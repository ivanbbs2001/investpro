/* ===== FIIs: cotação atual via brapi.dev (plano gratuito: token próprio, 1 ativo por requisição, atraso ~30 min) ===== */
export const fiiParseBrapi=j=>{const r=j&&Array.isArray(j.results)?j.results[0]:null;const o=r&&(r.data&&typeof r.data==="object"&&!Array.isArray(r.data)?r.data:r);const preco=o?Number(o.regularMarketPrice):NaN;if(!(preco>0))return null;
  let ts=o.regularMarketTime;if(typeof ts==="number")ts=new Date(ts>1e12?ts:ts*1000).toISOString();else if(ts){const d=new Date(ts);ts=isNaN(d)?null:d.toISOString();}else ts=null;return{preco,ts};};
export const fiiBuscarCotacoes=async(tickers,token,fetchFn)=>{
  const f=fetchFn||((...a)=>fetch(...a));const quotes={},erros=[];const lista=[...new Set((tickers||[]).map(t=>String(t||"").trim().toUpperCase()).filter(Boolean))];
  if(!token)return{quotes,erros:["informe o token da brapi (gratuito) para buscar as cotações"],pedidos:lista};
  const tk=encodeURIComponent(token);
  for(const t of lista){let ok=false,fatal=false;
    for(const url of[`https://brapi.dev/api/quote/${t}?token=${tk}`,`https://brapi.dev/api/v2/stocks/quote?symbols=${t}&token=${tk}`]){
      try{const c=typeof AbortController!=="undefined"?new AbortController():null;const tm=c?setTimeout(()=>c.abort(),12000):null;let r;try{r=await f(url,c?{signal:c.signal}:undefined);}finally{if(tm)clearTimeout(tm);}
        if(r.status===401||r.status===403){erros.push("token da brapi inválido ou sem acesso ("+r.status+")");fatal=true;break;}
        if(!r.ok)continue;const q=fiiParseBrapi(await r.json());if(q){quotes[t]=q;ok=true;break;}}
      catch(e){if(url.includes("/v2/"))erros.push(t+": "+(e&&e.name==="AbortError"?"tempo esgotado":String((e&&e.message)||e)));}}
    if(fatal)break;if(!ok&&!erros.some(e=>e.startsWith(t+":")))erros.push(t+": sem cotação");}
  return{quotes,erros,pedidos:lista};};
export const fiiMesclarCotacoes=(prev,res,agoraISO)=>{const b={quotes:{},ultimaOK:null,...(prev||{})};const quotes={...b.quotes};Object.entries(res.quotes).forEach(([t,q])=>{quotes[t]={...q,buscadoEm:agoraISO};});
  return{quotes,ultimaTentativa:agoraISO,ultimaOK:Object.keys(res.quotes).length?agoraISO:b.ultimaOK,erro:res.erros.length?[...new Set(res.erros)].join(" · "):null};};
