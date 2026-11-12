import{test,expect}from'vitest';import*as L from'../src/lib/cripto.js';const assert=(c,m)=>{if(!c)throw new Error(m);};
test('cripto.test.js',async()=>{
let n=0;const ok=(c,m)=>{n++;assert(c,m);};const near=(a,b,m)=>ok(Math.abs(a-b)<1e-6,m+` got ${a} want ${b}`);
// legado: linhas do JSON do usuário (sem tipo)
const cr=[{id:"1",ticker:"BTC",quantidade:"0.00814715",valorInvestido:"6000"},{id:"2",ticker:"DOGE",quantidade:"2371.13717061",valorInvestido:""}];
let c=L.crCalcular(cr);ok(c.posicoes.length===2);const btc=c.posicoes.find(p=>p.ticker==="BTC");near(btc.custo,6000,"custo");near(btc.precoMedio,6000/0.00814715,"pm");ok(c.posicoes.find(p=>p.ticker==="DOGE").semCusto,"semCusto");
// cotação
const now=Date.now(),iso=new Date(now).toISOString();const cot={quotes:{BTC:{brl:500000,var24h:1.5,buscadoEm:iso,fonte:"CoinGecko"},DOGE:{brl:1,buscadoEm:iso}}};
let r=L.crResumo(cr,cot,undefined,now);near(r.valorTotal,0.00814715*500000+2371.13717061,"valor");near(r.linhas.find(l=>l.ticker==="BTC").lp,0.00814715*500000-6000,"lp");ok(r.linhas.find(l=>l.ticker==="DOGE").lp===null,"lp doge null");
// sem cotação -> custo, não zero
r=L.crResumo(cr,{quotes:{}},undefined,now);near(r.valorTotal,6000,"fallback custo");
// manual tem prioridade
const cr2=[{...cr[0],precoManual:"600000"}];r=L.crResumo(cr2,cot,undefined,now);near(r.valorTotal,0.00814715*600000,"manual");
// defasada
r=L.crResumo(cr,cot,undefined,now+3600e3);ok(r.linhas[0].defasado,"defasado");
// venda custo médio: compra 2@100, 2@200 (custo 300 por 4? ) -> 2 a 100 e 2 a 200 = 600 / 4 =150; vende 1 por 200 => custo 150 ganho 50
const v=[{id:"a",tipo:"Compra",ticker:"ETH",quantidade:"2",valorInvestido:"200",dataCompra:"2024-01-01"},{id:"b",tipo:"Compra",ticker:"ETH",quantidade:"2",valorInvestido:"400",dataCompra:"2024-02-01"},{id:"c",tipo:"Venda",ticker:"ETH",quantidade:"1",valorRecebido:"200",dataCompra:"2024-03-10"}];
c=L.crCalcular(v);near(c.realizadas[0].custo,150,"custo vend");near(c.realizadas[0].ganho,50,"ganho");const eth=c.posicoes[0];near(eth.qtd,3,"qtd");near(eth.custo,450,"custo resta");
// as-of
c=L.crCalcular(v,"2024-02-15");near(c.posicoes[0].qtd,4,"asof qtd");near(c.posicoes[0].custo,600,"asof custo");
// venda > saldo
ok(L.crValidarItem({ticker:"ETH",quantidade:"5",valorRecebido:"10",dataCompra:"2024-03-10",tipo:"Venda"},v.slice(0,2))!==null,"venda>saldo");
ok(L.crValidarItem({ticker:"ETH",quantidade:"1",valorRecebido:"10",dataCompra:"2024-03-10",tipo:"Venda"},v.slice(0,2))===null,"venda ok");
ok(L.crValidarItem({ticker:"E",quantidade:"1",dataCompra:"2024-03-10",tipo:"Compra"},[])!==null,"ticker curto");
// mês / alertas
const vm=L.crVendasPorMes([{data:"2026-11-02",recebido:30000,ganho:1},{data:"2026-11-05",recebido:6000,ganho:2},{data:"2026-10-01",recebido:29000,ganho:0},{data:"2025-01-01",recebido:99999,ganho:0}]);
near(vm["2026-11"].total,36000,"mes");const al=L.crAlertasIsencao(vm,"2026-11-09");ok(al.length===2&&al[0].mes==="2026-11"&&al[0].estourou&&al[1].proximo,"alertas "+JSON.stringify(al));
// IRPF
const ir=L.crIrpfLinhas(v,2024);ok(ir.length===1&&ir[0].qtdAtual===3&&ir[0].qtdAnterior===0&&ir[0].codigo==="02","irpf");near(ir[0].custoAtual,450,"irpf custo");
// import CSV
const csv="Data;Tipo;Moeda;Quantidade;Valor (R$)\n15/03/2023;Compra;BTC;0,005;4.500,00\n20/06/2024;Venda;DOGE;500;250,00\n21/06/2024;Depósito;BRL;1000;1000\n;Compra;BTC;1;1\n";
let p=L.crParseCSV(csv);ok(!p.erro&&p.itens.length===2&&p.ignoradas===2,JSON.stringify(p));near(p.itens[0].valor,4500,"valor imp");ok(p.itens[0].quantidade==="0.005"&&p.itens[0].data==="2023-03-15","imp campos");
const csv2="Date,Side,Pair,Amount,Price\n2024-05-01 10:00:00,BUY,BTC/BRL,0.01,300000\n";p=L.crParseCSV(csv2);ok(p.itens.length===1&&p.itens[0].ticker==="BTC"&&p.itens[0].tipo==="Compra",JSON.stringify(p));near(p.itens[0].valor,3000,"preço×qtd");
ok(L.crParseCSV("a;b\n1;2").erro,"cab inválido");
const it=L.crItemDeImport(p.itens[0],"Binance");ok(L.crDuplicado([it],p.itens[0]),"dup");ok(!L.crDuplicado([],p.itens[0]),"não dup");
// modal helpers
const m=L.crPrepararModal({ticker:"pepe"},"Compra");ok(m.ticker==="OUTRA"&&m.tickerOutra==="PEPE");ok(L.crFinalizarItem({...m,quantidade:"1"}).ticker==="PEPE");
await (async()=>{
 const mk=(map)=>async(url)=>{for(const k in map){if(url.includes(k)){const x=map[k];if(x instanceof Error)throw x;return{ok:x.ok!==false,status:x.status||200,json:async()=>x.body};}}throw new Error("no route");};
 // CoinGecko ok
 let res=await L.crBuscarCotacoes(["BTC","SHIB"],mk({"coingecko":{body:{bitcoin:{brl:300000,brl_24h_change:2},"shiba-inu":{brl:0.00007}}}}));ok(res.quotes.BTC.brl===300000&&res.quotes.SHIB.brl===0.00007&&!res.erros.length,"cg ok");
 // CoinGecko falha -> AwesomeAPI para BTC; SHIB sem fallback
 res=await L.crBuscarCotacoes(["BTC","SHIB"],mk({"coingecko":{ok:false,status:429},"awesomeapi":{body:{BTCBRL:{bid:"299000",pctChange:"1"}}}}));ok(res.quotes.BTC.fonte==="AwesomeAPI"&&!res.quotes.SHIB&&res.erros.length===1,"fallback "+JSON.stringify(res));
 // tudo falha: merge não apaga cache
 res=await L.crBuscarCotacoes(["BTC"],mk({"coingecko":new Error("x"),"awesomeapi":new Error("y")}));ok(Object.keys(res.quotes).length===0&&res.erros.length===2);
 const prev={quotes:{BTC:{brl:111,buscadoEm:"2026-11-09T10:00:00.000Z"}},ultimaOK:"2026-11-09T10:00:00.000Z"};
 let mg=L.crMesclarCotacoes(prev,res,"2026-11-09T12:00:00.000Z");ok(mg.quotes.BTC.brl===111&&mg.ultimaOK==="2026-11-09T10:00:00.000Z"&&mg.erro,"cache preservado");
 res=await L.crBuscarCotacoes(["BTC"],mk({"coingecko":{body:{bitcoin:{brl:222}}}}));mg=L.crMesclarCotacoes(prev,res,"2026-11-09T12:00:00.000Z");ok(mg.quotes.BTC.brl===222&&mg.erro===null&&mg.ultimaOK==="2026-11-09T12:00:00.000Z","sucesso");
 // ticker sem catálogo
 res=await L.crBuscarCotacoes(["PEPE"],mk({}));mg=L.crMesclarCotacoes(null,res,"2026-11-09T12:00:00.000Z");ok(/preço manual/.test(mg.erro),"sem catálogo");
 
})()

});
