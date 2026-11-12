import{test,expect}from'vitest';import*as A from'../src/lib/analise.js';
const near=(a,b,d=1e-6)=>expect(Math.abs(a-b)).toBeLessThan(d);
test('classes e snapshot',()=>{
  const e={rf:[{valor:"1000"}],inco:[{valor:"500"}],tdApos:[{valor:"100"}],tdLiza:[{valor:"50"}],ac:[{quantidade:"10",precoMedio:"20"}],
    etfs:[{moeda:"USD",quantidade:"2",precoMedio:"100",precoAtual:"110",dataCompra:"2026-01-09"}],fiis:[{ticker:"hglg11",quantidade:"10",precoMedio:"100"},{ticker:"X11",quantidade:"1",precoMedio:"50"}],
    cr:[{ticker:"BTC",quantidade:"1",valorInvestido:"1000"}],fx:{atual:5,dia:{}},fiiCot:{quotes:{HGLG11:{preco:120}}},cotCr:{quotes:{BTC:{brl:3000,buscadoEm:new Date().toISOString()}}}};
  const c=A.anClasses(e);near(c.rf,1000);near(c.td,150);near(c.ac,200);near(c.etfs,2*110*5);near(c.fiis,10*120+50);near(c.cr,3000);
  const s=A.anSnapshot(e,"2026-11-12");expect(s.ym).toBe("2026-11");near(s.total,1000+500+150+200+1100+1250+3000);
});
test('upsert devolve a mesma referência se nada mudou',()=>{
  const s1=A.anSnapshot({rf:[{valor:"100"}]},"2026-11-12");const a=A.anUpsert({},s1);expect(A.anUpsert(a,{...s1,t:"2026-11-13"})).toBe(a);
  const s2=A.anSnapshot({rf:[{valor:"200"}]},"2026-11-13");const b=A.anUpsert(a,s2);expect(b).not.toBe(a);near(b["2026-11"].total,200);
  expect(A.anUpsert(a,A.anSnapshot({},"2026-11-14"))).toBe(a);
});
test('série: retorno só entre meses consecutivos, com fluxo',()=>{
  const snaps={"2026-08":{classes:{etfs:1000},total:5000},"2026-09":{classes:{etfs:1300},total:5400},"2026-11":{classes:{etfs:1500},total:6000}};
  const s=A.anSerie(snaps,{"2026-09":200,"2026-11":0});
  expect(s[0].retorno).toBeNull();near(s[1].lucro,1300-1000-200);near(s[1].retorno,100/(1000+100)*100);near(s[1].delta,400);expect(s[2].retorno).toBeNull();expect(s[2].delta).toBeNull();
});
test('fluxos por mês (ETF em USD usa dólar do dia; venda de cripto é saída)',()=>{
  const f=A.anFluxos({etfs:[{moeda:"USD",quantidade:"2",precoMedio:"100",dataCompra:"2026-01-15"}],fiis:[{quantidade:"10",precoMedio:"10",dataCompra:"2026-01-20"}],cr:[{tipo:"Compra",valorInvestido:"300",dataCompra:"2026-01-02"},{tipo:"Venda",valorRecebido:"100",dataCompra:"2026-02-02"}],fx:{atual:5,dia:{"2026-01-15":6}}});
  near(f["2026-01"],2*100*6+100+300);near(f["2026-02"],-100);
});
test('BCB e acumulado',()=>{
  const cdi=A.anParseBCB([{data:"01/09/2026",valor:"1.0"},{data:"01/10/2026",valor:"2.0"}]);expect(cdi).toEqual({"2026-09":1,"2026-10":2});
  const ac=A.anAcumulado([{ym:"2026-09",retorno:10},{ym:"2026-10",retorno:null},{ym:"2026-11",retorno:10}],cdi,{});near(ac.carteira,21,1e-9);expect(ac.cdi).toBeNull();expect(ac.meses).toBe(2);
  const ac2=A.anAcumulado([{ym:"2026-09",retorno:10},{ym:"2026-10",retorno:10}],cdi,{"2026-09":0.5,"2026-10":0.5});near(ac2.cdi,(1.01*1.02-1)*100,1e-9);near(ac2.ipca,(1.005*1.005-1)*100,1e-9);
});
test('alocação e próximo aporte',()=>{
  const v={rf:600,inco:0,td:0,ac:0,etfs:200,fiis:200,cr:0};const al=A.anAlocacao(v,{rf:"50",etfs:"30",fiis:"20"});near(al.total,1000);
  near(al.linhas.find(l=>l.k==="rf").desvio,10);near(al.linhas.find(l=>l.k==="etfs").ajuste,100);near(al.somaAlvos,100);
  // aporte 200: T=1200 → alvo rf 600 (falta 0), etfs 360 (falta 160), fiis 240 (falta 40) → soma 200 = aporte
  const ap=A.anAporte(v,{rf:"50",etfs:"30",fiis:"20"},200);expect(ap.map(x=>[x.k,x.valor])).toEqual([["etfs",160],["fiis",40]]);
  // aporte grande: sobra reparte pelos alvos; soma sempre = aporte
  const ap2=A.anAporte(v,{rf:"50",etfs:"30",fiis:"20"},1000);near(ap2.reduce((a,x)=>a+x.valor,0),1000,0.02);
  expect(A.anAporte(v,{},100)).toEqual([]);
});
test('reserva: média das despesas dos 6 meses fechados, sem Investimentos',()=>{
  const orc=[{tipo:"Despesa",data:"2026-10-05",valor:"3000",categoria:"Mercado"},{tipo:"Despesa",data:"2026-10-06",valor:"9999",categoria:"Investimentos"},{tipo:"Despesa",data:"2026-09-05",valor:"2000",categoria:"Luz"},{tipo:"Receita",data:"2026-09-05",valor:"9000"},{tipo:"Despesa",data:"2026-11-02",valor:"500",categoria:"Luz"}];
  const m=A.anDespesaMedia(orc,"2026-11-12");near(m.media,2500);expect(m.meses).toBe(2);
  const rf=[{id:"a",tipo:"Tesouro Selic",valor:"10000"},{id:"b",tipo:"CDB",indexador:"CDI",valor:"5000"}];
  expect(A.anReserva(rf,null,2500).meses).toBe(4);expect(A.anReserva(rf,["a","b"],2500).meses).toBe(6);expect(A.anReserva(rf,[],0).meses).toBeNull();
});
test('BCB: busca com erro não derruba',async()=>{
  const r=await A.anBuscarIndices(async u=>{if(u.includes("4391"))return{ok:true,json:async()=>[{data:"01/10/2026",valor:"1.1"}]};throw new Error("x");});expect(r.cdi["2026-10"]).toBe(1.1);expect(r.erros.length).toBe(1);
});

test('RF só entra no retorno quando os dois meses têm RF estimada; aportes RF descontados',()=>{
  const snaps={"2026-10":{classes:{rf:1000,etfs:1000},total:2000,rfEst:true},"2026-11":{classes:{rf:1600,etfs:1000},total:2600,rfEst:true},"2026-09":{classes:{rf:900,etfs:1000},total:1900}};
  const s=A.anSerie(snaps,{},{"2026-11":500});const nov=s.find(x=>x.ym==="2026-11"),out=s.find(x=>x.ym==="2026-10");
  expect(nov.comRf).toBe(true);expect(nov.lucro).toBeCloseTo(100);        // (2600-2000)-500
  expect(out.comRf).toBe(false);expect(out.lucro).toBeCloseTo(0);         // set sem rfEst: só ETFs (1000→1000)
});

test('reserva: janela de 6 meses (mês -6 entra, -7 não)',()=>{
  const orc=[{tipo:"Despesa",data:"2026-05-10",valor:"1000"},{tipo:"Despesa",data:"2026-04-10",valor:"9000"},{tipo:"Despesa",data:"2026-10-10",valor:"2000"}];
  const m=A.anDespesaMedia(orc,"2026-11-12");near(m.media,1500);expect(m.meses).toBe(2);
});

test('reserva usa o valor atual estimado quando informado',()=>{
  const rf=[{id:"a",tipo:"Tesouro Selic",valor:"10000"}];
  expect(A.anReserva(rf,null,1000).valor).toBe(10000);expect(A.anReserva(rf,null,1000,{a:11000}).meses).toBe(11);
});
