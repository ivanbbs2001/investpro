/* Análises da carteira: patrimônio mensal, retorno vs CDI/IPCA, alocação-alvo e reserva de emergência (funções puras) */
import{etfAtualBRL,etfCustoBRL,etfFxEm,etfAddMes,etfYM}from"./etf.js";
import{crPatrimonio,crFetchJSON}from"./cripto.js";
export const AN_CLASSES=[{k:"rf",l:"Renda Fixa"},{k:"inco",l:"INCO"},{k:"td",l:"Tesouro Direto"},{k:"ac",l:"Ações"},{k:"etfs",l:"ETFs"},{k:"fiis",l:"FIIs"},{k:"cr",l:"Cripto"}];
export const AN_MERCADO=["etfs","fiis","cr"];           // classes avaliadas a mercado (as demais ficam ao custo no app)
const n=x=>Number(x)||0;const soma=(a,f)=>a.reduce((s,i)=>s+f(i),0);
/* e: {rf,inco,ac,etfs,fiis,cr,tdApos,tdLiza,cotCr,fx,fiiCot} */
export const anClasses=e=>{
  const fx=e.fx||{},q=(e.fiiCot&&e.fiiCot.quotes)||{};
  return{rf:e.rfValor!=null?n(e.rfValor):soma(e.rf||[],i=>n(i.valor)),inco:soma(e.inco||[],i=>n(i.valor)),td:soma(e.tdApos||[],i=>n(i.valor))+soma(e.tdLiza||[],i=>n(i.valor)),
    ac:soma(e.ac||[],i=>n(i.quantidade)*n(i.precoMedio)),
    etfs:soma(e.etfs||[],i=>(i.moeda==="USD"&&!n(fx.atual))?etfCustoBRL(i,fx):etfAtualBRL(i,fx)),
    fiis:soma(e.fiis||[],i=>{const c=q[String(i.ticker||"").toUpperCase()];return n(i.quantidade)*(c&&c.preco>0?c.preco:n(i.precoMedio));}),
    cr:crPatrimonio(e.cr||[],e.cotCr,"mercado")};};
export const anSnapshot=(e,hojeISO)=>{const classes=anClasses(e);const total=Object.values(classes).reduce((a,b)=>a+b,0);const o={ym:hojeISO.slice(0,7),t:hojeISO,classes,total};if(e.rfValor!=null)o.rfEst=true;return o;};
/* Atualiza só o mês corrente; devolve a MESMA referência se nada mudou (evita laços de efeito) */
export const anUpsert=(snaps,snap)=>{if(!snap||!(snap.total>0))return snaps;const a=(snaps||{})[snap.ym];
  if(a&&Math.abs(a.total-snap.total)<0.5&&Object.keys(snap.classes).every(k=>Math.abs((a.classes[k]||0)-snap.classes[k])<0.5)&&!!a.rfEst===!!snap.rfEst)return snaps;
  return{...(snaps||{}),[snap.ym]:{t:snap.t,classes:snap.classes,total:snap.total,...(snap.rfEst?{rfEst:true}:{})}};};
export const anMesclarSnaps=(a,b)=>{const o={...(a||{})};Object.entries(b||{}).forEach(([k,v])=>{if(!o[k]||String(v.t||"")>String(o[k].t||""))o[k]=v;});return o;};
/* Compras (+) e vendas (−) por mês nas classes a mercado, em R$ */
export const anFluxos=e=>{const f={},add=(d,v)=>{const m=etfYM(d);if(!/^\d{4}-\d{2}$/.test(m)||!isFinite(v))return;f[m]=(f[m]||0)+v;};const fx=e.fx||{};
  (e.etfs||[]).forEach(i=>{if(!i.dataCompra)return;const q=n(i.quantidade),pm=n(i.precoMedio);add(i.dataCompra,i.moeda==="USD"?q*pm*(etfFxEm(fx,i.dataCompra)||n(fx.atual)):q*pm);});
  (e.fiis||[]).forEach(i=>{if(i.dataCompra)add(i.dataCompra,n(i.quantidade)*n(i.precoMedio));});
  (e.cr||[]).forEach(i=>{if(!i.dataCompra)return;add(i.dataCompra,i.tipo==="Venda"?-n(i.valorRecebido):n(i.valorInvestido));});return f;};
const vMercado=(s,comRf)=>AN_MERCADO.reduce((a,k)=>a+((s.classes&&s.classes[k])||0),0)+(comRf?((s.classes&&s.classes.rf)||0):0);
/* Série mensal; retorno só entre meses consecutivos (Dietz simples: fluxo no meio do mês) */
/* fluxosRf: aportes em renda fixa por mês; a RF só entra no retorno quando os DOIS meses têm RF estimada (rfEst) */
export const anSerie=(snaps,fluxos,fluxosRf)=>{const ks=Object.keys(snaps||{}).sort();return ks.map((ym,i)=>{const s=snaps[ym],p=i>0&&ks[i-1]===etfAddMes(ym,-1)?snaps[ks[i-1]]:null;
  const comRf=!!(p&&s.rfEst&&p.rfEst),v1=vMercado(s,comRf),v0=p?vMercado(p,comRf):null,F=((fluxos&&fluxos[ym])||0)+(comRf?((fluxosRf&&fluxosRf[ym])||0):0);let ret=null,lucro=null;
  if(p&&v0+F/2>0){lucro=v1-v0-F;ret=lucro/(v0+F/2)*100;}
  return{ym,total:s.total,mercado:v1,comRf,delta:p?s.total-p.total:null,deltaPct:p&&p.total>0?(s.total/p.total-1)*100:null,fluxo:F,lucro,retorno:ret};});};
export const anParseBCB=arr=>{const o={};(Array.isArray(arr)?arr:[]).forEach(x=>{const m=String(x.data||"").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);const v=Number(String(x.valor).replace(",","."));if(m&&isFinite(v))o[`${m[3]}-${m[2]}`]=v;});return o;};
export const anBuscarIndices=async(fetchFn,meses=36)=>{const f=fetchFn||((...a)=>fetch(...a));const r={cdi:{},ipca:{},erros:[]};
  for(const[k,c]of[["cdi",4391],["ipca",433]]){try{r[k]=anParseBCB(await crFetchJSON(f,`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${c}/dados/ultimos/${meses}?formato=json`));}catch(e){r.erros.push(k.toUpperCase()+": "+String((e&&e.message)||e));}}return r;};
/* Acumulado composto nos meses em que a carteira tem retorno calculado */
export const anAcumulado=(linhas,cdi,ipca)=>{let p=1,c=1,i=1,m=0,okC=true,okI=true;linhas.forEach(l=>{if(l.retorno==null)return;m++;p*=1+l.retorno/100;if(cdi&&cdi[l.ym]!=null)c*=1+cdi[l.ym]/100;else okC=false;if(ipca&&ipca[l.ym]!=null)i*=1+ipca[l.ym]/100;else okI=false;});
  return m?{meses:m,carteira:(p-1)*100,cdi:okC?(c-1)*100:null,ipca:okI?(i-1)*100:null}:null;};
/* Alocação-alvo */
export const anAlocacao=(valores,alvos)=>{const total=AN_CLASSES.reduce((a,c)=>a+n(valores[c.k]),0);
  return{total,linhas:AN_CLASSES.map(c=>{const v=n(valores[c.k]),al=alvos&&alvos[c.k]!==""&&alvos[c.k]!=null?Number(alvos[c.k]):null;return{k:c.k,l:c.l,valor:v,pct:total>0?v/total*100:0,alvo:al,desvio:al!=null&&total>0?v/total*100-al:null,ajuste:al!=null?al/100*total-v:null};}),somaAlvos:AN_CLASSES.reduce((a,c)=>a+(alvos&&alvos[c.k]!==""&&alvos[c.k]!=null?Number(alvos[c.k]):0),0)};};
/* Onde colocar o próximo aporte: primeiro as classes abaixo do alvo, na proporção da falta */
export const anAporte=(valores,alvos,aporte)=>{const a=anAlocacao(valores,alvos);if(!(aporte>0)||a.somaAlvos<=0)return[];const T=a.total+aporte;
  const need=a.linhas.map(l=>({k:l.k,l:l.l,falta:l.alvo!=null?Math.max(0,l.alvo/100*T-l.valor):0,alvo:l.alvo||0}));const sf=need.reduce((s,x)=>s+x.falta,0);
  const res=need.map(x=>({k:x.k,l:x.l,valor:sf>=aporte?aporte*x.falta/(sf||1):x.falta+(aporte-sf)*x.alvo/a.somaAlvos}));return res.filter(r=>r.valor>0.005).map(r=>({...r,valor:Math.round(r.valor*100)/100}));};
/* Reserva de emergência */
export const anDespesaMedia=(orc,hojeISO,janela=3)=>{const atual=hojeISO.slice(0,7),tot={};
  (orc||[]).forEach(i=>{if(i.tipo!=="Despesa"||!i.data||i.categoria==="Investimentos")return;const m=i.data.slice(0,7);if(m>=atual)return;tot[m]=(tot[m]||0)+n(i.valor);});
  const ms=[];for(let k=1;k<=janela;k++)ms.push(etfAddMes(atual,-k));const usados=ms.filter(m=>tot[m]>0);
  return{media:usados.length?usados.reduce((a,m)=>a+tot[m],0)/usados.length:0,meses:usados.length};};
export const anReservaPadrao=rf=>(rf||[]).filter(i=>i.tipo==="Tesouro Selic"||i.indexador==="Selic").map(i=>i.id);
export const anReserva=(rf,ids,media)=>{const sel=new Set(ids==null?anReservaPadrao(rf):ids);const itens=(rf||[]).filter(i=>sel.has(i.id));const valor=soma(itens,i=>n(i.valor));
  return{valor,itens,meses:media>0?valor/media:null};};
