/* Valor atual estimado da renda fixa (marcação na curva, sem marcação a mercado) */
import{ymdToUTC}from"./util.js";
export function getIR(dias){if(dias<=180)return 22.5;if(dias<=360)return 20;if(dias<=720)return 17.5;return 15;}
export function temIR(t){return["CDB","Tesouro Selic","Tesouro IPCA+","Tesouro Prefixado","Debênture","LC"].includes(t);}
const DIA=864e5;const ym=d=>d.slice(0,7);
const diasNoMes=m=>new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7),0)).getUTCDate();
const addMes=(m,k)=>{const t=(+m.slice(0,4))*12+(+m.slice(5,7)-1)+k;return `${Math.floor(t/12)}-${String(t%12+1).padStart(2,"0")}`;};
/* Produto dos fatores mensais entre duas datas [de, ate): proporcional (em dias) nos meses incompletos.
   serie: {"AAAA-MM": % no mês}; f(%)→taxa do mês em fração; falta→% mensal usado quando o mês não tem dado */
export const rfFatorSerie=(serie,de,ate,f,falta)=>{const a=ymdToUTC(de),b=ymdToUTC(ate);if(!(b>a))return 1;let fator=1;
  for(let m=ym(de);ymdToUTC(m+"-01")<b;m=addMes(m,1)){const ini=Math.max(a,ymdToUTC(m+"-01")),fim=Math.min(b,ymdToUTC(addMes(m,1)+"-01")),frac=(fim-ini)/DIA/diasNoMes(m);if(frac<=0)continue;
    const r=serie&&serie[m]!=null?serie[m]:falta;fator*=Math.pow(1+f(r),frac);}return fator;};
const mensalDeAnual=aa=>(Math.pow(1+aa/100,1/12)-1)*100;
/* ctx: {cdi,ipca (séries mensais do BCB), cdi12m, ipca12m, igpm (% a.a.)} */
export const rfResgatado=i=>!!i&&i.status==="Resgatado";
export const rfValorAtual=(item,ctx,hojeISO)=>{
  if(rfResgatado(item))return{valor:0,aplicado:0,rend:0,rendPct:null,ir:0,fonte:"resgatado"};
  const valor=Number(item.valor)||0,manual=Number(item.valorAtualManual)||0;
  if(manual>0)return{valor:manual,aplicado:valor,rend:manual-valor,rendPct:valor>0?(manual/valor-1)*100:null,ir:null,fonte:"manual"};
  const t=Number(item.taxa)||0;if(!(valor>0)||!(t>0)||!item.dataInicio||item.dataInicio>=hojeISO)return{valor,aplicado:valor,rend:0,rendPct:null,ir:0,fonte:"aplicado"};
  const ate=item.dataVencimento&&item.dataVencimento<hojeISO?item.dataVencimento:hojeISO;if(ate<=item.dataInicio)return{valor,aplicado:valor,rend:0,rendPct:null,ir:0,fonte:"aplicado"};
  const dias=(ymdToUTC(ate)-ymdToUTC(item.dataInicio))/DIA,ix=item.indexador||"Pré",c=ctx||{};let fator,fonte="estimado";
  if(ix==="CDI"||ix==="Selic"){const falta=mensalDeAnual(c.cdi12m||14.15);fator=rfFatorSerie(c.cdi,item.dataInicio,ate,r=>r/100*t/100,falta);if(!c.cdi||!Object.keys(c.cdi).length)fonte="estimado (sem série do BCB)";}
  else if(ix==="IPCA"){const falta=mensalDeAnual(c.ipca12m||4.5);fator=rfFatorSerie(c.ipca,item.dataInicio,ate,r=>r/100,falta)*Math.pow(1+t/100,dias/365);if(!c.ipca||!Object.keys(c.ipca).length)fonte="estimado (sem série do BCB)";}
  else if(ix==="IGPM"){fator=Math.pow((1+(c.igpm||3.5)/100)*(1+t/100),dias/365);fonte="estimado (índice anual médio)";}
  else fator=Math.pow(1+t/100,dias/365);                      // Pré e demais: taxa anual composta
  const bruto=valor*fator,rend=bruto-valor,ir=temIR(item.tipo)?rend*getIR(dias)/100:0,liq=bruto-ir;
  return{valor:liq,aplicado:valor,bruto,rend:liq-valor,rendPct:(liq/valor-1)*100,ir,fonte};};
/* fluxos: aportes (+) pelo mês de início e resgates (−) pelo mês do resgate, em R$ — usados no retorno da Análise.
   Resgate sem valor informado: usa a estimativa na data do resgate. */
export const rfFluxos=(rf,ctx)=>{const f={},add=(d,v)=>{if(/^\d{4}-\d{2}/.test(d||"")&&isFinite(v)&&v){const m=d.slice(0,7);f[m]=(f[m]||0)+v;}};
  (rf||[]).forEach(i=>{const v=Number(i.valor)||0;if(v>0)add(i.dataInicio,v);
    if(rfResgatado(i)){let r=Number(i.valorResgate)||0;if(!(r>0)&&i.dataResgate)r=rfValorAtual({...i,status:"Ativo",valorAtualManual:""},ctx,i.dataResgate).valor;if(r>0)add(i.dataResgate,-r);}});return f;};
export const rfCarteira=(rf,ctx,hojeISO)=>{const itens=(rf||[]).map(i=>({id:i.id,...rfValorAtual(i,ctx,hojeISO)}));
  return{valor:itens.reduce((a,x)=>a+x.valor,0),aplicado:itens.reduce((a,x)=>a+x.aplicado,0),itens,fluxos:rfFluxos(rf,ctx)};};
export const rfPatrimonio=(rf,ctx,base,hojeISO)=>{const c=rfCarteira(rf,ctx,hojeISO);return base==="custo"?c.aplicado:c.valor;};
