import{ymdToUTC}from"./util.js";import{crFetchJSON}from"./cripto.js";
/* ===================== ETFs: oscilação e retorno mensal (US$ e R$) — funções puras ===================== */
export const etfYM=d=>String(d||"").slice(0,7);
export const etfAddMes=(ym,n)=>{const t=(+ym.slice(0,4))*12+(+ym.slice(5,7)-1)+n;return `${Math.floor(t/12)}-${String(t%12+1).padStart(2,"0")}`;};
export const etfFimMes=ym=>`${ym}-${String(new Date(Date.UTC(+ym.slice(0,4),+ym.slice(5,7),0)).getUTCDate()).padStart(2,"0")}`;
export const etfAddDias=(d,n)=>new Date(ymdToUTC(d)+n*864e5).toISOString().slice(0,10);
export const etfMeses=(de,ate)=>{const r=[];for(let m=de;m<=ate;m=etfAddMes(m,1))r.push(m);return r;};
export const etfNum=x=>{const n=Number(String(x==null?"":x).replace(",","."));return isFinite(n)&&n>0?n:null;};
/* Dólar do último dia com cotação até `data` (no máximo 10 dias antes) */
export const etfFxEm=(fx,data)=>{const dia=(fx&&fx.dia)||{};let b=null;for(const d in dia){if(d<=data&&(b==null||d>b))b=d;}return(b&&ymdToUTC(data)-ymdToUTC(b)<=10*864e5)?Number(dia[b]):null;};
export const etfMesesDesde=(d,hoje)=>d?(ymdToUTC(hoje)-ymdToUTC(d))/864e5/30.4375:0;
export const etfCustoBRL=(i,fx)=>{const q=Number(i.quantidade)||0,pm=Number(i.precoMedio)||0;if(i.moeda!=="USD")return q*pm;const f=etfFxEm(fx,i.dataCompra||"")||(fx&&Number(fx.atual))||0;return q*pm*f;};
export const etfAtualBRL=(i,fx)=>{const q=Number(i.quantidade)||0,pa=Number(i.precoAtual)||Number(i.precoMedio)||0;return i.moeda==="USD"?q*pa*((fx&&Number(fx.atual))||0):q*pa;};
/* Série mensal de uma posição. compras: [{data,qtd,preco}] na moeda nativa; histP/histFx: {"AAAA-MM":valor} (fechamentos informados) */
export const etfSerie=(compras,moeda,histP,histFx,fx,precoAtual,hoje)=>{
  const usd=moeda==="USD",hojeYM=etfYM(hoje);const cs=[...compras].filter(c=>c.data&&c.qtd>0).sort((a,b)=>a.data.localeCompare(b.data));
  if(!cs.length)return{linhas:[],resumo:null};
  const fxAtual=(fx&&Number(fx.atual))||etfFxEm(fx,hoje)||null;
  const fxFim=ym=>!usd?1:ym===hojeYM?fxAtual:(etfNum(histFx&&histFx[ym])||etfFxEm(fx,etfFimMes(ym)));
  const fxCompra=d=>!usd?1:(etfFxEm(fx,d)||fxFim(etfYM(d)));
  const preco=ym=>ym===hojeYM?etfNum(precoAtual):etfNum(histP&&histP[ym]);
  const linhas=[];let qtdPrev=0,pPrev=null,fxPrev=null,primeiro=true;
  etfMeses(etfYM(cs[0].data),hojeYM).forEach(ym=>{
    const fim=etfFimMes(ym),doMes=cs.filter(c=>etfYM(c.data)===ym),qtdFim=cs.filter(c=>c.data<=fim).reduce((a,c)=>a+c.qtd,0);
    const aporteNat=doMes.reduce((a,c)=>a+c.qtd*c.preco,0);
    const fxs=doMes.map(c=>fxCompra(c.data));const aporteBRL=fxs.some(f=>!f)?null:doMes.reduce((a,c,i)=>a+c.qtd*c.preco*fxs[i],0);
    const P=preco(ym),fxF=fxFim(ym);
    const base=primeiro?(doMes.length?doMes[0].preco:null):pPrev,fxBase=primeiro?(doMes.length?fxs[0]:null):fxPrev;
    const oscNat=(P&&base)?P/base-1:null;
    const oscBRL=!usd?oscNat:(P&&base&&fxF&&fxBase)?(P*fxF)/(base*fxBase)-1:null;
    const valorNat=P!=null?qtdFim*P:null;
    const prevOk=qtdPrev===0||pPrev!=null;const valPrevNat=qtdPrev>0&&pPrev!=null?qtdPrev*pPrev:0;
    const retNat=(valorNat!=null&&prevOk)?valorNat-valPrevNat-aporteNat:null;const bNat=valPrevNat+aporteNat;
    const valorBRL=valorNat!=null&&fxF?valorNat*fxF:null;
    const valPrevBRL=qtdPrev===0?0:(pPrev!=null&&fxPrev?qtdPrev*pPrev*fxPrev:null);
    const retBRL=(valorBRL!=null&&valPrevBRL!=null&&aporteBRL!=null)?valorBRL-valPrevBRL-aporteBRL:null;const bBRL=(valPrevBRL||0)+(aporteBRL||0);
    linhas.push({ym,parcial:ym===hojeYM,qtd:qtdFim,preco:P,fx:usd?fxF:null,precoBRL:P&&fxF?P*fxF:null,oscNat,oscBRL,
      retNat:usd?retNat:null,retPctNat:usd&&retNat!=null&&bNat>0?retNat/bNat*100:null,retBRL,retPctBRL:retBRL!=null&&bBRL>0?retBRL/bBRL*100:null,
      retNatNativo:retNat,retPctNativo:retNat!=null&&bNat>0?retNat/bNat*100:null,oscNat100:oscNat==null?null:oscNat*100,oscBRL100:oscBRL==null?null:oscBRL*100});
    primeiro=false;qtdPrev=qtdFim;pPrev=P;fxPrev=fxF;
  });
  const qtd=cs.reduce((a,c)=>a+c.qtd,0),custoNat=cs.reduce((a,c)=>a+c.qtd*c.preco,0),pa=etfNum(precoAtual);
  const fxsC=cs.map(c=>fxCompra(c.data));const custoBRL=fxsC.some(f=>!f)?null:cs.reduce((a,c,i)=>a+c.qtd*c.preco*fxsC[i],0);
  const valNat=pa?qtd*pa:null,valBRL=valNat!=null&&fxAtual?valNat*fxAtual:null;
  return{linhas,resumo:{qtd,custoNat,custoBRL,valNat,valBRL,lpNat:valNat!=null?valNat-custoNat:null,lpNatPct:valNat!=null&&custoNat>0?(valNat/custoNat-1)*100:null,
    lpBRL:valBRL!=null&&custoBRL!=null?valBRL-custoBRL:null,lpBRLPct:valBRL!=null&&custoBRL>0?(valBRL/custoBRL-1)*100:null,pm:qtd>0?custoNat/qtd:null}};
};
/* Dólar: cotação atual + histórico diário (AwesomeAPI). Nunca devolve vazio por erro: quem chama mescla com o cache. */
export const etfBuscarFx=async(desde,hoje,fetchFn)=>{
  const f=fetchFn||((...a)=>fetch(...a));const dia={},erros=[];let atual=null;
  const msg=e=>e&&e.name==="AbortError"?"tempo esgotado":String((e&&e.message)||e);
  try{const d=await crFetchJSON(f,"https://economia.awesomeapi.com.br/last/USD-BRL");if(d&&d.USDBRL&&Number(d.USDBRL.bid)>0)atual=Number(d.USDBRL.bid);else erros.push("dólar atual indisponível");}catch(e){erros.push("dólar atual: "+msg(e));}
  let ini=desde;
  while(desde&&ini<=hoje){const fim=etfAddDias(ini,299)<hoje?etfAddDias(ini,299):hoje;
    try{const arr=await crFetchJSON(f,`https://economia.awesomeapi.com.br/json/daily/USD-BRL/400?start_date=${ini.replace(/-/g,"")}&end_date=${fim.replace(/-/g,"")}`);
      (Array.isArray(arr)?arr:[]).forEach(x=>{const b=Number(x.bid),ts=Number(x.timestamp);if(b>0&&ts)dia[new Date(ts*1000-3*3600e3).toISOString().slice(0,10)]=b;});}
    catch(e){erros.push("histórico do dólar: "+msg(e));break;}
    ini=etfAddDias(fim,1);}
  return{atual,dia,erros};
};
export const etfMesclarFx=(prev,res,desde,agoraISO)=>{const b={atual:null,dia:{},desde:null,ultimaOK:null,erro:null,...(prev||{})};
  const dia={...b.dia,...res.dia};const novo=res.atual!=null||Object.keys(res.dia).length>0;
  return{atual:res.atual!=null?res.atual:b.atual,dia,desde:!res.erros.some(e=>e.startsWith("histórico"))&&desde?(b.desde&&b.desde<desde?b.desde:desde):b.desde,ultimaOK:novo?agoraISO:b.ultimaOK,ultimaTentativa:agoraISO,erro:res.erros.length?res.erros.join(" · "):null};};
/* ===== Preços de ETFs/ações no exterior via Twelve Data (plano gratuito: chave própria, 8 req/min) ===== */
export const etfParseTD=j=>{if(!j||j.status==="error"||!Array.isArray(j.values))return{erro:(j&&j.message)||"resposta inesperada"};
  const meses={};let ult=null,ultEm="";j.values.forEach(x=>{const c=Number(x.close),d=String(x.datetime||"");if(!(c>0)||!/^\d{4}-\d{2}/.test(d))return;meses[d.slice(0,7)]=c;if(d>ultEm){ultEm=d;ult=c;}});
  return Object.keys(meses).length?{meses,ultimo:ult,ultimoEm:ultEm}:{erro:"sem dados"};};
export const etfBuscarPrecos=async(tickers,chave,fetchFn)=>{const f=fetchFn||((...a)=>fetch(...a));const precos={},erros=[];
  if(!chave)return{precos,erros:["informe a chave da Twelve Data (gratuita)"]};
  const lista=[...new Set((tickers||[]).map(t=>String(t||"").trim().toUpperCase()).filter(Boolean))].slice(0,7);
  if((tickers||[]).length>7)erros.push("limite de 8 consultas por minuto: só os 7 primeiros tickers foram buscados");
  for(const t of lista){try{const j=await crFetchJSON(f,`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(t)}&interval=1month&outputsize=60&apikey=${encodeURIComponent(chave)}`);
      const p=etfParseTD(j);if(p.erro){erros.push(t+": "+p.erro);if(j&&(j.code===401||j.code===429))break;}else precos[t]=p;}
    catch(e){erros.push(t+": "+String((e&&e.message)||e));if(/HTTP (401|429)/.test(String(e&&e.message)))break;}}
  return{precos,erros};};
/* Aplica no histórico só os meses FECHADOS que ainda não têm valor (não sobrescreve o que você digitou) */
export const etfMesclarFechamentos=(hist,precos,hojeYM)=>{const out={...(hist||{})};Object.entries(precos).forEach(([t,p])=>{const h={...(out[t]||{})};Object.entries(p.meses).forEach(([m,c])=>{if(m<hojeYM&&!(Number(h[m])>0))h[m]=String(c);});out[t]=h;});return out;};
