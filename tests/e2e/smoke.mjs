/* Teste de fumaça: abre o app num navegador real, visita cada aba (vazio e com dados) e falha em qualquer erro de JS.
   Uso: npm run build && npm run test:e2e     (a rede externa é simulada; nada sai do computador) */
import{chromium}from"playwright";import{spawn}from"node:child_process";
const PORT=4179,BASE=`http://127.0.0.1:${PORT}/investpro/`;
const ABAS=["Dashboard","Comparação","Evolução","Análise","Projeções","Renda Fixa","INCO","Tesouro Direto","Ações","ETFs","FIIs","Cripto","Aportes","Simulação","Orçamento","IRPF","PRF","Imóveis","Índices","Config"];
const hoje=new Date().toISOString().slice(0,10),mes=hoje.slice(0,7);
const DADOS={
 "ip8-rf":[{id:"r1",dataInicio:"2025-11-12",dataVencimento:"2028-11-12",tipo:"LCI",indexador:"CDI",taxa:"100",valor:"10000"},{id:"r2",dataInicio:"2025-06-01",tipo:"CDB",indexador:"Pré",taxa:"12",valor:"5000",valorAtualManual:"5400"},{id:"r3",dataInicio:"2025-01-10",dataVencimento:"2030-01-10",tipo:"Tesouro IPCA+",indexador:"IPCA",taxa:"6",valor:"3000"}],
 "ip8-etf":[{id:"e1",ticker:"IVV",moeda:"USD",quantidade:"1",precoMedio:"610",dataCompra:"2025-01-23",precoAtual:"700"}],
 "ip8-fii":[{id:"f1",ticker:"HGLG11",quantidade:"10",precoMedio:"150",dataCompra:"2025-03-01"}],
 "ip8-cr":[{id:"c1",ticker:"BTC",tipo:"Compra",quantidade:"0.01",valorInvestido:"3000",dataCompra:"2025-05-01"}],
 "ip8-ac":[{id:"a1",ticker:"PETR4",quantidade:"100",precoMedio:"30"}],
 "ip8-orc":[{id:"o1",tipo:"Despesa",data:`${mes}-02`,categoria:"Mercado",descricao:"Teste",valor:"500"},{id:"o2",tipo:"Receita",data:`${mes}-01`,categoria:"Salário",descricao:"Teste",valor:"5000"}]};
const serie=cod=>Array.from({length:120},(_,k)=>{const d=new Date(Date.UTC(new Date().getUTCFullYear(),new Date().getUTCMonth()-k,1));return{data:`01/${String(d.getUTCMonth()+1).padStart(2,"0")}/${d.getUTCFullYear()}`,valor:cod==="4391"?"1.00":cod==="433"?"0.40":"10.00"};});
async function rodar(browser,seed,rotulo){
  const erros=[],ctx=await browser.newContext(),p=await ctx.newPage();
  p.on("pageerror",e=>erros.push("pageerror: "+e));p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|net::ERR|firebase|Firestore/i.test(m.text()))erros.push("console: "+m.text());});
  await p.route(/api\.bcb\.gov\.br/,r=>{const c=(/sgs\.(\d+)/.exec(r.request().url())||[])[1];r.fulfill({contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify(serie(c))});});
  await p.route(url=>!url.href.startsWith(`http://127.0.0.1:${PORT}`)&&!/api\.bcb\.gov\.br/.test(url.href),r=>r.abort());
  if(seed)await p.addInitScript(d=>{if(!localStorage.getItem("__semeado")){Object.entries(d).forEach(([k,v])=>localStorage.setItem(k,JSON.stringify(v)));localStorage.setItem("__semeado","1");}},DADOS);
  await p.goto(BASE);await p.waitForSelector(".dsb",{timeout:15000});
  for(const aba of ABAS){
    const el=p.locator(".dsb").getByText(new RegExp(aba+"\\s*$")).first();
    if(!(await el.count())){erros.push(`aba não encontrada: ${aba}`);continue;}
    await el.click();await p.waitForTimeout(250);
    const vazio=await p.evaluate(()=>!document.querySelector("#root")||document.querySelector("#root").innerText.trim().length<20);
    if(vazio)erros.push(`tela em branco em "${aba}"`);
    const novo=p.getByRole("button",{name:"+ Novo"}).first();
    if(await novo.count()){await novo.click();await p.waitForTimeout(150);const c=p.getByRole("button",{name:"Cancelar"}).first();if(await c.count())await c.click();}
  }
  await p.waitForTimeout(500);await ctx.close();
  console.log(`${erros.length?"FALHOU":"ok    "} ${rotulo} (${ABAS.length} abas)`);erros.forEach(e=>console.log("   -",e));return erros.length;
}
const srv=spawn("npx",["vite","preview","--port",String(PORT),"--host","127.0.0.1","--strictPort"],{stdio:"ignore"});
let falhas=0;
try{
  for(let i=0;i<50;i++){try{if((await fetch(BASE)).ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
  const b=await chromium.launch();
  falhas+=await rodar(b,false,"app vazio");falhas+=await rodar(b,true,"app com dados");
  await b.close();
}finally{srv.kill();}
process.exit(falhas?1:0);
