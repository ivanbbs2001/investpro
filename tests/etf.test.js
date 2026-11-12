import{test,expect}from'vitest';import*as L from'../src/lib/etf.js';const assert=(c,m)=>{if(!c)throw new Error(m);};
test('etf.test.js',async()=>{
let n=0;const ok=(c,m)=>{n++;assert(c,m);};const near=(a,b,m)=>ok(a!=null&&Math.abs(a-b)<1e-6,m+` got ${a} want ${b}`);
// IVV: 10 @100 em 15/01 (fx 5.0); 10 @120 em 10/02 (fx 5.5). Fechamentos: jan 110 (fx 5.2), fev 130 (fx 5.6); hoje fev: preço 130, fx atual 5.6
const compras=[{data:"2026-01-15",qtd:10,preco:100},{data:"2026-02-10",qtd:10,preco:120}];
const fx={atual:5.6,dia:{"2026-01-15":5.0,"2026-02-10":5.5,"2026-01-31":5.2}};
const s=L.etfSerie(compras,"USD",{"2026-01":110},{},fx,130,"2026-02-20");
const [jan,fev]=s.linhas;
near(jan.oscNat,110/100-1,"jan osc usd");near(jan.retNat,10*110-0-1000,"jan ret usd 100");near(jan.retPctNat,10,"jan ret %");
near(jan.oscBRL,(110*5.2)/(100*5.0)-1,"jan osc brl");near(jan.retBRL,1100*5.2-5000,"jan ret brl 720");
// fev: osc = 130/110-1 ; ret usd = 20*130 - 10*110 - 10*120 = 2600-1100-1200=300 ; base=1100+1200=2300
near(fev.oscNat,130/110-1,"fev osc");near(fev.retNat,300,"fev ret");near(fev.retPctNat,300/2300*100,"fev ret%");
// brl: valorFim=2600*5.6=14560; prev=10*110*5.2=5720; aporte=10*120*5.5=6600 -> 2240
near(fev.retBRL,14560-5720-6600,"fev ret brl");near(fev.oscBRL,(130*5.6)/(110*5.2)-1,"fev osc brl");
ok(fev.parcial&&!jan.parcial,"parcial");
// resumo: custo usd 2200, brl 5000+6600=11600; valor 2600 / 14560
near(s.resumo.custoNat,2200,"custo");near(s.resumo.custoBRL,11600,"custo brl");near(s.resumo.lpBRL,14560-11600,"lp brl");near(s.resumo.pm,110,"pm");
// lacuna: sem fechamento de jan → fev sem oscilação/retorno (não inventa)
const g=L.etfSerie(compras,"USD",{},{},fx,130,"2026-02-20");ok(g.linhas[0].oscNat===null||g.linhas[0].preco===null);ok(g.linhas[1].oscNat===null&&g.linhas[1].retNat===null,"lacuna");
// BRL nativo (ETF nacional): sem colunas US$
const b=L.etfSerie([{data:"2026-01-15",qtd:10,preco:100}],"BRL",{"2026-01":110},{},null,120,"2026-02-20");near(b.linhas[0].retBRL,100,"brl nativo");ok(b.linhas[0].retNat===null&&b.linhas[0].fx===null,"sem usd");near(b.linhas[1].oscBRL,120/110-1,"osc brl nativo");
// fx ausente → R$ nulo, US$ preservado
const h=L.etfSerie(compras,"USD",{"2026-01":110},{},{atual:null,dia:{}},130,"2026-02-20");near(h.linhas[0].retNat,100,"usd ok sem fx");ok(h.linhas[0].retBRL===null&&h.linhas[0].oscBRL===null,"brl nulo sem fx");
// etfFxEm: janela de 10 dias
ok(L.etfFxEm({dia:{"2026-01-02":5}},"2026-01-10")===5&&L.etfFxEm({dia:{"2026-01-02":5}},"2026-01-13")===null,"janela");
// agregados
near(L.etfCustoBRL({moeda:"USD",quantidade:"2",precoMedio:"100",dataCompra:"2026-01-15"},fx),1000,"custo brl agg");near(L.etfAtualBRL({moeda:"USD",quantidade:"2",precoAtual:"130"},fx),2*130*5.6,"atual agg");near(L.etfCustoBRL({quantidade:"2",precoMedio:"100"},fx),200,"legado brl");
await (async()=>{const mk=m=>async url=>{for(const k in m){if(url.includes(k)){if(m[k] instanceof Error)throw m[k];return{ok:true,json:async()=>m[k]};}}throw new Error("x");};
 const ts=d=>Math.floor(Date.parse(d+"T20:00:00Z")/1000);
 let r=await L.etfBuscarFx("2026-01-01","2026-02-20",mk({"/last/":{USDBRL:{bid:"5.6"}},"/json/daily/":[{bid:"5.1",timestamp:String(ts("2026-01-02"))},{bid:"5.2",timestamp:String(ts("2026-01-03"))}]}));
 ok(r.atual===5.6&&r.dia["2026-01-02"]===5.1&&!r.erros.length,"fx ok "+JSON.stringify(r));
 r=await L.etfBuscarFx("2026-01-01","2026-02-20",mk({"/last/":new Error("down"),"/json/daily/":new Error("down")}));ok(r.atual===null&&r.erros.length===2,"fx falha");
 const prev={atual:5.5,dia:{"2026-01-02":5.1},desde:"2026-01-01"};const m=L.etfMesclarFx(prev,r,"2025-06-01","2026-02-20T10:00:00Z");ok(m.atual===5.5&&m.dia["2026-01-02"]===5.1&&m.erro&&m.desde==="2026-01-01","cache preservado");
 })()

});
import{etfParseTD,etfBuscarPrecos,etfMesclarFechamentos}from'../src/lib/etf.js';
test('Twelve Data: parse, busca e mescla sem sobrescrever o digitado',async()=>{
  const ok={status:"ok",values:[{datetime:"2026-11-11",close:"738.68"},{datetime:"2026-10-01",close:"700.5"},{datetime:"2026-09-01",close:"690"}]};
  const p=etfParseTD(ok);expect(p.ultimo).toBe(738.68);expect(p.meses["2026-10"]).toBe(700.5);expect(etfParseTD({status:"error",message:"bad key"}).erro).toBe("bad key");
  let calls=0;const r=await etfBuscarPrecos(["ivv","BLK"],"K",async u=>{calls++;if(u.includes("BLK"))return{ok:true,json:async()=>({code:429,status:"error",message:"limite"})};return{ok:true,json:async()=>ok};});
  expect(r.precos.IVV.ultimo).toBe(738.68);expect(r.erros[0]).toContain("BLK");expect(calls).toBe(2);
  expect((await etfBuscarPrecos(["IVV"],"",async()=>{throw new Error("x");})).erros[0]).toContain("chave");
  const h=etfMesclarFechamentos({IVV:{"2026-09":"111"}},r.precos,"2026-11");expect(h.IVV["2026-09"]).toBe("111");expect(h.IVV["2026-10"]).toBe("700.5");expect(h.IVV["2026-11"]).toBeUndefined();
});
