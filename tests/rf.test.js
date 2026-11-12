import{test,expect}from'vitest';import{rfValorAtual,rfFatorSerie,rfCarteira,rfPatrimonio,getIR}from'../src/lib/rf.js';
const near=(a,b,d=1e-6)=>expect(Math.abs(a-b)).toBeLessThan(d);
test('fator por série mensal, com meses parciais proporcionais',()=>{
  const f=r=>r/100;
  near(rfFatorSerie({"2026-01":1,"2026-02":1},"2026-01-01","2026-03-01",f,0),1.01*1.01);
  near(rfFatorSerie({"2026-01":1},"2026-01-16","2026-02-01",f,0),Math.pow(1.01,16/31));           // metade do mês (16 de 31 dias)
  near(rfFatorSerie({},"2026-01-01","2026-02-01",f,2),1.02);                                  // mês sem dado usa o valor de falta
  expect(rfFatorSerie({},"2026-02-01","2026-01-01",f,2)).toBe(1);
});
test('Pré: juros compostos por dias/365, IR regressivo do CDB',()=>{
  const r=rfValorAtual({valor:"10000",taxa:"12",indexador:"Pré",tipo:"CDB",dataInicio:"2025-11-12"},{}, "2026-11-12");  // 365 dias
  near(r.bruto,11200,1e-6);near(r.ir,1200*17.5/100,1e-6);near(r.valor,11200-210,1e-6);expect(r.fonte).toBe("estimado");expect(getIR(365)).toBe(17.5);
  const lci=rfValorAtual({valor:"10000",taxa:"12",indexador:"Pré",tipo:"LCI",dataInicio:"2025-11-12"},{}, "2026-11-12");near(lci.valor,11200,1e-6);near(lci.ir,0);
});
test('CDI: % do CDI sobre a série mensal; sem série usa a taxa anual média',()=>{
  const ctx={cdi:{"2026-01":1,"2026-02":1},cdi12m:14,ipca12m:4,igpm:3};
  const r=rfValorAtual({valor:"1000",taxa:"100",indexador:"CDI",tipo:"LCI",dataInicio:"2026-01-01"},ctx,"2026-03-01");near(r.valor,1000*1.01*1.01,1e-6);
  const r2=rfValorAtual({valor:"1000",taxa:"110",indexador:"CDI",tipo:"LCI",dataInicio:"2026-01-01"},ctx,"2026-03-01");near(r2.valor,1000*(1+0.011)*(1+0.011),1e-6);
  const s=rfValorAtual({valor:"1000",taxa:"100",indexador:"CDI",tipo:"LCI",dataInicio:"2025-11-12"},{cdi12m:10},"2026-11-12");near(s.valor,1000*Math.pow(1.1,1)*1,2);expect(s.fonte).toContain("sem série");
});
test('IPCA + spread',()=>{
  const ctx={ipca:{"2026-01":0.5,"2026-02":0.5},ipca12m:4};const r=rfValorAtual({valor:"1000",taxa:"6",indexador:"IPCA",tipo:"LCA",dataInicio:"2026-01-01"},ctx,"2026-03-01");
  near(r.valor,1000*1.005*1.005*Math.pow(1.06,59/365),1e-6);
});
test('manual manda; sem data/taxa cai no valor aplicado; vencido para de crescer',()=>{
  expect(rfValorAtual({valor:"1000",valorAtualManual:"1234.5",taxa:"10",indexador:"Pré",dataInicio:"2025-01-01"},{}, "2026-01-01").valor).toBe(1234.5);
  expect(rfValorAtual({valor:"1000",taxa:"10",indexador:"Pré"},{}, "2026-01-01")).toMatchObject({valor:1000,fonte:"aplicado"});
  expect(rfValorAtual({valor:"1000",taxa:"10",indexador:"Pré",dataInicio:"2027-01-01"},{}, "2026-01-01").fonte).toBe("aplicado");
  const a=rfValorAtual({valor:"1000",taxa:"10",indexador:"Pré",tipo:"LCI",dataInicio:"2025-01-01",dataVencimento:"2025-07-01"},{}, "2026-01-01");const b=rfValorAtual({valor:"1000",taxa:"10",indexador:"Pré",tipo:"LCI",dataInicio:"2025-01-01",dataVencimento:"2025-07-01"},{}, "2027-01-01");near(a.valor,b.valor);
});
test('carteira e base custo×atual',()=>{
  const rf=[{id:"1",valor:"1000",taxa:"10",indexador:"Pré",tipo:"LCI",dataInicio:"2025-11-12"},{id:"2",valor:"500"}];
  near(rfPatrimonio(rf,{}, "custo","2026-11-12"),1500);near(rfPatrimonio(rf,{}, "mercado","2026-11-12"),1100+500);expect(rfCarteira(rf,{}, "2026-11-12").itens.length).toBe(2);
});

import{rfFluxos,rfResgatado}from'../src/lib/rf.js';
test('resgatado sai do patrimônio; fluxos: aporte (+) no início e resgate (−) na data',()=>{
  const rf=[{id:"1",valor:"1000",taxa:"10",indexador:"Pré",tipo:"LCI",dataInicio:"2025-11-12",status:"Resgatado",dataResgate:"2026-05-20",valorResgate:"1070"},{id:"2",valor:"500",dataInicio:"2026-01-05"}];
  const c=rfCarteira(rf,{}, "2026-11-12");expect(c.itens[0]).toMatchObject({valor:0,fonte:"resgatado"});near(c.valor,500);
  expect(rfResgatado(rf[0])).toBe(true);
  const f=rfFluxos(rf,{});expect(f["2025-11"]).toBe(1000);expect(f["2026-01"]).toBe(500);expect(f["2026-05"]).toBe(-1070);
  const sem=rfFluxos([{...rf[0],valorResgate:""}],{});near(sem["2026-05"],-(1000*Math.pow(1.1,189/365)),1e-6);   // sem valor: estima na data (LCI, isento)
});
