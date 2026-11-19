import{test,expect}from'vitest';import{orcFrescor,orcFixosBase,orcSimularFixos}from'../src/lib/orc.js';
const D=(a,m,d)=>new Date(a,m-1,d,12);
test('frescor: atualizado, desatualizado com data do último gasto, sem gasto algum',()=>{
  expect(orcFrescor([],D(2026,11,19))).toBe(null);
  const ok=orcFrescor([{tipo:"Despesa",data:"2026-11-10",valor:"50"}],D(2026,11,19));expect(ok).toEqual({ok:true,last:"2026-11-10",dias:9});
  const velho=orcFrescor([{tipo:"Despesa",data:"2026-10-01",valor:"50"},{tipo:"Despesa",data:"2026-09-20",valor:"9"},{tipo:"Receita",data:"2026-11-18",valor:"5000"},{tipo:"Despesa",data:"2026-11-01",valor:"",fixo:true},{tipo:"Despesa",data:"2026-12-25",valor:"70"}],D(2026,11,19));
  expect(velho).toEqual({ok:false,last:"2026-10-01",dias:49});                       // receita, modelo em branco e data futura não contam
  expect(orcFrescor([{tipo:"Receita",data:"2026-11-18",valor:"5000"}],D(2026,11,19))).toEqual({ok:false,last:null,dias:null});
  expect(orcFrescor([{tipo:"Despesa",data:"2026-11-04",valor:"1"}],D(2026,11,19)).ok).toBe(true);    // exatamente 15 dias
  expect(orcFrescor([{tipo:"Despesa",data:"2026-11-03",valor:"1"}],D(2026,11,19)).ok).toBe(false);
});
const orc=[
 {tipo:"Despesa",fixo:true,categoria:"Aluguel",data:"2026-11-05",valor:"2000"},
 {tipo:"Despesa",fixo:true,categoria:"Internet",data:"2026-11-01",valor:""},{tipo:"Despesa",fixo:true,categoria:"Internet",data:"2026-10-08",valor:"120"},{tipo:"Despesa",fixo:true,categoria:"Internet",data:"2026-09-08",valor:"110"},
 {tipo:"Despesa",fixo:true,categoria:"Luz",data:"2026-11-02",valor:"150"},{tipo:"Despesa",fixo:true,categoria:"Luz",data:"2026-11-20",valor:"50"},
 {tipo:"Despesa",fixo:true,categoria:"Academia",data:"2026-11-01",valor:""},
 {tipo:"Despesa",fixo:true,categoria:"Antigo",data:"2025-01-01",valor:"99"},
 {tipo:"Despesa",categoria:"Mercado",data:"2026-11-03",valor:"800"},{tipo:"Receita",fixo:true,categoria:"Salário",data:"2026-11-01",valor:"9000"},
 {tipo:"Despesa",fixo:true,categoria:"Futuro",data:"2026-12-01",valor:"10"}];
test('base dos fixos: soma do mês atual; em branco usa o último mês com valor; ignora eventuais, receitas, futuro e histórico > 12 meses',()=>{
  const b=orcFixosBase(orc,"2026-11");
  expect(b.map(l=>[l.categoria,l.valor,l.ref,l.doMes])).toEqual([["Aluguel",2000,"2026-11",true],["Luz",200,"2026-11",true],["Internet",120,"2026-10",false],["Academia",0,null,false]]);
});
test('simulação: reajuste geral, ajuste por linha, corte, nova despesa e totais',()=>{
  const b=orcFixosBase(orc,"2026-11");
  const s0=orcSimularFixos(b,{});expect(s0.atual).toBe(2320);expect(s0.simulado).toBe(2320);expect(s0.dif).toBe(0);
  const s=orcSimularFixos(b,{pctGeral:"10",ajustes:{Aluguel:"2300"},cortes:{Luz:true},novos:[{id:"x",nome:"Streaming",valor:"55.9"},{id:"y",nome:"",valor:""}]});
  const L=Object.fromEntries(s.linhas.map(l=>[l.categoria,l]));
  expect(L.Aluguel.simulado).toBe(2300);expect(L.Aluguel.pct).toBeCloseTo(15);expect(L.Luz.simulado).toBe(0);expect(L.Internet.simulado).toBeCloseTo(132);expect(L.Academia.pct).toBe(null);
  expect(s.simulado).toBeCloseTo(2300+0+132+0+55.9);expect(s.dif).toBeCloseTo(2487.9-2320);expect(s.difAno).toBeCloseTo((2487.9-2320)*12);expect(s.novosTotal).toBeCloseTo(55.9);
  expect(orcSimularFixos(b,{pctGeral:"-100"}).simulado).toBe(0);expect(orcSimularFixos(b,{ajustes:{Aluguel:"-5"}}).linhas[0].simulado).toBe(2000);   // ajuste negativo é ignorado
});
