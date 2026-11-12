import{uid,tdParseLine,tdMoney}from"./util.js";
/* ===================== CRIPTO: cálculo, cotações, importação e IR (funções puras) ===================== */
export const CR_ISENCAO_MENSAL=35000;            // limite mensal de vendas p/ alerta (conferir a regra vigente na Receita)
export const CR_DEFASADO_MS=30*60*1000;          // cotação mais antiga que isso é marcada como defasada
export const CR_CATALOGO=[
  {tk:"BTC",nome:"Bitcoin",cg:"bitcoin",aw:"BTC",irpf:"01"},
  {tk:"ETH",nome:"Ethereum",cg:"ethereum",aw:"ETH",irpf:"02"},
  {tk:"BNB",nome:"BNB",cg:"binancecoin",aw:null,irpf:"02"},
  {tk:"XRP",nome:"XRP",cg:"ripple",aw:"XRP",irpf:"02"},
  {tk:"DOGE",nome:"Dogecoin",cg:"dogecoin",aw:"DOGE",irpf:"02"},
  {tk:"SHIB",nome:"Shiba Inu",cg:"shiba-inu",aw:null,irpf:"02"},
  {tk:"ETC",nome:"Ethereum Classic",cg:"ethereum-classic",aw:null,irpf:"02"},
  {tk:"LTC",nome:"Litecoin",cg:"litecoin",aw:"LTC",irpf:"02"},
  {tk:"SOL",nome:"Solana",cg:"solana",aw:null,irpf:"02"},
  {tk:"ADA",nome:"Cardano",cg:"cardano",aw:null,irpf:"02"},
  {tk:"DOT",nome:"Polkadot",cg:"polkadot",aw:null,irpf:"02"},
  {tk:"AVAX",nome:"Avalanche",cg:"avalanche-2",aw:null,irpf:"02"},
  {tk:"LINK",nome:"Chainlink",cg:"chainlink",aw:null,irpf:"02"},
  {tk:"TRX",nome:"TRON",cg:"tron",aw:null,irpf:"02"},
  {tk:"BCH",nome:"Bitcoin Cash",cg:"bitcoin-cash",aw:null,irpf:"02"},
  {tk:"XLM",nome:"Stellar",cg:"stellar",aw:null,irpf:"02"},
  {tk:"ATOM",nome:"Cosmos",cg:"cosmos",aw:null,irpf:"02"},
  {tk:"USDT",nome:"Tether",cg:"tether",aw:"USDT",irpf:"03"},
  {tk:"USDC",nome:"USD Coin",cg:"usd-coin",aw:null,irpf:"03"}
];
export const CR_TICKERS=CR_CATALOGO.map(c=>c.tk);
export const crInfo=tk=>CR_CATALOGO.find(c=>c.tk===String(tk||"").trim().toUpperCase());
export const crTk=r=>String((r&&r.ticker)||"").trim().toUpperCase();
export const crVazio=x=>x===""||x==null;
export const crQ=x=>{if(crVazio(x))return 0;const n=Number(String(x).replace(",","."));return isFinite(n)?n:0;};
export const crFmtQtd=q=>{const n=Number(q);return isFinite(n)?n.toLocaleString("pt-BR",{maximumFractionDigits:8}):"—";};

/* Posição por moeda pelo CUSTO MÉDIO. Compra: soma qtd e custo. Venda: baixa custo proporcional (qtd vendida / qtd total).
   `ate` (YYYY-MM-DD) limita às operações até essa data; operações sem data contam como as mais antigas.
   Compra sem valor pago = custo desconhecido (semCusto): não entra no custo nem gera lucro "fantasma". */
export const crCalcular=(cr,ate)=>{
  const ops=(cr||[]).map((r,idx)=>({r,idx,tk:crTk(r),tipo:r.tipo==="Venda"?"Venda":"Compra",data:r.dataCompra||""}))
    .filter(o=>o.tk&&(!ate||!o.data||o.data<=ate))
    .sort((a,b)=>(a.data||"0000-00-00").localeCompare(b.data||"0000-00-00")||a.idx-b.idx);
  const pos={},real=[],incons=[];
  ops.forEach(({r,tk,tipo,data})=>{
    const p=pos[tk]||(pos[tk]={ticker:tk,moeda:"",qtd:0,custo:0,semCusto:false,exchanges:new Set(),wallets:new Set(),precoManual:null,valorAtualLegado:0,legadoOk:true,vendeu:false});
    if(r.moeda&&!p.moeda)p.moeda=r.moeda;
    const q=crQ(r.quantidade);
    if(tipo==="Compra"){
      p.qtd+=q;const c=crQ(r.valorInvestido);
      if(c>0)p.custo+=c;else p.semCusto=true;
      if(r.exchange)p.exchanges.add(r.exchange);if(r.wallet)p.wallets.add(r.wallet);
      if(crQ(r.precoManual)>0)p.precoManual=crQ(r.precoManual);        // cronológico: o mais recente vence
      const va=crQ(r.valorAtual);if(va>0)p.valorAtualLegado+=va;else p.legadoOk=false;
    }else{
      const qv=Math.min(q,p.qtd);
      if(q>p.qtd+1e-9)incons.push({ticker:tk,data,msg:`Venda de ${crFmtQtd(q)} ${tk} maior que o saldo (${crFmtQtd(p.qtd)})${data?" em "+data:""}`});
      const custoRem=p.qtd>0?p.custo*(qv/p.qtd):0;const recebido=crQ(r.valorRecebido);
      real.push({id:r.id,data,ticker:tk,qtd:q,recebido,custo:custoRem,ganho:recebido-custoRem,semCusto:p.semCusto});
      p.qtd-=qv;p.custo-=custoRem;p.vendeu=true;
      if(p.qtd<1e-12){p.qtd=0;p.custo=0;}
    }
  });
  const posicoes=Object.values(pos).filter(p=>p.qtd>0).map(p=>({...p,exchanges:[...p.exchanges],wallets:[...p.wallets],precoMedio:(!p.semCusto&&p.qtd>0)?p.custo/p.qtd:null})).sort((a,b)=>a.ticker.localeCompare(b.ticker));
  return{posicoes,realizadas:real,inconsistencias:incons};
};
/* Valor de mercado de uma posição: preço manual (override) > cotação > valor atual lançado (legado) > custo */
export const crValorar=(p,cot,agora=Date.now())=>{
  const q=cot&&cot.quotes&&cot.quotes[p.ticker];
  let preco=null,fonte="",var24h=null,defasado=false;
  if(p.precoManual>0){preco=p.precoManual;fonte="manual";}
  else if(q&&Number(q.brl)>0){preco=Number(q.brl);fonte=q.fonte||"cotação";var24h=q.var24h==null?null:Number(q.var24h);defasado=!q.buscadoEm||agora-new Date(q.buscadoEm).getTime()>CR_DEFASADO_MS;}
  let valor;
  if(preco!=null)valor=p.qtd*preco;
  else if(p.legadoOk&&p.valorAtualLegado>0&&!p.vendeu){valor=p.valorAtualLegado;fonte="valor lançado";}
  else{valor=p.custo;fonte=p.custo>0?"custo (sem cotação)":"sem cotação";}
  const lp=(preco!=null&&!p.semCusto)?valor-p.custo:null;
  return{...p,preco,fonte,var24h,defasado,valor,lp,lpPct:(lp!=null&&p.custo>0)?lp/p.custo*100:null};
};
export const crResumo=(cr,cot,ate,agora=Date.now())=>{
  const c=crCalcular(cr,ate);const ls=c.posicoes.map(p=>crValorar(p,cot,agora));
  const valorTotal=ls.reduce((a,l)=>a+l.valor,0),custoTotal=ls.reduce((a,l)=>a+l.custo,0);
  const ok=ls.filter(l=>l.lp!=null);const lp=ok.reduce((a,l)=>a+l.lp,0),baseLp=ok.reduce((a,l)=>a+l.custo,0);
  return{linhas:ls.map(l=>({...l,peso:valorTotal>0?l.valor/valorTotal*100:0})),valorTotal,custoTotal,lp,lpPct:baseLp>0?lp/baseLp*100:null,
    semCusto:ls.filter(l=>l.semCusto).length,semCotacao:ls.filter(l=>l.preco==null).length,realizadas:c.realizadas,inconsistencias:c.inconsistencias};
};
/* Patrimônio em cripto usado no Dashboard e nas Projeções: base "custo" ou "mercado" */
export const crPatrimonio=(cr,cot,base,agora=Date.now())=>{
  const c=crCalcular(cr);
  return c.posicoes.reduce((a,p)=>a+(base==="custo"?p.custo:crValorar(p,cot,agora).valor),0);
};
/* Vendas por mês (para o alerta do limite) e alertas dos últimos 12 meses */
export const crVendasPorMes=real=>{const m={};(real||[]).forEach(r=>{const k=(r.data||"").slice(0,7);if(!k)return;const x=m[k]||(m[k]={total:0,ganho:0,n:0});x.total+=r.recebido;x.ganho+=r.ganho;x.n++;});return m;};
export const crAlertasIsencao=(vendasMes,hoje,limite=CR_ISENCAO_MENSAL)=>{
  const t=(+hoje.slice(0,4))*12+(+hoje.slice(5,7)-1)-12,corte=`${Math.floor(t/12)}-${String(t%12+1).padStart(2,"0")}`;
  return Object.entries(vendasMes).map(([mes,v])=>({mes,total:v.total,pct:v.total/limite*100,estourou:v.total>limite,proximo:v.total>=limite*0.8&&v.total<=limite}))
    .filter(a=>(a.estourou||a.proximo)&&a.mes>=corte).sort((a,b)=>b.mes.localeCompare(a.mes));};
/* IRPF (Bens e Direitos, grupo 08): posição e custo em 31/12 do ano-base e do anterior */
export const crIrpfLinhas=(cr,ano)=>{
  const a=crCalcular(cr,`${ano}-12-31`),b=crCalcular(cr,`${ano-1}-12-31`);
  const tks=[...new Set([...a.posicoes,...b.posicoes].map(p=>p.ticker))].sort();
  return tks.map(tk=>{const pa=a.posicoes.find(p=>p.ticker===tk),pb=b.posicoes.find(p=>p.ticker===tk),info=crInfo(tk),ref=pa||pb;
    const local=(ref.exchanges[0]||ref.wallets[0]||"");
    return{ticker:tk,nome:(info&&info.nome)||ref.moeda||tk,codigo:info?info.irpf:"02",qtdAtual:pa?pa.qtd:0,custoAtual:pa?pa.custo:0,qtdAnterior:pb?pb.qtd:0,custoAnterior:pb?pb.custo:0,semCusto:!!(pa&&pa.semCusto),
      discriminacao:pa?`${crFmtQtd(pa.qtd)} ${tk} (${(info&&info.nome)||ref.moeda||tk})${pa.semCusto?"":" — custo médio R$ "+(pa.custo/pa.qtd).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}${local?" — custódia: "+local:""}`:""};});
};

/* ---------- Cotações em R$: CoinGecko (principal) + AwesomeAPI (reserva). Nunca apaga cotação boa. ---------- */
export const crFetchJSON=async(fetchFn,url,ms=12000)=>{
  const c=typeof AbortController!=="undefined"?new AbortController():null;const t=c?setTimeout(()=>c.abort(),ms):null;
  try{const r=await fetchFn(url,c?{signal:c.signal}:undefined);if(!r.ok)throw new Error("HTTP "+r.status);return await r.json();}
  finally{if(t)clearTimeout(t);}
};
export const crBuscarCotacoes=async(tickers,fetchFn)=>{
  const f=fetchFn||((...a)=>fetch(...a));const pedidos=[...new Set((tickers||[]).map(t=>String(t).toUpperCase()))];
  const conhecidos=pedidos.map(crInfo).filter(Boolean),semCatalogo=pedidos.filter(t=>!crInfo(t)),quotes={},erros=[];
  const msg=e=>e&&e.name==="AbortError"?"tempo esgotado":String((e&&e.message)||e);
  if(conhecidos.length){
    try{const ids=[...new Set(conhecidos.map(c=>c.cg))].join(",");
      const d=await crFetchJSON(f,`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl&include_24hr_change=true&include_last_updated_at=true`);
      conhecidos.forEach(c=>{const x=d&&d[c.cg];if(x&&Number(x.brl)>0)quotes[c.tk]={brl:Number(x.brl),var24h:x.brl_24h_change==null?null:Number(x.brl_24h_change),ts:x.last_updated_at?new Date(x.last_updated_at*1000).toISOString():null,fonte:"CoinGecko"};});
    }catch(e){erros.push("CoinGecko: "+msg(e));}
    const faltam=conhecidos.filter(c=>!quotes[c.tk]&&c.aw);
    if(faltam.length){
      try{const d=await crFetchJSON(f,`https://economia.awesomeapi.com.br/last/${faltam.map(c=>c.aw+"-BRL").join(",")}`);
        faltam.forEach(c=>{const x=d&&d[c.aw+"BRL"];if(x&&Number(x.bid)>0)quotes[c.tk]={brl:Number(x.bid),var24h:x.pctChange==null?null:Number(x.pctChange),ts:x.timestamp?new Date(Number(x.timestamp)*1000).toISOString():null,fonte:"AwesomeAPI"};});
      }catch(e){erros.push("AwesomeAPI: "+msg(e));}
    }
  }
  return{quotes,erros,semCatalogo,pedidos};
};
export const crMesclarCotacoes=(prev,res,agoraISO)=>{
  const b={quotes:{},ultimaOK:null,ultimaTentativa:null,erro:null,...(prev||{})};const quotes={...b.quotes};
  Object.entries(res.quotes).forEach(([tk,q])=>{quotes[tk]={...q,buscadoEm:agoraISO};});
  const novos=Object.keys(res.quotes).length;const partes=[...res.erros];
  const naoVeio=res.pedidos.filter(t=>!res.quotes[t]&&!res.semCatalogo.includes(t));
  if(naoVeio.length&&!res.erros.length)partes.push("não retornou: "+naoVeio.join(", "));
  if(res.semCatalogo.length)partes.push("sem cotação automática para "+res.semCatalogo.join(", ")+" (informe o preço manual)");
  return{quotes,ultimaTentativa:agoraISO,ultimaOK:novos>0?agoraISO:b.ultimaOK,erro:partes.length?partes.join(" · "):null};
};

/* ---------- Importação de extrato (CSV): reconhece colunas por sinônimos; ignora o que não é compra/venda ---------- */
export const crNorm=s=>String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
export const CR_COLUNAS={
  data:["data","date","dia","data hora","datetime","horario","criado em","executado em","data da operacao","data operacao","time","created"],
  tipo:["tipo","type","side","lado","operacao","tipo de operacao","transacao","acao","tipo da ordem","order type"],
  ativo:["ativo","moeda","asset","coin","ticker","simbolo","par","pair","market","mercado","criptomoeda","token","moeda comprada"],
  qtd:["quantidade","qtd","amount","qty","quantity","volume","executado","tamanho","quantidade executada"],
  preco:["preco","price","cotacao","preco unitario","valor unitario","unit price","preco medio"],
  valor:["valor","total","valor total","total brl","valor brl","brl","financeiro","value","valor pago","valor recebido","custo","total pago","total recebido","total r","valor r","total em reais","valor em reais","amount brl"]
};
export const crQtdTexto=s=>{let t=String(s==null?"":s).replace(/[^\d.,\-]/g,"");if(!t)return null;const neg=t.startsWith("-");t=t.replace(/-/g,"");
  if(t.includes(",")&&t.includes("."))t=t.lastIndexOf(",")>t.lastIndexOf(".")?t.replace(/\./g,"").replace(",","."):t.replace(/,/g,"");
  else if(t.includes(","))t=t.replace(",",".");else if((t.match(/\./g)||[]).length>1)t=t.replace(/\./g,"");
  const n=Number(t);return isFinite(n)&&n>0?{n,neg}:null;};
export const crAtivoTk=s=>{let t=String(s||"").trim();if(!t)return"";const porNome=CR_CATALOGO.find(c=>crNorm(c.nome)===crNorm(t));if(porNome)return porNome.tk;
  t=t.toUpperCase();if(/[\/\-_ ]/.test(t))t=t.split(/[\/\-_ ]/)[0];else if(t.endsWith("BRL")&&t.length>3)t=t.slice(0,-3);return /^[A-Z0-9]{2,10}$/.test(t)?t:"";};
export const crTipoOp=s=>{const t=crNorm(s);if(/\b(compra|comprar|buy|bought|purchase|c)\b/.test(t))return"Compra";if(/\b(venda|vender|sell|sold|sale|v)\b/.test(t))return"Venda";return null;};
export const crParseCSV=text=>{
  const linhas=String(text||"").split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const mapa=cab=>{const m={},norm=cab.map(crNorm);
    ["preco","data","tipo","ativo","qtd","valor"].forEach(k=>{const i=norm.findIndex((h,ix)=>CR_COLUNAS[k].includes(h)&&!Object.values(m).includes(ix));if(i>=0)m[k]=i;});
    ["data","tipo","ativo","qtd","valor","preco"].forEach(k=>{if(m[k]!=null)return;const i=norm.findIndex((h,ix)=>!Object.values(m).includes(ix)&&CR_COLUNAS[k].some(s=>s.length>3&&h.includes(s)));if(i>=0)m[k]=i;});
    return m;};
  let hi=-1,m=null;
  for(let i=0;i<Math.min(6,linhas.length);i++){const mm=mapa(tdParseLine(linhas[i]));if(mm.data!=null&&mm.ativo!=null&&mm.qtd!=null&&mm.tipo!=null&&(mm.valor!=null||mm.preco!=null)){hi=i;m=mm;break;}}
  if(hi<0)return{erro:"Cabeçalho não reconhecido. O arquivo precisa ter colunas de Data, Tipo (compra/venda), Ativo/Moeda, Quantidade e Valor (ou Preço).",itens:[],ignoradas:0};
  const itens=[];let ignoradas=0;
  linhas.slice(hi+1).forEach(l=>{const c=tdParseLine(l);
    const tipo=crTipoOp(c[m.tipo]);const dm=String(c[m.data]||"").match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})|(\d{4})-(\d{2})-(\d{2})/);
    const data=dm?(dm[4]?`${dm[4]}-${dm[5]}-${dm[6]}`:`${dm[3]}-${dm[2].padStart(2,"0")}-${dm[1].padStart(2,"0")}`):null;
    const tk=crAtivoTk(c[m.ativo]),q=crQtdTexto(c[m.qtd]);
    let valor=m.valor!=null?tdMoney(c[m.valor]):null;
    if(valor==null&&m.preco!=null&&q){const pr=tdMoney(c[m.preco]);if(pr)valor=Math.round(pr*q.n*100)/100;}
    if(!tipo||!data||!tk||!q||!(valor>0)){ignoradas++;return;}
    itens.push({tipo,data,ticker:tk,quantidade:String(q.n),valor});});
  return{erro:null,itens,ignoradas};
};
export const crItemDeImport=(n,origem)=>({id:uid(),tipo:n.tipo,ticker:n.ticker,moeda:(crInfo(n.ticker)||{}).nome||n.ticker,quantidade:n.quantidade,
  ...(n.tipo==="Venda"?{valorRecebido:n.valor.toFixed(2),valorInvestido:""}:{valorInvestido:n.valor.toFixed(2)}),valorAtual:"",exchange:origem||"",wallet:"",dataCompra:n.data});
export const crDuplicado=(existentes,n)=>existentes.some(x=>(x.tipo==="Venda"?"Venda":"Compra")===n.tipo&&crTk(x)===n.ticker&&(x.dataCompra||"")===n.data&&Math.abs(crQ(x.quantidade)-Number(n.quantidade))<1e-9&&Math.abs(crQ(n.tipo==="Venda"?x.valorRecebido:x.valorInvestido)-n.valor)<0.01);

/* ---------- Cadastro: modal de Compra/Venda ---------- */
export const crPrepararModal=(row,tipo)=>{const b=row||{};const tk=crTk(b);const conhecido=!tk||!!crInfo(tk);return{...b,tipo,ticker:conhecido?tk:"OUTRA",tickerOutra:conhecido?"":tk};};
export const crFinalizarItem=it=>{const o={...it};let tk=String(o.ticker||"").trim().toUpperCase();if(tk==="OUTRA")tk=String(o.tickerOutra||"").trim().toUpperCase();
  o.ticker=tk;delete o.tickerOutra;const info=crInfo(tk);o.moeda=info?info.nome:(o.moeda||tk);return o;};
export const crValidarItem=(it,outros)=>{
  if(!/^[A-Z0-9]{2,10}$/.test(it.ticker||""))return"Informe a moeda (ticker com 2 a 10 letras/números).";
  if(!(crQ(it.quantidade)>0))return"Informe a quantidade (maior que zero).";
  if(!it.dataCompra)return"Informe a data da operação.";
  if(it.tipo==="Venda"){
    if(!(crQ(it.valorRecebido)>0))return"Informe o valor recebido na venda (R$).";
    const p=crCalcular(outros,it.dataCompra).posicoes.find(x=>x.ticker===it.ticker);const saldo=p?p.qtd:0;
    if(crQ(it.quantidade)>saldo+1e-9)return`Venda maior que o saldo de ${it.ticker} nessa data (saldo: ${crFmtQtd(saldo)}).`;
  }
  return null;
};

