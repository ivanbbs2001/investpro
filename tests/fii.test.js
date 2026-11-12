import{test,expect}from'vitest';import*as L from'../src/lib/fii.js';const assert=(c,m)=>{if(!c)throw new Error(m);};
test('fii.test.js',async()=>{
let n=0;const ok=(c,m)=>{n++;assert(c,m);};
const R=(status,body)=>({ok:status>=200&&status<300,status,json:async()=>body});
await (async()=>{
 // formato legado
 let calls=[];let res=await L.fiiBuscarCotacoes(["hglg11","MXRF11"],"TK",async u=>{calls.push(u);return R(200,{results:[{symbol:u.includes("HGLG")?"HGLG11":"MXRF11",regularMarketPrice:u.includes("HGLG")?160.5:10.2,regularMarketTime:"2026-11-12T13:00:00.000Z"}]});});
 ok(res.quotes.HGLG11.preco===160.5&&res.quotes.MXRF11.preco===10.2&&!res.erros.length&&calls.length===2&&calls[0].includes("token=TK"),"legado");
 // formato v2 como fallback (legado 404)
 res=await L.fiiBuscarCotacoes(["XPLG11"],"TK",async u=>u.includes("/v2/")?R(200,{results:[{data:{regularMarketPrice:98.7,regularMarketTime:1762952400}}]}):R(404,{}));ok(res.quotes.XPLG11.preco===98.7&&res.quotes.XPLG11.ts.startsWith("2025-11-12"),"v2 fallback "+JSON.stringify(res));
 // token inválido: erro único e para
 calls=[];res=await L.fiiBuscarCotacoes(["A11","B11"],"X",async u=>{calls.push(u);return R(401,{});});ok(res.erros.length===1&&/token/.test(res.erros[0])&&calls.length===1&&!Object.keys(res.quotes).length,"401");
 // sem token
 res=await L.fiiBuscarCotacoes(["A11"],"",async()=>{throw new Error("não deveria chamar");});ok(/token/.test(res.erros[0]),"sem token");
 // um falha outro ok; cache preservado
 res=await L.fiiBuscarCotacoes(["OK11","RUIM11"],"T",async u=>u.includes("OK11")?R(200,{results:[{regularMarketPrice:5}]}):R(404,{}));ok(res.quotes.OK11&&!res.quotes.RUIM11&&res.erros.some(e=>e.startsWith("RUIM11")),"parcial");
 const prev={quotes:{RUIM11:{preco:7,buscadoEm:"2026-11-11T10:00:00Z"}},ultimaOK:"2026-11-11T10:00:00Z"};const m=L.fiiMesclarCotacoes(prev,res,"2026-11-12T10:00:00Z");ok(m.quotes.RUIM11.preco===7&&m.quotes.OK11.preco===5&&m.erro,"merge preserva");
 // rede falha
 res=await L.fiiBuscarCotacoes(["Z11"],"T",async()=>{throw new Error("net");});ok(res.erros.some(e=>e.includes("net")),"rede");
 })()

});
