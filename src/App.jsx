import React,{useState,useEffect,useRef,useMemo,createContext,useContext,useCallback} from"react";
import{db,doc,getDoc,setDoc}from"./firebase.js";
const TC=createContext();const useT=()=>useContext(TC);
const DARK={bg:"#0b0f14",surface:"#12171e",surfaceAlt:"#181e27",border:"#1e2630",borderLight:"#2a3342",text:"#e2e8f0",textDim:"#8494a7",textMuted:"#556677",accent:"#10b981",accentGlow:"rgba(16,185,129,0.12)",red:"#ef4444",redDim:"rgba(239,68,68,0.12)",blue:"#3b82f6",blueDim:"rgba(59,130,246,0.12)",yellow:"#f59e0b",yellowDim:"rgba(245,158,11,0.12)",purple:"#a855f7",purpleDim:"rgba(168,85,247,0.12)",orange:"#f97316",orangeDim:"rgba(249,115,22,0.12)",cyan:"#06b6d4",cyanDim:"rgba(6,182,212,0.12)",hover:"rgba(255,255,255,0.04)",sidebarBg:"#0f1319",thBg:"#181e27"};
const LIGHT={bg:"#f0f2f5",surface:"#ffffff",surfaceAlt:"#f7f8fa",border:"#e2e5ea",borderLight:"#d0d5dd",text:"#1a1d23",textDim:"#5f6b7a",textMuted:"#9ca3af",accent:"#059669",accentGlow:"rgba(5,150,105,0.10)",red:"#dc2626",redDim:"rgba(220,38,38,0.08)",blue:"#2563eb",blueDim:"rgba(37,99,235,0.08)",yellow:"#d97706",yellowDim:"rgba(217,119,6,0.08)",purple:"#7c3aed",purpleDim:"rgba(124,58,237,0.08)",orange:"#ea580c",orangeDim:"rgba(234,88,12,0.08)",cyan:"#0891b2",cyanDim:"rgba(8,145,178,0.08)",hover:"rgba(0,0,0,0.03)",sidebarBg:"#e8eaed",thBg:"#dfe1e5"};
const INDUSTRIAL_LIGHT={bg:"#faf8f5",surface:"#ffffff",surfaceAlt:"#f5f2ee",border:"#d8d3cc",borderLight:"#e0dbd4",text:"#2c2a26",textDim:"#6b6860",textMuted:"#908d85",accent:"#4a7c59",accentGlow:"rgba(74,124,89,0.10)",red:"#b33a3a",redDim:"rgba(179,58,58,0.06)",blue:"#3d6b99",blueDim:"rgba(61,107,153,0.06)",yellow:"#a67c3d",yellowDim:"rgba(166,124,61,0.06)",purple:"#7a5ea8",purpleDim:"rgba(122,94,168,0.06)",orange:"#c47a35",orangeDim:"rgba(196,122,53,0.06)",cyan:"#3d8a8a",cyanDim:"rgba(61,138,138,0.06)",hover:"rgba(0,0,0,0.03)",sidebarBg:"#f0ede8",thBg:"#e8e3dd"};
const INDUSTRIAL={bg:"#f5f0eb",surface:"#ebe6df",surfaceAlt:"#e0dbd4",border:"#c8c3bc",borderLight:"#d5d0c9",text:"#2c2a26",textDim:"#6b6860",textMuted:"#908d85",accent:"#4a7c59",accentGlow:"rgba(74,124,89,0.12)",red:"#b33a3a",redDim:"rgba(179,58,58,0.08)",blue:"#3d6b99",blueDim:"rgba(61,107,153,0.08)",yellow:"#a67c3d",yellowDim:"rgba(166,124,61,0.08)",purple:"#7a5ea8",purpleDim:"rgba(122,94,168,0.08)",orange:"#c47a35",orangeDim:"rgba(196,122,53,0.08)",cyan:"#3d8a8a",cyanDim:"rgba(61,138,138,0.08)",hover:"rgba(0,0,0,0.04)",sidebarBg:"#d8d3cc",thBg:"#cec9c2"};
const PLANNER={bg:"#faf6f1",surface:"#ffffff",surfaceAlt:"#f5f0ea",border:"#e8e0d6",borderLight:"#ede6dd",text:"#2d2926",textDim:"#6b635a",textMuted:"#a09890",accent:"#c4622a",accentGlow:"rgba(196,98,42,0.10)",red:"#c43a3a",redDim:"rgba(196,58,58,0.08)",blue:"#4a7a9b",blueDim:"rgba(74,122,155,0.08)",yellow:"#c49a2a",yellowDim:"rgba(196,154,42,0.08)",purple:"#8a5ea0",purpleDim:"rgba(138,94,160,0.08)",orange:"#c4622a",orangeDim:"rgba(196,98,42,0.08)",cyan:"#3a8a7a",cyanDim:"rgba(58,138,122,0.08)",hover:"rgba(0,0,0,0.03)",sidebarBg:"#2d2926",thBg:"#f0e8df"};
const TABS_M=[{id:"dashboard",l:"Dashboard",ic:"◉"},{id:"comp",l:"Comparação",ic:"⚖"},{id:"evo",l:"Evolução",ic:"📈"},{id:"proj",l:"Projeções",ic:"🎯"}];
const TABS_I=[{id:"rf",l:"Renda Fixa",ic:"▤"},{id:"inco",l:"INCO",ic:"⌂"},{id:"td",l:"Tesouro Direto",ic:"🏛"},{id:"ac",l:"Ações",ic:"▲"},{id:"etf",l:"ETFs",ic:"◆"},{id:"fii",l:"FIIs",ic:"⬡"},{id:"cr",l:"Cripto",ic:"◈"},{id:"ap",l:"Aportes",ic:"↗"},{id:"sim",l:"Simulação",ic:"🧮"}];
const TABS_G=[{id:"orc",l:"Orçamento",ic:"☰"},{id:"irpf",l:"IRPF",ic:"📋"},{id:"prf",l:"PRF",ic:"📊"},{id:"imoveis",l:"Imóveis",ic:"🏠"}];
const TABS_S=[{id:"ind",l:"Índices",ic:"≡"},{id:"cfg",l:"Config",ic:"⚙"}];
const ALL_T=[...TABS_M,...TABS_I,...TABS_G,...TABS_S];
const SK={rf:"ip8-rf",ac:"ip8-ac",etf:"ip8-etf",fii:"ip8-fii",cr:"ip8-cr",ind:"ip8-ind",indLF:"ip8-indLF",ap:"ip8-ap",orc:"ip8-orc",inco:"ip8-inco",banks:"ip8-banks",theme:"ip8-theme",apMeta:"ip8-apMeta",fiiMkt:"ip8-fiiMkt",rates:"ip8-rates",evo:"ip8-evo",cryptoQ:"ip8-cryptoQ",cotCr:"ip8-cotCr",etfHist:"ip8-etfHist",fxUsd:"ip8-fxUsd",crBase:"ip8-crBase",prfRef:"ip8-prfRef",tdApos:"ip8-tdApos",tdLiza:"ip8-tdLiza",simImo:"ip8-simImo",simProj:"ip8-simProj",simPrf:"ip8-simPrf"};
const DEF_PRF_REF={diariaInterior:335,diariaCapitais:380,diariaSPRJ:425,horaGECC:165.78,horaADFRON:11.50,diaADFRON:92};
function ld(k,fb){try{const r=localStorage.getItem(k);return r?JSON.parse(r):fb;}catch{return fb;}}
function sv(k,d){try{localStorage.setItem(k,JSON.stringify(d));}catch(e){console.error(e);}}
const DBANKS=["NUBANK","INTER","CAIXA","SISPRIME","DAYCOVAL","RICO"];
const fmt=v=>{if(v==null||v==="")return"—";const n=Number(v);return n.toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2});};
const fP=v=>(v!=null&&v!=="")?Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%":"—";
const fD=d=>{if(!d)return"—";const p=d.split("-");return`${p[2]}/${p[1]}/${p[0]}`;};
const uid=()=>Math.random().toString(36).slice(2,9);
const mL=d=>{if(!d)return"";const[y,m]=d.split("-");const ms=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];return`${ms[parseInt(m)-1]}/${y}`;};
function getIR(dias){if(dias<=180)return 22.5;if(dias<=360)return 20;if(dias<=720)return 17.5;return 15;}
function diasV(dv){if(!dv)return 9999;return Math.max(0,Math.floor((new Date(dv)-new Date())/(864e5)));}
function temIR(t){return["CDB","Tesouro Selic","Tesouro IPCA+","Tesouro Prefixado","Debênture","LC"].includes(t);}
let RATES={cdi12m:14.15,ipca12m:4.5,igpm:3.5};
async function fetchRates(){try{const[c,i]=await Promise.all([fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.4392/dados/ultimos/1?formato=json").then(r=>r.ok?r.json():null),fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.13522/dados/ultimos/1?formato=json").then(r=>r.ok?r.json():null)]);if(c&&c.length)RATES.cdi12m=Number(c[0].valor);if(i&&i.length)RATES.ipca12m=Number(i[0].valor);sv(SK.rates,RATES);}catch{}}

/* calcRF: Compound interest + correct IR based on holding period
   CDI: Daily rate = (1+CDI_aa)^(1/252)-1. Title daily = daily * (pct/100). Annual = (1+title_daily)^252-1
   IPCA+: Fisher: (1+IPCA)(1+spread)-1 (already annual, 365 calendar days)
   IR: Based on dias desde início da aplicação (holding period), NOT dias até vencimento
   rendAnual = V * ((1+taxaAnual)^1 - 1) = V * taxaAnual (for 1 year projection)
   rendLiq = rendAnual * (1 - IR/100)
   rendMensal = rendLiq / 12 */
function calcRF(item){
  const v=Number(item.valor)||0,t=Number(item.taxa)||0;
  if(v<=0||t<=0)return{rendAnual:"0",rendLiq:"0",rendMensal:"0",taxaReal:"0",taxaRealMensal:"0",irPct:0,taxaNom:"0",taxaNomLabel:"—"};
  const ix=item.indexador||"Pré";
  let taxaNom=t,taxaNomLabel=`${t}% a.a.`;
  
  if(ix==="CDI"||ix==="Selic"){
    // CDI compound: daily CDI rate from annual, then scale by percentage
    // Daily CDI = (1 + CDI_annual/100)^(1/252) - 1
    // Title daily = Daily CDI * (pct/100)  
    // Title annual = (1 + Title daily)^252 - 1
    const cdiAa=RATES.cdi12m/100;
    const cdiDaily=Math.pow(1+cdiAa,1/252)-1;
    const titleDaily=cdiDaily*(t/100);
    taxaNom=(Math.pow(1+titleDaily,252)-1)*100;
    taxaNomLabel=`${t}% CDI`;
  } else if(ix==="IPCA"){
    // Fisher equation: (1+IPCA)(1+spread)-1, compound annual
    const ipca=RATES.ipca12m/100;
    const spread=t/100;
    taxaNom=((1+ipca)*(1+spread)-1)*100;
    taxaNomLabel=`IPCA+${t}%`;
  } else if(ix==="IGPM"||ix==="INCC"){
    const idx=RATES.igpm/100;
    const spread=t/100;
    taxaNom=((1+idx)*(1+spread)-1)*100;
    taxaNomLabel=`${ix}+${t}%`;
  }
  
  // Rendimento anual bruto (projeção 1 ano, juros compostos = simples para 1 ano)
  const rendAnual=v*(taxaNom/100);
  
  // IR: based on HOLDING PERIOD (dias desde início), not dias até vencimento
  // Se não tem data início, usa dias até vencimento como fallback
  let diasHolding=365; // default 1 year
  if(item.dataInicio){
    diasHolding=Math.max(1,Math.floor((new Date()-new Date(item.dataInicio))/(864e5)));
  }
  // For future projection (título ainda não venceu), use the larger of holding or projected total
  if(item.dataInicio&&item.dataVencimento){
    const totalDias=Math.max(1,Math.floor((new Date(item.dataVencimento)-new Date(item.dataInicio))/(864e5)));
    diasHolding=totalDias; // IR é calculado pelo prazo total do título
  }
  const irPct=temIR(item.tipo)?getIR(diasHolding):0;
  
  // Rendimento líquido
  const rendLiq=rendAnual*(1-irPct/100);
  const rendMensal=rendLiq/12;
  
  // Taxa real = taxa líquida de IR (para tributados) ou taxa nominal (isentos)
  const taxaReal=irPct>0?(taxaNom*(1-irPct/100)).toFixed(2):taxaNom.toFixed(2);
  const taxaRealMensal=(Number(taxaReal)/12).toFixed(2);
  
  return{rendAnual:rendAnual.toFixed(2),rendLiq:rendLiq.toFixed(2),rendMensal:rendMensal.toFixed(2),taxaReal,taxaRealMensal,taxaNom:taxaNom.toFixed(2),taxaNomLabel,irPct};
}
/* calcINCO: Google Sheets formula:
   taxaNomAnual = indexador + taxa (ex: CDI 14.15 + 6.5 = 20.65% a.a.)
   Sheets: =((1+G*12/100)^(DAYS(F,E)/365)-1)*A*0.825
   Where G = taxaNomAnual/12, so G*12 = taxaNomAnual
   => ((1 + taxaNomAnual/100)^(dias/365) - 1) * valor * 0.825
   rendMensal: =rendPeriodo / DATEDIF(inicio, fim, "M") */
function calcINCO(item){
  const v=Number(item.valor)||0,t=Number(item.taxa)||0;
  if(v<=0||t<=0)return{rendPeriodo:"0",rendMensal:"0",taxaReal:"0",taxaRealMensal:"0",irPct:17.5,taxaNom:"0",taxaNomLabel:"—"};
  const ix=item.indexador||"Pré";
  
  // Taxa nominal anual = indexador + taxa do usuário (soma simples)
  let idxVal=0;
  if(ix==="CDI"||ix==="Selic") idxVal=RATES.cdi12m;
  else if(ix==="IPCA") idxVal=RATES.ipca12m;
  else if(ix==="IGPM") idxVal=RATES.igpm;
  else if(ix==="INCC") idxVal=RATES.igpm;
  else if(ix==="Dólar") idxVal=5.0;
  // Pré: idxVal=0, taxaNomAnual = just the user's rate
  
  const taxaNomAnual=idxVal+t;
  
  let taxaNomLabel=`${t}% a.a.`;
  if(ix==="CDI"||ix==="Selic") taxaNomLabel=`CDI+${t}%`;
  else if(ix==="IPCA") taxaNomLabel=`IPCA+${t}%`;
  else if(ix==="IGPM"||ix==="INCC") taxaNomLabel=`${ix}+${t}%`;
  else if(ix==="Dólar") taxaNomLabel=`Dólar+${t}%`;
  
  // Dias e meses do investimento
  let dias=365,meses=12;
  if(item.dataInicio&&item.dataVencimento){
    const di=new Date(item.dataInicio),df=new Date(item.dataVencimento);
    dias=Math.max(1,Math.floor((df-di)/(864e5)));
    // DATEDIF equivalent: count full months
    meses=(df.getFullYear()-di.getFullYear())*12+(df.getMonth()-di.getMonth());
    if(meses<1)meses=1;
  }
  
  // Fórmula: ((1 + taxaNomAnual/100)^(dias/365) - 1) * valor * fatorIR
  const isento=!!item.isCriCra;
  const fatorIR=isento?1.0:0.825;
  const irPct=isento?0:17.5;
  const fator=Math.pow(1+taxaNomAnual/100, dias/365)-1;
  const rendBruto=fator*v;
  const rendPeriodo=rendBruto*fatorIR;
  const rendMensal=rendPeriodo/meses;
  
  const taxaReal=(ix==="Pré")?taxaNomAnual.toFixed(2):(taxaNomAnual*fatorIR).toFixed(2);
  const taxaRealMensal=(Number(taxaReal)/12).toFixed(2);
  
  return{rendPeriodo:rendPeriodo.toFixed(2),rendMensal:rendMensal.toFixed(2),taxaReal,taxaRealMensal,taxaNom:taxaNomAnual.toFixed(2),taxaNomLabel,irPct};
}

const FII_MKT_DEF=[
  {ticker:"MXRF11",nome:"Maxi Renda",setor:"Papel",preco:9.80,pvp:0.98,dy:12.5,ultDiv:0.1},
  {ticker:"HGLG11",nome:"CSHG Logística",setor:"Logística",preco:158,pvp:0.95,dy:8.4,ultDiv:1.11},
  {ticker:"XPLG11",nome:"XP Log",setor:"Logística",preco:95.5,pvp:0.90,dy:9.1,ultDiv:0.72},
  {ticker:"KNRI11",nome:"Kinea Renda",setor:"Híbrido",preco:133,pvp:0.85,dy:8.8,ultDiv:0.98},
  {ticker:"HGRU11",nome:"CSHG Renda Urbana",setor:"Renda Urbana",preco:115,pvp:0.92,dy:8.2,ultDiv:0.79},
  {ticker:"VISC11",nome:"Vinci Shopping",setor:"Shopping",preco:100,pvp:0.88,dy:9.5,ultDiv:0.79},
  {ticker:"BTLG11",nome:"BTG Logística",setor:"Logística",preco:95,pvp:0.93,dy:9.0,ultDiv:0.71},
  {ticker:"XPML11",nome:"XP Malls",setor:"Shopping",preco:96,pvp:0.87,dy:9.8,ultDiv:0.78},
  {ticker:"VILG11",nome:"Vinci Logística",setor:"Logística",preco:88,pvp:0.82,dy:9.2,ultDiv:0.67},
  {ticker:"IRDM11",nome:"Iridium Recebíveis",setor:"Papel",preco:68,pvp:0.90,dy:13.0,ultDiv:0.74},
  {ticker:"KNCR11",nome:"Kinea Rendimentos",setor:"Papel",preco:100,pvp:1.02,dy:12.8,ultDiv:1.07},
  {ticker:"CPTS11",nome:"Capitânia Securities",setor:"Papel",preco:80,pvp:0.92,dy:12.2,ultDiv:0.81},
  {ticker:"RBRR11",nome:"RBR High Grade",setor:"Papel",preco:85,pvp:0.95,dy:11.5,ultDiv:0.81},
  {ticker:"BCFF11",nome:"BTG FoF",setor:"FoF",preco:65,pvp:0.85,dy:10.0,ultDiv:0.54},
  {ticker:"HGBS11",nome:"Hedge Shopping",setor:"Shopping",preco:190,pvp:0.88,dy:8.5,ultDiv:1.35},
  {ticker:"PVBI11",nome:"VBI Prime",setor:"Lajes",preco:80,pvp:0.78,dy:9.3,ultDiv:0.62},
  {ticker:"VGIR11",nome:"Valora RE",setor:"Papel",preco:9.50,pvp:0.97,dy:13.5,ultDiv:0.11},
  {ticker:"TGAR11",nome:"TG Ativo Real",setor:"Híbrido",preco:120,pvp:0.95,dy:11.0,ultDiv:1.1},
  {ticker:"RECR11",nome:"REC Recebíveis",setor:"Papel",preco:80,pvp:0.92,dy:12.0,ultDiv:0.8},
  {ticker:"ALZR11",nome:"Alianza Trust",setor:"Híbrido",preco:105,pvp:0.90,dy:8.8,ultDiv:0.77},
  {ticker:"KNSC11",nome:"Kinea Securities",setor:"Papel",preco:8.50,pvp:0.94,dy:13.2,ultDiv:0.09},
  {ticker:"VRTA11",nome:"Fator Veritá",setor:"Papel",preco:80,pvp:0.88,dy:12.0,ultDiv:0.8},
  {ticker:"HFOF11",nome:"Hedge TOP FOFII",setor:"FoF",preco:70,pvp:0.82,dy:10.5,ultDiv:0.61},
  {ticker:"JSRE11",nome:"JS Real Estate",setor:"Lajes",preco:65,pvp:0.72,dy:9.0,ultDiv:0.49},
  {ticker:"BRCR11",nome:"BTG Corp Office",setor:"Lajes",preco:50,pvp:0.55,dy:8.5,ultDiv:0.35},
  {ticker:"RBRP11",nome:"RBR Properties",setor:"Lajes",preco:45,pvp:0.65,dy:9.8,ultDiv:0.37},
  {ticker:"HSML11",nome:"HSI Malls",setor:"Shopping",preco:80,pvp:0.85,dy:9.2,ultDiv:0.61},
  {ticker:"TRXF11",nome:"TRX Real Estate",setor:"Renda Urbana",preco:100,pvp:0.95,dy:9.5,ultDiv:0.79},
  {ticker:"LVBI11",nome:"VBI Logístico",setor:"Logística",preco:100,pvp:0.88,dy:8.8,ultDiv:0.73},
  {ticker:"BRCO11",nome:"Bresco Logística",setor:"Logística",preco:110,pvp:0.92,dy:8.5,ultDiv:0.78},
  {ticker:"HGRE11",nome:"CSHG Real Estate",setor:"Lajes",preco:110,pvp:0.78,dy:8.0,ultDiv:0.73},
  {ticker:"RBRF11",nome:"RBR Alpha FoF",setor:"FoF",preco:68,pvp:0.80,dy:10.0,ultDiv:0.57},
  {ticker:"XPCI11",nome:"XP Crédito Imob.",setor:"Papel",preco:80,pvp:0.92,dy:12.5,ultDiv:0.83},
  {ticker:"VGHF11",nome:"Valora Hedge Fund",setor:"Papel",preco:8.00,pvp:0.90,dy:14.0,ultDiv:0.09},
  {ticker:"PLCR11",nome:"Plural Recebíveis",setor:"Papel",preco:80,pvp:0.90,dy:12.8,ultDiv:0.85},
  {ticker:"MALL11",nome:"Malls Brasil Plural",setor:"Shopping",preco:95,pvp:0.88,dy:9.0,ultDiv:0.71},
  {ticker:"GARE11",nome:"Guardian RE",setor:"Híbrido",preco:8.00,pvp:0.85,dy:11.5,ultDiv:0.08},
  {ticker:"SNFF11",nome:"Suno FoF",setor:"FoF",preco:80,pvp:0.85,dy:10.2,ultDiv:0.68},
  {ticker:"HCTR11",nome:"Hectare CE",setor:"Papel",preco:30,pvp:0.55,dy:15.0,ultDiv:0.38},
  {ticker:"DEVA11",nome:"Devant Recebíveis",setor:"Papel",preco:35,pvp:0.60,dy:14.0,ultDiv:0.41},
  {ticker:"RZTR11",nome:"Riza Terrax",setor:"Rural",preco:90,pvp:0.90,dy:11.0,ultDiv:0.83},
  {ticker:"CVBI11",nome:"VBI CRI",setor:"Papel",preco:85,pvp:0.92,dy:12.0,ultDiv:0.85},
  {ticker:"BTAL11",nome:"BTG Agro",setor:"Rural",preco:80,pvp:0.88,dy:10.5,ultDiv:0.7},
  {ticker:"OUJP11",nome:"Ourinvest JPP",setor:"Papel",preco:75,pvp:0.85,dy:13.5,ultDiv:0.84},
  {ticker:"CACR11",nome:"Cartesia Recebíveis",setor:"Papel",preco:95,pvp:0.96,dy:13.0,ultDiv:1.03},
  {ticker:"RBRX11",nome:"RBR Plus",setor:"Híbrido",preco:8.50,pvp:0.88,dy:11.0,ultDiv:0.08},
  {ticker:"HABT11",nome:"Habitat Recebíveis",setor:"Papel",preco:80,pvp:0.85,dy:13.0,ultDiv:0.87},
  {ticker:"RZAK11",nome:"Riza Akin",setor:"Papel",preco:85,pvp:0.90,dy:12.5,ultDiv:0.89},
  {ticker:"MCCI11",nome:"Mauá Capital",setor:"Papel",preco:85,pvp:0.92,dy:12.2,ultDiv:0.86},
  {ticker:"VCJR11",nome:"Vectis Juros Real",setor:"Papel",preco:85,pvp:0.90,dy:12.8,ultDiv:0.91},
  {ticker:"AIEC11",nome:"Autonomy Edifícios",setor:"Lajes",preco:55,pvp:0.55,dy:9.5,ultDiv:0.44},
  {ticker:"GTWR11",nome:"Green Towers",setor:"Lajes",preco:65,pvp:0.72,dy:9.0,ultDiv:0.49},
  {ticker:"VINO11",nome:"Vinci Offices",setor:"Lajes",preco:7.00,pvp:0.60,dy:9.5,ultDiv:0.06},
  {ticker:"TEPP11",nome:"Tellus Properties",setor:"Lajes",preco:60,pvp:0.70,dy:9.0,ultDiv:0.45},
  {ticker:"KIVO11",nome:"Kilima Volkano",setor:"Papel",preco:8.50,pvp:0.85,dy:13.5,ultDiv:0.1},
  {ticker:"AFHI11",nome:"AF Invest CRI",setor:"Papel",preco:90,pvp:0.93,dy:12.5,ultDiv:0.94},
  {ticker:"CYCR11",nome:"Cyrela Crédito",setor:"Papel",preco:9.00,pvp:0.95,dy:12.8,ultDiv:0.1},
  {ticker:"URPR11",nome:"Urca Prime",setor:"Papel",preco:75,pvp:0.80,dy:14.5,ultDiv:0.91},
  {ticker:"TVRI11",nome:"Tivio Renda",setor:"Híbrido",preco:90,pvp:0.88,dy:10.0,ultDiv:0.75},
  {ticker:"BLMG11",nome:"BlueMacaw Logística",setor:"Logística",preco:45,pvp:0.55,dy:9.5,ultDiv:0.36},
  {ticker:"RBVA11",nome:"Rio Bravo Renda",setor:"Renda Urbana",preco:100,pvp:0.90,dy:9.8,ultDiv:0.82},
  {ticker:"GRUL11",nome:"Guarulhos RE",setor:"Híbrido",preco:8.00,pvp:0.85,dy:10.5,ultDiv:0.07},
  {ticker:"RPRI11",nome:"RBR Premium",setor:"Papel",preco:85,pvp:0.92,dy:12.0,ultDiv:0.85},
  {ticker:"GGRC11",nome:"GGR Covepi",setor:"Logística",preco:95,pvp:0.88,dy:9.0,ultDiv:0.71},
  {ticker:"FEXC11",nome:"BTG Fundo Exc.",setor:"Papel",preco:60,pvp:0.85,dy:12.0,ultDiv:0.6},
  {ticker:"MGFF11",nome:"Mogno FoF",setor:"FoF",preco:60,pvp:0.80,dy:10.5,ultDiv:0.53},
  {ticker:"XFIX11",nome:"XP Selection IFIX",setor:"ETF/FoF",preco:9.00,pvp:0.95,dy:10.0,ultDiv:0.07},
  {ticker:"NSLU11",nome:"Hospital N.S. Lourdes",setor:"Hospital",preco:170,pvp:0.95,dy:7.5,ultDiv:1.06},
  {ticker:"HCRI11",nome:"Hospital Criança",setor:"Hospital",preco:180,pvp:0.90,dy:7.0,ultDiv:1.05},
  {ticker:"RCRB11",nome:"Rio Bravo Corp",setor:"Lajes",preco:130,pvp:0.72,dy:8.5,ultDiv:0.92},
  {ticker:"PMLL11",nome:"Pátria Malls",setor:"Shopping",preco:75,pvp:0.85,dy:9.5,ultDiv:0.60},
  {ticker:"PML11",nome:"Pátria Malls",setor:"Shopping",preco:75,pvp:0.85,dy:9.5,ultDiv:0.60},
  {ticker:"KNCA11",nome:"Kinea Crédito Agro",setor:"Rural",preco:95,pvp:0.92,dy:12.0,ultDiv:0.95},
];
/* FII dividend = último dividendo × quantidade de cotas */
function getFiiData(ticker,mkt){const tk=(ticker||"").toUpperCase();const m=mkt.find(f=>f.ticker.toUpperCase()===tk);return m||null;}

function useS(){const P=useT();return useMemo(()=>({
  i:{background:P.surfaceAlt,border:`1px solid ${P.borderLight}`,borderRadius:6,padding:"8px 12px",fontSize:13,color:P.text,fontFamily:"inherit",width:"100%",boxSizing:"border-box",outline:"none"},
  sel:{background:P.surfaceAlt,border:`1px solid ${P.borderLight}`,borderRadius:6,padding:"8px 12px",fontSize:13,color:P.text,fontFamily:"inherit",width:"100%",boxSizing:"border-box",outline:"none",appearance:"none"},
  lbl:{fontSize:11,fontWeight:600,color:P.textDim,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"},
  card:{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,padding:20,marginBottom:16},
  th:{textAlign:"left",padding:"10px 12px",borderBottom:`2px solid ${P.border}`,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:"0.6px",color:P.textDim,whiteSpace:"nowrap",cursor:"pointer",userSelect:"none",background:P.thBg||"transparent"},
  td:{padding:"10px 12px",borderBottom:`1px solid ${P.border}`,whiteSpace:"nowrap"},
  btn:(c=P.accent)=>({background:c,color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}),
  btnA:()=>({background:P.surfaceAlt,color:P.text,border:`2px solid ${P.accent}`,borderRadius:6,padding:"7px 15px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}),
  btnO:{background:"transparent",color:P.textDim,border:`1px solid ${P.borderLight}`,borderRadius:6,padding:"8px 16px",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"},
  tag:(c,bg)=>({display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:600,color:c,background:bg}),
}),[P]);}
function SC({label,value,color,dim}){const P=useT();return(<div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,padding:"18px 20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,right:0,width:60,height:60,background:dim||P.accentGlow,borderRadius:"0 0 0 60px",opacity:0.5}}/><div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px",color:P.textDim,marginBottom:8}}>{label}</div><div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.5px",color:color||P.accent}}>{value}</div></div>);}
function TR({children,onClick,baseBg}){const P=useT();const[h,setH]=useState(false);return(<tr style={{cursor:"pointer",background:h?P.hover:baseBg||"transparent",transition:"background 0.15s"}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick}>{children}</tr>);}
function STH({label,field,sb,sd,onS,style}){const P=useT();const a=sb===field;return(<th style={style} onClick={()=>onS(field)}>{label} {a&&<span style={{color:P.accent}}>{sd==="asc"?"▲":"▼"}</span>}</th>);}
const PC=["#3b82f6","#10b981","#f59e0b","#a855f7","#f97316","#06b6d4","#ef4444","#ec4899","#84cc16","#6366f1","#14b8a6","#0ea5e9","#8b5cf6","#d946ef","#78716c","#64748b","#ca8a04","#059669","#dc2626","#ea580c","#d97706","#65a30d","#0d9488","#7c3aed","#a3a3a3"];
function Pie({data,size=260}){const P=useT();const[hover,setHover]=useState(null);const[mounted,setMounted]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setMounted(true),30);return()=>clearTimeout(t);},[]);
  const total=data.reduce((a,d)=>a+d.value,0);if(total<=0)return null;let cum=0;const r=size/2-4,cx=size/2,cy=size/2;
  const sl=data.filter(d=>d.value>0).map((d,i)=>{const pct=d.value/total;const sa=cum;cum+=pct*2*Math.PI;const ea=cum;const la=pct>0.5?1:0;
    if(pct>=0.999)return{p:`M ${cx} ${cy-r} A ${r} ${r} 0 1 1 ${cx-0.01} ${cy-r} Z`,c:d.color||PC[i%PC.length],l:d.label,pct,val:d.value,idx:i};
    const x1=cx+r*Math.cos(sa-Math.PI/2),y1=cy+r*Math.sin(sa-Math.PI/2),x2=cx+r*Math.cos(ea-Math.PI/2),y2=cy+r*Math.sin(ea-Math.PI/2);
    return{p:`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`,c:d.color||PC[i%PC.length],l:d.label,pct,val:d.value,idx:i,midA:(sa+ea)/2};
  });
  // Animation: scale each slice from center on mount
  const animStyle=(s,i)=>({
    transformOrigin:`${cx}px ${cy}px`,
    transform:mounted?"scale(1)":"scale(0)",
    transition:`transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i*60}ms`,
    cursor:"pointer",
    filter:hover===s.idx?"drop-shadow(0 2px 6px rgba(0,0,0,0.3))":"none",
    opacity:hover===null||hover===s.idx?1:0.55,
  });
  return(<div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
    <div style={{position:"relative"}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {sl.map((s,i)=>{
          const isHov=hover===s.idx;
          // Slightly expand hovered slice
          const nudge=isHov?8:0;
          const mx=cx+nudge*Math.cos(s.midA-Math.PI/2);const my=cy+nudge*Math.sin(s.midA-Math.PI/2);
          const dPath=isHov&&s.midA!==undefined?s.p.replace(`M ${cx} ${cy}`,`M ${mx.toFixed(1)} ${my.toFixed(1)}`):s.p;
          return(<path key={i} d={dPath} fill={s.c} stroke={P.bg} strokeWidth={isHov?"3":"2"} style={{...animStyle(s,i),transition:`transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i*60}ms, opacity 0.15s, filter 0.15s`}} onMouseEnter={()=>setHover(s.idx)} onMouseLeave={()=>setHover(null)}/>);
        })}
      </svg>
      {hover!==null&&sl[hover]&&(<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none",animation:"numPop 0.2s ease-out"}}>
        <div style={{fontSize:11,fontWeight:700,color:P.text,marginBottom:2}}>{sl[hover].l}</div>
        <div style={{fontSize:15,fontWeight:700,color:sl[hover].c}}>{fmt(sl[hover].val)}</div>
        <div style={{fontSize:11,color:P.textDim}}>{(sl[hover].pct*100).toFixed(1)}%</div>
      </div>)}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {sl.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,opacity:hover===null||hover===s.idx?1:0.5,cursor:"pointer",transition:"opacity 0.15s, transform 0.15s",transform:hover===s.idx?"translateX(4px)":"translateX(0)"}} onMouseEnter={()=>setHover(s.idx)} onMouseLeave={()=>setHover(null)}>
        <div style={{width:10,height:10,borderRadius:2,background:s.c,flexShrink:0,transition:"transform 0.15s",transform:hover===s.idx?"scale(1.3)":"scale(1)"}}/>
        <span>{CAT_EMOJI[s.l]||""} </span><span style={{color:P.textDim}}>{s.l}</span>
        <span style={{fontWeight:600}}>{fmt(s.val)}</span>
        <span style={{color:P.textMuted}}>({(s.pct*100).toFixed(1)}%)</span>
      </div>))}
    </div>
  </div>);
}

function Mdl({title,fields,onSave,onCancel,initial,banks,autoFocus}){const P=useT();const S=useS();const[v,setV]=useState(initial||{});const set=(k,val)=>setV(p=>({...p,[k]:val}));const firstRef=useRef(null);
  useEffect(()=>{if(firstRef.current)firstRef.current.focus();},[]);
  const rf=fields.map(f=>{
    if(f.key==="banco"&&f.type==="select"&&f.useBanks)return{...f,options:banks||DBANKS};
    if(f.key==="categoria"&&f.dynamicOptions)return{...f,options:v.tipo==="Receita"?ORC_REC:ORC_C,emojiMap:CAT_EMOJI};
    return f;
  });
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}} onClick={onCancel}><div style={{...S.card,maxWidth:560,width:"100%",margin:0,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{fontSize:16,fontWeight:700,marginBottom:20}}>{title}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:16}}>{rf.map(f=>{if(f.hidden)return null;
    // showWhen: "key=value" conditional visibility
    if(f.showWhen){const[sk,sv2]=f.showWhen.split("=");if((v[sk]||"")!==sv2)return null;}
    return(<div key={f.key} style={f.wide?{gridColumn:"1/-1"}:{}}><label style={S.lbl}>{f.label}</label>{f.type==="select"?(<select style={S.sel} value={v[f.key]||""} onChange={e=>{set(f.key,e.target.value);if(f.key==="categoria"&&typeof AUTO_FIXO!=="undefined"&&AUTO_FIXO.includes(e.target.value))set("fixo",true);}}><option value="">Selecione</option>{f.options.map(o=><option key={o} value={o}>{f.emojiMap&&f.emojiMap[o]?f.emojiMap[o]+" "+o:o}</option>)}</select>):f.type==="checkbox"?(<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={!!v[f.key]} onChange={e=>set(f.key,e.target.checked)}/><span style={{fontSize:13,color:P.text}}>{f.checkLabel||"Sim"}</span></label>):f.readOnly?(<div style={{...S.i,background:P.bg,color:P.textDim}}>{v[f.key]||"Auto"}</div>):(<input ref={(autoFocus===f.key)?firstRef:null} style={S.i} type={f.type||"text"} step={f.step} placeholder={f.placeholder||""} value={v[f.key]||""} max={f.type==="date"?"2099-12-31":undefined} min={f.type==="date"?"2020-01-01":undefined} onChange={e=>set(f.key,e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();let out={...v,id:v.id||uid()};if(fields.some(ff=>ff.key==="rendAnual")){const c=calcRF(v);out={...out,...c};}onSave(out);}}}/>)}</div>);})}</div><div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button style={S.btnO} onClick={onCancel}>Cancelar</button><button style={S.btn()} onClick={()=>{let out={...v,id:v.id||uid()};if(fields.some(f=>f.key==="rendAnual")){const c=calcRF(v);out={...out,...c};}onSave(out);}}>Salvar</button></div></div></div>);}
function Cfm({msg,onOk,onNo}){const P=useT();const S=useS();return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}} onClick={onNo}><div style={{...S.card,maxWidth:400,width:"100%",margin:0}} onClick={e=>e.stopPropagation()}><div style={{fontSize:14,marginBottom:20,lineHeight:1.6}}>{msg}</div><div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button style={S.btnO} onClick={onNo}>Cancelar</button><button style={S.btn(P.red)} onClick={onOk}>Excluir</button></div></div></div>);}
function CRUD({title,icon,fields,data,setData,columns,renderRow,footerRow,cards,headerExtra,banks,subtitle,sortFields}){const P=useT();const S=useS();const[modal,setModal]=useState(null);const[del,setDel]=useState(null);
  const{sb:cSb,sd:cSd,onS:cOnS,doS:cDoS}=useSort();const sortedData=sortFields?cDoS(data):data;
  const doSave=item=>{setData(p=>{const i=p.findIndex(x=>x.id===item.id);if(i>=0){const n=[...p];n[i]=item;return n;}return[...p,item];});setModal(null);};
  return(<div>{title&&(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}><div style={{fontSize:22,fontWeight:700}}>{title}</div><div style={{display:"flex",gap:8,alignItems:"center"}}>{headerExtra}<button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button></div></div>)}{!title&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button></div>}{subtitle&&<div style={{fontSize:13,color:P.textDim,marginBottom:28}}>{subtitle}</div>}{cards&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:24}}>{cards}</div>}{data.length===0?(<div style={{textAlign:"center",padding:60,color:P.textMuted}}><div style={{fontSize:36,marginBottom:12}}>{icon||"○"}</div><div>Nenhum registro</div></div>):(<div style={{...S.card,padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{sortFields?sortFields.map((sf,i)=>(<STH key={sf.k||columns[i]} label={columns[i]} field={sf.k} sb={cSb} sd={cSd} onS={cOnS} style={S.th}/>)):columns.map(h=><th key={h} style={S.th}>{h}</th>)}<th style={S.th}></th></tr></thead><tbody>{sortedData.map(item=>(<TR key={item.id} onClick={()=>setModal(item)}>{renderRow(item)}<td style={S.td}><button style={{background:"transparent",border:"none",color:P.textMuted,cursor:"pointer",fontSize:16,fontFamily:"inherit"}} onClick={e=>{e.stopPropagation();setDel(item.id);}}>✕</button></td></TR>))}</tbody>{footerRow&&<tfoot><tr>{footerRow}</tr></tfoot>}</table></div>)}{modal&&<Mdl title={modal==="new"?"Novo":"Editar"} fields={fields} initial={modal==="new"?{}:modal} onSave={doSave} onCancel={()=>setModal(null)} banks={banks}/>}{del&&<Cfm msg="Excluir?" onOk={()=>{setData(p=>p.filter(x=>x.id!==del));setDel(null);}} onNo={()=>setDel(null)}/>}</div>);}

/* INDICES */
const BCB_M={"SELIC (meta)":{c:432,m:"l",u:"%"},"SELIC (mês)":{c:4390,m:"l",u:"%"},"SELIC (acum.jan)":{c:4390,m:"a",u:"%"},"IPCA (mês)":{c:433,m:"l",u:"%"},"IPCA (acum.12m)":{c:13522,m:"l",u:"%"},"CDI (mês)":{c:4391,m:"l",u:"%"},"CDI (acum.12m)":{c:4392,m:"l",u:"%"},"Poupança":{c:195,m:"l",u:"%"},"Dólar":{c:1,m:"l",u:"R$"},"IGPM":{c:189,m:"l",u:"%"},"Sal.Mínimo":{c:1619,m:"l",u:"R$"}};
async function fBCB(c,n){try{const r=await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${c}/dados/ultimos/${n}?formato=json`);if(!r.ok)return null;return await r.json();}catch{return null;}}
async function fAllInd(){const res={};await Promise.all(Object.entries(BCB_M).map(async([n,cfg])=>{const d=await fBCB(cfg.c,cfg.m==="a"?60:3);if(!d||!d.length)return;if(cfg.m==="l"){res[n]={valor:d[d.length-1].valor,data:d[d.length-1].data,unidade:cfg.u};}else{const yr=new Date().getFullYear();const yd=d.filter(x=>parseInt(x.data.split("/")[2])===yr);const ac=yd.reduce((a,x)=>a*(1+Number(x.valor)/100),1);res[n]={valor:((ac-1)*100).toFixed(2),data:yd.length?yd[yd.length-1].data:"",unidade:cfg.u};}}));try{const r=await fetch("https://api.dadosdemercado.com.br/v1/macro/incc-m");if(r.ok){const d=await r.json();if(d&&d.length)res["INCC"]={valor:d[d.length-1].value,data:d[d.length-1].date,unidade:"%"};}}catch{}return res;}
function IndTab({data,setData,prfRef,setPrfRef}){const P=useT();const S=useS();const[f,setF]=useState(false);const[lf,setLf]=useState(()=>ld(SK.indLF,null));const[ed,setEd]=useState(false);const[dr,setDr]=useState(data);const[edPrf,setEdPrf]=useState(false);const[prfDr,setPrfDr]=useState(prfRef||DEF_PRF_REF);useEffect(()=>{setDr(data);},[data]);useEffect(()=>{setPrfDr(prfRef||DEF_PRF_REF);},[prfRef]);
  const doF=async()=>{setF(true);try{const r=await fAllInd();await fetchRates();const u=data.map(it=>r[it.nome]?{...it,valor:r[it.nome].valor,dataRef:r[it.nome].data,unidade:r[it.nome].unidade}:it);Object.entries(r).forEach(([n,v])=>{if(!u.find(x=>x.nome===n))u.push({nome:n,valor:v.valor,dataRef:v.data,unidade:v.unidade});});setData(u);const now=new Date().toISOString();setLf(now);sv(SK.indLF,now);}catch{}setF(false);};
  const da=useRef(false);useEffect(()=>{if(da.current)return;da.current=true;const c=ld(SK.rates,null);if(c)RATES=c;const l=ld(SK.indLF,null);if(!l||(Date.now()-new Date(l).getTime())>86400000)doF();},[]);
  return(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:10}}><div style={{fontSize:22,fontWeight:700}}>Índices</div><div style={{display:"flex",gap:8}}>{ed?(<React.Fragment><button style={S.btnO} onClick={()=>{setDr(data);setEd(false);}}>Cancelar</button><button style={S.btn()} onClick={()=>{setData(dr);setEd(false);}}>Salvar</button></React.Fragment>):(<React.Fragment><button style={S.btnO} onClick={()=>setEd(true)}>Editar</button><button style={S.btn()} onClick={doF} disabled={f}>{f?"...":"⟳ Atualizar"}</button></React.Fragment>)}</div></div><div style={{fontSize:11,color:P.textMuted,marginBottom:6}}>CDI 12m: {RATES.cdi12m.toFixed(2)}% · IPCA 12m: {RATES.ipca12m.toFixed(2)}%</div>{lf&&<div style={{fontSize:12,color:P.textDim,marginBottom:20,padding:"8px 12px",background:P.surfaceAlt,borderRadius:6,display:"inline-block"}}>Última atualização: <b>{new Date(lf).toLocaleDateString("pt-BR")}</b> às <b>{new Date(lf).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</b></div>}<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>{dr.map((it,idx)=>(<div key={it.nome} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,padding:"14px 18px"}}><div style={{fontSize:11,fontWeight:600,color:P.textDim,textTransform:"uppercase",marginBottom:6}}>{it.nome}</div>{ed?(<input style={{...S.i,fontSize:16,fontWeight:700}} type="number" step="0.01" value={dr[idx].valor||""} onChange={e=>{const n=[...dr];n[idx]={...n[idx],valor:e.target.value};setDr(n);}}/>):(<div style={{fontSize:20,fontWeight:700,color:it.valor?P.text:P.textMuted}}>{it.valor?(it.unidade==="R$"?fmt(it.valor):fP(it.valor)):"—"}</div>)}</div>))}</div>
    {/* PRF References */}
    <div style={{marginTop:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:18,fontWeight:700}}>Referências PRF</div>{edPrf?<div style={{display:"flex",gap:8}}><button style={S.btnO} onClick={()=>{setPrfDr(prfRef||DEF_PRF_REF);setEdPrf(false);}}>Cancelar</button><button style={S.btn()} onClick={()=>{setPrfRef(prfDr);setEdPrf(false);}}>Salvar</button></div>:<button style={S.btnO} onClick={()=>setEdPrf(true)}>Editar</button>}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
        {[{k:"diariaInterior",l:"Diária Interior",u:"R$"},{k:"diariaCapitais",l:"Diária Capitais",u:"R$"},{k:"diariaSPRJ",l:"Diária SP/RJ/AM/BSB",u:"R$"},{k:"horaGECC",l:"Hora GECC",u:"R$"},{k:"horaADFRON",l:"Hora ADFRON",u:"R$"},{k:"diaADFRON",l:"Dia ADFRON",u:"R$"}].map(ref=>(<div key={ref.k} style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,padding:"14px 18px"}}><div style={{fontSize:11,fontWeight:600,color:P.textDim,textTransform:"uppercase",marginBottom:6}}>{ref.l}</div>{edPrf?(<input style={{...S.i,fontSize:16,fontWeight:700}} type="number" step="0.01" value={prfDr[ref.k]||""} onChange={e=>{setPrfDr({...prfDr,[ref.k]:Number(e.target.value)});}}/>):(<div style={{fontSize:20,fontWeight:700,color:P.text}}>{fmt(prfDr[ref.k])}</div>)}</div>))}
      </div>
    </div>
  </div>);}

function useSort(defField,defDir){const[sb,setSb]=useState(defField||null);const[sd,setSd]=useState(defDir||"asc");const onS=f=>{if(sb===f)setSd(d=>d==="asc"?"desc":"asc");else{setSb(f);setSd("asc");}};const doS=arr=>{if(!sb)return arr;return[...arr].sort((a,b)=>{let va=a[sb],vb=b[sb];if(va==null)va="";if(vb==null)vb="";const na=Number(va),nb=Number(vb);if(!isNaN(na)&&!isNaN(nb))return sd==="asc"?na-nb:nb-na;return sd==="asc"?String(va).localeCompare(String(vb)):String(vb).localeCompare(String(va));});};return{sb,sd,onS,doS};}
/* ===== Utilitários (calendário puro: independem do fuso horário do navegador) ===== */
const ymdToUTC=v=>{if(typeof v==="number")return v;const m=String(v||"").match(/^(\d{4})-(\d{2})-(\d{2})/);return m?Date.UTC(+m[1],+m[2]-1,+m[3]):NaN;};
const localISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
/* PRF: dias úteis (seg-sex) entre duas datas YYYY-MM-DD, inclusive */
const prfNetworkDays=(start,end)=>{const a=ymdToUTC(start),b=ymdToUTC(end);if(isNaN(a)||isNaN(b))return 0;let c=0;for(let t=a;t<=b;t+=864e5){const w=new Date(t).getUTCDay();if(w!==0&&w!==6)c++;}return c;};
const prfMonthBounds=ymd=>{const t=ymdToUTC(ymd);if(isNaN(t))return null;const d=new Date(t),y=d.getUTCFullYear(),m=d.getUTCMonth();return{first:Date.UTC(y,m,1),last:Date.UTC(y,m+1,0)};};
/* Orçamento: aviso de atualização. Só conta gasto real (valor > 0, até hoje, últimos 15 dias); linhas-modelo dos fixos (valor vazio) não contam */
const orcFrescor=(data,agora=new Date())=>{
  if(!data.length)return null;
  const hoje=localISO(agora),q15=localISO(new Date(agora.getFullYear(),agora.getMonth(),agora.getDate()-15));
  const rec=data.filter(i=>i.tipo!=="Receita"&&Number(i.valor)>0&&i.data>=q15&&i.data<=hoje);
  if(rec.length===0)return{ok:false};
  const last=rec.reduce((a,b)=>b.data>a.data?b:a).data;
  return{ok:true,last,dias:Math.round((ymdToUTC(hoje)-ymdToUTC(last))/864e5)};
};
/* Orçamento: linhas-modelo (categoria dos gastos fixos, sem valor) para um mês vazio; nunca para meses futuros */
const orcModelosFixos=(data,mes,mesAtual,novoId)=>{
  if(mes>mesAtual)return[];
  if(data.some(i=>i.data&&i.data.startsWith(mes)))return[];
  const[y,m]=mes.split("-").map(Number);const p=new Date(y,m-2,1);const prevM=`${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,"0")}`;
  const seen=new Set();
  return data.filter(i=>i.data&&i.data.startsWith(prevM)&&i.fixo&&i.tipo!=="Receita"&&!seen.has(i.categoria)&&seen.add(i.categoria)).map(i=>({...i,id:novoId(),data:mes+"-01",valor:"",descricao:""}));
};
/* Orçamento: lançamento "em branco" = linha-modelo dos gastos fixos (valor vazio). Não conta como gasto. */
const orcEmBranco=i=>i.valor===""||i.valor==null;
/* Remove a linha-modelo de uma categoria quando o mês já tem lançamento REAL (valor > 0) dela. Os lançamentos reais da
   categoria ficam marcados como fixos, para o mês seguinte voltar a trazer o modelo. Devolve a MESMA lista se nada mudou. */
const orcLimparModelos=data=>{
  const chave=i=>(i.data||"").slice(0,7)+"|"+(i.categoria||"");
  const real=i=>i.tipo!=="Receita"&&i.data&&!orcEmBranco(i)&&Number(i.valor)>0;
  const reais=new Set(data.filter(real).map(chave));
  const fixos=new Set();let mudou=false;
  const sem=data.filter(i=>{if(i.tipo!=="Receita"&&i.data&&orcEmBranco(i)&&reais.has(chave(i))){mudou=true;if(i.fixo)fixos.add(chave(i));return false;}return true;});
  if(!mudou)return data;
  return sem.map(i=>(real(i)&&!i.fixo&&fixos.has(chave(i)))?{...i,fixo:true}:i);
};
/* Orçamento: já existe lançamento real da mesma categoria no mês? (linhas em branco não contam) */
const orcDupCategoria=(data,out,mes)=>data.find(x=>x.tipo!=="Receita"&&x.categoria===out.categoria&&x.data&&x.data.startsWith(mes)&&x.id!==out.id&&!orcEmBranco(x));
/* Tesouro Direto: registros do CSV que ainda não existem. Um aporte por mês: mesmo mês + mesmo valor = já lançado (qualquer dia). */
const tdNovos=(existentes,items)=>items.filter(n=>!existentes.some(x=>(x.data||"").slice(0,7)===n.data.slice(0,7)&&Math.abs((Number(x.valor)||0)-Number(n.valor))<0.01));
/* Tesouro Direto: título e estimativa de cada carteira */
const TD_INFO={
  apos:{nome:"Aposentadoria",titulo:"Renda+ 2045 · IPCA + 5,71% a.a.",estimativa:"Estimativa para janeiro de 2045: receber cerca de R$ 2.990 por mês durante 20 anos"},
  liza:{nome:"Faculdade Liza",titulo:"Educa+ 2042 · IPCA + 7,05% a.a.",estimativa:"Estimativa para janeiro de 2042: receber cerca de R$ 2.000 por mês durante 5 anos"}
};

/* PDF: agrupa os itens de texto de UMA página em linhas (de cima p/ baixo) e células (da esquerda p/ direita) */
const pdfAgruparLinhas=items=>{
  const its=items.filter(i=>i.str&&i.str.trim()).map(i=>({x:i.x,y:i.y,str:i.str.trim()})).sort((a,b)=>b.y-a.y);
  const linhas=[];let cur=null,curY=null;
  its.forEach(i=>{if(cur===null||Math.abs(i.y-curY)>3){cur=[];linhas.push(cur);curY=i.y;}cur.push(i);});
  return linhas.map(l=>l.sort((a,b)=>a.x-b.x).map(i=>i.str));
};
/* Lê o PDF página a página (ordem das páginas preservada); devolve as linhas como arrays de células */
const pdfLerLinhas=async(file,loadLib)=>{
  const lib=await loadLib();const pdf=await lib.getDocument({data:await file.arrayBuffer()}).promise;const out=[];
  for(let pg=1;pg<=pdf.numPages;pg++){const page=await pdf.getPage(pg);const c=await page.getTextContent();
    pdfAgruparLinhas(c.items.map(it=>({x:it.transform[4],y:it.transform[5],str:it.str}))).forEach(l=>out.push(l));}
  return out;
};
/* Extrato bancário em PDF (Data/Doc | Histórico | Descrição | Débito | Crédito | Saldo).
   Débito x crédito é decidido pelo SALDO (só entra se o saldo caiu), pois a coluna vazia some na extração. */
const extratoPdfRows=(linhas,ignorar=[])=>{
  const dinheiro=c=>{const m=String(c).match(/^R\$\s*(\d{1,3}(?:\.\d{3})+|\d+),(\d{2})$/);return m?Number(m[1].replace(/\./g,"")+"."+m[2]):null;};
  let prev=null;const rows=[];
  linhas.forEach(cells=>{
    const sa=cells.join(" ").match(/Saldo Anterior:?\s*(R\$\s*[\d.]+,\d{2})/i);
    if(sa){prev=dinheiro(sa[1]);return;}
    const dm=(cells[0]||"").match(/^(\d{2})\/(\d{2})\/(\d{4})/);if(!dm)return;
    const vals=cells.slice(1).filter(c=>dinheiro(c)!==null).map(dinheiro);
    if(vals.length<2)return;
    const saldo=vals[vals.length-1],mov=vals[vals.length-2];
    const debito=prev===null?true:saldo<prev-0.004;
    prev=saldo;
    if(!debito||mov<=0)return;
    const historico=cells[1]||"",desc=(cells[2]||"").trim();
    if(desc.length<2||ignorar.some(ig=>desc.toUpperCase().includes(ig)))return;
    rows.push({dt:`${dm[3]}-${dm[2]}-${dm[1]}`,historico,desc,val:mov.toFixed(2)});
  });
  return rows;
};

/* ===================== CRIPTO: cálculo, cotações, importação e IR (funções puras) ===================== */
const CR_ISENCAO_MENSAL=35000;            // limite mensal de vendas p/ alerta (conferir a regra vigente na Receita)
const CR_DEFASADO_MS=30*60*1000;          // cotação mais antiga que isso é marcada como defasada
const CR_CATALOGO=[
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
const CR_TICKERS=CR_CATALOGO.map(c=>c.tk);
const crInfo=tk=>CR_CATALOGO.find(c=>c.tk===String(tk||"").trim().toUpperCase());
const crTk=r=>String((r&&r.ticker)||"").trim().toUpperCase();
const crVazio=x=>x===""||x==null;
const crQ=x=>{if(crVazio(x))return 0;const n=Number(String(x).replace(",","."));return isFinite(n)?n:0;};
const crFmtQtd=q=>{const n=Number(q);return isFinite(n)?n.toLocaleString("pt-BR",{maximumFractionDigits:8}):"—";};

/* Posição por moeda pelo CUSTO MÉDIO. Compra: soma qtd e custo. Venda: baixa custo proporcional (qtd vendida / qtd total).
   `ate` (YYYY-MM-DD) limita às operações até essa data; operações sem data contam como as mais antigas.
   Compra sem valor pago = custo desconhecido (semCusto): não entra no custo nem gera lucro "fantasma". */
const crCalcular=(cr,ate)=>{
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
const crValorar=(p,cot,agora=Date.now())=>{
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
const crResumo=(cr,cot,ate,agora=Date.now())=>{
  const c=crCalcular(cr,ate);const ls=c.posicoes.map(p=>crValorar(p,cot,agora));
  const valorTotal=ls.reduce((a,l)=>a+l.valor,0),custoTotal=ls.reduce((a,l)=>a+l.custo,0);
  const ok=ls.filter(l=>l.lp!=null);const lp=ok.reduce((a,l)=>a+l.lp,0),baseLp=ok.reduce((a,l)=>a+l.custo,0);
  return{linhas:ls.map(l=>({...l,peso:valorTotal>0?l.valor/valorTotal*100:0})),valorTotal,custoTotal,lp,lpPct:baseLp>0?lp/baseLp*100:null,
    semCusto:ls.filter(l=>l.semCusto).length,semCotacao:ls.filter(l=>l.preco==null).length,realizadas:c.realizadas,inconsistencias:c.inconsistencias};
};
/* Patrimônio em cripto usado no Dashboard e nas Projeções: base "custo" ou "mercado" */
const crPatrimonio=(cr,cot,base,agora=Date.now())=>{
  const c=crCalcular(cr);
  return c.posicoes.reduce((a,p)=>a+(base==="custo"?p.custo:crValorar(p,cot,agora).valor),0);
};
/* Vendas por mês (para o alerta do limite) e alertas dos últimos 12 meses */
const crVendasPorMes=real=>{const m={};(real||[]).forEach(r=>{const k=(r.data||"").slice(0,7);if(!k)return;const x=m[k]||(m[k]={total:0,ganho:0,n:0});x.total+=r.recebido;x.ganho+=r.ganho;x.n++;});return m;};
const crAlertasIsencao=(vendasMes,hoje,limite=CR_ISENCAO_MENSAL)=>{
  const t=(+hoje.slice(0,4))*12+(+hoje.slice(5,7)-1)-12,corte=`${Math.floor(t/12)}-${String(t%12+1).padStart(2,"0")}`;
  return Object.entries(vendasMes).map(([mes,v])=>({mes,total:v.total,pct:v.total/limite*100,estourou:v.total>limite,proximo:v.total>=limite*0.8&&v.total<=limite}))
    .filter(a=>(a.estourou||a.proximo)&&a.mes>=corte).sort((a,b)=>b.mes.localeCompare(a.mes));};
/* IRPF (Bens e Direitos, grupo 08): posição e custo em 31/12 do ano-base e do anterior */
const crIrpfLinhas=(cr,ano)=>{
  const a=crCalcular(cr,`${ano}-12-31`),b=crCalcular(cr,`${ano-1}-12-31`);
  const tks=[...new Set([...a.posicoes,...b.posicoes].map(p=>p.ticker))].sort();
  return tks.map(tk=>{const pa=a.posicoes.find(p=>p.ticker===tk),pb=b.posicoes.find(p=>p.ticker===tk),info=crInfo(tk),ref=pa||pb;
    const local=(ref.exchanges[0]||ref.wallets[0]||"");
    return{ticker:tk,nome:(info&&info.nome)||ref.moeda||tk,codigo:info?info.irpf:"02",qtdAtual:pa?pa.qtd:0,custoAtual:pa?pa.custo:0,qtdAnterior:pb?pb.qtd:0,custoAnterior:pb?pb.custo:0,semCusto:!!(pa&&pa.semCusto),
      discriminacao:pa?`${crFmtQtd(pa.qtd)} ${tk} (${(info&&info.nome)||ref.moeda||tk})${pa.semCusto?"":" — custo médio R$ "+(pa.custo/pa.qtd).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}${local?" — custódia: "+local:""}`:""};});
};

/* ---------- Cotações em R$: CoinGecko (principal) + AwesomeAPI (reserva). Nunca apaga cotação boa. ---------- */
const crFetchJSON=async(fetchFn,url,ms=12000)=>{
  const c=typeof AbortController!=="undefined"?new AbortController():null;const t=c?setTimeout(()=>c.abort(),ms):null;
  try{const r=await fetchFn(url,c?{signal:c.signal}:undefined);if(!r.ok)throw new Error("HTTP "+r.status);return await r.json();}
  finally{if(t)clearTimeout(t);}
};
const crBuscarCotacoes=async(tickers,fetchFn)=>{
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
const crMesclarCotacoes=(prev,res,agoraISO)=>{
  const b={quotes:{},ultimaOK:null,ultimaTentativa:null,erro:null,...(prev||{})};const quotes={...b.quotes};
  Object.entries(res.quotes).forEach(([tk,q])=>{quotes[tk]={...q,buscadoEm:agoraISO};});
  const novos=Object.keys(res.quotes).length;const partes=[...res.erros];
  const naoVeio=res.pedidos.filter(t=>!res.quotes[t]&&!res.semCatalogo.includes(t));
  if(naoVeio.length&&!res.erros.length)partes.push("não retornou: "+naoVeio.join(", "));
  if(res.semCatalogo.length)partes.push("sem cotação automática para "+res.semCatalogo.join(", ")+" (informe o preço manual)");
  return{quotes,ultimaTentativa:agoraISO,ultimaOK:novos>0?agoraISO:b.ultimaOK,erro:partes.length?partes.join(" · "):null};
};

/* ---------- Importação de extrato (CSV): reconhece colunas por sinônimos; ignora o que não é compra/venda ---------- */
const crNorm=s=>String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const CR_COLUNAS={
  data:["data","date","dia","data hora","datetime","horario","criado em","executado em","data da operacao","data operacao","time","created"],
  tipo:["tipo","type","side","lado","operacao","tipo de operacao","transacao","acao","tipo da ordem","order type"],
  ativo:["ativo","moeda","asset","coin","ticker","simbolo","par","pair","market","mercado","criptomoeda","token","moeda comprada"],
  qtd:["quantidade","qtd","amount","qty","quantity","volume","executado","tamanho","quantidade executada"],
  preco:["preco","price","cotacao","preco unitario","valor unitario","unit price","preco medio"],
  valor:["valor","total","valor total","total brl","valor brl","brl","financeiro","value","valor pago","valor recebido","custo","total pago","total recebido","total r","valor r","total em reais","valor em reais","amount brl"]
};
const crQtdTexto=s=>{let t=String(s==null?"":s).replace(/[^\d.,\-]/g,"");if(!t)return null;const neg=t.startsWith("-");t=t.replace(/-/g,"");
  if(t.includes(",")&&t.includes("."))t=t.lastIndexOf(",")>t.lastIndexOf(".")?t.replace(/\./g,"").replace(",","."):t.replace(/,/g,"");
  else if(t.includes(","))t=t.replace(",",".");else if((t.match(/\./g)||[]).length>1)t=t.replace(/\./g,"");
  const n=Number(t);return isFinite(n)&&n>0?{n,neg}:null;};
const crAtivoTk=s=>{let t=String(s||"").trim();if(!t)return"";const porNome=CR_CATALOGO.find(c=>crNorm(c.nome)===crNorm(t));if(porNome)return porNome.tk;
  t=t.toUpperCase();if(/[\/\-_ ]/.test(t))t=t.split(/[\/\-_ ]/)[0];else if(t.endsWith("BRL")&&t.length>3)t=t.slice(0,-3);return /^[A-Z0-9]{2,10}$/.test(t)?t:"";};
const crTipoOp=s=>{const t=crNorm(s);if(/\b(compra|comprar|buy|bought|purchase|c)\b/.test(t))return"Compra";if(/\b(venda|vender|sell|sold|sale|v)\b/.test(t))return"Venda";return null;};
const crParseCSV=text=>{
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
const crItemDeImport=(n,origem)=>({id:uid(),tipo:n.tipo,ticker:n.ticker,moeda:(crInfo(n.ticker)||{}).nome||n.ticker,quantidade:n.quantidade,
  ...(n.tipo==="Venda"?{valorRecebido:n.valor.toFixed(2),valorInvestido:""}:{valorInvestido:n.valor.toFixed(2)}),valorAtual:"",exchange:origem||"",wallet:"",dataCompra:n.data});
const crDuplicado=(existentes,n)=>existentes.some(x=>(x.tipo==="Venda"?"Venda":"Compra")===n.tipo&&crTk(x)===n.ticker&&(x.dataCompra||"")===n.data&&Math.abs(crQ(x.quantidade)-Number(n.quantidade))<1e-9&&Math.abs(crQ(n.tipo==="Venda"?x.valorRecebido:x.valorInvestido)-n.valor)<0.01);

/* ---------- Cadastro: modal de Compra/Venda ---------- */
const crPrepararModal=(row,tipo)=>{const b=row||{};const tk=crTk(b);const conhecido=!tk||!!crInfo(tk);return{...b,tipo,ticker:conhecido?tk:"OUTRA",tickerOutra:conhecido?"":tk};};
const crFinalizarItem=it=>{const o={...it};let tk=String(o.ticker||"").trim().toUpperCase();if(tk==="OUTRA")tk=String(o.tickerOutra||"").trim().toUpperCase();
  o.ticker=tk;delete o.tickerOutra;const info=crInfo(tk);o.moeda=info?info.nome:(o.moeda||tk);return o;};
const crValidarItem=(it,outros)=>{
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

function VencSec({title,items,P}){const[open,setOpen]=useState(false);const S=useS();if(!items.length)return null;const total=items.reduce((a,i)=>a+(Number(i.valor)||0),0);return(<div style={{marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:title.includes("30d")?P.red:title.includes("180")?P.yellow:P.accent,marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:8}} onClick={()=>setOpen(!open)}><span style={{fontSize:14}}>{open?"▼":"▶"}</span>{title} ({items.length}) — Total: {fmt(total)}</div>{open&&<div style={{display:"flex",gap:8,flexWrap:"wrap",paddingLeft:22}}>{items.map(i=>(<div key={i.id} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:6,padding:"8px 12px",fontSize:11}}><b>{i.tipo||i.incorporadora||""}</b> {i.emissor||i.empreendimento||""} — {fmt(i.valor)} — {fD(i.dataVencimento)} ({diasV(i.dataVencimento)}d)</div>))}</div>}</div>);}

/* ═══ RF — columns reordered: ...Valor, Rend.Anual, Rend.Líq, Rend.Mensal, IR%, ... + 3 pie charts ═══ */
const RF_FIELDS=[{key:"dataInicio",label:"Data Início",type:"date"},{key:"dataVencimento",label:"Vencimento",type:"date"},{key:"tipo",label:"Tipo",type:"select",options:["CDB","CRA","CRI","LCI","LCA","Debênture","Tesouro Selic","Tesouro IPCA+","Tesouro Prefixado","LC","Outro"]},{key:"indexador",label:"Indexador",type:"select",options:["Pré","CDI","IPCA","Selic","IGPM","Outro"]},{key:"taxa",label:"Taxa (%)",type:"number",step:"0.01"},{key:"valor",label:"Valor",type:"number",step:"0.01"},{key:"rendAnual",label:"Rend.Anual",readOnly:true},{key:"rendMensal",label:"Rend.Mensal",readOnly:true},{key:"emissor",label:"Emissor"},{key:"banco",label:"Banco",type:"select",useBanks:true}];
// Columns: Data, Venc, Tipo, Idx, TaxaNom, TaxaReal, Valor, Rend.Anual, Rend.Líq, Rend.Mensal, IR%, Emissor, Banco
const RF_C=[{k:"dataInicio",l:"Data"},{k:"dataVencimento",l:"Venc."},{k:"tipo",l:"Tipo"},{k:"indexador",l:"Idx"},{k:"taxaNomLabel",l:"Taxa Nom."},{k:"taxaReal",l:"Taxa Real"},{k:"taxaRealMensal",l:"Tx Real/Mês"},{k:"valor",l:"Valor"},{k:"rendAnual",l:"Rend.Anual"},{k:"rendLiq",l:"Rend.Líq."},{k:"rendMensal",l:"Rend.Mensal"},{k:"irPct",l:"IR%"},{k:"emissor",l:"Emissor"},{k:"banco",l:"Banco"}];

function RFTab({data,setData,banks,dashRetPct}){const P=useT();const S=useS();const[sub,setSub]=useState("lista");const{sb,sd,onS,doS}=useSort("dataVencimento","asc");const[rebalVal,setRebalVal]=useState("");
  const[slIPCA,setSlIPCA]=useState(45);const[slCDI,setSlCDI]=useState(30);const[slPre,setSlPre]=useState(25);
  const[aporteProj,setAporteProj]=useState("");const[hovProj1,setHovProj1]=useState(null);const[hovProj2,setHovProj2]=useState(null);
  const[rfFiltroTipo,setRfFiltroTipo]=useState("");const[rfFiltroIdx,setRfFiltroIdx]=useState("");
  const enriched=data.map(i=>({...i,...calcRF(i)}));
  const filtered=enriched.filter(i=>{if(rfFiltroTipo&&i.tipo!==rfFiltroTipo)return false;if(rfFiltroIdx&&i.indexador!==rfFiltroIdx)return false;return true;});
  const sorted=doS(filtered);
  const tiposUnicos=[...new Set(data.map(i=>i.tipo).filter(Boolean))].sort();
  const idxUnicos=[...new Set(data.map(i=>i.indexador).filter(Boolean))].sort();
  const tV=filtered.reduce((a,i)=>a+(Number(i.valor)||0),0),tRA=filtered.reduce((a,i)=>a+(Number(i.rendAnual)||0),0),tRL=filtered.reduce((a,i)=>a+(Number(i.rendLiq)||0),0),tRM=filtered.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const mediaValor=filtered.length>0?tV/filtered.length:0;
  const mediaTaxaNom=filtered.length>0?(filtered.reduce((a,i)=>a+(Number(i.taxaNom)||0),0)/filtered.length):0;
  const v30=data.filter(i=>diasV(i.dataVencimento)<=30),v180=data.filter(i=>{const d=diasV(i.dataVencimento);return d>30&&d<=180;}),vP=data.filter(i=>diasV(i.dataVencimento)>180);
  const[modal,setModal]=useState(null);const[del,setDel]=useState(null);
  const doSave=item=>{const c=calcRF(item);const out={...item,...c,id:item.id||uid()};setData(p=>{const i=p.findIndex(x=>x.id===out.id);if(i>=0){const n=[...p];n[i]=out;return n;}return[...p,out];});setModal(null);};
  // Pie data
  const byTipo={},byIdx={},byBanco={};enriched.forEach(i=>{byTipo[i.tipo||"Outro"]=(byTipo[i.tipo||"Outro"]||0)+(Number(i.valor)||0);byIdx[i.indexador||"Outro"]=(byIdx[i.indexador||"Outro"]||0)+(Number(i.valor)||0);byBanco[i.banco||"Outro"]=(byBanco[i.banco||"Outro"]||0)+(Number(i.valor)||0);});
  const pieTipo=Object.entries(byTipo).map(([l,v],i)=>({label:l,value:v,color:PC[i%PC.length]}));
  const pieIdx=Object.entries(byIdx).map(([l,v],i)=>({label:l,value:v,color:PC[(i+5)%PC.length]}));
  const pieBanco=Object.entries(byBanco).map(([l,v],i)=>({label:l,value:v,color:PC[(i+10)%PC.length]}));

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}><div style={{fontSize:22,fontWeight:700}}>Renda Fixa</div><div style={{display:"flex",gap:8}}><button style={sub==="lista"?S.btnA():S.btnO} onClick={()=>setSub("lista")}>Lista</button><button style={sub==="venc"?S.btnA():S.btnO} onClick={()=>setSub("venc")}>Vencimentos</button><button style={sub==="graf"?S.btnA():S.btnO} onClick={()=>setSub("graf")}>Gráficos</button><button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button></div></div>
    {sub==="lista"&&(<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
      <span style={{fontSize:11,color:P.textDim}}>Filtrar:</span>
      <select style={{...S.sel,width:"auto",minWidth:100,fontSize:11}} value={rfFiltroTipo} onChange={e=>setRfFiltroTipo(e.target.value)}><option value="">Todos Tipos</option>{tiposUnicos.map(t=><option key={t} value={t}>{t}</option>)}</select>
      <select style={{...S.sel,width:"auto",minWidth:100,fontSize:11}} value={rfFiltroIdx} onChange={e=>setRfFiltroIdx(e.target.value)}><option value="">Todos Indexadores</option>{idxUnicos.map(t=><option key={t} value={t}>{t}</option>)}</select>
      {(rfFiltroTipo||rfFiltroIdx)&&<button style={{background:"transparent",border:"none",color:P.red,cursor:"pointer",fontSize:11,fontFamily:"inherit"}} onClick={()=>{setRfFiltroTipo("");setRfFiltroIdx("");}}>✕ Limpar</button>}
      {(rfFiltroTipo||rfFiltroIdx)&&<span style={{fontSize:11,color:P.accent,fontWeight:600}}>{filtered.length} títulos · Média valor: {fmt(mediaValor)} · Média taxa nom: {mediaTaxaNom.toFixed(2)}%</span>}
    </div>)}
    <div style={{fontSize:12,color:P.textDim,marginBottom:12}}>CDI 12m: {RATES.cdi12m.toFixed(2)}% · IPCA 12m: {RATES.ipca12m.toFixed(2)}%</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:24}}><SC label="Investido" value={fmt(tV)} color={P.blue} dim={P.blueDim}/><SC label="Rend.Anual" value={fmt(tRA)} color={P.accent} dim={P.accentGlow}/><SC label="Rend.Líq.Anual" value={fmt(tRL)} color={P.cyan} dim={P.cyanDim}/><SC label="Rend.Mensal" value={fmt(tRM)} color={P.accent} dim={P.accentGlow}/><SC label="Retorno Mensal" value={tV>0?fP((tRM/tV)*100):"—"} color={P.yellow} dim={P.yellowDim}/></div>
    <RFMediaPanel data={data}/>
    <FGCAlert data={data} P={P} S={S}/>

    {sub==="graf"&&data.length>0&&(<div style={{display:"grid",gridTemplateColumns:"1fr",gap:20,marginBottom:20}}>
      <div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Distribuição por Tipo</div><Pie data={pieTipo} size={300}/></div>
      <div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Distribuição por Indexador</div><Pie data={pieIdx} size={300}/></div>
      <div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Distribuição por Banco</div><Pie data={pieBanco} size={300}/></div>
      {/* Rebalancing suggestion */}
      <div style={{...S.card,padding:24}}>
        <div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>Sugestão de Aporte</div>
        <div style={{fontSize:11,color:P.textMuted,marginBottom:16}}>Ajuste a meta de alocação (total deve ser 100%)</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16}}>
          {[{l:"IPCA",val:slIPCA,set:v=>{const d=v-slIPCA;setSlIPCA(v);setSlCDI(Math.max(0,slCDI-Math.ceil(d/2)));setSlPre(Math.max(0,100-v-Math.max(0,slCDI-Math.ceil(d/2))));},c:P.yellow},
            {l:"CDI",val:slCDI,set:v=>{const d=v-slCDI;setSlCDI(v);setSlPre(Math.max(0,100-slIPCA-v));},c:P.blue},
            {l:"Prefixado",val:slPre,set:v=>{setSlPre(v);setSlCDI(Math.max(0,100-slIPCA-v));},c:P.purple}
          ].map(s=>(<div key={s.l}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:s.c,fontWeight:600}}>{s.l}</span><span style={{fontWeight:700}}>{s.val}%</span></div><input type="range" min="0" max="100" value={s.val} onChange={e=>s.set(Number(e.target.value))} style={{width:"100%",accentColor:s.c}}/></div>))}
        </div>
        <div style={{fontSize:11,color:(slIPCA+slCDI+slPre)===100?P.accent:P.red,marginBottom:14}}>Total: {slIPCA+slCDI+slPre}%{(slIPCA+slCDI+slPre)!==100?" — ajuste para 100%":""}</div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}><label style={{fontSize:12,color:P.textDim,whiteSpace:"nowrap"}}>Valor disponível:</label><input style={{...S.i,maxWidth:200}} type="number" step="0.01" placeholder="R$ 0,00" value={rebalVal} onChange={e=>setRebalVal(e.target.value)}/></div>
        {(()=>{
          const idxTotals={IPCA:0,CDI:0,Pré:0};
          enriched.forEach(i=>{const ix=i.indexador||"Outro";if(ix==="IPCA")idxTotals.IPCA+=(Number(i.valor)||0);else if(ix==="CDI"||ix==="Selic")idxTotals.CDI+=(Number(i.valor)||0);else if(ix==="Pré")idxTotals["Pré"]+=(Number(i.valor)||0);});
          const aporte=Number(rebalVal)||0;const totalAtual=idxTotals.IPCA+idxTotals.CDI+idxTotals["Pré"];const totalNovo=totalAtual+aporte;
          const metaIPCA=totalNovo*slIPCA/100,metaCDI=totalNovo*slCDI/100,metaPre=totalNovo*slPre/100;
          const needIPCA=Math.max(0,metaIPCA-idxTotals.IPCA),needCDI=Math.max(0,metaCDI-idxTotals.CDI),needPre=Math.max(0,metaPre-idxTotals["Pré"]);
          const totalNeed=needIPCA+needCDI+needPre;
          const allocIPCA=totalNeed>0?(needIPCA/totalNeed)*aporte:aporte*0.45;
          const allocCDI=totalNeed>0?(needCDI/totalNeed)*aporte:aporte*0.30;
          const allocPre=totalNeed>0?(needPre/totalNeed)*aporte:aporte*0.25;
          const pctAtIPCA=totalAtual>0?((idxTotals.IPCA/totalAtual)*100).toFixed(1):"0";
          const pctAtCDI=totalAtual>0?((idxTotals.CDI/totalAtual)*100).toFixed(1):"0";
          const pctAtPre=totalAtual>0?((idxTotals["Pré"]/totalAtual)*100).toFixed(1):"0";
          return(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
            {[{l:"IPCA",meta:slIPCA,atual:pctAtIPCA,atV:idxTotals.IPCA,alloc:allocIPCA,c:P.yellow},{l:"CDI",meta:slCDI,atual:pctAtCDI,atV:idxTotals.CDI,alloc:allocCDI,c:P.blue},{l:"Prefixado",meta:slPre,atual:pctAtPre,atV:idxTotals["Pré"],alloc:allocPre,c:P.purple}].map(x=>(<div key={x.l} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:8,padding:"14px 18px"}}><div style={{fontSize:12,fontWeight:700,color:x.c,marginBottom:6}}>{x.l}</div><div style={{fontSize:10,color:P.textMuted}}>Atual: {x.atual}% ({fmt(x.atV)})</div><div style={{fontSize:10,color:P.textMuted,marginBottom:8}}>Meta: {x.meta}%</div>{aporte>0&&<div style={{fontSize:16,fontWeight:700,color:P.accent}}>Aportar: {fmt(x.alloc)}</div>}</div>))}
          </div>);
        })()}
      </div>
      {/* Projection charts */}
      {tV>0&&(()=>{
        const txMes=(dashRetPct||0)/100;const N=61;
        const proj1=[];let a1=tV;for(let i=0;i<N;i++){proj1.push({m:i*6,v:a1});a1=tV*Math.pow(1+txMes,i*6+6);}
        const ap=Number(aporteProj)||0;
        const proj2=[];let a2=tV;for(let i=0;i<N;i++){proj2.push({m:i*6,v:a2});for(let j=0;j<6;j++)a2=a2*(1+txMes)+ap;}
        const drawChart=(pts,color,label,extra,hovState,setHov)=>{
          const mx=Math.max(...pts.map(p=>p.v),1);
          const W=900,H=260,pd={t:30,r:30,b:40,l:90},cW=W-pd.l-pd.r,cH=H-pd.t-pd.b;
          const xS=pts.length>1?cW/(pts.length-1):cW;
          const yy=v=>pd.t+cH*(1-v/mx);
          return(<div style={{...S.card,padding:24}}>
            <div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>{label}</div>
            {extra}
            <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>setHov(null)}>
              {[0,0.25,0.5,0.75,1].map(p=>(<g key={p}><line x1={pd.l} y1={pd.t+cH*(1-p)} x2={W-pd.r} y2={pd.t+cH*(1-p)} stroke={P.border} strokeWidth="1"/><text x={pd.l-8} y={pd.t+cH*(1-p)+4} textAnchor="end" fontSize="9" fill={P.textMuted}>{fmt(mx*p)}</text></g>))}
              {pts.filter((_,i)=>i%5===0||i===pts.length-1).map(p=>{const i=pts.indexOf(p);return(<text key={i} x={pd.l+i*xS} y={H-8} textAnchor="middle" fontSize="8" fill={P.textMuted}>{p.m}</text>);})}
              {hovState!==null&&<line x1={pd.l+hovState*xS} y1={pd.t} x2={pd.l+hovState*xS} y2={pd.t+cH} stroke={P.textMuted} strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>}
              <polyline points={pts.map((p,i)=>`${pd.l+i*xS},${yy(p.v)}`).join(" ")} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round"/>
              {pts.map((p,i)=>{const isH=hovState===i;const cx=pd.l+i*xS,cy=yy(p.v);const anos=Math.floor(p.m/12),meses=p.m%12;const prazoTxt=anos>0?`${anos}a${meses>0?` ${meses}m`:""}`:p.m>0?`${p.m}m`:"Hoje";const dt=new Date();dt.setMonth(dt.getMonth()+p.m);const dtTxt=dt.toLocaleDateString("pt-BR",{month:"short",year:"numeric"});return(<g key={i}><circle cx={cx} cy={cy} r={isH?7:3} fill={color} stroke={P.bg} strokeWidth="2" style={{cursor:"pointer"}} onMouseEnter={()=>setHov(i)}/>{isH&&<><rect x={cx-70} y={cy-42} width={140} height={34} rx={4} fill={P.surface} stroke={color} strokeWidth="1"/><text x={cx} y={cy-28} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{fmt(p.v)}</text><text x={cx} y={cy-15} textAnchor="middle" fontSize="9" fill={P.textDim}>{prazoTxt} · {dtTxt}</text></>}</g>);})}
            </svg>
            <div style={{fontSize:11,color:P.textDim,marginTop:6}}>Taxa mensal: {(txMes*100).toFixed(4)}% · Final 30 anos: {fmt(pts[pts.length-1]?.v)}</div>
          </div>);
        };
        return(<div>{drawChart(proj1,P.blue,"Projeção Patrimonial (30 anos) — Sem aportes",null,hovProj1,setHovProj1)}{drawChart(proj2,P.accent,"Projeção com Aportes Mensais",<div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}><label style={{fontSize:12,color:P.textDim}}>Aporte mensal:</label><input style={{...S.i,maxWidth:180}} type="number" step="0.01" placeholder="R$ 0,00" value={aporteProj} onChange={e=>setAporteProj(e.target.value)}/></div>,hovProj2,setHovProj2)}</div>);
      })()}
    </div>)}
    {sub==="venc"&&(<div style={S.card}><div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Vencimentos</div><VencSec title="⚠ Até 30d" items={v30} P={P}/><VencSec title="⏳ 30-180d" items={v180} P={P}/><VencSec title="✓ +180d" items={vP} P={P}/>{!data.length&&<div style={{color:P.textMuted,textAlign:"center",padding:20}}>Nenhum</div>}</div>)}
    {sub==="lista"&&(sorted.length===0?<div style={{textAlign:"center",padding:60,color:P.textMuted}}>Nenhum registro</div>:(
    <div style={{...S.card,padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{RF_C.map(c=>(<STH key={c.k} label={c.l} field={c.k} sb={sb} sd={sd} onS={onS} style={S.th}/>))}<th style={S.th}></th></tr></thead><tbody>{sorted.map(i=>{const d30=diasV(i.dataVencimento)<=30;const ic=IDX_COLORS[i.indexador]||IDX_COLORS.Outro;return(<TR key={i.id} baseBg={d30?"rgba(239,68,68,0.08)":undefined} onClick={()=>setModal(i)}>
      <td style={S.td}>{fD(i.dataInicio)}</td><td style={{...S.td,color:d30?P.red:P.text}}>{fD(i.dataVencimento)}</td>
      <td style={S.td}><span style={S.tag(P.blue,P.blueDim)}>{i.tipo||"—"}</span></td>
      <td style={S.td}><span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:600,color:ic.c,background:ic.bg}}>{i.indexador||"—"}</span></td>
      <td style={{...S.td,fontWeight:600}}>{i.taxaNomLabel||"—"}</td>
      <td style={{...S.td,color:P.cyan}}>{i.taxaReal!=="—"?`${i.taxaReal}%`:"—"}</td>
      <td style={{...S.td,color:P.cyan}}>{i.taxaRealMensal?`${i.taxaRealMensal}%`:"—"}</td>
      <td style={S.td}>{fmt(i.valor)}</td>
      <td style={{...S.td,color:P.accent}}>{fmt(i.rendAnual)}</td>
      <td style={{...S.td,color:P.accent,fontWeight:600}}>{fmt(i.rendLiq)}</td>
      <td style={{...S.td,color:P.accent}}>{fmt(i.rendMensal)}</td>
      <td style={{...S.td,color:i.irPct>0?P.red:P.textMuted}}>{i.irPct>0?`${i.irPct}%`:"Isento"}</td>
      <td style={S.td}>{i.emissor||"—"}</td><td style={S.td}>{i.banco||"—"}</td>
      <td style={S.td}><button style={{background:"transparent",border:"none",color:P.textMuted,cursor:"pointer",fontSize:16,fontFamily:"inherit"}} onClick={e=>{e.stopPropagation();setDel(i.id);}}>✕</button></td>
    </TR>);})}</tbody>
    <tfoot><tr>
      <td colSpan={7} style={{...S.td,fontWeight:700,borderBottom:"none"}}>TOTAL</td>
      <td style={{...S.td,fontWeight:700,borderBottom:"none"}}>{fmt(tV)}</td>
      <td style={{...S.td,fontWeight:700,color:P.accent,borderBottom:"none"}}>{fmt(tRA)}</td>
      <td style={{...S.td,fontWeight:700,color:P.accent,borderBottom:"none"}}>{fmt(tRL)}</td>
      <td style={{...S.td,fontWeight:700,color:P.accent,borderBottom:"none"}}>{fmt(tRM)}</td>
      <td colSpan={4} style={{...S.td,borderBottom:"none"}}></td>
    </tr></tfoot>
    </table></div>))}
    {modal&&<Mdl title={modal==="new"?"Novo":"Editar"} fields={RF_FIELDS} initial={modal==="new"?{dataInicio:new Date().toISOString().slice(0,10)}:modal} autoFocus="dataInicio" onSave={doSave} onCancel={()=>setModal(null)} banks={banks}/>}
    {del&&<Cfm msg="Excluir?" onOk={()=>{setData(p=>p.filter(x=>x.id!==del));setDel(null);}} onNo={()=>setDel(null)}/>}
  </div>);
}

/* INCO sortable + taxa real + totals */
const INCO_F=[{key:"dataInicio",label:"Data Início",type:"date"},{key:"dataVencimento",label:"Vencimento",type:"date"},{key:"risco",label:"Risco",type:"select",options:["A","B","C","D","E"]},{key:"empreendimento",label:"Empreendimento"},{key:"indexador",label:"Indexador",type:"select",options:["Pré","CDI","IPCA","IGPM","INCC","Dólar","Outro"]},{key:"taxa",label:"Taxa (%)",type:"number",step:"0.01"},{key:"valor",label:"Valor",type:"number",step:"0.01"},{key:"isCriCra",label:"CRI/CRA",type:"checkbox",checkLabel:"Isento de IR (CRI/CRA)"},{key:"rendPeriodo",label:"Rend.Período",readOnly:true},{key:"rendMensal",label:"Rend.Mensal",readOnly:true}];
const IN_C=[{k:"dataInicio",l:"Data"},{k:"dataVencimento",l:"Venc."},{k:"risco",l:"Risco"},{k:"empreendimento",l:"Empreend."},{k:"indexador",l:"Idx"},{k:"taxaNomLabel",l:"Taxa Nom."},{k:"taxaReal",l:"Taxa Real"},{k:"taxaRealMensal",l:"Tx Real/Mês"},{k:"valor",l:"Valor"},{k:"rendPeriodo",l:"Rend.Período"},{k:"rendMensal",l:"Rend.Mensal"}];
const IDX_COLORS={CDI:{c:"#3b82f6",bg:"rgba(59,130,246,0.12)"},IPCA:{c:"#f59e0b",bg:"rgba(245,158,11,0.12)"},Pré:{c:"#a855f7",bg:"rgba(168,85,247,0.12)"},IGPM:{c:"#06b6d4",bg:"rgba(6,182,212,0.12)"},INCC:{c:"#ec4899",bg:"rgba(236,72,153,0.12)"},Selic:{c:"#3b82f6",bg:"rgba(59,130,246,0.12)"},"Dólar":{c:"#10b981",bg:"rgba(16,185,129,0.12)"},Outro:{c:"#64748b",bg:"rgba(100,116,139,0.12)"}};
const RISCO_COLORS={A:{c:"#10b981",bg:"rgba(16,185,129,0.12)"},B:{c:"#3b82f6",bg:"rgba(59,130,246,0.12)"},C:{c:"#f59e0b",bg:"rgba(245,158,11,0.12)"},D:{c:"#f97316",bg:"rgba(249,115,22,0.12)"},E:{c:"#ef4444",bg:"rgba(239,68,68,0.12)"}};
function IncoTab({data,setData}){const P=useT();const S=useS();const[sub,setSub]=useState("lista");const{sb,sd,onS,doS}=useSort("dataVencimento","asc");
  const[inFiltroIdx,setInFiltroIdx]=useState("");const[inFiltroRisco,setInFiltroRisco]=useState("");
  const enriched=data.map(i=>({...i,...calcINCO(i)}));
  const filtered=enriched.filter(i=>{if(inFiltroIdx&&i.indexador!==inFiltroIdx)return false;if(inFiltroRisco&&i.risco!==inFiltroRisco)return false;return true;});
  const sorted=doS(filtered);
  const idxUnicosIn=[...new Set(data.map(i=>i.indexador).filter(Boolean))].sort();
  const riscoUnicosIn=[...new Set(data.map(i=>i.risco).filter(Boolean))].sort();
  const tV=filtered.reduce((a,i)=>a+(Number(i.valor)||0),0),tRP=filtered.reduce((a,i)=>a+(Number(i.rendPeriodo)||0),0),tRM=filtered.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const inMediaValor=filtered.length>0?tV/filtered.length:0;
  const inMediaTaxaNom=filtered.length>0?(filtered.reduce((a,i)=>a+(Number(i.taxaNom)||0),0)/filtered.length):0;
  const v30=data.filter(i=>diasV(i.dataVencimento)<=30),v180=data.filter(i=>{const d=diasV(i.dataVencimento);return d>30&&d<=180;}),vP=data.filter(i=>diasV(i.dataVencimento)>180);
  const[modal,setModal]=useState(null);const[del,setDel]=useState(null);
  const doSave=item=>{const c=calcINCO(item);const out={...item,...c,id:item.id||uid()};setData(p=>{const i=p.findIndex(x=>x.id===out.id);if(i>=0){const n=[...p];n[i]=out;return n;}return[...p,out];});setModal(null);};
  // Pie data for Gráficos
  const byIdx={},byRisco={};enriched.forEach(i=>{byIdx[i.indexador||"Outro"]=(byIdx[i.indexador||"Outro"]||0)+(Number(i.valor)||0);byRisco[i.risco||"—"]=(byRisco[i.risco||"—"]||0)+(Number(i.valor)||0);});
  const pieIdx=Object.entries(byIdx).map(([l,v],i)=>({label:l,value:v,color:PC[(i+5)%PC.length]}));
  const pieRisco=Object.entries(byRisco).map(([l,v])=>({label:`Risco ${l}`,value:v,color:RISCO_COLORS[l]?RISCO_COLORS[l].c:PC[0]}));
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}><div style={{fontSize:22,fontWeight:700}}>INCO</div><div style={{display:"flex",gap:8}}><button style={sub==="lista"?S.btnA():S.btnO} onClick={()=>setSub("lista")}>Lista</button><button style={sub==="venc"?S.btnA():S.btnO} onClick={()=>setSub("venc")}>Vencimentos</button><button style={sub==="graf"?S.btnA():S.btnO} onClick={()=>setSub("graf")}>Gráficos</button><button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button></div></div>
    {sub==="lista"&&(<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
      <span style={{fontSize:11,color:P.textDim}}>Filtrar:</span>
      <select style={{...S.sel,width:"auto",minWidth:100,fontSize:11}} value={inFiltroIdx} onChange={e=>setInFiltroIdx(e.target.value)}><option value="">Todos Indexadores</option>{idxUnicosIn.map(t=><option key={t} value={t}>{t}</option>)}</select>
      <select style={{...S.sel,width:"auto",minWidth:80,fontSize:11}} value={inFiltroRisco} onChange={e=>setInFiltroRisco(e.target.value)}><option value="">Todos Riscos</option>{riscoUnicosIn.map(t=><option key={t} value={t}>{t}</option>)}</select>
      {(inFiltroIdx||inFiltroRisco)&&<button style={{background:"transparent",border:"none",color:P.red,cursor:"pointer",fontSize:11,fontFamily:"inherit"}} onClick={()=>{setInFiltroIdx("");setInFiltroRisco("");}}>✕ Limpar</button>}
      {(inFiltroIdx||inFiltroRisco)&&<span style={{fontSize:11,color:P.accent,fontWeight:600}}>{filtered.length} investimentos · Média valor: {fmt(inMediaValor)} · Média taxa nom: {inMediaTaxaNom.toFixed(2)}%</span>}
    </div>)}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:24}}><SC label="Investido" value={fmt(tV)} color={P.cyan} dim={P.cyanDim}/><SC label="Rend.Período" value={fmt(tRP)} color={P.accent} dim={P.accentGlow}/><SC label="Rend.Mensal" value={fmt(tRM)} color={P.accent} dim={P.accentGlow}/><SC label="Retorno Mensal" value={tV>0?fP((tRM/tV)*100):"—"} color={P.yellow} dim={P.yellowDim}/></div>
    {sub==="graf"&&data.length>0&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Por Indexador</div><Pie data={pieIdx} size={240}/></div>
      <div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Por Risco</div><Pie data={pieRisco} size={240}/></div>
    </div>)}
    {sub==="venc"&&(<div style={S.card}><VencSec title="⚠ Até 30d" items={v30} P={P}/><VencSec title="⏳ 30-180d" items={v180} P={P}/><VencSec title="✓ +180d" items={vP} P={P}/></div>)}
    {sub==="lista"&&(sorted.length===0?<div style={{textAlign:"center",padding:60,color:P.textMuted}}>Nenhum</div>:(
    <div style={{...S.card,padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{IN_C.map(c=>(<STH key={c.k} label={c.l} field={c.k} sb={sb} sd={sd} onS={onS} style={S.th}/>))}<th style={S.th}></th></tr></thead><tbody>{sorted.map(i=>{const d30=diasV(i.dataVencimento)<=30;const ic=IDX_COLORS[i.indexador]||IDX_COLORS.Outro;const rc=RISCO_COLORS[i.risco];return(<TR key={i.id} baseBg={d30?"rgba(239,68,68,0.08)":undefined} onClick={()=>setModal(i)}><td style={S.td}>{fD(i.dataInicio)}</td><td style={{...S.td,color:d30?P.red:P.text}}>{fD(i.dataVencimento)}</td><td style={S.td}>{rc?<span style={{display:"inline-block",padding:"2px 10px",borderRadius:4,fontSize:11,fontWeight:700,color:rc.c,background:rc.bg}}>{i.risco}</span>:(i.risco||"—")}</td><td style={S.td}>{i.empreendimento||"—"}</td><td style={S.td}><span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:600,color:ic.c,background:ic.bg}}>{i.indexador||"—"}</span></td><td style={{...S.td,fontWeight:600}}>{i.taxaNomLabel||"—"}</td><td style={{...S.td,color:P.cyan}}>{i.taxaReal?`${i.taxaReal}%`:"—"}</td><td style={{...S.td,color:P.cyan}}>{i.taxaRealMensal?`${i.taxaRealMensal}%`:"—"}</td><td style={S.td}>{fmt(i.valor)}</td><td style={{...S.td,color:P.accent}}>{fmt(i.rendPeriodo)}</td><td style={{...S.td,color:P.accent}}>{fmt(i.rendMensal)}</td><td style={S.td}><button style={{background:"transparent",border:"none",color:P.textMuted,cursor:"pointer",fontSize:16,fontFamily:"inherit"}} onClick={e=>{e.stopPropagation();setDel(i.id);}}>✕</button></td></TR>);})}</tbody>
    <tfoot><tr><td colSpan={8} style={{...S.td,fontWeight:700,borderBottom:"none"}}>TOTAL</td><td style={{...S.td,fontWeight:700,borderBottom:"none"}}>{fmt(tV)}</td><td style={{...S.td,fontWeight:700,color:P.accent,borderBottom:"none"}}>{fmt(tRP)}</td><td style={{...S.td,fontWeight:700,color:P.accent,borderBottom:"none"}}>{fmt(tRM)}</td><td style={{...S.td,borderBottom:"none"}}></td></tr></tfoot>
    </table></div>))}
    {modal&&<Mdl title={modal==="new"?"Novo":"Editar"} fields={INCO_F} initial={modal==="new"?{dataInicio:new Date().toISOString().slice(0,10)}:modal} autoFocus="dataInicio" onSave={doSave} onCancel={()=>setModal(null)}/>}
    {del&&<Cfm msg="Excluir?" onOk={()=>{setData(p=>p.filter(x=>x.id!==del));setDel(null);}} onNo={()=>setDel(null)}/>}
  </div>);
}

/* AC, ETF, CR */
const AC_F=[{key:"ticker",label:"Ticker"},{key:"empresa",label:"Empresa"},{key:"setor",label:"Setor"},{key:"quantidade",label:"Qtd",type:"number",step:"1"},{key:"precoMedio",label:"PM",type:"number",step:"0.01"},{key:"precoAtual",label:"Atual",type:"number",step:"0.01"},{key:"dataCompra",label:"Data",type:"date"},{key:"corretora",label:"Corretora"}];
function AcTab({data,setData}){const P=useT();const S=useS();const tI=data.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0),tA=data.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoAtual)||Number(i.precoMedio)||0),0),lp=tA-tI;return<CRUD title="Ações" icon="▲" fields={AC_F} data={data} setData={setData} cards={<React.Fragment><SC label="Investido" value={fmt(tI)} color={P.yellow} dim={P.yellowDim}/><SC label="Atual" value={fmt(tA)} color={P.blue} dim={P.blueDim}/><SC label="L/P" value={fmt(lp)} color={lp>=0?P.accent:P.red} dim={lp>=0?P.accentGlow:P.redDim}/></React.Fragment>} columns={["Ticker","Empresa","Qtd","PM","Atual","Investido","Atual","L/P","Corretora"]} renderRow={i=>{const inv=(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),at=(Number(i.quantidade)||0)*(Number(i.precoAtual)||Number(i.precoMedio)||0),l=at-inv;return(<React.Fragment><td style={{...S.td,fontWeight:700}}>{i.ticker||"—"}</td><td style={S.td}>{i.empresa||"—"}</td><td style={S.td}>{i.quantidade||"—"}</td><td style={S.td}>{fmt(i.precoMedio)}</td><td style={S.td}>{fmt(i.precoAtual)}</td><td style={S.td}>{fmt(inv)}</td><td style={S.td}>{fmt(at)}</td><td style={{...S.td,color:l>=0?P.accent:P.red,fontWeight:600}}>{fmt(l)}</td><td style={S.td}>{i.corretora||"—"}</td></React.Fragment>);}}/>;
}
/* ===================== ETFs: oscilação e retorno mensal (US$ e R$) — funções puras ===================== */
const etfYM=d=>String(d||"").slice(0,7);
const etfAddMes=(ym,n)=>{const t=(+ym.slice(0,4))*12+(+ym.slice(5,7)-1)+n;return `${Math.floor(t/12)}-${String(t%12+1).padStart(2,"0")}`;};
const etfFimMes=ym=>`${ym}-${String(new Date(Date.UTC(+ym.slice(0,4),+ym.slice(5,7),0)).getUTCDate()).padStart(2,"0")}`;
const etfAddDias=(d,n)=>new Date(ymdToUTC(d)+n*864e5).toISOString().slice(0,10);
const etfMeses=(de,ate)=>{const r=[];for(let m=de;m<=ate;m=etfAddMes(m,1))r.push(m);return r;};
const etfNum=x=>{const n=Number(String(x==null?"":x).replace(",","."));return isFinite(n)&&n>0?n:null;};
/* Dólar do último dia com cotação até `data` (no máximo 10 dias antes) */
const etfFxEm=(fx,data)=>{const dia=(fx&&fx.dia)||{};let b=null;for(const d in dia){if(d<=data&&(b==null||d>b))b=d;}return(b&&ymdToUTC(data)-ymdToUTC(b)<=10*864e5)?Number(dia[b]):null;};
const etfCustoBRL=(i,fx)=>{const q=Number(i.quantidade)||0,pm=Number(i.precoMedio)||0;if(i.moeda!=="USD")return q*pm;const f=etfFxEm(fx,i.dataCompra||"")||(fx&&Number(fx.atual))||0;return q*pm*f;};
const etfAtualBRL=(i,fx)=>{const q=Number(i.quantidade)||0,pa=Number(i.precoAtual)||Number(i.precoMedio)||0;return i.moeda==="USD"?q*pa*((fx&&Number(fx.atual))||0):q*pa;};
/* Série mensal de uma posição. compras: [{data,qtd,preco}] na moeda nativa; histP/histFx: {"AAAA-MM":valor} (fechamentos informados) */
const etfSerie=(compras,moeda,histP,histFx,fx,precoAtual,hoje)=>{
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
const etfBuscarFx=async(desde,hoje,fetchFn)=>{
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
const etfMesclarFx=(prev,res,desde,agoraISO)=>{const b={atual:null,dia:{},desde:null,ultimaOK:null,erro:null,...(prev||{})};
  const dia={...b.dia,...res.dia};const novo=res.atual!=null||Object.keys(res.dia).length>0;
  return{atual:res.atual!=null?res.atual:b.atual,dia,desde:!res.erros.some(e=>e.startsWith("histórico"))&&desde?(b.desde&&b.desde<desde?b.desde:desde):b.desde,ultimaOK:novo?agoraISO:b.ultimaOK,ultimaTentativa:agoraISO,erro:res.erros.length?res.erros.join(" · "):null};};
const ETF_F=[{key:"ticker",label:"Ticker"},{key:"nome",label:"Nome"},{key:"moeda",label:"Moeda do preço",type:"select",options:["USD","BRL"]},{key:"indiceRef",label:"Índice"},{key:"quantidade",label:"Qtd",type:"number",step:"0.00000001"},{key:"precoMedio",label:"Preço de compra",type:"number",step:"0.01"},{key:"precoAtual",label:"Preço atual",type:"number",step:"0.01"},{key:"taxaAdm",label:"TxAdm%",type:"number",step:"0.01"},{key:"dataCompra",label:"Data",type:"date"},{key:"corretora",label:"Corretora"}];
const etfUsd=v=>v==null||v===""||!isFinite(Number(v))?"—":Number(v).toLocaleString("en-US",{style:"currency",currency:"USD"});
const etfMesFmt=ym=>`${ym.slice(5)}/${ym.slice(0,4)}`;
/* Colar fechamentos: linhas "2025-01;610,33" ou "01/2025;610,33" (também aceita dd/mm/aaaa) */
const etfParseFech=text=>{const r={};String(text||"").split(/\r?\n/).forEach(l=>{const c=tdParseLine(l.trim());if(c.length<2)return;let ym=null,i0=-1;
  c.forEach((x,i)=>{if(ym)return;let m=x.match(/^(\d{4})-(\d{2})/);if(m){ym=`${m[1]}-${m[2]}`;i0=i;return;}m=x.match(/^(?:\d{1,2}\/)?(\d{1,2})\/(\d{4})$/);if(m){ym=`${m[2]}-${m[1].padStart(2,"0")}`;i0=i;}});
  if(!ym||+ym.slice(5)<1||+ym.slice(5)>12)return;const v=c.find((x,i)=>i!==i0&&tdMoney(x));if(v)r[ym]=String(tdMoney(v));});return r;};
function EtfSerie({grupo,hist,setHist,fx,hoje,setPrecoAtual}){const P=useT();const S=useS();const[colar,setColar]=useState(null);
  const usd=grupo.moeda==="USD";const h=hist[grupo.ticker]||{},hf=hist.USDBRL||{};
  const s=etfSerie(grupo.compras,grupo.moeda,h,hf,fx,grupo.precoAtual,hoje);const r=s.resumo;
  const setH=(k,ym,v)=>setHist(p=>({...p,[k]:{...(p[k]||{}),[ym]:v}}));
  const m=(v,u)=>v==null?"—":(u?etfUsd(v):fmt(v));const cor=v=>v==null?P.textMuted:v>=0?P.accent:P.red;
  const inp={...S.i,width:92,padding:"4px 6px",fontSize:11};
  const linhas=[...s.linhas].reverse();const faltam=s.linhas.filter(l=>!l.parcial&&l.preco==null).length;
  return(<div style={{...S.card,marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:10}}>
      <div style={{fontSize:15,fontWeight:700}}>{grupo.ticker} <span style={{fontSize:11,fontWeight:500,color:P.textMuted}}>{crFmtQtd(r.qtd)} cotas · PM {usd?etfUsd(r.pm):fmt(r.pm)}{grupo.semData?` · ${grupo.semData} compra(s) sem data ignorada(s)`:""}</span></div>
      <div style={{display:"flex",gap:8,alignItems:"center",fontSize:11}}><span style={{color:P.textDim}}>Preço atual ({usd?"US$":"R$"})</span><input style={{...inp,width:100}} type="number" step="0.01" value={grupo.precoAtualTxt} onChange={e=>setPrecoAtual(grupo,e.target.value)}/>
        <button style={{...S.btnO,padding:"4px 10px"}} onClick={()=>setColar(colar==null?"":null)}>Colar fechamentos</button></div></div>
    <div style={{display:"flex",gap:18,flexWrap:"wrap",fontSize:12,marginBottom:10}}>
      {usd&&<span>L/P US$: <b style={{color:cor(r.lpNat)}}>{m(r.lpNat,true)}{r.lpNatPct!=null?` (${crPct(r.lpNatPct)})`:""}</b></span>}
      <span>L/P R$: <b style={{color:cor(r.lpBRL)}}>{m(r.lpBRL)}{r.lpBRLPct!=null?` (${crPct(r.lpBRLPct)})`:""}</b></span>
      <span style={{color:P.textMuted}}>Valor atual: {usd?etfUsd(r.valNat)+" · ":""}{fmt(r.valBRL)}</span></div>
    {colar!=null&&<div style={{marginBottom:10}}><textarea style={{...S.i,width:"100%",height:90,fontFamily:"monospace",fontSize:11}} placeholder={"2025-01;610,33\n2025-02;625,10"} value={colar} onChange={e=>setColar(e.target.value)}/>
      <div style={{display:"flex",gap:8,marginTop:6}}><button style={S.btn()} onClick={()=>{const p=etfParseFech(colar);Object.entries(p).forEach(([ym,v])=>setH(grupo.ticker,ym,v));setColar(null);}}>Aplicar</button><button style={S.btnO} onClick={()=>setColar(null)}>Cancelar</button></div></div>}
    {faltam>0&&<div style={{fontSize:11,color:P.yellow,marginBottom:8}}>⚠ {faltam} mês(es) sem fechamento {usd?"em US$":""}: oscilação e retorno ficam “—” nesses meses e no seguinte. Preencha na tabela (ou use “Colar fechamentos”).</div>}
    <div style={{maxHeight:380,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{(usd?["Mês","Fech. US$","Osc. US$","USD/BRL","Fech. R$","Osc. R$","Retorno US$","Ret. %","Retorno R$","Ret. %"]:["Mês","Fech. R$","Osc.","Retorno R$","Ret. %"]).map((x,ix)=><th key={ix} style={S.th}>{x}</th>)}</tr></thead>
    <tbody>{linhas.map(l=>(<tr key={l.ym}><td style={{...S.td,whiteSpace:"nowrap"}}>{etfMesFmt(l.ym)}{l.parcial&&<span style={{fontSize:9,color:P.textMuted}}> parcial</span>}</td>
      <td style={S.td}>{l.parcial?<span>{m(l.preco,usd)}</span>:<input style={inp} type="number" step="0.01" value={h[l.ym]||""} onChange={e=>setH(grupo.ticker,l.ym,e.target.value)}/>}</td>
      <td style={{...S.td,color:cor(l.oscNat100),fontWeight:600}}>{crPct(usd?l.oscNat100:l.oscBRL100)}</td>
      {usd&&<td style={S.td}>{l.parcial?<span>{l.fx?l.fx.toFixed(4):"—"}</span>:<input style={{...inp,width:76}} type="number" step="0.0001" placeholder={l.fx?l.fx.toFixed(4):""} value={hf[l.ym]||""} onChange={e=>setH("USDBRL",l.ym,e.target.value)}/>}</td>}
      {usd&&<td style={S.td}>{m(l.precoBRL)}</td>}
      {usd&&<td style={{...S.td,color:cor(l.oscBRL100),fontWeight:600}}>{crPct(l.oscBRL100)}</td>}
      {usd&&<td style={{...S.td,color:cor(l.retNat)}}>{m(l.retNat,true)}</td>}
      {usd&&<td style={{...S.td,color:cor(l.retNat)}}>{crPct(l.retPctNat)}</td>}
      <td style={{...S.td,color:cor(l.retBRL)}}>{m(l.retBRL)}</td><td style={{...S.td,color:cor(l.retBRL)}}>{crPct(l.retPctBRL)}</td></tr>))}</tbody></table></div>
    <div style={{fontSize:10,color:P.textMuted,marginTop:8,lineHeight:1.5}}>Oscilação = variação do preço de fechamento contra o mês anterior (no mês da 1ª compra, contra o preço pago). Retorno = valor da posição no fim do mês − valor no mês anterior − compras do mês (R$ usa o dólar do dia de cada compra e o do fim de cada mês). O mês corrente usa o preço atual informado. Sem dividendos nem taxas.</div>
  </div>);}

function EtfTab({data,setData,hist,setHist,fx,onFxRefresh,fxLoading}){const P=useT();const S=useS();
  const hoje=localISO(new Date());const usdUsado=data.some(i=>i.moeda==="USD");
  const nat=(i,k)=>(Number(i.quantidade)||0)*(Number(i[k])||0);
  const tIb=data.reduce((a,i)=>a+etfCustoBRL(i,fx),0),tAb=data.reduce((a,i)=>a+etfAtualBRL(i,fx),0),lp=tAb-tIb;
  const usdRows=data.filter(i=>i.moeda==="USD");const tIu=usdRows.reduce((a,i)=>a+nat(i,"precoMedio"),0),tAu=usdRows.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoAtual)||Number(i.precoMedio)||0),0);
  const grupos={};data.forEach(i=>{const tk=String(i.ticker||"").trim().toUpperCase();if(!tk)return;const moeda=i.moeda==="USD"?"USD":"BRL",k=tk+"|"+moeda;const g=grupos[k]||(grupos[k]={ticker:tk,moeda,compras:[],semData:0,linhas:[]});g.linhas.push(i);
    if(i.dataCompra&&Number(i.quantidade)>0&&Number(i.precoMedio)>0)g.compras.push({data:i.dataCompra,qtd:Number(i.quantidade),preco:Number(i.precoMedio)});else g.semData++;});
  const lista=Object.values(grupos).map(g=>{const ordenadas=[...g.linhas].sort((a,b)=>(b.dataCompra||"").localeCompare(a.dataCompra||""));const pa=ordenadas.find(i=>Number(i.precoAtual)>0);return{...g,precoAtual:pa?Number(pa.precoAtual):null,precoAtualTxt:pa?String(pa.precoAtual):""};}).filter(g=>g.compras.length);
  const setPrecoAtual=(g,v)=>setData(data.map(i=>(String(i.ticker||"").trim().toUpperCase()===g.ticker&&(i.moeda==="USD"?"USD":"BRL")===g.moeda)?{...i,precoAtual:v}:i));
  const velho=fx.ultimaOK?Date.now()-new Date(fx.ultimaOK).getTime()>6*3600e3:true;
  const f=(i,v)=>i.moeda==="USD"?etfUsd(v):fmt(v);
  return(<div>
    {usdUsado&&<div style={{...S.card,padding:"10px 14px",marginBottom:14,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",fontSize:12}}>
      <button style={S.btnO} disabled={fxLoading} onClick={onFxRefresh}>{fxLoading?"Atualizando…":"↻ Atualizar dólar"}</button>
      <span><b>USD/BRL:</b> {fx.atual?fx.atual.toFixed(4):"—"}</span>
      <span style={{color:velho?P.yellow:P.textMuted}}>{fx.ultimaOK?`atualizado ${new Date(fx.ultimaOK).toLocaleDateString("pt-BR")} ${new Date(fx.ultimaOK).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}${velho?" — DEFASADO":""}`:"sem cotação obtida"}</span>
      {fx.erro&&<span style={{color:P.red}}>⚠ {fx.erro}</span>}</div>}
    <CRUD title="ETFs" icon="◆" fields={ETF_F} data={data} setData={setData} cards={<React.Fragment><SC label="Investido (R$)" value={fmt(tIb)} color={P.cyan} dim={P.cyanDim}/><SC label="Atual (R$)" value={fmt(tAb)} color={P.blue} dim={P.blueDim}/><SC label="L/P (R$)" value={fmt(lp)} color={lp>=0?P.accent:P.red} dim={lp>=0?P.accentGlow:P.redDim}/>{usdUsado&&<SC label="Investido (US$)" value={etfUsd(tIu)} color={P.cyan} dim={P.cyanDim}/>}{usdUsado&&<SC label="Atual (US$)" value={etfUsd(tAu)} color={P.blue} dim={P.blueDim}/>}</React.Fragment>} columns={["Ticker","Nome","Moeda","Qtd","Compra","Atual","Investido","Atual","L/P","Atual (R$)","TxAdm","Var. desde compra","Média/mês","% ao mês","Corretora"]} renderRow={i=>{const inv=nat(i,"precoMedio"),at=(Number(i.quantidade)||0)*(Number(i.precoAtual)||Number(i.precoMedio)||0),l=at-inv;const meses=i.dataCompra?(ymdToUTC(hoje)-ymdToUTC(i.dataCompra))/864e5/30.4375:0;const mOk=meses>=1;const vr=(Number(i.precoAtual)>0&&Number(i.precoMedio)>0)?(Number(i.precoAtual)/Number(i.precoMedio)-1)*100:null;return(<React.Fragment><td style={{...S.td,fontWeight:700}}>{i.ticker||"—"}</td><td style={S.td}>{i.nome||"—"}</td><td style={S.td}>{i.moeda==="USD"?"US$":"R$"}</td><td style={S.td}>{i.quantidade?crFmtQtd(i.quantidade):"—"}</td><td style={S.td}>{f(i,i.precoMedio)}</td><td style={S.td}>{f(i,i.precoAtual)}</td><td style={S.td}>{f(i,inv)}</td><td style={S.td}>{f(i,at)}</td><td style={{...S.td,color:l>=0?P.accent:P.red,fontWeight:600}}>{f(i,l)}</td><td style={S.td}>{i.moeda==="USD"&&!fx.atual?"—":fmt(etfAtualBRL(i,fx))}</td><td style={S.td}>{i.taxaAdm?`${i.taxaAdm}%`:"—"}</td><td style={{...S.td,fontWeight:600,color:vr==null?P.textMuted:vr>=0?P.accent:P.red}}>{vr==null?"—":crPct(vr)}</td><td style={{...S.td,color:!mOk||vr==null?P.textMuted:l>=0?P.accent:P.red}} title={`${meses.toFixed(1)} meses desde a compra`}>{mOk&&vr!=null?f(i,l/meses):"—"}</td><td style={{...S.td,color:!mOk||vr==null?P.textMuted:vr>=0?P.accent:P.red}}>{mOk&&vr!=null?crPct((Math.pow(1+vr/100,1/meses)-1)*100):"—"}</td><td style={S.td}>{i.corretora||"—"}</td></React.Fragment>);}}/>
    {lista.length>0&&<div style={{marginTop:24}}><div style={{fontSize:18,fontWeight:700,marginBottom:12}}>Oscilação e retorno mensal</div>
      {lista.map(g=><EtfSerie key={g.ticker+g.moeda} grupo={g} hist={hist} setHist={setHist} fx={fx} hoje={hoje} setPrecoAtual={setPrecoAtual}/>)}</div>}
  </div>);
}
const CR_CORES=["#f7931a","#627eea","#f3ba2f","#23292f","#c2a633","#e84142","#345d9d","#00aae4","#8247e5","#26a17b","#2775ca","#14b8a6","#a855f7","#ef4444"];
const crCampos=tipo=>[
  {key:"ticker",label:"Moeda",type:"select",options:[...CR_TICKERS,"OUTRA"]},
  {key:"tickerOutra",label:"Ticker da moeda",showWhen:"ticker=OUTRA",placeholder:"ex.: PEPE"},
  {key:"quantidade",label:"Quantidade",type:"number",step:"0.00000001"},
  tipo==="Venda"?{key:"valorRecebido",label:"Valor recebido (R$)",type:"number",step:"0.01"}:{key:"valorInvestido",label:"Valor pago (R$)",type:"number",step:"0.01"},
  {key:"dataCompra",label:"Data",type:"date"},
  {key:"exchange",label:"Exchange"},{key:"wallet",label:"Custódia (carteira)"}
];
const crBaixar=(nome,texto)=>{try{const b=new Blob(["﻿"+texto],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=nome;document.body.appendChild(a);a.click();document.body.removeChild(a);}catch{}};
const crPct=v=>v==null?"—":`${v>=0?"+":""}${v.toLocaleString("pt-BR",{maximumFractionDigits:2})}%`;
const crHora=iso=>{if(!iso)return"nunca";const d=new Date(iso);return d.toLocaleDateString("pt-BR")+" "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});};

function CrOps({ops,onEdit,onDel}){const P=useT();const S=useS();
  if(!ops.length)return<div style={{fontSize:12,color:P.textMuted,padding:12}}>Nenhuma operação.</div>;
  return(<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Data","Tipo","Moeda","Qtd","Valor","Preço unit.","Exchange","Custódia",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
    <tbody>{ops.map(o=>{const v=o.tipo==="Venda"?crQ(o.valorRecebido):crQ(o.valorInvestido);const q=crQ(o.quantidade);const pu=(v>0&&q>0)?v/q:null;
      return(<tr key={o.id}><td style={S.td}>{fD(o.dataCompra)}</td><td style={{...S.td,fontWeight:700,color:o.tipo==="Venda"?P.red:P.accent}}>{o.tipo==="Venda"?"Venda":"Compra"}</td><td style={{...S.td,fontWeight:700}}>{o.ticker||"—"}</td><td style={S.td}>{crFmtQtd(q)}</td><td style={S.td}>{v>0?fmt(v):"—"}</td><td style={S.td}>{pu!=null?fmt(pu):"—"}</td><td style={S.td}>{o.exchange||"—"}</td><td style={S.td}>{o.wallet||"—"}</td>
        <td style={{...S.td,whiteSpace:"nowrap"}}><button style={{...S.btnO,padding:"3px 8px"}} onClick={()=>onEdit(o)}>✎</button> <button style={{...S.btnO,padding:"3px 8px",color:P.red}} onClick={()=>onDel(o)}>✕</button></td></tr>);})}</tbody></table>);}

function CrIrpfTabela({cr,ano}){const P=useT();const S=useS();const ls=crIrpfLinhas(cr,ano);
  if(!ls.length)return<div style={{fontSize:12,color:P.textMuted}}>Sem posição em cripto em 31/12/{ano}.</div>;
  return(<table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr>{["Cód.","Moeda","Qtd 31/12/"+ano,"Custo 31/12/"+(ano-1),"Custo 31/12/"+ano,"Discriminação"].map(h=><th key={h} style={{...S.th,fontSize:10}}>{h}</th>)}</tr></thead>
    <tbody>{ls.map(l=>(<tr key={l.ticker}><td style={S.td}>{l.codigo}</td><td style={{...S.td,fontWeight:700}}>{l.ticker}</td><td style={S.td}>{crFmtQtd(l.qtdAtual)}</td><td style={S.td}>{l.qtdAnterior>0?(l.custoAnterior>0?fmt(l.custoAnterior):"sem custo"):"—"}</td><td style={{...S.td,fontWeight:600,color:l.semCusto?P.yellow:undefined}}>{l.qtdAtual>0?(l.semCusto?"informe o custo":fmt(l.custoAtual)):"—"}</td><td style={{...S.td,fontSize:10}}>{l.discriminacao||"—"}</td></tr>))}</tbody></table>);}

function CrImport({data,onImport,onClose}){const P=useT();const S=useS();
  const[res,setRes]=useState(null);const[origem,setOrigem]=useState("");const[nome,setNome]=useState("");
  const ler=async f=>{if(!f)return;setNome(f.name);try{const t=await f.text();setRes(crParseCSV(t));}catch(e){setRes({erro:"Não consegui ler o arquivo.",itens:[],ignoradas:0});}};
  const novos=res&&!res.erro?res.itens.filter(n=>!crDuplicado(data,n)):[];const dups=res&&!res.erro?res.itens.length-novos.length:0;
  // duplicatas dentro do próprio arquivo não são removidas (podem ser operações reais iguais); só contra o que já existe
  const incons=novos.length?crCalcular([...data,...novos.map(n=>crItemDeImport(n,origem))]).inconsistencias:[];
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}} onClick={onClose}><div style={{...S.card,maxWidth:680,width:"100%",margin:0,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
    <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Importar extrato (CSV)</div>
    <div style={{fontSize:11,color:P.textMuted,marginBottom:14,lineHeight:1.5}}>Colunas reconhecidas: Data, Tipo (compra/venda), Moeda/Ativo, Quantidade e Valor (ou Preço). Linhas que não forem compra/venda (depósitos, taxas, saques) são ignoradas. Operações idênticas às já cadastradas não são duplicadas.</div>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:14}}>
      <input type="file" accept=".csv,.txt,text/csv" onChange={e=>ler(e.target.files&&e.target.files[0])}/>
      <input style={{...S.i,width:200}} placeholder="Exchange (opcional)" value={origem} onChange={e=>setOrigem(e.target.value)}/>
      <button style={S.btnO} onClick={()=>crBaixar("modelo_cripto.csv","Data;Tipo;Moeda;Quantidade;Valor (R$)\n15/03/2023;Compra;BTC;0,005;4500,00\n20/06/2024;Venda;DOGE;500;250,00\n")}>Baixar modelo</button>
    </div>
    {res&&res.erro&&<div style={{color:P.red,fontSize:12,marginBottom:12}}>{res.erro}</div>}
    {res&&!res.erro&&(<div style={{fontSize:12,marginBottom:12,lineHeight:1.7}}>
      <div><b>{nome}</b>: {novos.length} nova(s) · {dups} já cadastrada(s) · {res.ignoradas} linha(s) ignorada(s)</div>
      {incons.length>0&&<div style={{color:P.yellow}}>⚠ {incons.length} venda(s) ficariam sem saldo (falta a compra correspondente): {incons.slice(0,3).map(i=>i.msg).join("; ")}</div>}
      {novos.length>0&&<div style={{maxHeight:220,overflowY:"auto",marginTop:8}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr>{["Data","Tipo","Moeda","Qtd","Valor"].map(h=><th key={h} style={{...S.th,fontSize:10}}>{h}</th>)}</tr></thead><tbody>{novos.map((n,i)=>(<tr key={i}><td style={S.td}>{fD(n.data)}</td><td style={{...S.td,color:n.tipo==="Venda"?P.red:P.accent,fontWeight:700}}>{n.tipo}</td><td style={S.td}>{n.ticker}</td><td style={S.td}>{crFmtQtd(n.quantidade)}</td><td style={S.td}>{fmt(n.valor)}</td></tr>))}</tbody></table></div>}
    </div>)}
    <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button style={S.btnO} onClick={onClose}>Cancelar</button><button style={{...S.btn(),opacity:novos.length?1:0.5}} disabled={!novos.length} onClick={()=>onImport(novos.map(n=>crItemDeImport(n,origem)))}>Importar {novos.length||""}</button></div>
  </div></div>);}

function CrTab({data,setData,cot,base,setBase,onRefresh,loading}){const P=useT();const S=useS();
  const[aba,setAba]=useState("carteira");const[modal,setModal]=useState(null);const[del,setDel]=useState(null);const[aberto,setAberto]=useState(null);const[imp,setImp]=useState(false);const[pm,setPm]=useState(null);
  const[ano,setAno]=useState(()=>new Date().getFullYear());
  const hoje=localISO(new Date());
  const rs=crResumo(data,cot);
  const ops=data.map(o=>({...o,ticker:crTk(o),tipo:o.tipo==="Venda"?"Venda":"Compra"})).sort((a,b)=>(b.dataCompra||"").localeCompare(a.dataCompra||""));
  const salvar=it=>{const fin=crFinalizarItem(it);const outros=data.filter(x=>x.id!==fin.id);const err=crValidarItem(fin,outros);if(err){window.alert(err);return;}
    const novo=data.some(x=>x.id===fin.id)?data.map(x=>x.id===fin.id?fin:x):[...data,fin];
    if(crCalcular(novo).inconsistencias.length>crCalcular(data).inconsistencias.length){window.alert("Essa alteração deixaria uma venda posterior sem saldo. Ajuste as operações em ordem.");return;}
    setData(novo);setModal(null);};
  const excluir=()=>{if(!del)return;setData(data.filter(x=>x.id!==del.id));setDel(null);};
  const abrir=(tipo,row)=>setModal({tipo,initial:row?crPrepararModal(row,tipo):{tipo,ticker:"BTC",dataCompra:hoje}});
  const salvarPreco=v=>{const tk=pm.ticker,val=crQ(v.precoManual)>0?String(crQ(v.precoManual)):"";setData(data.map(x=>(crTk(x)===tk&&x.tipo!=="Venda")?{...x,precoManual:val}:x));setPm(null);};
  const vendasMes=crVendasPorMes(rs.realizadas),alertas=crAlertasIsencao(vendasMes,hoje),alertaAtual=alertas.find(a=>a.mes===hoje.slice(0,7));
  const nenhuma=!rs.linhas.length;
  const idade=cot.ultimaOK?Date.now()-new Date(cot.ultimaOK).getTime():null;const velha=idade==null||idade>CR_DEFASADO_MS;
  const abaBtn=(k,l)=><button key={k} style={{...S.btnO,background:aba===k?P.accent:"transparent",color:aba===k?"#fff":P.textDim,borderColor:aba===k?P.accent:P.borderLight}} onClick={()=>setAba(k)}>{l}</button>;
  const anos=[...new Set([new Date().getFullYear(),...data.map(o=>+(o.dataCompra||"").slice(0,4)).filter(Boolean)])].sort((a,b)=>b-a);
  const vendasAno=rs.realizadas.filter(r=>(r.data||"").startsWith(String(ano))).sort((a,b)=>b.data.localeCompare(a.data));
  const mesesAno=Object.entries(vendasMes).filter(([m])=>m.startsWith(String(ano))).sort((a,b)=>b[0].localeCompare(a[0]));
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}><div style={{fontSize:22,fontWeight:700}}>◈ Cripto</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button style={S.btn()} onClick={()=>abrir("Compra")}>+ Compra</button><button style={S.btn(P.red)} onClick={()=>abrir("Venda")}>+ Venda</button><button style={S.btnO} onClick={()=>setImp(true)}>Importar extrato</button></div></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:14}}>
      <SC label={base==="custo"?"Patrimônio (custo)":"Valor de mercado"} value={fmt(base==="custo"?rs.custoTotal:rs.valorTotal)} color={P.blue} dim={P.blueDim}/>
      <SC label="Investido (custo)" value={fmt(rs.custoTotal)} color={P.orange} dim={P.orangeDim}/>
      <SC label={"L/P"+(rs.lpPct!=null?" ("+crPct(rs.lpPct)+")":"")} value={rs.lpPct==null?"—":fmt(rs.lp)} color={(rs.lp||0)>=0?P.accent:P.red} dim={(rs.lp||0)>=0?P.accentGlow:P.redDim}/>
    </div>
    <div style={{...S.card,padding:"10px 14px",marginBottom:14,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",fontSize:12}}>
      <button style={S.btnO} disabled={loading} onClick={onRefresh}>{loading?"Atualizando…":"↻ Atualizar cotações"}</button>
      <span style={{color:velha?P.yellow:P.textMuted}}>{cot.ultimaOK?`Última cotação: ${crHora(cot.ultimaOK)}${velha?" — DEFASADA":""}`:"Sem cotação obtida ainda"}</span>
      {cot.erro&&<span style={{color:P.red}}>⚠ {cot.erro}</span>}
      <span style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}><span style={{color:P.textMuted}}>Dashboard usa:</span>
        <button style={{...S.btnO,padding:"4px 10px",background:base==="mercado"?P.accent:"transparent",color:base==="mercado"?"#fff":P.textDim}} onClick={()=>setBase("mercado")}>Mercado</button>
        <button style={{...S.btnO,padding:"4px 10px",background:base==="custo"?P.accent:"transparent",color:base==="custo"?"#fff":P.textDim}} onClick={()=>setBase("custo")}>Custo</button></span>
    </div>
    {alertaAtual&&<div style={{...S.card,borderColor:alertaAtual.estourou?P.red:P.yellow,marginBottom:14,fontSize:12}}>{alertaAtual.estourou?"⚠ Vendas deste mês já passam de":"⚠ Vendas deste mês próximas de"} {fmt(CR_ISENCAO_MENSAL)}: {fmt(alertaAtual.total)} ({alertaAtual.pct.toFixed(0)}%). Veja “Vendas & IR”.</div>}
    {rs.inconsistencias.length>0&&<div style={{...S.card,borderColor:P.yellow,marginBottom:14,fontSize:12}}>⚠ {rs.inconsistencias.slice(0,3).map(i=>i.msg).join(" · ")}</div>}
    <div style={{display:"flex",gap:8,marginBottom:14}}>{abaBtn("carteira","Carteira")}{abaBtn("ops",`Operações (${data.length})`)}{abaBtn("ir","Vendas & IR")}</div>

    {aba==="carteira"&&(nenhuma?<div style={{...S.card,fontSize:13,color:P.textMuted}}>Nenhuma posição. Use “+ Compra” ou importe um extrato.</div>:(<div>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,2.4fr) minmax(0,1fr)",gap:16,alignItems:"start"}} className="cr-grid">
        <div style={{...S.card,padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Moeda","Qtd","Preço médio","Investido","Preço atual","24h","Valor atual","L/P","%","Peso"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{rs.linhas.map(l=>{const sub=ops.filter(o=>o.ticker===l.ticker);return(<React.Fragment key={l.ticker}>
          <TR onClick={()=>setAberto(aberto===l.ticker?null:l.ticker)}><td style={{...S.td,fontWeight:700}}>{aberto===l.ticker?"▼":"▶"} {l.ticker} <span style={{fontWeight:400,color:P.textMuted,fontSize:10}}>{(crInfo(l.ticker)||{}).nome||l.moeda}</span></td>
            <td style={S.td}>{crFmtQtd(l.qtd)}</td><td style={S.td}>{l.precoMedio!=null?fmt(l.precoMedio):"—"}</td><td style={S.td}>{l.semCusto?<span title="Há compra sem valor pago">{fmt(l.custo)} ⚠</span>:fmt(l.custo)}</td>
            <td style={S.td}>{l.preco!=null?fmt(l.preco):"—"} <span style={{fontSize:9,color:l.defasado?P.yellow:P.textMuted}}>{l.preco==null?l.fonte:l.fonte+(l.defasado?" · defasada":"")}</span> <span style={{cursor:"pointer"}} title="Definir preço manual" onClick={e=>{e.stopPropagation();setPm({ticker:l.ticker,precoManual:l.fonte==="manual"?String(l.preco):""});}}>✎</span></td>
            <td style={{...S.td,color:l.var24h==null?P.textMuted:l.var24h>=0?P.accent:P.red}}>{crPct(l.var24h)}</td>
            <td style={{...S.td,fontWeight:600}}>{fmt(l.valor)}</td><td style={{...S.td,fontWeight:600,color:l.lp==null?P.textMuted:l.lp>=0?P.accent:P.red}}>{l.lp==null?"—":fmt(l.lp)}</td><td style={{...S.td,color:l.lpPct==null?P.textMuted:l.lpPct>=0?P.accent:P.red}}>{crPct(l.lpPct)}</td><td style={S.td}>{l.peso.toFixed(1)}%</td></TR>
          {aberto===l.ticker&&<tr><td colSpan={10} style={{padding:10,background:P.surfaceAlt}}><CrOps ops={sub} onEdit={o=>abrir(o.tipo,o)} onDel={setDel}/></td></tr>}</React.Fragment>);})}</tbody></table></div>
        <div style={{...S.card,padding:20}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>Alocação por moeda</div><Pie data={rs.linhas.filter(l=>l.valor>0).map((l,i)=>({label:l.ticker,value:l.valor,color:CR_CORES[i%CR_CORES.length]}))} size={200}/></div>
      </div>
      <div style={{fontSize:10,color:P.textMuted,marginTop:8}}>L/P é calculado só onde há valor pago em todas as compras da moeda. “Preço atual” vem das cotações (CoinGecko, reserva AwesomeAPI) ou do preço manual (✎), que tem prioridade.</div>
    </div>))}

    {aba==="ops"&&<div style={{...S.card,padding:0,overflowX:"auto"}}><CrOps ops={ops} onEdit={o=>abrir(o.tipo,o)} onDel={setDel}/></div>}

    {aba==="ir"&&(<div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}><span style={{fontSize:12,color:P.textDim}}>Ano-base</span><select style={{...S.sel,width:"auto"}} value={ano} onChange={e=>setAno(Number(e.target.value))}>{anos.map(a=><option key={a} value={a}>{a}</option>)}</select></div>
      <div style={{...S.card,marginBottom:14}}><div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Vendas por mês × limite de {fmt(CR_ISENCAO_MENSAL)}</div>
        {mesesAno.length===0?<div style={{fontSize:12,color:P.textMuted}}>Sem vendas em {ano}.</div>:<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Mês","Total vendido","% do limite","Ganho/perda","Situação"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{mesesAno.map(([m,v])=>{const est=v.total>CR_ISENCAO_MENSAL;return(<tr key={m}><td style={S.td}>{m.slice(5)}/{m.slice(0,4)}</td><td style={S.td}>{fmt(v.total)}</td><td style={S.td}>{(v.total/CR_ISENCAO_MENSAL*100).toFixed(0)}%</td><td style={{...S.td,color:v.ganho>=0?P.accent:P.red}}>{fmt(v.ganho)}</td><td style={{...S.td,color:est?P.red:P.accent,fontWeight:600}}>{est?"Acima do limite":"Dentro do limite"}</td></tr>);})}</tbody></table>}
        <div style={{fontSize:10,color:P.textMuted,marginTop:8,lineHeight:1.5}}>Referência: limite de R$ 35.000 em vendas no mês (regra tradicional de isenção de ganho de capital). Confirme a regra vigente com a Receita/contador antes de declarar; o ganho aqui usa custo médio e não considera taxas.</div></div>
      <div style={{...S.card,marginBottom:14}}><div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Vendas realizadas em {ano}</div>
        {vendasAno.length===0?<div style={{fontSize:12,color:P.textMuted}}>Nenhuma venda.</div>:<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Data","Moeda","Qtd","Recebido","Custo baixado","Ganho/perda"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{vendasAno.map((r,i)=>(<tr key={i}><td style={S.td}>{fD(r.data)}</td><td style={{...S.td,fontWeight:700}}>{r.ticker}</td><td style={S.td}>{crFmtQtd(r.qtd)}</td><td style={S.td}>{fmt(r.recebido)}</td><td style={S.td}>{r.semCusto?"sem custo":fmt(r.custo)}</td><td style={{...S.td,color:r.ganho>=0?P.accent:P.red}}>{fmt(r.ganho)}</td></tr>))}</tbody></table>}</div>
      <div style={S.card}><div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Bens e Direitos — Grupo 08 (posição em 31/12/{ano})</div><CrIrpfTabela cr={data} ano={ano}/>
        <div style={{fontSize:10,color:P.textMuted,marginTop:8}}>Códigos: 01 Bitcoin, 02 outras criptomoedas, 03 stablecoins (confirme na ficha do ano).</div></div>
    </div>)}

    {modal&&<Mdl title={modal.tipo==="Venda"?"Venda de cripto":"Compra de cripto"} fields={crCampos(modal.tipo)} initial={modal.initial} onSave={salvar} onCancel={()=>setModal(null)}/>}
    {pm&&<Mdl title={`Preço manual — ${pm.ticker} (deixe vazio para usar a cotação)`} fields={[{key:"precoManual",label:"Preço (R$)",type:"number",step:"0.00000001"}]} initial={pm} onSave={salvarPreco} onCancel={()=>setPm(null)}/>}
    {del&&<Cfm msg={`Excluir ${del.tipo==="Venda"?"venda":"compra"} de ${crFmtQtd(crQ(del.quantidade))} ${del.ticker}?`} onOk={excluir} onNo={()=>setDel(null)}/>}
    {imp&&<CrImport data={data} onClose={()=>setImp(false)} onImport={novos=>{setData([...data,...novos]);setImp(false);}}/>}
  </div>);}

/* FIIs — fix DY lookup with uppercase ticker */
const FII_F=[{key:"ticker",label:"Ticker",placeholder:"HGLG11"},{key:"quantidade",label:"Qtd",type:"number",step:"1"},{key:"precoMedio",label:"PM",type:"number",step:"0.01"},{key:"ultDivManual",label:"Último Dividendo (manual)",type:"number",step:"0.01",placeholder:"Deixe vazio para usar o padrão"},{key:"dataCompra",label:"Data",type:"date"}];
function FiiTab({data,setData,fiiMkt,setFiiMkt}){const P=useT();const S=useS();const[sub,setSub]=useState("cart");const[fiiMktLF,setFiiMktLF]=useState(()=>ld("ip8-fiiMktLF",null));
  const lookup=(ticker)=>{const tk=(ticker||"").toUpperCase();const def=FII_MKT_DEF.find(f=>f.ticker.toUpperCase()===tk);const m=fiiMkt.find(f=>f.ticker.toUpperCase()===tk);if(def)return{...(m||def),ultDiv:def.ultDiv,dy:def.dy,setor:def.setor};return m||null;};
  const setDW=fn=>{
    const process=arr=>arr.map(i=>{const tk=(i.ticker||"").toUpperCase();const m=lookup(tk);const q=Number(i.quantidade)||0;
      const ultDivAuto=m?m.ultDiv:0;const ultDiv=Number(i.ultDivManual)>0?Number(i.ultDivManual):ultDivAuto;
      const dy=m?m.dy:0;const setor=m?m.setor:(i.segmento||"—");
      const divMensal=(q>0&&ultDiv>0)?(ultDiv*q).toFixed(2):"0";
      return{...i,ticker:tk,banco:"INTER",dividendoMensal:divMensal,dyAnual:dy,ultDiv,segmento:setor,_inv:q*(Number(i.precoMedio)||0)};});
    if(typeof fn==="function")setData(prev=>process(fn(prev)));else setData(process(fn));
  };
  const tI=data.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0),tD=data.reduce((a,i)=>a+(Number(i.dividendoMensal)||0),0);
  const mergedMkt=useMemo(()=>{const mp=new Map(fiiMkt.map(f=>[f.ticker.toUpperCase(),f]));data.forEach(i=>{const tk=(i.ticker||"").toUpperCase();if(tk&&!mp.has(tk))mp.set(tk,{ticker:tk,nome:tk,setor:i.segmento||"—",preco:Number(i.precoAtual)||0,pvp:0,dy:0,ultDiv:0});});return Array.from(mp.values());},[fiiMkt,data]);
  const refreshMkt=()=>{const u=[...FII_MKT_DEF];const e=new Set(u.map(f=>f.ticker.toUpperCase()));data.forEach(i=>{const tk=(i.ticker||"").toUpperCase();if(tk&&!e.has(tk))u.push({ticker:tk,nome:tk,setor:i.segmento||"—",preco:Number(i.precoAtual)||0,pvp:0,dy:0,ultDiv:0});});setFiiMkt(u);};
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{fontSize:22,fontWeight:700}}>FIIs</div><div style={{display:"flex",gap:8}}><button style={sub==="cart"?S.btnA():S.btnO} onClick={()=>setSub("cart")}>Carteira</button><button style={sub==="mkt"?S.btnA():S.btnO} onClick={()=>setSub("mkt")}>Mercado</button></div></div>
    <div style={{fontSize:13,color:P.textDim,marginBottom:28}}>Banco: INTER · Dividendo = último dividendo × cotas</div>
    {sub==="cart"&&(<CRUD title="" icon="⬡" fields={FII_F} data={data} setData={setDW} cards={<React.Fragment><SC label="Investido" value={fmt(tI)} color={P.purple} dim={P.purpleDim}/><SC label="Div.Mensal" value={fmt(tD)} color={P.accent} dim={P.accentGlow}/></React.Fragment>}
      columns={["Ticker","Seg.","Qtd","PM","Últ.Div","Investido","DY%","Div.Mensal"]}
      sortFields={[{k:"ticker"},{k:"segmento"},{k:"quantidade"},{k:"precoMedio"},{k:"ultDiv"},{k:"_inv"},{k:"dyAnual"},{k:"dividendoMensal"}]}
      renderRow={i=>{const inv=(Number(i.quantidade)||0)*(Number(i.precoMedio)||0);const dy=i.dyAnual||0;const ud=i.ultDiv||0;return(<React.Fragment><td style={{...S.td,fontWeight:700}}>{i.ticker||"—"}</td><td style={S.td}><span style={S.tag(P.purple,P.purpleDim)}>{i.segmento||"—"}</span></td><td style={S.td}>{i.quantidade||"—"}</td><td style={S.td}>{fmt(i.precoMedio)}</td><td style={{...S.td,color:P.cyan}}>{ud>0?fmt(ud):"—"}</td><td style={S.td}>{fmt(inv)}</td><td style={{...S.td,color:dy>0?P.accent:P.textMuted}}>{dy>0?`${dy}%`:"—"}</td><td style={{...S.td,color:P.accent,fontWeight:600}}>{fmt(i.dividendoMensal)}</td></React.Fragment>);}}
    />)}
    {sub==="mkt"&&(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontSize:14,fontWeight:600}}>Top IFIX + seus FIIs ({mergedMkt.length})</div><button style={S.btn()} onClick={()=>{refreshMkt();setFiiMktLF(new Date().toISOString());}}>⟳ Atualizar</button></div>{fiiMktLF&&<div style={{fontSize:12,color:P.textDim,marginBottom:16,padding:"6px 10px",background:P.surfaceAlt,borderRadius:6,display:"inline-block"}}>Última atualização: <b>{new Date(fiiMktLF).toLocaleDateString("pt-BR")}</b> às <b>{new Date(fiiMktLF).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</b></div>}<div style={{...S.card,padding:0,overflowX:"auto",maxHeight:500,overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead style={{position:"sticky",top:0,background:P.surface,zIndex:2}}><tr><th style={S.th}>Ticker</th><th style={S.th}>Nome</th><th style={S.th}>Setor</th><th style={S.th}>Preço</th><th style={S.th}>Últ.Div</th><th style={S.th}>P/VP</th><th style={S.th}>DY</th><th style={S.th}>Cart.</th></tr></thead><tbody>{mergedMkt.map(f=>{const inC=data.some(d=>(d.ticker||"").toUpperCase()===f.ticker.toUpperCase());return(<TR key={f.ticker} onClick={()=>{}}><td style={{...S.td,fontWeight:700}}>{f.ticker}</td><td style={S.td}>{f.nome}</td><td style={S.td}>{f.setor}</td><td style={S.td}>{fmt(f.preco)}</td><td style={{...S.td,color:P.cyan}}>{f.ultDiv?fmt(f.ultDiv):"—"}</td><td style={{...S.td,color:f.pvp&&f.pvp<1?P.accent:P.text}}>{f.pvp?f.pvp.toFixed(2):"—"}</td><td style={{...S.td,color:P.accent}}>{f.dy?fP(f.dy):"—"}</td><td style={S.td}>{inC?<span style={S.tag(P.accent,P.accentGlow)}>✓</span>:"—"}</td></TR>);})}</tbody></table></div></div>)}
  </div>);
}

/* APORTES */
function apF(){return[{key:"data",label:"Data",type:"date"},{key:"valor",label:"Valor (R$)",type:"number",step:"0.01"}];}
function ApTab({data,setData,banks,meta,setMeta}){const P=useT();const S=useS();const total=data.reduce((a,i)=>a+(Number(i.valor)||0),0);const sorted=[...data].sort((a,b)=>(b.data||"").localeCompare(a.data||""));const byM={};data.forEach(i=>{if(!i.data)return;const k=i.data.slice(0,7);byM[k]=(byM[k]||0)+(Number(i.valor)||0);});const months=Object.entries(byM).sort((a,b)=>a[0].localeCompare(b[0]));const monthsDesc=[...months].reverse().slice(0,12);const[em,setEm]=useState(false);const[dm,setDm]=useState(meta);
  // Meta gap: sum of (aporte - meta) for each distinct month
  const nMeses=months.length;
  const metaTotal=meta*nMeses;
  const gap=total-metaTotal; // positive = exceeded, negative = deficit
  return(<div><div style={{fontSize:22,fontWeight:700,marginBottom:20}}>Aportes</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:24}}><SC label="Total Aportado" value={fmt(total)} color={P.accent} dim={P.accentGlow}/><SC label="Meses" value={String(nMeses)} color={P.blue} dim={P.blueDim}/><div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,padding:"18px 20px"}}><div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",color:P.textDim,marginBottom:8}}>Meta Mensal</div>{em?(<div style={{display:"flex",gap:6}}><input style={{...S.i,fontSize:16,fontWeight:700,width:120}} type="number" value={dm} onChange={e=>setDm(e.target.value)}/><button style={{...S.btn(),padding:"4px 10px",fontSize:11}} onClick={()=>{setMeta(Number(dm)||0);setEm(false);}}>OK</button></div>):(<div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20,fontWeight:700,color:P.yellow}}>{meta>0?fmt(meta):"—"}</span><button style={{background:"transparent",border:"none",color:P.textDim,cursor:"pointer",fontSize:11,fontFamily:"inherit",textDecoration:"underline"}} onClick={()=>{setDm(meta);setEm(true);}}>editar</button></div>)}</div>{meta>0&&nMeses>0&&<SC label={gap>=0?"Excedente Acumulado":"Déficit Acumulado"} value={fmt(Math.abs(gap))} color={gap>=0?P.accent:P.red} dim={gap>=0?P.accentGlow:P.redDim}/>}{meta>0&&nMeses>0&&<SC label="Meta Total Período" value={fmt(metaTotal)} color={P.textDim} dim={P.surfaceAlt}/>}</div>
    {monthsDesc.length>0&&(<div style={{...S.card,marginBottom:20}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{monthsDesc.map(([m,v])=>{const hit=meta>0&&v>=meta;return(<div key={m} style={{background:hit?P.accentGlow:P.surfaceAlt,border:`1px solid ${hit?P.accent:P.border}`,borderRadius:8,padding:"10px 14px",minWidth:110}}><div style={{fontSize:11,color:P.textMuted}}>{mL(m)}</div><div style={{fontSize:15,fontWeight:700,color:hit?P.accent:P.text}}>{fmt(v)}</div>{meta>0&&<div style={{fontSize:10,color:hit?P.accent:P.red}}>{hit?"✓ Meta":fmt(v-(meta))}</div>}</div>);})}</div></div>)}
    <CRUD title="" icon="↗" fields={apF()} data={sorted} setData={setData} columns={["Data","Valor"]} sortFields={[{k:"data"},{k:"valor"}]} renderRow={i=>(<React.Fragment><td style={S.td}>{fD(i.data)}</td><td style={{...S.td,fontWeight:600}}>{fmt(i.valor)}</td></React.Fragment>)}/>
  </div>);
}

/* ORC — complete rewrite */
const ORC_C=["Água","Almoços","Assinaturas","Celular","Clube","Comer Fora","Diarista","Educação","Escola Liza","Escritório JU","Extra","Gasolina","iFood","INSS","Internet","Investimentos","Jardim","Lazer","Luz","Mercado","Moradia","Netflix","Piscina","Preta","Remédio","Seguro Vida","Sepal","Shopee","Telefone","Unimed","Viagem","Outros"].sort((a,b)=>a.localeCompare(b,"pt-BR"));
const CAT_EMOJI={"Água":"💧","Almoços":"🍽️","Assinaturas":"📱","Celular":"📞","Clube":"🏊","Comer Fora":"🍔","Diarista":"🧹","Educação":"📚","Escola Liza":"🎒","Escritório JU":"🏢","Extra":"⭐","Gasolina":"⛽","iFood":"🛵","INSS":"🏛️","Internet":"🌐","Investimentos":"📈","Jardim":"🌿","Lazer":"🎭","Luz":"💡","Mercado":"🛒","Moradia":"🏠","Netflix":"🎬","Piscina":"🏊","Preta":"🐾","Remédio":"💊","Seguro Vida":"🛡️","Sepal":"🏢","Shopee":"📦","Telefone":"☎️","Unimed":"🏥","Viagem":"✈️","Salário":"💰","Vale Refeição":"🍽️","Renda Extra":"💵","Vale Alimentação":"🥗","Outros":"📌"};
const catEmoji=cat=>CAT_EMOJI[cat]||"📌";
const ORC_REC=["Salário","Honorários","Outros"];
const AUTO_FIXO=["Água","Luz","Internet","Telefone","Unimed","Diarista","Clube","Educação","Escola Liza","Preta","Gasolina","Jardim","Seguro Vida","Piscina","Assinaturas","Sepal","INSS","Mercado"];
const ORC_F=[{key:"data",label:"Data",type:"date"},{key:"tipo",label:"Tipo",type:"select",options:["Despesa","Receita"]},{key:"categoria",label:"Categoria",type:"select",options:ORC_C,dynamicOptions:true},{key:"descricao",label:"Descrição",placeholder:"Opcional"},{key:"valor",label:"Valor",type:"number",step:"0.01"},{key:"fixo",label:"Gasto Fixo",type:"checkbox",checkLabel:"Gasto fixo mensal",showWhen:"tipo=Despesa"}];
function OrcTab({data,setData}){const P=useT();const S=useS();
  const{sb:orcSb,sd:orcSd,onS:orcOnS,doS:orcDoS}=useSort("valor","desc");
  const[mF,setMF]=useState(()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;});
  const[modal,setModal]=useState(null);const[del,setDel]=useState(null);const[sub,setSub]=useState("visao");
  const[repCats,setRepCats]=useState([]);const[repMonths,setRepMonths]=useState([]);const[hoverPt,setHoverPt]=useState(null);
  const[pieFilter,setPieFilter]=useState(null);
  // 7. Auto-copy fixed expenses from previous month if current month is empty
  // Copies category name only — value is reset to 0 for user to fill in
  useEffect(()=>{
    const novos=orcModelosFixos(data,mF,localISO(new Date()).slice(0,7),uid);   // nunca cria linhas em meses futuros
    if(novos.length)setData(prev=>[...prev,...novos]);
  },[mF]);
  // Lançou o gasto real de uma categoria fixa? A linha em branco daquele mês some sozinha (também ao importar fatura/extrato)
  useEffect(()=>{setData(prev=>orcLimparModelos(prev));},[data]);
  // Credit card import state
  const[showImport,setShowImport]=useState(false);const[importItems,setImportItems]=useState([]);
  const[catMap,setCatMap]=useState(()=>ld("ip8-catMap",{}));
  const saveCatMap=m=>{setCatMap(m);sv("ip8-catMap",m);};
  // Parse CSV/OFX credit card statement
  // PDF text extraction via CDN
  const[showPdfDebug,setShowPdfDebug]=useState(false);const[pdfRawText,setPdfRawText]=useState("");
  const handlePdfDebug=async(e)=>{const file=e.target.files[0];if(!file)return;setPdfCsvLoading(true);
    try{
      const pdfjsLib=await loadPdfJs();
      const buf=await file.arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf}).promise;
      const rows=[];
      for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const content=await page.getTextContent();
        const byY={};content.items.forEach(item=>{const y=Math.round(item.transform[5]);if(!byY[y])byY[y]=[];byY[y].push({x:Math.round(item.transform[4]),str:item.str});});
        Object.keys(byY).sort((a,b)=>Number(b)-Number(a)).forEach(y=>{const rowItems=byY[y].sort((a,b)=>a.x-b.x);rows.push(`Y${y}: `+rowItems.map(i=>`[${i.str}]`).join(" "));});
      }
      setPdfRawText(rows.join("\n"));setShowPdfDebug(true);
    }catch(err){alert("Erro: "+err.message);}
    setPdfCsvLoading(false);e.target.value="";
  };
  const loadPdfJs=()=>new Promise((res,rej)=>{if(window.pdfjsLib)return res(window.pdfjsLib);const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";res(window.pdfjsLib);};s.onerror=rej;document.head.appendChild(s);});
  // PDF to CSV converter
  const extractPdfText=async(file)=>(await pdfLerLinhas(file,loadPdfJs)).map(c=>c.join(" ")).join("\n");
  const[showPdfCsv,setShowPdfCsv]=useState(false);const[pdfCsvRows,setPdfCsvRows]=useState([]);const[pdfCsvLoading,setPdfCsvLoading]=useState(false);
  const handlePdfToCsv=async(e)=>{const file=e.target.files[0];if(!file)return;setPdfCsvLoading(true);
    try{
      const linhas=await pdfLerLinhas(file,loadPdfJs);
      setPdfRawText(linhas.map(c=>c.join(" | ")).join("\n"));
      const rows=extratoPdfRows(linhas,IGNORE_EXTRATO).map(r=>({...r,include:true,categoria:catMap[r.desc.toUpperCase()]||guessCategory(r.desc)}));
      setPdfCsvRows(rows);setShowPdfCsv(true);
    }catch(err){alert("Erro ao ler PDF: "+err.message);}
    setPdfCsvLoading(false);e.target.value="";
  };
  const confirmPdfCsv=()=>{
    const toImport=pdfCsvRows.filter(r=>r.include).map(r=>{
      const isPix=r.historico.toUpperCase().includes("PIX");const mapped=catMap[r.desc.toUpperCase()]||r.categoria;
      return{id:uid(),data:r.dt,tipo:"Despesa",categoria:mapped,descricao:(isPix?"PIX: ":"")+r.desc,valor:Number(r.val).toFixed(2),fixo:AUTO_FIXO.includes(mapped),original:r.desc};
    });
    const withDup=processImportItems(toImport);setImportItems(withDup);setShowPdfCsv(false);if(withDup.length>0)setShowImport(true);
  };
  const parseFaturaLine=(line)=>{
    const m=line.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(.+?)\s+([\d.,]+)\s*$/);
    if(m){let dt=m[1],desc=m[2].trim(),val=m[3].replace(/\./g,"").replace(",",".");const dm=dt.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);if(dm)dt=`${dm[3]}-${dm[2]}-${dm[1]}`;return{dt,desc,val:Math.abs(Number(val))};}
    const m2=line.match(/(\d{2}[\/\-]\d{2})\s+(.+?)\s+([\d.,]+)\s*$/);
    if(m2){const yr=new Date().getFullYear();let dt=m2[1]+"/"+yr,desc=m2[2].trim(),val=m2[3].replace(/\./g,"").replace(",",".");const dm=dt.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);if(dm)dt=`${dm[3]}-${dm[2]}-${dm[1]}`;return{dt,desc,val:Math.abs(Number(val))};}
    return null;
  };
  const processImportItems=(items)=>items.map(item=>{
    const dup=data.some(d=>d.data===item.data&&Math.abs((Number(d.valor)||0)-(Number(item.valor)||0))<0.01&&(d.descricao||"").toUpperCase()===(item.descricao||"").toUpperCase());
    return{...item,isDup:dup};
  });
  const IGNORE_EXTRATO=["PAGAMENTO RECEBIDO","PAGAMENTO DE FATURA","PAG FATURA","APLICACAO","RESGATE","TRANSFERENCIA ENTRE","TED ENTRE","RENDIMENTO","IOF","TARIFA","JUROS","SALDO","IVAN BIALECKI"];
  const parseTextToItems=(text,fileName,isExtrato)=>{
    const lines=text.split("\n").map(l=>l.trim()).filter(l=>l);const items=[];
    // Parse CSV respecting quoted fields: "value,with,commas"
    const parseCSVLine=(line)=>{const result=[];let cur="",inQ=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){inQ=!inQ;}else if((c===","||c===";"||c==="\t")&&!inQ){result.push(cur.trim());cur="";}else{cur+=c;}}result.push(cur.trim());return result;};
    const detectSep=(line)=>{if(line.includes(";"))return";";if(line.includes("\t"))return"\t";return",";};
    if(fileName.endsWith(".ofx")){
      const txns=text.split("<STMTTRN>").slice(1);
      txns.forEach(txn=>{const getField=(f)=>{const m=txn.match(new RegExp(`<${f}>(.*?)(?:<|\\n)`));return m?m[1].trim():"";};
        const trnType=getField("TRNTYPE");const dt=getField("DTPOSTED").slice(0,8);const desc=getField("MEMO")||getField("NAME");let val=Number(getField("TRNAMT").replace(",","."));
        if(!dt||!desc)return;if(isExtrato&&val>0&&trnType!=="DEBIT")return;
        val=Math.abs(val);const fdt=dt.length>=8?`${dt.slice(0,4)}-${dt.slice(4,6)}-${dt.slice(6,8)}`:"";
        const dUp=desc.toUpperCase();if(IGNORE_EXTRATO.some(ig=>dUp.includes(ig)))return;
        const mapped=catMap[dUp]||guessCategory(desc);const isPix=isExtrato&&dUp.includes("PIX");
        items.push({id:uid(),data:fdt,tipo:"Despesa",categoria:mapped,descricao:(isPix?"PIX: ":"")+desc,valor:val.toFixed(2),fixo:AUTO_FIXO.includes(mapped),original:desc});
      });
    } else {
      lines.forEach((line,idx)=>{if(idx===0&&(line.toLowerCase().includes("data")||line.toLowerCase().includes("date")||line.toLowerCase().includes("lançamento")||line.toLowerCase().includes("title")||line.toLowerCase().includes("amount")))return;
        // --- SISPRIME / bank PDF format ---
        // Line like: "18/05/2026 38372267 Pagamento Pix SHPP BRASIL INSTITUI R$ 45,78 R$ 5.285,71"
        const sisprime=line.match(/^(\d{2}\/\d{2}\/\d{4})\s+\S+\s+(?:Pagamento Pix|Débito Pix|Pix|Ted|Liq\. Eletrônica IB)\s+(.+?)\s+R\$\s*([\d.,]+)\s+R\$\s*[\d.,]+\s*$/i);
        if(sisprime){
          const[,rawDt,desc,rawVal]=sisprime;const dm=rawDt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          const dt=dm?`${dm[3]}-${dm[2]}-${dm[1]}`:rawDt;const val=Math.abs(Number(rawVal.replace(/\./g,"").replace(",","."))||0);
          if(val>0&&desc.trim()){
            const dUp=desc.trim().toUpperCase();if(IGNORE_EXTRATO.some(ig=>dUp.includes(ig)))return;
            const d2=desc.trim();const mapped=catMap[dUp]||guessCategory(d2);
            items.push({id:uid(),data:dt,tipo:"Despesa",categoria:mapped,descricao:"PIX: "+d2,valor:val.toFixed(2),fixo:AUTO_FIXO.includes(mapped),original:d2});
          }return;
        }
        const splitLine=(l)=>parseCSVLine(l);
        const parts=splitLine(line)||[];let parsed=null;
        if(parts.length>=3){
          let dt=parts[0].trim(),desc=parts[1].trim(),val=0;
          if(isExtrato&&parts.length>=4){const debit=parts[2].trim().replace(/[^\d.,-]/g,"").replace(",",".");val=Math.abs(Number(debit)||0);if(val===0)return;}
          else{val=Math.abs(Number(parts[parts.length-1].trim().replace(/[^\d.,]/g,"").replace(",","."))||0);}
          const dm1=dt.match(/(\d{4})-(\d{2})-(\d{2})/);if(!dm1){const dm2=dt.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);if(dm2)dt=`${dm2[3]}-${dm2[2]}-${dm2[1]}`;}
          if(val>0&&desc)parsed={dt,desc,val};
        }
        if(!parsed)parsed=parseFaturaLine(line);
        if(!parsed||parsed.val<=0||!parsed.desc)return;
        const dUp=parsed.desc.toUpperCase();
        if(dUp.includes("PAGAMENTO RECEBIDO"))return;
        if(isExtrato&&IGNORE_EXTRATO.some(ig=>dUp.includes(ig)))return;
        const mapped=catMap[dUp]||guessCategory(parsed.desc);const isPix=isExtrato&&dUp.includes("PIX");
        items.push({id:uid(),data:parsed.dt,tipo:"Despesa",categoria:mapped,descricao:(isPix?"PIX: ":"")+parsed.desc,valor:parsed.val.toFixed(2),fixo:AUTO_FIXO.includes(mapped),original:parsed.desc});
      });
    }
    return items;
  };
  const readFileText=file=>new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsText(file,"UTF-8");});
  const handleImport=async(e)=>{const file=e.target.files[0];if(!file)return;
    try{let text="";if(file.name.toLowerCase().endsWith(".pdf")){text=await extractPdfText(file);}else{text=typeof file.text==="function"?await file.text():await readFileText(file);}
    const items=parseTextToItems(text,file.name.toLowerCase(),false);
    if(items.length===0){alert("Nenhum item encontrado. Verifique o formato do arquivo (CSV com ; ou tab, OFX, ou PDF).");}
    setImportItems(processImportItems(items));if(items.length>0)setShowImport(true);}catch(err){alert("Erro ao ler arquivo: "+err.message);}e.target.value="";
  };
  const handleExtrato=async(e)=>{const file=e.target.files[0];if(!file)return;
    if(file.name.toLowerCase().endsWith(".pdf"))return handlePdfToCsv(e);   // extrato em PDF: mesma tela de revisão do botão PDF→Extrato
    try{let text=typeof file.text==="function"?await file.text():await readFileText(file);
    const items=parseTextToItems(text,file.name.toLowerCase(),true);
    if(items.length===0){alert("Nenhum item encontrado. Verifique o formato do arquivo.");}
    setImportItems(processImportItems(items));if(items.length>0)setShowImport(true);}catch(err){alert("Erro ao ler arquivo: "+err.message);}e.target.value="";
  };
  const guessCategory=desc=>{const d=desc.toUpperCase();
    if(d.includes("MERCADO")||d.includes("SUPERMERCADO")||d.includes("ATACADAO")||d.includes("CONDOR")||d.includes("MUFFATO")||d.includes("MUFFATAO")||d.includes("IRANI")||d.includes("FESTVAL")||d.includes("BEAL")||d.includes("ATACADAO"))return"Mercado";
    if(d.includes("IFOOD")||d.includes("RAPPI")||d.includes("RITTER")||d.includes("IFD"))return"iFood";
    if(d.includes("GASOLINA")||d.includes("COMBUSTIVEL")||d.includes("POSTO")||d.includes("SHELL"))return"Gasolina";
    if(d.includes("FARMACIA")||d.includes("DROGARIA")||d.includes("REMEDIO")||d.includes("DEBORA ZANETTI"))return"Remédio";
    if(d.includes("NETFLIX")||d.includes("SPOTIFY")||d.includes("DISNEY")||d.includes("PRIME")||d.includes("YOUTUBE"))return"Assinaturas";
    if(d.includes("SHOPEE")||d.includes("MERCADOLIVRE")||d.includes("AMAZON")||d.includes("SHEIN")||d.includes("MELIMAIS"))return"Shopee";
    if(d.includes("TABEMONO")||d.includes("DIVINO SABOR"))return"Almoços";if(d.includes("RESTAURANTE")||d.includes("PIZZARIA")||d.includes("BURGER")||d.includes("LANCHE")||d.includes("CAFE")||d.includes("CAFETERIA"))return"Comer Fora";
    if(d.includes("UNIMED")||d.includes("SAUDE")||d.includes("HOSPITAL")||d.includes("CLINICA"))return"Unimed";
    if(d.includes("LUZ")||d.includes("COPEL")||d.includes("ENERGIA"))return"Luz";
    if(d.includes("AGUA")||d.includes("SANEPAR"))return"Água";
    if(d.includes("INTERNET")||d.includes("CLARO")||d.includes("VIVO")||d.includes("TIM")||d.includes("OI"))return"Internet";
    return"Outros";
  };
  const dupCount=importItems.filter(i=>i.isDup).length;
  const confirmImport=()=>{
    const newMap={...catMap};importItems.forEach(i=>{if(i.original&&i.categoria!=="Outros")newMap[i.original.toUpperCase()]=i.categoria;});
    saveCatMap(newMap);
    // Filter out duplicates that are still marked
    const toImport=importItems.filter(i=>!i.isDup);
    setData(prev=>[...prev,...toImport]);setShowImport(false);setImportItems([]);
  };
  const fl=data.filter(i=>i.data&&i.data.startsWith(mF));
  const rec=fl.filter(i=>i.tipo==="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0);
  const desp=fl.filter(i=>i.tipo!=="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0);
  const sal=rec-desp;
  const bC={};fl.filter(i=>i.tipo!=="Receita").forEach(i=>{bC[i.categoria||"Outros"]=(bC[i.categoria||"Outros"]||0)+(Number(i.valor)||0);});const cS=Object.entries(bC).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const despFixo=fl.filter(i=>i.tipo!=="Receita"&&i.fixo).reduce((a,i)=>a+(Number(i.valor)||0),0);
  const despVar=desp-despFixo;
  const sF=orcDoS(fl);
  const aM=[...new Set(data.filter(i=>i.data).map(i=>i.data.slice(0,7)))].sort().reverse();if(!aM.includes(mF))aM.unshift(mF);
  const pieData=cS.map(([l,v],i)=>({label:l,value:v,color:PC[i%PC.length]}));
  const pieFixVar=[{label:"Gastos Fixos",value:despFixo,color:P.blue},{label:"Gastos Eventuais",value:despVar,color:P.orange}];
  const pieRecDesp=[{label:"Receitas",value:rec,color:P.accent},{label:"Despesas",value:desp,color:P.red}];
  
  const doSave=item=>{
    // Auto-mark as fixo if category is in AUTO_FIXO list
    let out={...item,id:item.id||uid()};
    if(out.tipo!=="Receita"&&AUTO_FIXO.includes(out.categoria)&&out.fixo===undefined)out.fixo=true;
    // Check duplicate category in same month
    if(!out.id||!data.find(x=>x.id===out.id)){
      const month=out.data?out.data.slice(0,7):"";
      const dup=orcDupCategoria(data,out,month);
      if(dup&&out.tipo!=="Receita"){if(!confirm(`Já existe "${out.categoria}" em ${mL(month)}. Adicionar mesmo assim?`))return;}
    }
    setData(prev=>{const idx=prev.findIndex(x=>x.id===out.id);if(idx>=0){const n=[...prev];n[idx]=out;return n;}return[...prev,out];});
    setModal(null);
  };

  // All unique categories in data for report
  const allCats=[...new Set(data.filter(i=>i.tipo!=="Receita").map(i=>i.categoria||"Outros"))].sort();
  const allMonths=[...new Set(data.filter(i=>i.data).map(i=>i.data.slice(0,7)))].sort();

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:10}}>
      <div style={{fontSize:22,fontWeight:700}}>Orçamento</div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <button style={sub==="visao"?S.btnA():S.btnO} onClick={()=>setSub("visao")}>Visão</button>
        <button style={sub==="relatorio"?S.btnA():S.btnO} onClick={()=>setSub("relatorio")}>Relatório</button>
        <select style={{...S.sel,width:"auto",minWidth:140}} value={mF} onChange={e=>setMF(e.target.value)}>{aM.map(m=><option key={m} value={m}>{mL(m)}</option>)}</select>
        <button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button>
        <label style={{...S.btnO,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><input type="file" accept=".csv,.txt,.ofx,.pdf" style={{display:"none"}} onChange={handleImport}/>📎 Fatura Cartão</label>
        <label style={{...S.btnO,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><input type="file" accept=".csv,.txt,.ofx,.pdf" style={{display:"none"}} onChange={handleExtrato}/>🏦 Extrato Banco</label>
        <label style={{...S.btn(P.purple),cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><input type="file" accept=".pdf" style={{display:"none"}} onChange={handlePdfToCsv}/>{pdfCsvLoading?"⏳ Lendo...":"📄 PDF→Extrato"}</label>
      </div>
    </div>

    {/* PDF→CSV preview modal */}
    {showPdfCsv&&(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",justifyContent:"center",alignItems:"center"}}><div style={{background:P.surface,borderRadius:14,padding:24,maxWidth:820,width:"92%",maxHeight:"85vh",overflow:"auto",border:`1px solid ${P.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:16,fontWeight:700}}>📄 Extrato PDF — {pdfCsvRows.length} transações encontradas</div><button style={S.btnO} onClick={()=>setShowPdfCsv(false)}>✕</button></div>
      <div style={{fontSize:11,color:P.textDim,marginBottom:14}}>Revise os lançamentos. Desmarque os que não deseja importar. Edite a categoria se necessário.</div>
      {pdfCsvRows.length===0?(<div><div style={{textAlign:"center",padding:20,color:P.textMuted,marginBottom:12}}>Nenhuma transação identificada neste PDF.</div>
        {pdfRawText&&(<div><div style={{fontSize:11,fontWeight:700,color:P.textDim,marginBottom:6}}>Texto extraído do PDF (para diagnóstico):</div><textarea readOnly value={pdfRawText} style={{width:"100%",height:300,fontSize:9,fontFamily:"monospace",background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:6,padding:8,color:P.textDim,resize:"vertical"}}/></div>)}</div>):(
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr><th style={S.th}><input type="checkbox" checked={pdfCsvRows.every(r=>r.include)} onChange={e=>{const v=e.target.checked;setPdfCsvRows(p=>p.map(r=>({...r,include:v})));}} title="Marcar todos"/></th><th style={S.th}>Data</th><th style={S.th}>Descrição</th><th style={S.th}>Categoria</th><th style={S.th}>Valor</th></tr></thead>
          <tbody>{pdfCsvRows.map((row,idx)=>(<tr key={idx} style={{opacity:row.include?1:0.4}}>
            <td style={S.td}><input type="checkbox" checked={row.include} onChange={e=>{const n=[...pdfCsvRows];n[idx]={...n[idx],include:e.target.checked};setPdfCsvRows(n);}}/></td>
            <td style={S.td}>{fD(row.dt)}</td>
            <td style={{...S.td,maxWidth:220}}><input style={{...S.i,fontSize:10,padding:"3px 6px"}} value={row.desc} onChange={e=>{const n=[...pdfCsvRows];n[idx]={...n[idx],desc:e.target.value};setPdfCsvRows(n);}}/></td>
            <td style={S.td}><select style={{...S.sel,fontSize:10,padding:"3px 6px"}} value={row.categoria} onChange={e=>{const n=[...pdfCsvRows];n[idx]={...n[idx],categoria:e.target.value};setPdfCsvRows(n);}}>{ORC_C.map(c=><option key={c} value={c}>{catEmoji(c)} {c}</option>)}</select></td>
            <td style={{...S.td,fontWeight:600,color:P.red}}>{fmt(row.val)}</td>
          </tr>))}</tbody>
          <tfoot><tr><td colSpan={4} style={{...S.td,fontWeight:700,borderBottom:"none"}}>TOTAL selecionado</td><td style={{...S.td,fontWeight:700,color:P.red,borderBottom:"none"}}>{fmt(pdfCsvRows.filter(r=>r.include).reduce((a,r)=>a+Number(r.val),0))}</td></tr></tfoot>
        </table>)}
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:16}}>
        <button style={S.btnO} onClick={()=>setShowPdfCsv(false)}>Cancelar</button>
        <button style={S.btn()} onClick={confirmPdfCsv} disabled={!pdfCsvRows.some(r=>r.include)}>Importar {pdfCsvRows.filter(r=>r.include).length} lançamentos</button>
      </div>
    </div></div>)}
    {showImport&&importItems.length>0&&(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",justifyContent:"center",alignItems:"center"}}><div style={{background:P.surface,borderRadius:14,padding:24,maxWidth:800,width:"90%",maxHeight:"80vh",overflow:"auto",border:`1px solid ${P.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:16,fontWeight:700}}>Importar Fatura ({importItems.length} itens{dupCount>0&&<span style={{color:P.red,fontWeight:400,fontSize:12}}> · {dupCount} duplicados</span>})</div><button style={S.btnO} onClick={()=>{setShowImport(false);setImportItems([]);}}>✕ Cancelar</button></div>
      <div style={{fontSize:11,color:P.textDim,marginBottom:12}}>Itens duplicados (mesma data, descrição e valor) ficam destacados em vermelho e não serão importados. Clique no ✕ da coluna "Dup" para forçar a inclusão.</div>
      <div style={{maxHeight:"50vh",overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr><th style={S.th}>Data</th><th style={S.th}>Descrição</th><th style={S.th}>Categoria</th><th style={S.th}>Valor</th><th style={S.th}>Fixo</th><th style={S.th}>Dup</th></tr></thead>
        <tbody>{importItems.map((item,idx)=>(<tr key={item.id} style={{background:item.isDup?"rgba(239,68,68,0.08)":"transparent",opacity:item.isDup?0.5:1}}>
          <td style={S.td}>{fD(item.data)}</td>
          <td style={{...S.td,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{item.descricao}</td>
          <td style={S.td}><select style={{...S.sel,fontSize:11,padding:"4px 6px"}} value={item.categoria} onChange={e=>{const n=[...importItems];n[idx]={...n[idx],categoria:e.target.value,fixo:AUTO_FIXO.includes(e.target.value)};setImportItems(n);}}>{ORC_C.map(c=><option key={c} value={c}>{catEmoji(c)} {c}</option>)}</select></td>
          <td style={{...S.td,fontWeight:600,color:P.red}}>{fmt(item.valor)}</td>
          <td style={S.td}><input type="checkbox" checked={!!item.fixo} onChange={e=>{const n=[...importItems];n[idx]={...n[idx],fixo:e.target.checked};setImportItems(n);}}/></td>
          <td style={S.td}>{item.isDup?<button style={{background:"transparent",border:"none",color:P.red,cursor:"pointer",fontSize:10,fontFamily:"inherit"}} onClick={()=>{const n=[...importItems];n[idx]={...n[idx],isDup:false};setImportItems(n);}}>⚠ Dup</button>:"—"}</td>
        </tr>))}</tbody>
      </table></div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:16}}><button style={S.btnO} onClick={()=>{setShowImport(false);setImportItems([]);}}>Cancelar</button><button style={S.btn()} onClick={confirmImport}>Importar {importItems.filter(i=>!i.isDup).length} itens</button></div>
    </div></div>)}

    {(()=>{
      const f=orcFrescor(data);if(!f)return null;
      if(!f.ok){return(<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:8,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>⚠️</span><div><div style={{fontSize:12,fontWeight:700,color:"#dc2626"}}>Gastos desatualizados</div><div style={{fontSize:11,color:"#dc2626",opacity:0.8}}>Nenhum gasto nos últimos 15 dias. Atualize via <b>📎 Fatura Cartão</b> ou <b>🏦 Extrato Banco</b>.</div></div></div>);}
      return(<div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.35)",borderRadius:8,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>✅</span><div><div style={{fontSize:12,fontWeight:700,color:"#16a34a"}}>Gastos atualizados</div><div style={{fontSize:11,color:"#16a34a",opacity:0.8}}>Último lançamento há {f.dias===0?"hoje":f.dias===1?"1 dia":`${f.dias} dias`} ({fD(f.last)}).</div></div></div>);
    })()}
    {sub==="relatorio"?(<div>
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:14,fontWeight:700}}>Relatório Comparativo</div><div style={{display:"flex",gap:8}}><button style={S.btnO} onClick={()=>{setRepCats([]);setRepMonths([]);}}>Limpar Tudo</button><button style={S.btnO} onClick={()=>setRepMonths([...allMonths])}>Selecionar Todo Período</button></div></div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:600,color:P.textDim,marginBottom:8}}>Categorias:</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{allCats.map(c=>(<label key={c} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,cursor:"pointer",padding:"4px 8px",background:repCats.includes(c)?P.accentGlow:P.surfaceAlt,border:`1px solid ${repCats.includes(c)?P.accent:P.border}`,borderRadius:6}}><input type="checkbox" checked={repCats.includes(c)} onChange={e=>{if(e.target.checked)setRepCats([...repCats,c]);else setRepCats(repCats.filter(x=>x!==c));}}/>{c}</label>))}</div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:600,color:P.textDim,marginBottom:8}}>Meses:</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{allMonths.map(m=>(<label key={m} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,cursor:"pointer",padding:"4px 8px",background:repMonths.includes(m)?P.accentGlow:P.surfaceAlt,border:`1px solid ${repMonths.includes(m)?P.accent:P.border}`,borderRadius:6}}><input type="checkbox" checked={repMonths.includes(m)} onChange={e=>{if(e.target.checked)setRepMonths([...repMonths,m]);else setRepMonths(repMonths.filter(x=>x!==m));}}/>{mL(m)}</label>))}</div>
        </div>
      </div>
      {repCats.length>0&&repMonths.length>0&&(()=>{
        const sortedM=[...repMonths].sort();
        const chartData=repCats.map((cat,ci)=>({cat,values:sortedM.map(m=>data.filter(i=>i.tipo!=="Receita"&&(i.categoria||"Outros")===cat&&i.data&&i.data.startsWith(m)).reduce((a,i)=>a+(Number(i.valor)||0),0))}));
        const allVals=chartData.flatMap(d=>d.values);const maxV=Math.max(...allVals,1);
        const W=Math.max(600,sortedM.length*120),H=300,pad={t:30,r:20,b:40,l:70};
        const cW=W-pad.l-pad.r,cH=H-pad.t-pad.b;
        const xStep=sortedM.length>1?cW/(sortedM.length-1):cW;
        return(<div>
          <div style={{...S.card,padding:24,marginBottom:16,overflowX:"auto",position:"relative"}}>
            <div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Evolução das Despesas</div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} onMouseLeave={()=>setHoverPt(null)}>
              {[0,0.25,0.5,0.75,1].map(p=>(<g key={p}><line x1={pad.l} y1={pad.t+cH*(1-p)} x2={W-pad.r} y2={pad.t+cH*(1-p)} stroke={P.border} strokeWidth="1"/><text x={pad.l-8} y={pad.t+cH*(1-p)+4} textAnchor="end" fontSize="9" fill={P.textMuted}>{fmt(maxV*p)}</text></g>))}
              {sortedM.map((m,i)=>(<text key={m} x={pad.l+i*xStep} y={H-10} textAnchor="middle" fontSize="9" fill={P.textMuted}>{mL(m)}</text>))}
              {/* Vertical hover line */}
              {hoverPt&&<line x1={pad.l+hoverPt.mi*xStep} y1={pad.t} x2={pad.l+hoverPt.mi*xStep} y2={pad.t+cH} stroke={P.textMuted} strokeWidth="1" strokeDasharray="4,4" opacity="0.5"/>}
              {/* Lines */}
              {chartData.map((cd,ci)=>{const pts=cd.values.map((v,i)=>`${pad.l+i*xStep},${pad.t+cH*(1-v/maxV)}`).join(" ");return(<g key={cd.cat}><polyline points={pts} fill="none" stroke={PC[ci%PC.length]} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>{cd.values.map((v,i)=>{const isHov=hoverPt&&hoverPt.ci===ci&&hoverPt.mi===i;const cx=pad.l+i*xStep,cy=pad.t+cH*(1-v/maxV);return(<g key={i}><circle cx={cx} cy={cy} r={isHov?8:5} fill={PC[ci%PC.length]} stroke={P.bg} strokeWidth="2" style={{cursor:"pointer",transition:"r 0.15s"}} onMouseEnter={()=>setHoverPt({ci,mi:i,cat:cd.cat,val:v})}/>{isHov&&<><rect x={cx-45} y={cy-28} width={90} height={20} rx={4} fill={P.surface} stroke={PC[ci%PC.length]} strokeWidth="1"/><text x={cx} y={cy-14} textAnchor="middle" fontSize="11" fontWeight="700" fill={PC[ci%PC.length]}>{fmt(v)}</text></>}</g>);})}</g>);})}
            </svg>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:12}}>{chartData.map((cd,ci)=>(<div key={cd.cat} style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:12,height:3,borderRadius:2,background:PC[ci%PC.length]}}/><span style={{color:P.textDim}}>{cd.cat}</span></div>))}</div>
          </div>
          <div style={{...S.card,padding:0,overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr><th style={S.th}>Categoria</th>{sortedM.map(m=><th key={m} style={S.th}>{mL(m)}</th>)}</tr></thead>
              <tbody>{repCats.map(cat=>(<tr key={cat}><td style={{...S.td,fontWeight:700}}><span style={{marginRight:5}}>{catEmoji(cat)}</span>{cat}</td>{sortedM.map(m=>{const v=data.filter(i=>i.tipo!=="Receita"&&(i.categoria||"Outros")===cat&&i.data&&i.data.startsWith(m)).reduce((a,i)=>a+(Number(i.valor)||0),0);return(<td key={m} style={{...S.td,color:v>0?P.red:P.textMuted}}>{v>0?fmt(v):"—"}</td>);})}</tr>))}</tbody>
            </table>
          </div>
        </div>);
      })()}
    </div>):(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:24}}><SC label="Receitas" value={fmt(rec)} color={P.accent} dim={P.accentGlow}/><SC label="Despesas" value={fmt(desp)} color={P.red} dim={P.redDim}/><SC label="Saldo" value={fmt(sal)} color={sal>=0?P.accent:P.red} dim={sal>=0?P.accentGlow:P.redDim}/><SC label="Gastos Fixos" value={fmt(despFixo)} color={P.blue} dim={P.blueDim}/><SC label="Gastos Eventuais" value={fmt(despVar)} color={P.orange} dim={P.orangeDim}/></div>
    {(rec>0||desp>0)&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20}}>
      {(rec>0||desp>0)&&(<div style={{...S.card,padding:20}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>Receita vs Despesa</div>
        {(()=>{
          const pctDesp=rec>0?Math.round((desp/rec)*100):100;const over=pctDesp>100;
          const arc=Math.min(pctDesp,100)*3.01;
          return(<div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{position:"relative",width:110,height:110,flexShrink:0}}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="44" fill="none" stroke={P.surfaceAlt} strokeWidth="13"/>
                <circle cx="55" cy="55" r="44" fill="none" stroke={over?P.red:P.accent} strokeWidth="13" strokeDasharray={`${over?132:arc} 999`} strokeLinecap="round" transform="rotate(-90 55 55)"/>
                {over&&<circle cx="55" cy="55" r="44" fill="none" stroke={P.red} strokeWidth="13" strokeDasharray={`132 999`} opacity="0.3" transform="rotate(-90 55 55)"/>}
              </svg>
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                <div style={{fontSize:over?14:20,fontWeight:700,color:over?P.red:P.accent,lineHeight:1}}>{pctDesp}%</div>
                <div style={{fontSize:7,color:P.textMuted}}>gasto</div>
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{marginBottom:8}}>
                <div style={{fontSize:10,color:P.textMuted}}>Receitas</div>
                <div style={{fontSize:14,fontWeight:700,color:P.accent}}>{fmt(rec)}</div>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{fontSize:10,color:P.textMuted}}>Despesas</div>
                <div style={{fontSize:14,fontWeight:700,color:over?P.red:P.text}}>{fmt(desp)}</div>
              </div>
              {over?(<div style={{background:P.redDim,border:`1px solid ${P.red}44`,borderRadius:6,padding:"6px 8px"}}>
                <div style={{fontSize:10,fontWeight:700,color:P.red}}>⚠ Gasto {pctDesp-100}% acima</div>
                <div style={{fontSize:11,fontWeight:700,color:P.red}}>{fmt(desp-rec)} a mais</div>
              </div>):(<div><div style={{fontSize:10,color:P.textMuted}}>Saldo</div><div style={{fontSize:14,fontWeight:700,color:P.accent}}>{fmt(rec-desp)}</div></div>)}
            </div>
          </div>);
        })()}
      </div>)}
      {desp>0&&<div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Por Categoria</div><Pie data={pieData}/><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:14}}>{pieData.map(d=>(<button key={d.label} onClick={()=>setPieFilter(pieFilter===d.label?null:d.label)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:pieFilter===d.label?`2px solid ${d.color}`:`1px solid ${P.border}`,background:pieFilter===d.label?d.color+"18":P.surfaceAlt,cursor:"pointer",fontSize:10,fontWeight:pieFilter===d.label?700:400,color:P.text,fontFamily:"inherit"}}><div style={{width:8,height:8,borderRadius:"50%",background:d.color}}/>{d.label} ({fmt(d.value)})</button>))}</div></div>}
      {desp>0&&<div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Fixos vs Eventuais</div><Pie data={pieFixVar} size={200}/></div>}
    </div>)}
    {pieFilter&&(<div style={{...S.card,marginBottom:0}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:12,fontWeight:700}}>{catEmoji(pieFilter)} Detalhamento: {pieFilter}</div><button style={{background:"transparent",border:"none",color:P.textMuted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}} onClick={()=>setPieFilter(null)}>✕ Fechar</button></div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={S.th}>Data</th><th style={S.th}>Descrição</th><th style={S.th}>Valor</th></tr></thead><tbody>{data.filter(i=>i.data&&i.data.startsWith(mF)&&i.tipo!=="Receita"&&(i.categoria||"Outros")===pieFilter).sort((a,b)=>(a.data||"").localeCompare(b.data||"")||(a.descricao||"").localeCompare(b.descricao||"")).map(i=>(<tr key={i.id}><td style={S.td}>{fD(i.data)}</td><td style={S.td}>{i.descricao||"—"}</td><td style={{...S.td,fontWeight:600,color:P.red}}>{fmt(i.valor)}</td></tr>))}</tbody><tfoot><tr><td style={{...S.td,fontWeight:700,borderBottom:"none"}} colSpan={2}>TOTAL</td><td style={{...S.td,fontWeight:700,color:P.red,borderBottom:"none"}}>{fmt(data.filter(i=>i.data&&i.data.startsWith(mF)&&i.tipo!=="Receita"&&(i.categoria||"Outros")===pieFilter).reduce((a,i)=>a+(Number(i.valor)||0),0))}</td></tr></tfoot></table></div></div>)}
    {sF.length>0&&(<div style={{...S.card,padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr><STH label="Data" field="data" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Tipo" field="tipo" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Categoria" field="categoria" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Descrição" field="descricao" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Valor" field="valor" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Fixo" field="fixo" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><th style={S.th}></th></tr></thead><tbody>{sF.map(i=>(<TR key={i.id} onClick={()=>setModal(i)}><td style={S.td}>{fD(i.data)}</td><td style={S.td}><span style={S.tag(i.tipo==="Receita"?P.accent:P.red,i.tipo==="Receita"?P.accentGlow:P.redDim)}>{i.tipo||"Despesa"}</span></td><td style={S.td}><span style={{marginRight:5}}>{catEmoji(i.categoria||"Outros")}</span>{i.categoria||"—"}</td><td style={S.td}>{i.descricao||"—"}</td><td style={{...S.td,fontWeight:600,color:i.tipo==="Receita"?P.accent:P.red}}>{fmt(i.valor)}</td><td style={S.td}>{i.fixo?<span style={S.tag(P.blue,P.blueDim)}>Fixo</span>:"—"}</td><td style={S.td}><button style={{background:"transparent",border:"none",color:P.textMuted,cursor:"pointer",fontSize:16,fontFamily:"inherit"}} onClick={e=>{e.stopPropagation();setDel(i.id);}}>✕</button></td></TR>))}</tbody></table></div>)}
    <SaldoEvoChart data={data} P={P} S={S}/>
    </div>)}
    {modal&&<Mdl title={modal==="new"?"Novo":"Editar"} fields={ORC_F} initial={modal==="new"?{data:mF+"-01",tipo:"Despesa"}:modal} onSave={doSave} onCancel={()=>setModal(null)}/>}
    {del&&<Cfm msg="Excluir?" onOk={()=>{setData(prev=>prev.filter(x=>x.id!==del));setDel(null);}} onNo={()=>setDel(null)}/>}
  </div>);
}

/* CONFIG */
function CfgTab({banks,setBanks,isDark,setIsDark,allState,loadState,font,setFont}){const P=useT();const S=useS();const[nb,setNb]=useState("");
  const[gStatus,setGStatus]=useState("");
  const GCID="291041168789-qg2dvfq45le70kk9coiosktur1a5au7o.apps.googleusercontent.com";
  const GSCOPE="https://www.googleapis.com/auth/drive.file";
  
  const doExp=()=>{const b=new Blob([JSON.stringify(allState(),null,2)],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;const d=new Date();const dd=String(d.getDate()).padStart(2,"0"),mm=String(d.getMonth()+1).padStart(2,"0"),aa=d.getFullYear();a.download=`backup_contas_${dd}${mm}${aa}.json`;a.click();};
  const doImp=()=>{const inp=document.createElement("input");inp.type="file";inp.accept=".json";inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{loadState(JSON.parse(ev.target.result));alert("Importado!");}catch{alert("Erro.");}};r.readAsText(f);};inp.click();};
  
  // Google Drive OAuth2 implicit flow + upload
  const doGDrive=()=>{
    setGStatus("Abrindo autenticação Google...");
    const redirectUri=window.location.origin+window.location.pathname;
    const authUrl=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${GCID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(GSCOPE)}&prompt=consent`;
    
    // Save state to restore after redirect
    sessionStorage.setItem("ip8-gdrive-pending","true");
    sessionStorage.setItem("ip8-gdrive-data",JSON.stringify(allState()));
    window.location.href=authUrl;
  };
  
  // Check if returning from OAuth redirect
  useEffect(()=>{
    const hash=window.location.hash;
    if(hash&&hash.includes("access_token")&&sessionStorage.getItem("ip8-gdrive-pending")){
      const params=new URLSearchParams(hash.substring(1));
      const token=params.get("access_token");
      if(token){
        sessionStorage.removeItem("ip8-gdrive-pending");
        const dataStr=sessionStorage.getItem("ip8-gdrive-data")||JSON.stringify(allState());
        sessionStorage.removeItem("ip8-gdrive-data");
        // Clear hash
        window.history.replaceState(null,"",window.location.pathname);
        // Upload to Google Drive
        setGStatus("Enviando para o Google Drive...");
        const fileName=`investpro-${new Date().toISOString().slice(0,10)}.json`;
        const metadata={name:fileName,mimeType:"application/json"};
        const form=new FormData();
        form.append("metadata",new Blob([JSON.stringify(metadata)],{type:"application/json"}));
        form.append("file",new Blob([dataStr],{type:"application/json"}));
        fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",{
          method:"POST",headers:{Authorization:`Bearer ${token}`},body:form
        }).then(r=>{if(r.ok){setGStatus("✓ Salvo no Google Drive!");setTimeout(()=>setGStatus(""),5000);}else{r.text().then(t=>setGStatus("Erro: "+t));}}).catch(e=>setGStatus("Erro: "+e.message));
      }
    }
  },[]);
  return(<div><div style={{fontSize:22,fontWeight:700,marginBottom:28}}>Configurações</div>
    <div style={S.card}><div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Aparência</div><div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}><button style={isDark==="dark"||isDark===true?S.btn():S.btnO} onClick={()=>setIsDark("dark")}>🌙 Noturno</button><button style={isDark==="light"||isDark===false?S.btn():S.btnO} onClick={()=>setIsDark("light")}>☀️ Diurno</button><button style={isDark==="industrial"?S.btn():S.btnO} onClick={()=>setIsDark("industrial")}>🏭 Industrial</button><button style={isDark==="industrial-light"?S.btn():S.btnO} onClick={()=>setIsDark("industrial-light")}>🏛 Industrial Claro</button><button style={isDark==="planner"?S.btn():S.btnO} onClick={()=>setIsDark("planner")}>📊 Planner</button></div><div style={{fontSize:12,fontWeight:600,color:P.textDim,marginBottom:8}}>Fonte</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[{id:"mono",l:"JetBrains Mono"},{id:"roboto",l:"Roboto"},{id:"poppins",l:"Poppins"},{id:"montserrat",l:"Montserrat"}].map(f=>(<button key={f.id} style={font===f.id?S.btn():S.btnO} onClick={()=>setFont(f.id)}><span style={{fontFamily:f.id==="mono"?"'JetBrains Mono',monospace":f.l}}>{f.l}</span></button>))}</div></div>
    <div style={S.card}><div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Bancos de Custódia</div><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>{banks.map(b=>(<div key={b} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:6,padding:"6px 12px",fontSize:12,fontWeight:600}}>{b}</div>))}</div><div style={{display:"flex",gap:8}}><input style={{...S.i,maxWidth:250}} value={nb} onChange={e=>setNb(e.target.value)} placeholder="Novo banco" onKeyDown={e=>{if(e.key==="Enter"&&nb.trim()&&!banks.includes(nb.trim().toUpperCase())){setBanks([...banks,nb.trim().toUpperCase()]);setNb("");}}} /><button style={S.btn()} onClick={()=>{if(nb.trim()&&!banks.includes(nb.trim().toUpperCase())){setBanks([...banks,nb.trim().toUpperCase()]);setNb("");}}}>Adicionar</button></div></div>
    <div style={S.card}><div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Backup</div>
      <div style={{display:"flex",gap:12,marginBottom:12}}><button style={S.btn(P.blue)} onClick={doExp}>⬇ Exportar Local</button><button style={S.btnO} onClick={doImp}>⬆ Importar Local</button></div>
      <div style={{borderTop:`1px solid ${P.border}`,paddingTop:12}}>
        <div style={{fontSize:12,fontWeight:600,color:P.textDim,marginBottom:8}}>Google Drive</div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}><button style={S.btn(P.accent)} onClick={doGDrive}>☁ Salvar no Google Drive</button>{gStatus&&<span style={{fontSize:11,color:gStatus.startsWith("✓")?P.accent:gStatus.startsWith("Erro")?P.red:P.textDim}}>{gStatus}</span>}</div>
        <div style={{fontSize:10,color:P.textMuted,marginTop:8}}>Ao clicar, você será redirecionado para autenticar com sua conta Google. O arquivo JSON será salvo no seu Drive.</div>
      </div>
    </div>
  </div>);
}

/* ═══ EVOLUÇÃO DA CARTEIRA ═══ */
const EVO_F=[{key:"data",label:"Data",type:"date"},{key:"patrimonio",label:"Patrimônio (R$)",type:"number",step:"0.01"},{key:"yeld",label:"Yield (%)",type:"number",step:"0.01"},{key:"retornoMes",label:"Retorno Mês (R$)",type:"number",step:"0.01"}];
function EvoTab({data,setData}){const P=useT();const S=useS();
  const sorted=[...data].sort((a,b)=>(a.data||"").localeCompare(b.data||""));
  const sortedDesc=[...data].sort((a,b)=>(b.data||"").localeCompare(a.data||""));
  const[modal,setModal]=useState(null);const[del,setDel]=useState(null);
  const doSave=item=>{const out={...item,id:item.id||uid()};setData(p=>{const i=p.findIndex(x=>x.id===out.id);if(i>=0){const n=[...p];n[i]=out;return n;}return[...p,out];});setModal(null);};
  
  // Line chart: dual axis — patrimônio (left) + yield (right)
  const W=700,H=280,pad={t:30,r:60,b:40,l:80};
  const cW=W-pad.l-pad.r,cH=H-pad.t-pad.b;
  const maxP=sorted.reduce((a,i)=>Math.max(a,Number(i.patrimonio)||0),1);
  const maxY=sorted.reduce((a,i)=>Math.max(a,Number(i.yeld)||0),0.1);
  const xStep=sorted.length>1?cW/(sorted.length-1):cW;
  
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}><div style={{fontSize:22,fontWeight:700}}>Evolução da Carteira</div><button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button></div>
    {sorted.length>1&&(<div style={{...S.card,padding:24,overflowX:"auto"}}>
      <div style={{display:"flex",gap:20,marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}><div style={{width:14,height:3,borderRadius:2,background:P.accent}}/><span style={{color:P.textDim}}>Patrimônio (R$)</span></div><div style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}><div style={{width:14,height:3,borderRadius:2,background:P.cyan}}/><span style={{color:P.textDim}}>Yield (%)</span></div></div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {[0,0.25,0.5,0.75,1].map(p=>(<g key={p}><line x1={pad.l} y1={pad.t+cH*(1-p)} x2={W-pad.r} y2={pad.t+cH*(1-p)} stroke={P.border} strokeWidth="1"/><text x={pad.l-8} y={pad.t+cH*(1-p)+4} textAnchor="end" fontSize="9" fill={P.textMuted}>{fmt(maxP*p)}</text><text x={W-pad.r+8} y={pad.t+cH*(1-p)+4} textAnchor="start" fontSize="9" fill={P.cyan}>{(maxY*p).toFixed(2)}%</text></g>))}
        {sorted.map((item,i)=>(<text key={i} x={pad.l+i*xStep} y={H-8} textAnchor="middle" fontSize="9" fill={P.textMuted}>{fD(item.data)}</text>))}
        {/* Patrimônio line */}
        <polyline points={sorted.map((item,i)=>`${pad.l+i*xStep},${pad.t+cH*(1-(Number(item.patrimonio)||0)/maxP)}`).join(" ")} fill="none" stroke={P.accent} strokeWidth="2.5" strokeLinejoin="round"/>
        {sorted.map((item,i)=>(<circle key={`p${i}`} cx={pad.l+i*xStep} cy={pad.t+cH*(1-(Number(item.patrimonio)||0)/maxP)} r="4" fill={P.accent} stroke={P.bg} strokeWidth="2"><title>Patrimônio: {fmt(item.patrimonio)}</title></circle>))}
        {/* Yield line */}
        <polyline points={sorted.map((item,i)=>`${pad.l+i*xStep},${pad.t+cH*(1-(Number(item.yeld)||0)/maxY)}`).join(" ")} fill="none" stroke={P.cyan} strokeWidth="2" strokeDasharray="6,3" strokeLinejoin="round"/>
        {sorted.map((item,i)=>(<circle key={`y${i}`} cx={pad.l+i*xStep} cy={pad.t+cH*(1-(Number(item.yeld)||0)/maxY)} r="3.5" fill={P.cyan} stroke={P.bg} strokeWidth="2"><title>Yield: {item.yeld}%</title></circle>))}
      </svg>
    </div>)}
    {sortedDesc.length>0&&(<div style={{...S.card,padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead><tr><th style={S.th}>Data</th><th style={S.th}>Patrimônio</th><th style={S.th}>Yield</th><th style={S.th}>Retorno Mês</th><th style={S.th}></th></tr></thead>
      <tbody>{sortedDesc.map(i=>(<TR key={i.id} onClick={()=>setModal(i)}><td style={S.td}>{fD(i.data)}</td><td style={{...S.td,fontWeight:700}}>{fmt(i.patrimonio)}</td><td style={{...S.td,color:P.cyan}}>{i.yeld?`${i.yeld}%`:"—"}</td><td style={{...S.td,color:P.accent}}>{fmt(i.retornoMes)}</td><td style={S.td}><button style={{background:"transparent",border:"none",color:P.textMuted,cursor:"pointer",fontSize:16,fontFamily:"inherit"}} onClick={e=>{e.stopPropagation();setDel(i.id);}}>✕</button></td></TR>))}</tbody>
    </table></div>)}
    {sorted.length===0&&<div style={{textAlign:"center",padding:60,color:P.textMuted}}>Adicione registros da evolução</div>}
    {modal&&<Mdl title={modal==="new"?"Novo":"Editar"} fields={EVO_F} initial={modal==="new"?{}:modal} onSave={doSave} onCancel={()=>setModal(null)}/>}
    {del&&<Cfm msg="Excluir?" onOk={()=>{setData(p=>p.filter(x=>x.id!==del));setDel(null);}} onNo={()=>setDel(null)}/>}
  </div>);
}

/* RF MÉDIA POR INDEXADOR */
function RFMediaPanel({data}){const P=useT();const S=useS();
  const exempt=data.filter(i=>!temIR(i.tipo));
  const byIdx={};exempt.forEach(i=>{const ix=i.indexador||"Outro";const t=Number(i.taxa)||0;if(t<=0)return;
    // Calculate effective annual rate for this title
    const c=calcRF(i);const efetiva=Number(c.taxaNom)||0;
    if(!byIdx[ix])byIdx[ix]={sumTaxa:0,sumEfetiva:0,count:0};
    byIdx[ix].sumTaxa+=t;byIdx[ix].sumEfetiva+=efetiva;byIdx[ix].count++;
  });
  const medias=Object.entries(byIdx).map(([ix,v])=>({indexador:ix,media:(v.sumTaxa/v.count).toFixed(2),efetiva:(v.sumEfetiva/v.count).toFixed(2),count:v.count}));
  if(!medias.length)return null;
  return(<div style={{...S.card,marginBottom:20}}>
    <div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>Média por Indexador (títulos isentos de IR)</div>
    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>{medias.map(m=>{
      const label=m.indexador==="CDI"||m.indexador==="Selic"?`${m.media}% CDI`:m.indexador==="IPCA"?`IPCA+${m.media}%`:m.indexador==="Pré"?`${m.media}% a.a.`:`${m.indexador}+${m.media}%`;
      return(<div key={m.indexador} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:8,padding:"14px 20px",minWidth:180}}>
        <div style={{fontSize:11,color:P.textMuted,marginBottom:4}}>{m.indexador} ({m.count} títulos)</div>
        <div style={{fontSize:18,fontWeight:700,color:P.accent}}>{label}</div>
        <div style={{fontSize:12,color:P.cyan,marginTop:4}}>Taxa líquida: {m.efetiva}% a.a.</div>
        <div style={{fontSize:11,color:P.textMuted}}>≈ {(Number(m.efetiva)/12).toFixed(2)}% a.m.</div>
      </div>);
    })}</div>
  </div>);
}

/* CRYPTO QUOTES — AwesomeAPI for BTC, ETH, DOGE; BCB USD for SHIB */

/* 3. BENCHMARK COMPARISON (used in Dashboard) */
function LiquidezPanel({rf,inco,P,S}){
  const[dataAlvo,setDataAlvo]=useState(()=>{const d=new Date();d.setMonth(d.getMonth()+12);return d.toISOString().slice(0,10);});
  const hoje=new Date();hoje.setHours(0,0,0,0);
  const alvo=new Date(dataAlvo+"T00:00:00");
  const diasAte=Math.max(0,Math.floor((alvo-hoje)/864e5));
  // RF vencendo até a data alvo
  const rfLiq=rf.filter(i=>i.dataVencimento&&new Date(i.dataVencimento+"T00:00:00")<=alvo);
  const rfJaVenc=rf.filter(i=>i.dataVencimento&&new Date(i.dataVencimento+"T00:00:00")<hoje);
  const rfNoAlvo=rf.filter(i=>i.dataVencimento&&new Date(i.dataVencimento+"T00:00:00")>=hoje&&new Date(i.dataVencimento+"T00:00:00")<=alvo);
  // INCO vencendo até a data alvo
  const incoLiq=inco.filter(i=>i.dataVencimento&&new Date(i.dataVencimento+"T00:00:00")<=alvo);
  const incoJaVenc=inco.filter(i=>i.dataVencimento&&new Date(i.dataVencimento+"T00:00:00")<hoje);
  const incoNoAlvo=inco.filter(i=>i.dataVencimento&&new Date(i.dataVencimento+"T00:00:00")>=hoje&&new Date(i.dataVencimento+"T00:00:00")<=alvo);
  const totalRF=rfNoAlvo.reduce((a,i)=>a+(Number(i.valor)||0),0);
  const totalRFVenc=rfJaVenc.reduce((a,i)=>a+(Number(i.valor)||0),0);
  const totalInco=incoNoAlvo.reduce((a,i)=>a+(Number(i.valor)||0),0);
  const totalIncoVenc=incoJaVenc.reduce((a,i)=>a+(Number(i.valor)||0),0);
  const totalLiquidez=totalRFVenc+totalRF+totalIncoVenc+totalInco;
  const totalLiquidezFutura=totalRF+totalInco;
  const[showDetail,setShowDetail]=useState(false);
  const allVenc=[...rfNoAlvo.map(i=>({...i,tipo:"RF"})),...incoNoAlvo.map(i=>({...i,tipo:"INCO"}))].sort((a,b)=>(a.dataVencimento||"").localeCompare(b.dataVencimento||""));
  return(<div style={S.card}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
      <div><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim}}>💧 Liquidez até</div></div>
      <input style={{...S.i,width:"auto",minWidth:160}} type="date" value={dataAlvo} min={hoje.toISOString().slice(0,10)} onChange={e=>setDataAlvo(e.target.value)}/>
    </div>
    <div style={{fontSize:11,color:P.textMuted,marginBottom:16}}>{diasAte} dias · {alvo.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}</div>
    {/* Total cards */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
      <div style={{background:P.surfaceAlt,borderRadius:10,padding:"14px 16px",border:`1px solid ${P.border}`}}>
        <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Vence no período</div>
        <div style={{fontSize:22,fontWeight:700,color:P.accent}}>{fmt(totalLiquidezFutura)}</div>
        <div style={{fontSize:11,color:P.textDim,marginTop:2}}>{rfNoAlvo.length+incoNoAlvo.length} título{rfNoAlvo.length+incoNoAlvo.length!==1?"s":""}</div>
      </div>
      <div style={{background:P.surfaceAlt,borderRadius:10,padding:"14px 16px",border:`1px solid ${P.border}`}}>
        <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Liquidez total disponível</div>
        <div style={{fontSize:22,fontWeight:700,color:P.cyan}}>{fmt(totalLiquidez)}</div>
        <div style={{fontSize:11,color:P.textDim,marginTop:2}}>incluindo já vencidos</div>
      </div>
    </div>
    {/* Breakdown */}
    {(totalRF>0||totalInco>0)&&(<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
      {totalRF>0&&<div style={{flex:1,minWidth:100,background:P.blueDim,border:`1px solid ${P.blue}44`,borderRadius:8,padding:"10px 14px"}}>
        <div style={{fontSize:10,color:P.textMuted}}>Renda Fixa</div>
        <div style={{fontSize:16,fontWeight:700,color:P.blue}}>{fmt(totalRF)}</div>
        <div style={{fontSize:10,color:P.textDim}}>{rfNoAlvo.length} título{rfNoAlvo.length!==1?"s":""}</div>
      </div>}
      {totalInco>0&&<div style={{flex:1,minWidth:100,background:P.cyanDim,border:`1px solid ${P.cyan}44`,borderRadius:8,padding:"10px 14px"}}>
        <div style={{fontSize:10,color:P.textMuted}}>INCO</div>
        <div style={{fontSize:16,fontWeight:700,color:P.cyan}}>{fmt(totalInco)}</div>
        <div style={{fontSize:10,color:P.textDim}}>{incoNoAlvo.length} título{incoNoAlvo.length!==1?"s":""}</div>
      </div>}
    </div>)}
    {/* Detail toggle */}
    {allVenc.length>0&&(<>
      <button style={{...S.btnO,width:"100%",marginBottom:showDetail?12:0}} onClick={()=>setShowDetail(p=>!p)}>
        {showDetail?"▲ Ocultar títulos":"▼ Ver "+allVenc.length+" título"+(allVenc.length!==1?"s":"")+" em detalhe"}
      </button>
      {showDetail&&(<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead><tr><th style={S.th}>Tipo</th><th style={S.th}>Título</th><th style={S.th}>Vencimento</th><th style={S.th}>Dias</th><th style={S.th}>Valor</th></tr></thead>
        <tbody>{allVenc.map((i,idx)=>{
          const dv=new Date(i.dataVencimento+"T00:00:00");const dias=Math.floor((dv-hoje)/864e5);
          return(<tr key={idx}><td style={S.td}><span style={S.tag(i.tipo==="RF"?P.blue:P.cyan,i.tipo==="RF"?P.blueDim:P.cyanDim)}>{i.tipo}</span></td>
            <td style={S.td}>{i.tipo==="RF"?(i.tipo_original||i.tipo):(i.empreendimento||"INCO")}</td>
            <td style={S.td}>{fD(i.dataVencimento)}</td>
            <td style={{...S.td,color:dias<=30?P.orange:P.textDim}}>{dias}d</td>
            <td style={{...S.td,fontWeight:600,color:P.accent}}>{fmt(i.valor)}</td>
          </tr>);
        })}</tbody>
        <tfoot><tr><td colSpan={4} style={{...S.td,fontWeight:700,borderBottom:"none"}}>TOTAL</td><td style={{...S.td,fontWeight:700,color:P.accent,borderBottom:"none"}}>{fmt(totalLiquidezFutura)}</td></tr></tfoot>
      </table></div>)}
    </>)}
    {totalLiquidezFutura===0&&<div style={{textAlign:"center",padding:16,color:P.textMuted,fontSize:12}}>Nenhum título vence até {alvo.toLocaleDateString("pt-BR")}.</div>}
  </div>);
}

function BenchmarkPanel({tG,retPctAnual,P,S}){
  const cdi=RATES.cdi12m,ipca=RATES.ipca12m,ipca6=((1+ipca/100)*(1+6/100)-1)*100,dolar=5.0;
  const benchmarks=[
    {l:"CDI",val:cdi,c:P.blue},{l:"IPCA",val:ipca,c:P.yellow},{l:"IPCA+6%",val:ipca6,c:P.orange},{l:"Dólar",val:dolar,c:P.accent}
  ];
  return(<div style={{...S.card,marginBottom:20}}>
    <div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>Rentabilidade vs Benchmarks (anual)</div>
    <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{benchmarks.map(b=>{
      const diff=retPctAnual-b.val;const win=diff>=0;
      return(<div key={b.l} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:8,padding:"12px 18px",minWidth:140}}>
        <div style={{fontSize:11,color:P.textMuted,marginBottom:4}}>{b.l}: {b.val.toFixed(2)}% a.a.</div>
        <div style={{fontSize:11,color:P.textMuted,marginBottom:2}}>Sua carteira: {retPctAnual.toFixed(2)}% a.a.</div>
        <div style={{fontSize:16,fontWeight:700,color:win?P.accent:P.red}}>{win?`+${diff.toFixed(2)}%`:`${diff.toFixed(2)}%`}</div>
        <div style={{fontSize:10,color:win?P.accent:P.red}}>{win?"Acima":"Abaixo"} do {b.l}</div>
      </div>);
    })}</div>
  </div>);
}

/* 6. FGC ALERT (used in RFTab) */
function FGCAlert({data,P,S}){
  const byEmissor={};data.forEach(i=>{const e=(i.emissor||"Sem emissor").toUpperCase();byEmissor[e]=(byEmissor[e]||0)+(Number(i.valor)||0);});
  const alertas=Object.entries(byEmissor).filter(([,v])=>v>=250000).sort((a,b)=>b[1]-a[1]);
  if(!alertas.length)return null;
  return(<div style={{...S.card,marginBottom:20,border:`2px solid ${P.red}44`,background:`${P.redDim}`}}>
    <div style={{fontSize:13,fontWeight:700,color:P.red,marginBottom:12}}>⚠ Alerta FGC — Concentração acima de R$ 250.000</div>
    <div style={{fontSize:11,color:P.textDim,marginBottom:14}}>O FGC garante até R$ 250.000 por CPF por instituição financeira.</div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{alertas.map(([emissor,valor])=>(<div key={emissor} style={{background:P.surface,border:`1px solid ${P.red}44`,borderRadius:8,padding:"10px 16px"}}>
      <div style={{fontSize:12,fontWeight:700,color:P.red}}>{emissor}</div>
      <div style={{fontSize:16,fontWeight:700,color:P.text}}>{fmt(valor)}</div>
      <div style={{fontSize:10,color:P.red}}>Excede em {fmt(valor-250000)}</div>
    </div>))}</div>
  </div>);
}

/* 12. SALDO EVOLUTION CHART (used in OrcTab) */
function SaldoEvoChart({data,P,S}){
  const[hov,setHov]=useState(null);
  const allM=[...new Set(data.filter(i=>i.data).map(i=>i.data.slice(0,7)))].sort();
  if(allM.length<2)return null;
  const points=allM.map(m=>{
    const fl=data.filter(i=>i.data&&i.data.startsWith(m));
    const rec=fl.filter(i=>i.tipo==="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0);
    const desp=fl.filter(i=>i.tipo!=="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0);
    return{m,rec,desp,saldo:rec-desp};
  });
  const maxV=Math.max(...points.map(p=>Math.max(p.rec,p.desp,Math.abs(p.saldo))),1);
  const W=900,H=280,pad={t:30,r:30,b:40,l:80};
  const cW=W-pad.l-pad.r,cH=H-pad.t-pad.b;
  const xS=allM.length>1?cW/(allM.length-1):cW;
  const y=v=>pad.t+cH*(1-v/maxV);
  return(<div style={{...S.card,padding:24}}>
    <div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Evolução Receitas vs Despesas</div>
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>setHov(null)}>
      {[0,0.25,0.5,0.75,1].map(p=>(<g key={p}><line x1={pad.l} y1={pad.t+cH*(1-p)} x2={W-pad.r} y2={pad.t+cH*(1-p)} stroke={P.border} strokeWidth="1"/><text x={pad.l-8} y={pad.t+cH*(1-p)+4} textAnchor="end" fontSize="9" fill={P.textMuted}>{fmt(maxV*p)}</text></g>))}
      {points.map((p,i)=>(<text key={p.m} x={pad.l+i*xS} y={H-8} textAnchor="middle" fontSize="10" fill={P.textMuted}>{mL(p.m)}</text>))}
      {/* Vertical hover line */}
      {hov!==null&&<line x1={pad.l+hov*xS} y1={pad.t} x2={pad.l+hov*xS} y2={pad.t+cH} stroke={P.textMuted} strokeWidth="1" strokeDasharray="4,4" opacity="0.5"/>}
      {/* Receita */}
      <polyline points={points.map((p,i)=>`${pad.l+i*xS},${y(p.rec)}`).join(" ")} fill="none" stroke={P.accent} strokeWidth="2.5" strokeLinejoin="round"/>
      {points.map((p,i)=>{const isH=hov===i;const cx=pad.l+i*xS,cy=y(p.rec);return(<g key={`r${i}`}><circle cx={cx} cy={cy} r={isH?7:4} fill={P.accent} stroke={P.bg} strokeWidth="2" style={{cursor:"pointer"}} onMouseEnter={()=>setHov(i)}/>{isH&&<><rect x={cx-50} y={cy-26} width={100} height={18} rx={4} fill={P.surface} stroke={P.accent} strokeWidth="1"/><text x={cx} y={cy-13} textAnchor="middle" fontSize="10" fontWeight="700" fill={P.accent}>{fmt(p.rec)}</text></>}</g>);})}
      {/* Despesa */}
      <polyline points={points.map((p,i)=>`${pad.l+i*xS},${y(p.desp)}`).join(" ")} fill="none" stroke={P.red} strokeWidth="2.5" strokeLinejoin="round"/>
      {points.map((p,i)=>{const isH=hov===i;const cx=pad.l+i*xS,cy=y(p.desp);return(<g key={`d${i}`}><circle cx={cx} cy={cy} r={isH?7:4} fill={P.red} stroke={P.bg} strokeWidth="2" style={{cursor:"pointer"}} onMouseEnter={()=>setHov(i)}/>{isH&&<><rect x={cx-50} y={cy-26} width={100} height={18} rx={4} fill={P.surface} stroke={P.red} strokeWidth="1"/><text x={cx} y={cy-13} textAnchor="middle" fontSize="10" fontWeight="700" fill={P.red}>{fmt(p.desp)}</text></>}</g>);})}
      {/* Saldo */}
      <polyline points={points.map((p,i)=>`${pad.l+i*xS},${y(Math.max(0,p.saldo))}`).join(" ")} fill="none" stroke={P.cyan} strokeWidth="2" strokeDasharray="6,3" strokeLinejoin="round"/>
      {points.map((p,i)=>{const isH=hov===i;const cx=pad.l+i*xS,cy=y(Math.max(0,p.saldo));return(<g key={`s${i}`}><circle cx={cx} cy={cy} r={isH?6:3} fill={P.cyan} stroke={P.bg} strokeWidth="2" style={{cursor:"pointer"}} onMouseEnter={()=>setHov(i)}/>{isH&&<><rect x={cx-50} y={cy+6} width={100} height={18} rx={4} fill={P.surface} stroke={P.cyan} strokeWidth="1"/><text x={cx} y={cy+19} textAnchor="middle" fontSize="10" fontWeight="700" fill={P.cyan}>{fmt(p.saldo)}</text></>}</g>);})}
    </svg>
    <div style={{display:"flex",gap:16,marginTop:10}}><div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,background:P.accent,borderRadius:2}}/><span style={{color:P.textDim}}>Receitas</span></div><div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,background:P.red,borderRadius:2}}/><span style={{color:P.textDim}}>Despesas</span></div><div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,background:P.cyan,borderRadius:2}}/><span style={{color:P.textDim}}>Saldo</span></div></div>
  </div>);
}

/* 19. IRPF TAB — with expandable detail rows */
function IrpfExpand({label,children,P,S,defaultOpen}){const[open,setOpen]=useState(defaultOpen||false);
  return(<div style={{marginBottom:4}}><div onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"6px 0"}}><span style={{fontSize:16,color:P.accent,fontWeight:700,width:20,textAlign:"center"}}>{open?"−":"+"}</span><span style={{fontSize:12,fontWeight:600,color:P.textDim}}>{label}</span></div>{open&&<div style={{paddingLeft:28,marginBottom:8}}>{children}</div>}</div>);
}
function IrpfTab({rf,inco,fiis,fiiMkt,ac,etfs,cr}){const P=useT();const S=useS();
  const anoAtual=new Date().getFullYear();const[ano,setAno]=useState(anoAtual-1);
  const dataRef=`${ano}-12-31`;
  const rfAtivos=rf.filter(i=>i.dataInicio&&i.dataInicio<=dataRef&&(!i.dataVencimento||i.dataVencimento>=`${ano}-01-01`));
  const rfByBanco={};rfAtivos.forEach(i=>{const b=i.banco||"Outros";if(!rfByBanco[b])rfByBanco[b]={items:[],total:0};rfByBanco[b].items.push(i);rfByBanco[b].total+=(Number(i.valor)||0);});
  const incoAtivos=inco.filter(i=>i.dataInicio&&i.dataInicio<=dataRef&&(!i.dataVencimento||i.dataVencimento>=`${ano}-01-01`));
  const incoTotal=incoAtivos.reduce((a,i)=>a+(Number(i.valor)||0),0);
  const fiiTotal=fiis.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0);
  const fiiDiv=fiis.reduce((a,i)=>a+(Number(i.dividendoMensal)||0)*12,0);
  const acTotal=ac.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0);
  const crLinhas=crIrpfLinhas(cr,ano);const crTotal=crLinhas.reduce((a,l)=>a+l.custoAtual,0);
  const rfTrib=rfAtivos.filter(i=>temIR(i.tipo));
  const rfRendTrib=rfTrib.reduce((a,i)=>{const c=calcRF(i);return a+(Number(c.rendAnual)||0);},0);
  const rfIR=rfTrib.reduce((a,i)=>{const c=calcRF(i);return a+(Number(c.rendAnual)||0)*(c.irPct/100);},0);
  const rfIsen=rfAtivos.filter(i=>!temIR(i.tipo));
  const rfRendIsen=rfIsen.reduce((a,i)=>{const c=calcRF(i);return a+(Number(c.rendAnual)||0);},0);
  const totalBens=Object.values(rfByBanco).reduce((a,d)=>a+d.total,0)+incoTotal+fiiTotal+acTotal+crTotal;

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:10}}>
      <div style={{fontSize:22,fontWeight:700}}>Resumo para IRPF</div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:P.textDim}}>Ano-base:</span><select style={{...S.sel,width:"auto",minWidth:100}} value={ano} onChange={e=>setAno(Number(e.target.value))}>{[anoAtual-1,anoAtual-2,anoAtual].map(a=><option key={a} value={a}>{a}</option>)}</select></div>
    </div>

    {/* Bens e Direitos */}
    <div style={S.card}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Bens e Direitos — Saldo em 31/12/{ano}</div>
      {Object.entries(rfByBanco).map(([banco,d])=>(<IrpfExpand key={banco} label={`04 - Renda Fixa — ${banco} (${d.items.length} títulos) — ${fmt(d.total)}`} P={P} S={S}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={{...S.th,fontSize:10}}>Tipo</th><th style={{...S.th,fontSize:10}}>Emissor</th><th style={{...S.th,fontSize:10}}>Vencimento</th><th style={{...S.th,fontSize:10}}>Valor</th></tr></thead>
        <tbody>{d.items.map(i=>(<tr key={i.id}><td style={S.td}>{i.tipo||"—"}</td><td style={S.td}>{i.emissor||"—"}</td><td style={S.td}>{fD(i.dataVencimento)}</td><td style={{...S.td,fontWeight:600}}>{fmt(i.valor)}</td></tr>))}</tbody></table>
      </IrpfExpand>))}
      {incoTotal>0&&(<IrpfExpand label={`04 - INCO — Incorporadoras (${incoAtivos.length} invest.) — ${fmt(incoTotal)}`} P={P} S={S}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={{...S.th,fontSize:10}}>Empreendimento</th><th style={{...S.th,fontSize:10}}>Vencimento</th><th style={{...S.th,fontSize:10}}>Valor</th></tr></thead>
        <tbody>{incoAtivos.map(i=>(<tr key={i.id}><td style={S.td}>{i.empreendimento||"—"}</td><td style={S.td}>{fD(i.dataVencimento)}</td><td style={{...S.td,fontWeight:600}}>{fmt(i.valor)}</td></tr>))}</tbody></table>
      </IrpfExpand>)}
      {fiiTotal>0&&(<IrpfExpand label={`07 - FIIs (${fiis.length} fundos) — ${fmt(fiiTotal)}`} P={P} S={S}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={{...S.th,fontSize:10}}>Ticker</th><th style={{...S.th,fontSize:10}}>Qtd</th><th style={{...S.th,fontSize:10}}>Custo</th><th style={{...S.th,fontSize:10}}>Div.Anual</th></tr></thead>
        <tbody>{fiis.map(i=>{const inv=(Number(i.quantidade)||0)*(Number(i.precoMedio)||0);return(<tr key={i.id}><td style={{...S.td,fontWeight:700}}>{i.ticker}</td><td style={S.td}>{i.quantidade}</td><td style={{...S.td,fontWeight:600}}>{fmt(inv)}</td><td style={{...S.td,color:P.accent}}>{fmt((Number(i.dividendoMensal)||0)*12)}</td></tr>);})}</tbody></table>
      </IrpfExpand>)}
      {acTotal>0&&(<IrpfExpand label={`03 - Ações (${ac.length} ativos) — ${fmt(acTotal)}`} P={P} S={S}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={{...S.th,fontSize:10}}>Ticker</th><th style={{...S.th,fontSize:10}}>Qtd</th><th style={{...S.th,fontSize:10}}>PM</th><th style={{...S.th,fontSize:10}}>Total</th></tr></thead>
        <tbody>{ac.map(i=>{const inv=(Number(i.quantidade)||0)*(Number(i.precoMedio)||0);return(<tr key={i.id}><td style={{...S.td,fontWeight:700}}>{i.ticker}</td><td style={S.td}>{i.quantidade}</td><td style={S.td}>{fmt(i.precoMedio)}</td><td style={{...S.td,fontWeight:600}}>{fmt(inv)}</td></tr>);})}</tbody></table>
      </IrpfExpand>)}
      {crLinhas.some(l=>l.qtdAtual>0)&&(<IrpfExpand label={`08 - Criptoativos (${crLinhas.filter(l=>l.qtdAtual>0).length} moedas) — ${fmt(crTotal)}`} P={P} S={S}><CrIrpfTabela cr={cr} ano={ano}/></IrpfExpand>)}
      <div style={{borderTop:`2px solid ${P.border}`,paddingTop:12,marginTop:8,display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700}}><span>TOTAL BENS E DIREITOS</span><span style={{color:P.accent}}>{fmt(totalBens)}</span></div>
    </div>

    {/* Rendimentos */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={S.card}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:16,color:P.red}}>Rendimentos Tributáveis</div>
        <SC label="Rendimento Bruto" value={fmt(rfRendTrib)} color={P.red} dim={P.redDim}/>
        <div style={{marginTop:12}}><SC label="IR Retido na Fonte" value={fmt(rfIR)} color={P.red} dim={P.redDim}/></div>
        {rfTrib.length>0&&(<IrpfExpand label={`Detalhamento (${rfTrib.length} títulos)`} P={P} S={S}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={{...S.th,fontSize:10}}>Tipo</th><th style={{...S.th,fontSize:10}}>Emissor</th><th style={{...S.th,fontSize:10}}>Rend.Bruto</th><th style={{...S.th,fontSize:10}}>IR%</th><th style={{...S.th,fontSize:10}}>IR R$</th></tr></thead>
          <tbody>{rfTrib.map(i=>{const c=calcRF(i);const rb=Number(c.rendAnual)||0;return(<tr key={i.id}><td style={S.td}>{i.tipo}</td><td style={S.td}>{i.emissor||"—"}</td><td style={S.td}>{fmt(rb)}</td><td style={S.td}>{c.irPct}%</td><td style={{...S.td,color:P.red}}>{fmt(rb*(c.irPct/100))}</td></tr>);})}</tbody></table>
        </IrpfExpand>)}
      </div>
      <div style={S.card}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:16,color:P.accent}}>Rendimentos Isentos</div>
        <SC label="RF Isenta" value={fmt(rfRendIsen)} color={P.accent} dim={P.accentGlow}/>
        <div style={{marginTop:12}}><SC label="Dividendos FIIs (12m)" value={fmt(fiiDiv)} color={P.accent} dim={P.accentGlow}/></div>
        {rfIsen.length>0&&(<IrpfExpand label={`RF Isenta (${rfIsen.length} títulos)`} P={P} S={S}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={{...S.th,fontSize:10}}>Tipo</th><th style={{...S.th,fontSize:10}}>Emissor</th><th style={{...S.th,fontSize:10}}>Rend.Anual</th></tr></thead>
          <tbody>{rfIsen.map(i=>{const c=calcRF(i);return(<tr key={i.id}><td style={S.td}>{i.tipo}</td><td style={S.td}>{i.emissor||"—"}</td><td style={{...S.td,color:P.accent}}>{fmt(Number(c.rendAnual)||0)}</td></tr>);})}</tbody></table>
        </IrpfExpand>)}
      </div>
    </div>
  </div>);
}

/* SIMULAÇÃO TAB */
function SimTab({retPctMensal}){const P=useT();const S=useS();
  const[metaRenda,setMetaRenda]=useState("");
  const[jcVal,setJcVal]=useState("");const[jcAporte,setJcAporte]=useState("");const[jcTaxa,setJcTaxa]=useState("");const[jcMeses,setJcMeses]=useState("");
  const[prazoUnit,setPrazoUnit]=useState("dias");const[prazoMode,setPrazoMode]=useState("fixo");
  // Comparador de taxas
  const[compRows,setCompRows]=useState([{id:uid(),tipo:"LCI",indexador:"CDI",taxa:"100",prazo:"365",dataIni:"",dataFim:""},{id:uid(),tipo:"CDB",indexador:"CDI",taxa:"110",prazo:"720",dataIni:"",dataFim:""},{id:uid(),tipo:"LCA",indexador:"IPCA",taxa:"7",prazo:"365",dataIni:"",dataFim:""}]);
  const addRow=()=>setCompRows([...compRows,{id:uid(),tipo:"CDB",indexador:"CDI",taxa:"",prazo:"",dataIni:"",dataFim:""}]);
  const updRow=(id,k,v)=>setCompRows(compRows.map(r=>r.id===id?{...r,[k]:v}:r));
  const delRow=id=>setCompRows(compRows.filter(r=>r.id!==id));
  const calcComp=r=>{const t=Number(r.taxa)||0;
    let d=0;
    if(prazoMode==="datas"&&r.dataIni&&r.dataFim){d=Math.max(1,Math.floor((new Date(r.dataFim)-new Date(r.dataIni))/(864e5)));}
    else{d=Number(r.prazo)||365;if(prazoUnit==="meses")d=d*30;}
    if(t<=0)return{taxaAa:0,taxaMes:0,isento:false,diasEfetivos:d};
    const ix=r.indexador||"Pré";let taxaAa=t;
    if(ix==="CDI"||ix==="Selic"){const cdiD=Math.pow(1+RATES.cdi12m/100,1/252)-1;taxaAa=(Math.pow(1+cdiD*(t/100),252)-1)*100;}
    else if(ix==="IPCA")taxaAa=((1+RATES.ipca12m/100)*(1+t/100)-1)*100;
    const isento=["LCI","LCA","CRA","CRI"].includes(r.tipo);const irPct=isento?0:getIR(d);
    const taxaLiq=taxaAa*(1-irPct/100);const taxaMes=taxaLiq/12;
    return{taxaAa:taxaLiq.toFixed(2),taxaMes:taxaMes.toFixed(4),isento,diasEfetivos:d};
  };
  const compCalc=compRows.map(r=>({...r,...calcComp(r)}));
  const bestIdx=compCalc.reduce((best,r,i)=>Number(r.taxaMes)>Number(compCalc[best]?.taxaMes||0)?i:best,0);

  // Juros compostos
  const jcResult=(()=>{const v=Number(jcVal)||0,a=Number(jcAporte)||0,tx=Number(jcTaxa)||0,m=Number(jcMeses)||0;if(m<=0||tx<=0)return null;
    let total=v;const hist=[];for(let i=1;i<=m;i++){total=total*(1+tx/100)+a;hist.push({mes:i,total});}
    const investido=v+a*m;return{total:total.toFixed(2),investido:investido.toFixed(2),juros:(total-investido).toFixed(2),hist};
  })();

  return(<div>
    <div style={{fontSize:22,fontWeight:700,marginBottom:28}}>Simulação</div>
    {/* Meta de renda passiva */}
    <div style={S.card}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Meta de Renda Passiva Mensal</div>
      <div style={{fontSize:12,color:P.textDim,marginBottom:14}}>Taxa de retorno mensal atual: {retPctMensal>0?fP(retPctMensal):"—"}</div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}><input style={{...S.i,maxWidth:200}} type="number" step="0.01" placeholder="Meta mensal (R$)" value={metaRenda} onChange={e=>setMetaRenda(e.target.value)}/></div>
      {metaRenda&&retPctMensal>0&&(()=>{const meta=Number(metaRenda);const needed=meta/(retPctMensal/100);return(<div style={{background:P.surfaceAlt,border:`1px solid ${P.accent}`,borderRadius:10,padding:20}}><div style={{fontSize:11,color:P.textDim}}>Para receber {fmt(meta)}/mês com retorno de {fP(retPctMensal)}:</div><div style={{fontSize:28,fontWeight:700,color:P.accent,marginTop:8}}>Investir {fmt(needed)}</div></div>);})()}
    </div>

    {/* Juros Compostos */}
    <div style={S.card}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Simulador de Juros Compostos</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:16}}>
        <div><label style={S.lbl}>Valor Inicial</label><input style={S.i} type="number" step="0.01" value={jcVal} onChange={e=>setJcVal(e.target.value)}/></div>
        <div><label style={S.lbl}>Aporte Mensal</label><input style={S.i} type="number" step="0.01" value={jcAporte} onChange={e=>setJcAporte(e.target.value)}/></div>
        <div><label style={S.lbl}>Taxa Mensal (%)</label><input style={S.i} type="number" step="0.01" value={jcTaxa} onChange={e=>setJcTaxa(e.target.value)}/></div>
        <div><label style={S.lbl}>Prazo (meses)</label><input style={S.i} type="number" step="1" value={jcMeses} onChange={e=>setJcMeses(e.target.value)}/></div>
      </div>
      {jcResult&&(<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:16}}><SC label="Total Final" value={fmt(jcResult.total)} color={P.accent} dim={P.accentGlow}/><SC label="Total Investido" value={fmt(jcResult.investido)} color={P.blue} dim={P.blueDim}/><SC label="Juros Ganhos" value={fmt(jcResult.juros)} color={P.cyan} dim={P.cyanDim}/></div></div>)}
    </div>

    {/* Comparador de Taxas */}
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}><div style={{fontSize:14,fontWeight:700}}>Comparador de Investimentos</div><div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{display:"flex",gap:4}}><button style={prazoMode==="fixo"?S.btn():S.btnO} onClick={()=>setPrazoMode("fixo")}>Prazo fixo</button><button style={prazoMode==="datas"?S.btn():S.btnO} onClick={()=>setPrazoMode("datas")}>Datas</button></div>
        {prazoMode==="fixo"&&<select style={{...S.sel,width:"auto",minWidth:80}} value={prazoUnit} onChange={e=>setPrazoUnit(e.target.value)}><option value="dias">Dias</option><option value="meses">Meses</option></select>}
        <button style={S.btn()} onClick={addRow}>+ Adicionar</button></div></div>
      <div style={{fontSize:11,color:P.textDim,marginBottom:14}}>{prazoMode==="fixo"?`Prazo em ${prazoUnit}.`:"Informe data início e fim."} Campos amarelos são editáveis.</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr><th style={S.th}>Título</th><th style={S.th}>Indexador</th><th style={S.th}>Taxa (%)</th>{prazoMode==="fixo"?<th style={S.th}>Prazo ({prazoUnit})</th>:<><th style={S.th}>Início</th><th style={S.th}>Fim</th><th style={S.th}>Dias</th></>}<th style={S.th}>IR</th><th style={S.th}>Taxa Líq. a.a.</th><th style={S.th}>Taxa Mensal</th><th style={S.th}></th></tr></thead>
        <tbody>{compCalc.map((r,idx)=>(<tr key={r.id} style={{background:idx===bestIdx?"rgba(16,185,129,0.12)":"transparent"}}>
          <td style={S.td}><select style={{...S.sel,minWidth:80,background:idx===bestIdx?"rgba(16,185,129,0.08)":P.surfaceAlt}} value={r.tipo} onChange={e=>updRow(r.id,"tipo",e.target.value)}>{["CDB","LCI","LCA","CRA","CRI","Tesouro Selic","Tesouro IPCA+","Tesouro Prefixado","Debênture","LC"].map(o=><option key={o} value={o}>{o}</option>)}</select></td>
          <td style={S.td}><select style={{...S.sel,minWidth:70}} value={r.indexador} onChange={e=>updRow(r.id,"indexador",e.target.value)}>{["Pré","CDI","IPCA","Selic"].map(o=><option key={o} value={o}>{o}</option>)}</select></td>
          <td style={S.td}><input style={{...S.i,width:70,background:"#fef9c3"}} type="number" step="0.01" value={r.taxa} onChange={e=>updRow(r.id,"taxa",e.target.value)}/></td>
          {prazoMode==="fixo"?<td style={S.td}><input style={{...S.i,width:70,background:"#fef9c3"}} type="number" step="1" value={r.prazo} onChange={e=>updRow(r.id,"prazo",e.target.value)}/></td>:<><td style={S.td}><input style={{...S.i,width:120,background:"#fef9c3"}} type="date" value={r.dataIni||""} onChange={e=>updRow(r.id,"dataIni",e.target.value)}/></td><td style={S.td}><input style={{...S.i,width:120,background:"#fef9c3"}} type="date" value={r.dataFim||""} onChange={e=>updRow(r.id,"dataFim",e.target.value)}/></td><td style={{...S.td,fontWeight:600}}>{r.diasEfetivos||"—"}</td></>}
          <td style={{...S.td,color:r.isento?P.accent:P.red}}>{r.isento?"Isento":`${getIR(r.diasEfetivos||365)}%`}</td>
          <td style={{...S.td,fontWeight:600}}>{r.taxaAa}%</td>
          <td style={{...S.td,fontWeight:700,fontSize:14,color:idx===bestIdx?P.accent:P.text}}>{r.taxaMes}%</td>
          <td style={S.td}><button style={{background:"transparent",border:"none",color:P.textMuted,cursor:"pointer",fontSize:16}} onClick={()=>delRow(r.id)}>✕</button></td>
        </tr>))}</tbody>
      </table></div>
      {compCalc.length>0&&<div style={{marginTop:12,fontSize:12,color:P.accent,fontWeight:600}}>Melhor opção: {compCalc[bestIdx]?.tipo} {compCalc[bestIdx]?.indexador} {compCalc[bestIdx]?.taxa}% → {compCalc[bestIdx]?.taxaMes}% ao mês</div>}
    </div>
  </div>);
}

/* PRF TAB — Diárias + ADFRON/GECC + Aposentadoria */
function PrfTab({prfRef,sim,setSim,defSim}){const P=useT();const S=useS();const[sub,setSub]=useState("diarias");
  const ref=prfRef||DEF_PRF_REF;
  const sf=(k,v)=>setSim(p=>({...p,[k]:v}));
  // Diárias — read from sim, write via sf()
  const dIni=sim?.dIni??"";const setDIni=v=>sf("dIni",v);
  const dFim=sim?.dFim??"";const setDFim=v=>sf("dFim",v);
  const dTipo=sim?.dTipo??"Interior";const setDTipo=v=>sf("dTipo",v);
  const dHotel=sim?.dHotel??"";const setDHotel=v=>sf("dHotel",v);
  const dLimpeza=sim?.dLimpeza??"";const setDLimpeza=v=>sf("dLimpeza",v);
  const dCarroProprio=sim?.dCarroProprio??false;const setDCarroProprio=v=>sf("dCarroProprio",v);
  const dDistKm=sim?.dDistKm??"";const setDDistKm=v=>sf("dDistKm",v);
  const dCombustivel=sim?.dCombustivel??"6.50";const setDCombustivel=v=>sf("dCombustivel",v);
  const dConsumo=sim?.dConsumo??"10";const setDConsumo=v=>sf("dConsumo",v);
  const dPlantoes=sim?.dPlantoes??"1";const setDPlantoes=v=>sf("dPlantoes",v);
  const dGecc=sim?.dGecc??false;const setDGecc=v=>sf("dGecc",v);
  const dHorasGecc=sim?.dHorasGecc??"";const setDHorasGecc=v=>sf("dHorasGecc",v);
  const adDias=sim?.adDias??"";const setAdDias=v=>sf("adDias",v);
  const gcHoras=sim?.gcHoras??"";const setGcHoras=v=>sf("gcHoras",v);
  const apNasc=sim?.apNasc??"";const setApNasc=v=>sf("apNasc",v);
  const apEntrada=sim?.apEntrada??"";const setApEntrada=v=>sf("apEntrada",v);
  const apFator=sim?.apFator??"1.0";const setApFator=v=>sf("apFator",v);
  // Dias úteis / limites do mês por calendário puro (sem depender do fuso do navegador)
  const networkDays=prfNetworkDays;
  const dDias=(()=>{if(!dIni||!dFim)return 0;const d=Math.max(0,Math.floor((new Date(dFim)-new Date(dIni))/(864e5)));return d>0?d+0.5:0;})();
  const dValor=dTipo==="Capitais"?(ref.diariaCapitais||380):dTipo==="Interior"?(ref.diariaInterior||335):(ref.diariaSPRJ||425);
  const dTotal=dDias*dValor;
  // Desc Alimentação: (1175/NETWORKDAYS(EOMONTH(dIni,-1)+1, EOMONTH(dIni,0))) * NETWORKDAYS(dIni,dFim)
  const dDescAlim=(()=>{if(!dIni||!dFim)return 0;
    const mb=prfMonthBounds(dIni);if(!mb)return 0;
    const wdMonth=prfNetworkDays(mb.first,mb.last);if(wdMonth<=0)return 0;
    return(1175/wdMonth)*prfNetworkDays(dIni,dFim);
  })();
  const dLiquido=dTotal-dDescAlim;
  const dHotelNum=Number(dHotel)||0;const dLimpezaNum=Number(dLimpeza)||0;
  const dHospTotal=dHotelNum*Math.floor(dDias)+dLimpezaNum;
  // Car cost: (distancia / consumo) * preco_combustivel
  const dCustoCarro=dCarroProprio?((Number(dDistKm)||0)/(Number(dConsumo)||10))*(Number(dCombustivel)||6.5)*(Number(dPlantoes)||1):0;
  const dGeccBruto=dGecc?(Number(dHorasGecc)||0)*(ref.horaGECC||165.78):0;
  const dGeccLiq=dGeccBruto*(1-0.275);
  const dRestante=dLiquido-dHospTotal-dCustoCarro;
  const dSaldoTotal=dRestante+dGeccLiq;
  // ADFRON lost: days away × daily ADFRON rate
  const diasInteiros=Math.ceil(dDias);
  const diasUteisAdfron=dIni&&dFim?networkDays(dIni,dFim):diasInteiros;
  const adfronPerdido=diasUteisAdfron*(ref.diaADFRON||92);
  const saldoVsAdfron=dSaldoTotal-adfronPerdido;
  // ADFRON/GECC
  const adTotal=(Number(adDias)||0)*(ref.diaADFRON||92);
  const gcBruto=(Number(gcHoras)||0)*(ref.horaGECC||165.78);
  const gcLiq=gcBruto*(1-0.275);
  const adWin=adTotal>=gcLiq;
  // Aposentadoria
  const calcApos=(targetDate)=>{const now=new Date();const t=new Date(targetDate);if(isNaN(t.getTime()))return"—";const diff=t-now;if(diff<=0)return"Atingido!";const totalDias=Math.floor(diff/(864e5));const anos=Math.floor(totalDias/365);const meses=Math.floor((totalDias%365)/30);const dias=totalDias%30;return`${anos}a ${meses}m ${dias}d`;};
  // With factor: target date comes CLOSER by factor (fewer effective days to wait)
  const calcDataFator=(targetDate,fator)=>{const now=new Date();const t=new Date(targetDate);if(isNaN(t.getTime()))return{text:"—",date:null};const diff=t-now;if(diff<=0)return{text:"Atingido!",date:null};const totalDias=Math.floor(diff/(864e5));const diasFator=Math.floor(totalDias/Number(fator||1));const novaData=new Date(now.getTime()+diasFator*864e5);const anos=Math.floor(diasFator/365);const meses=Math.floor((diasFator%365)/30);const dias=diasFator%30;return{text:`${anos}a ${meses}m ${dias}d`,date:novaData.toISOString().slice(0,10)};};
  const idade55=(()=>{if(!apNasc)return null;const n=new Date(apNasc);const t=new Date(n);t.setFullYear(t.getFullYear()+55);return t.toISOString().slice(0,10);})();
  const tempo30=(()=>{if(!apEntrada)return null;const e=new Date(apEntrada);const t=new Date(e);t.setFullYear(t.getFullYear()+30);return t.toISOString().slice(0,10);})();
  const id55f=idade55?calcDataFator(idade55,apFator):null;
  const tp30f=tempo30?calcDataFator(tempo30,apFator):null;

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}><div style={{fontSize:22,fontWeight:700}}>PRF</div><div style={{display:"flex",gap:8}}><button style={sub==="diarias"?S.btnA():S.btnO} onClick={()=>setSub("diarias")}>Diárias</button><button style={sub==="adfron"?S.btnA():S.btnO} onClick={()=>setSub("adfron")}>ADFRON/GECC</button><button style={sub==="apos"?S.btnA():S.btnO} onClick={()=>setSub("apos")}>Aposentadoria</button><button style={S.btnO} onClick={()=>setSim(defSim)}>✕ Limpar</button></div></div>

    {sub==="diarias"&&(<div style={S.card}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Diárias</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:20}}>
        <div><label style={S.lbl}>Data Início</label><input style={S.i} type="date" value={dIni} onChange={e=>setDIni(e.target.value)}/></div>
        <div><label style={S.lbl}>Data Final</label><input style={S.i} type="date" value={dFim} onChange={e=>setDFim(e.target.value)}/></div>
        <div><label style={S.lbl}>Destino</label><select style={S.sel} value={dTipo} onChange={e=>setDTipo(e.target.value)}><option value="Capitais">Capitais — R$ 380,00</option><option value="SP/RJ/AM/BSB">SP/RJ/AM/BSB — R$ 425,00</option><option value="Interior">Interior — R$ 335,00</option></select></div>
        <div><label style={S.lbl}>Diária Hotel</label><input style={S.i} type="number" step="0.01" placeholder="R$/noite" value={dHotel} onChange={e=>setDHotel(e.target.value)}/></div>
        <div><label style={S.lbl}>Taxa Limpeza</label><input style={S.i} type="number" step="0.01" placeholder="R$ total" value={dLimpeza} onChange={e=>setDLimpeza(e.target.value)}/></div>
        <div style={{gridColumn:"1/-1",display:"flex",gap:24,flexWrap:"wrap"}}>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={dCarroProprio} onChange={e=>setDCarroProprio(e.target.checked)}/>Carro próprio</label>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13}}><input type="checkbox" checked={dGecc} onChange={e=>setDGecc(e.target.checked)}/>GECC</label>
        </div>
        {dCarroProprio&&<><div><label style={S.lbl}>Distância (km ida+volta)</label><input style={S.i} type="number" step="1" placeholder="km" value={dDistKm} onChange={e=>setDDistKm(e.target.value)}/></div>
        <div><label style={S.lbl}>Nº de Viagens</label><input style={S.i} type="number" step="1" value={dPlantoes} onChange={e=>setDPlantoes(e.target.value)}/></div>
        <div><label style={S.lbl}>Preço Combustível (R$/L)</label><input style={S.i} type="number" step="0.01" value={dCombustivel} onChange={e=>setDCombustivel(e.target.value)}/></div>
        <div><label style={S.lbl}>Consumo Médio (km/L)</label><input style={S.i} type="number" step="0.1" value={dConsumo} onChange={e=>setDConsumo(e.target.value)}/></div></>}
        {dGecc&&<div><label style={S.lbl}>Horas GECC ({fmt(ref.horaGECC||165.78)}/h)</label><input style={S.i} type="number" step="0.5" placeholder="0" value={dHorasGecc} onChange={e=>setDHorasGecc(e.target.value)}/></div>}
      </div>
      <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:13}}>
          <div style={{color:P.textDim}}>Dias conv.</div><div style={{fontWeight:600,textAlign:"right"}}>{dDias}</div>
          <div style={{color:P.textDim}}>Valor atual</div><div style={{fontWeight:600,textAlign:"right"}}>{fmt(dValor)}</div>
          <div style={{color:P.textDim}}>Desc. Alimentação</div><div style={{fontWeight:600,textAlign:"right",color:P.red}}>{dDescAlim>0?`- ${fmt(dDescAlim)}`:"—"}</div>
          <div style={{color:P.textDim,fontSize:14,fontWeight:700,borderTop:`2px solid ${P.border}`,paddingTop:8}}>Total Diárias</div><div style={{fontSize:18,fontWeight:700,color:P.accent,textAlign:"right",borderTop:`2px solid ${P.border}`,paddingTop:8}}>{fmt(dTotal)}</div>
          <div style={{color:P.textDim,fontWeight:600}}>Líquido (após desc. alim.)</div><div style={{fontSize:16,fontWeight:700,color:P.blue,textAlign:"right"}}>{fmt(dLiquido)}</div>
          {dHotelNum>0&&<><div style={{color:P.textDim,borderTop:`1px solid ${P.border}`,paddingTop:8}}>Hotel ({Math.floor(dDias)} noites × {fmt(dHotelNum)})</div><div style={{fontWeight:600,textAlign:"right",color:P.red,borderTop:`1px solid ${P.border}`,paddingTop:8}}>- {fmt(dHotelNum*Math.floor(dDias))}</div></>}
          {dLimpezaNum>0&&<><div style={{color:P.textDim}}>Taxa Limpeza</div><div style={{fontWeight:600,textAlign:"right",color:P.red}}>- {fmt(dLimpezaNum)}</div></>}
          {(dHotelNum>0||dLimpezaNum>0)&&<><div style={{color:P.textDim}}>Hospedagem Total</div><div style={{fontWeight:600,textAlign:"right",color:P.red}}>- {fmt(dHospTotal)}</div></>}
          {dCustoCarro>0&&<><div style={{color:P.textDim}}>Combustível ({dDistKm}km × {dPlantoes} viag. ÷ {dConsumo}km/L × {fmt(dCombustivel)})</div><div style={{fontWeight:600,textAlign:"right",color:P.red}}>- {fmt(dCustoCarro)}</div></>}
          {(dHotelNum>0||dLimpezaNum>0||dCustoCarro>0)&&<><div style={{color:P.textDim,fontSize:14,fontWeight:700,borderTop:`2px solid ${P.accent}`,paddingTop:8}}>Valor Restante (após deduções)</div><div style={{fontSize:20,fontWeight:700,color:dRestante>=0?P.accent:P.red,textAlign:"right",borderTop:`2px solid ${P.accent}`,paddingTop:8}}>{fmt(dRestante)}</div></>}
          {dGeccLiq>0&&<><div style={{color:P.textDim,borderTop:`1px solid ${P.border}`,paddingTop:8}}>GECC ({dHorasGecc}h × {fmt(ref.horaGECC||165.78)} − 27,5%)</div><div style={{fontWeight:600,textAlign:"right",color:P.accent,borderTop:`1px solid ${P.border}`,paddingTop:8}}>+ {fmt(dGeccLiq)}</div>
          <div style={{fontSize:11,color:P.textMuted}}>Bruto: {fmt(dGeccBruto)}</div><div style={{fontSize:11,color:P.textMuted,textAlign:"right"}}>IR: - {fmt(dGeccBruto-dGeccLiq)}</div>
          <div style={{color:P.textDim,fontSize:14,fontWeight:700,borderTop:`2px solid ${P.cyan}`,paddingTop:8}}>Total com GECC</div><div style={{fontSize:20,fontWeight:700,color:P.cyan,textAlign:"right",borderTop:`2px solid ${P.cyan}`,paddingTop:8}}>{fmt(dSaldoTotal)}</div></>}
          {dDias>0&&<><div style={{color:P.textDim,borderTop:`2px solid ${P.border}`,paddingTop:10,marginTop:4}}>ADFRON perdido ({diasUteisAdfron} dias úteis × {fmt(ref.diaADFRON||92)})</div><div style={{fontWeight:600,textAlign:"right",color:P.red,borderTop:`2px solid ${P.border}`,paddingTop:10}}>- {fmt(adfronPerdido)}</div>
          <div style={{color:P.textDim,fontSize:14,fontWeight:700,borderTop:`2px solid ${P.border}`,paddingTop:8}}>Saldo Final (Diárias{dGeccLiq>0?" + GECC":""} − ADFRON)</div><div style={{fontSize:22,fontWeight:700,color:saldoVsAdfron>=0?P.accent:P.red,textAlign:"right",borderTop:`2px solid ${P.border}`,paddingTop:8}}>{fmt(saldoVsAdfron)}</div>
          <div colSpan={2} style={{gridColumn:"1/-1",textAlign:"center",fontSize:11,marginTop:8,padding:"8px 12px",borderRadius:6,background:saldoVsAdfron>=0?P.accentGlow:P.redDim,color:saldoVsAdfron>=0?P.accent:P.red,fontWeight:600}}>{saldoVsAdfron>=0?"✓ Compensa viajar — saldo positivo após ADFRON":"✗ Não compensa — você perde dinheiro viajando"}</div></>}
        </div>
      </div>
    </div>)}

    {sub==="adfron"&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={S.card}><div style={{fontSize:14,fontWeight:700,marginBottom:16}}>ADFRON</div><div><label style={S.lbl}>Dias ADFRON</label><input style={S.i} type="number" value={adDias} onChange={e=>setAdDias(e.target.value)}/></div><div style={{marginTop:12,fontSize:11,color:P.textDim}}>Valor/dia: {fmt(ref.diaADFRON||92)}</div><div style={{marginTop:12,padding:16,borderRadius:8,fontSize:20,fontWeight:700,textAlign:"center",background:adWin?"rgba(16,185,129,0.12)":P.surfaceAlt,color:adWin?P.accent:P.text}}>{fmt(adTotal)}</div>{adWin&&<div style={{textAlign:"center",fontSize:11,color:P.accent,marginTop:6,fontWeight:600}}>Melhor opção</div>}</div>
      <div style={S.card}><div style={{fontSize:14,fontWeight:700,marginBottom:16}}>GECC</div><div><label style={S.lbl}>Horas GECC</label><input style={S.i} type="number" value={gcHoras} onChange={e=>setGcHoras(e.target.value)}/></div><div style={{marginTop:12,fontSize:11,color:P.textDim}}>Valor/hora: {fmt(ref.horaGECC||165.78)} · Desconto: 27,5%</div><div style={{marginTop:4,fontSize:11,color:P.textMuted}}>Bruto: {fmt(gcBruto)}</div><div style={{marginTop:8,padding:16,borderRadius:8,fontSize:20,fontWeight:700,textAlign:"center",background:!adWin?"rgba(16,185,129,0.12)":P.surfaceAlt,color:!adWin?P.accent:P.text}}>{fmt(gcLiq)}</div>{!adWin&&gcLiq>0&&<div style={{textAlign:"center",fontSize:11,color:P.accent,marginTop:6,fontWeight:600}}>Melhor opção</div>}</div>
    </div>)}

    {sub==="apos"&&(<div style={S.card}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Simulação Aposentadoria</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:24}}>
        <div><label style={S.lbl}>Data de Nascimento</label><input style={S.i} type="date" value={apNasc} onChange={e=>setApNasc(e.target.value)}/></div>
        <div><label style={S.lbl}>Data de Entrada</label><input style={S.i} type="date" value={apEntrada} onChange={e=>setApEntrada(e.target.value)}/></div>
        <div><label style={S.lbl}>Fator Multiplicador</label><input style={S.i} type="number" step="0.01" value={apFator} onChange={e=>setApFator(e.target.value)}/></div>
      </div>
      {(apNasc||apEntrada)&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:P.blue,marginBottom:12}}>Aposentadoria por Idade (55 anos)</div>
          {idade55&&<div style={{fontSize:11,color:P.textMuted,marginBottom:4}}>Data alvo: {fD(idade55)}</div>}
          <div style={{fontSize:20,fontWeight:700,color:P.text}}>Faltam: {idade55?calcApos(idade55):"—"}</div>
          {Number(apFator)!==1&&id55f&&(<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${P.border}`}}><div style={{fontSize:11,color:P.textDim,marginBottom:4}}>Com fator {apFator}:</div>{id55f.date&&<div style={{fontSize:11,color:P.textMuted,marginBottom:4}}>Data alvo c/ fator: {fD(id55f.date)}</div>}<div style={{fontSize:18,fontWeight:700,color:P.accent}}>{id55f.text}</div></div>)}
        </div>
        <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,color:P.purple,marginBottom:12}}>Aposentadoria por Tempo (30 anos)</div>
          {tempo30&&<div style={{fontSize:11,color:P.textMuted,marginBottom:4}}>Data alvo: {fD(tempo30)}</div>}
          <div style={{fontSize:20,fontWeight:700,color:P.text}}>Faltam: {tempo30?calcApos(tempo30):"—"}</div>
          {Number(apFator)!==1&&tp30f&&(<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${P.border}`}}><div style={{fontSize:11,color:P.textDim,marginBottom:4}}>Com fator {apFator}:</div>{tp30f.date&&<div style={{fontSize:11,color:P.textMuted,marginBottom:4}}>Data alvo c/ fator: {fD(tp30f.date)}</div>}<div style={{fontSize:18,fontWeight:700,color:P.accent}}>{tp30f.text}</div></div>)}
        </div>
      </div>)}
    </div>)}
  </div>);
}

/* Tesouro Direto: parser de CSV/colagem (acha Data e Valor pelo conteúdo, em qualquer ordem de colunas) */
const tdParseLine=(line)=>{const sep=line.includes("\t")?"\t":line.includes(";")?";":",";const r=[];let cur="",q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"')q=!q;else if(c===sep&&!q){r.push(cur.trim());cur="";}else cur+=c;}r.push(cur.trim());return r;};
const tdISODate=s=>{s=(s||"").trim();let m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);if(m)return`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return`${m[1]}-${m[2]}-${m[3]}`;return null;};
const tdMoney=s=>{s=(s||"").replace(/R\$|\s/g,"");if(!/^-?\d[\d.,]*$/.test(s))return null;if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");else if((s.match(/\./g)||[]).length>1)s=s.replace(/\./g,"");const v=Math.abs(Number(s));return isFinite(v)&&v>0?v:null;};
const tdParseText=text=>{const items=[];text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).forEach(line=>{
  const cells=tdParseLine(line);const di=cells.findIndex(c=>tdISODate(c));if(di<0)return;
  const dt=tdISODate(cells[di]);let val=null;
  for(let i=cells.length-1;i>=0;i--){if(i===di)continue;const c=cells[i];if(/^\d+$/.test(c.replace(/\s/g,""))&&!/R\$/.test(c))continue;const v=tdMoney(c);if(v){val=v;break;}}
  if(val)items.push({id:uid(),data:dt,valor:val.toFixed(2)});});return items;};

/* Seleção múltipla (Tesouro Direto): clique alterna; Shift+clique marca/desmarca o intervalo desde o último clique */
const tdToggle=(ids,sel,id,last,shift)=>{const n=new Set(sel);if(shift&&last&&ids.includes(last)&&ids.includes(id)){const a=ids.indexOf(last),b=ids.indexOf(id),lo=Math.min(a,b),hi=Math.max(a,b),on=!sel.has(id);for(let k=lo;k<=hi;k++){if(on)n.add(ids[k]);else n.delete(ids[k]);}}else{if(n.has(id))n.delete(id);else n.add(id);}return n;};
const tdValidDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||"");

/* TESOURO DIRETO TAB */
function TDTab({apos,setApos,liza,setLiza}){const P=useT();const S=useS();const[sub,setSub]=useState("apos");const[modal,setModal]=useState(null);const[del,setDel]=useState(null);
  const[sel,setSel]=useState(()=>new Set());const[lastSel,setLastSel]=useState(null);const[delBulk,setDelBulk]=useState(false);
  useEffect(()=>{setSel(new Set());setLastSel(null);},[sub]);
  const activeData=sub==="apos"?apos:liza;const setActive=sub==="apos"?setApos:setLiza;
  const total=activeData.reduce((a,i)=>a+(Number(i.valor)||0),0);
  const{sb:tdSb,sd:tdSd,onS:tdOnS,doS:tdDoS}=useSort("data","desc");   // padrão: mais recente primeiro
  // Acumulado é sempre o total corrido em ordem CRONOLÓGICA, independente da ordenação exibida
  const accById={};{let acc=0;[...activeData].sort((a,b)=>(a.data||"").localeCompare(b.data||"")).forEach(i=>{acc+=(Number(i.valor)||0);accById[i.id]=acc;});}
  const sorted=tdDoS(activeData.map(i=>({...i,_acum:accById[i.id]})));
  const ids=sorted.map(i=>i.id);const selItems=sorted.filter(i=>sel.has(i.id));const selCount=selItems.length;
  const selTotal=selItems.reduce((a,i)=>a+(Number(i.valor)||0),0);
  const allSel=sorted.length>0&&selCount===sorted.length;
  const invalidos=sorted.filter(i=>!tdValidDate(i.data));
  const limparSel=()=>{setSel(new Set());setLastSel(null);};
  const doSave=item=>{const out={...item,id:item.id||uid()};setActive(p=>{const i=p.findIndex(x=>x.id===out.id);if(i>=0){const n=[...p];n[i]=out;return n;}return[...p,out];});setModal(null);};
  const handleCSV=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();
    reader.onload=ev=>{const items=tdParseText(ev.target.result);
      if(items.length===0){alert("Nenhum registro reconhecido. O arquivo precisa ter colunas de Data (dd/mm/aaaa) e Valor (R$).");return;}
      const novos=tdNovos(activeData,items);
      if(novos.length)setActive(p=>[...p,...novos]);
      alert(`${novos.length} importados · ${items.length-novos.length} ignorados (já existiam)`);
    };reader.readAsText(file,"UTF-8");e.target.value="";
  };
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:8}}>
      <div>
        <div style={{fontSize:22,fontWeight:700}}>Tesouro Direto — {TD_INFO[sub].nome}</div>
        <div style={{fontSize:13,fontWeight:600,color:P.accent,marginTop:4}}>{TD_INFO[sub].titulo}</div>
        <div style={{fontSize:12,color:P.textDim,marginTop:2}}>{TD_INFO[sub].estimativa}</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button style={sub==="apos"?S.btnA():S.btnO} onClick={()=>setSub("apos")}>Aposentadoria</button>
        <button style={sub==="liza"?S.btnA():S.btnO} onClick={()=>setSub("liza")}>Faculdade Liza</button>
        <button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button>
        <label style={{...S.btnO,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><input type="file" accept=".csv,.txt" style={{display:"none"}} onChange={handleCSV}/>📎 Importar CSV</label>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
      <SC label={sub==="apos"?"Total Aposentadoria":"Total Faculdade Liza"} value={fmt(total)} color={P.accent} dim={P.accentGlow}/>
      <SC label="Registros" value={String(activeData.length)} color={P.blue} dim={P.blueDim}/>
    </div>
    {invalidos.length>0&&(<div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",padding:"10px 16px",marginBottom:12,borderRadius:8,background:P.orangeDim,border:`1px solid ${P.orange}55`}}>
      <span style={{fontSize:12,fontWeight:600,color:P.orange}}>⚠ {invalidos.length} registro{invalidos.length!==1?"s":""} com data inválida (provável importação com erro)</span>
      <button style={S.btnO} onClick={()=>{setSel(new Set(invalidos.map(i=>i.id)));setLastSel(null);}}>Selecionar inválidos</button>
    </div>)}
    {selCount>0&&(<div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",padding:"10px 16px",marginBottom:12,borderRadius:8,background:P.redDim,border:`1px solid ${P.red}44`}}>
      <span style={{fontSize:12,fontWeight:700}}>{selCount} selecionado{selCount!==1?"s":""} · {fmt(selTotal)}</span>
      <button style={S.btn(P.red)} onClick={()=>setDelBulk(true)}>🗑 Excluir selecionados</button>
      <button style={S.btnO} onClick={limparSel}>Limpar seleção</button>
      <span style={{fontSize:10,color:P.textMuted}}>Dica: Shift+clique marca um intervalo</span>
    </div>)}
    {sorted.length>0?(<div style={{...S.card,padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead><tr><th style={{...S.th,width:36}}><input type="checkbox" title="Selecionar todos" checked={allSel} ref={el=>{if(el)el.indeterminate=selCount>0&&!allSel;}} onChange={()=>{if(allSel)limparSel();else{setSel(new Set(ids));setLastSel(null);}}}/></th><STH label="Data" field="data" sb={tdSb} sd={tdSd} onS={tdOnS} style={S.th}/><STH label="Valor" field="valor" sb={tdSb} sd={tdSd} onS={tdOnS} style={S.th}/><STH label="Acumulado" field="_acum" sb={tdSb} sd={tdSd} onS={tdOnS} style={S.th}/><th style={S.th}></th></tr></thead>
      <tbody>{(()=>{return sorted.map(i=>{return(<TR key={i.id} baseBg={sel.has(i.id)?P.accentGlow:undefined} onClick={()=>setModal(i)}><td style={{...S.td,width:36,cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSel(tdToggle(ids,sel,i.id,lastSel,e.shiftKey));setLastSel(i.id);}}><input type="checkbox" checked={sel.has(i.id)} onChange={()=>{}} style={{pointerEvents:"none"}}/></td><td style={S.td}>{tdValidDate(i.data)?fD(i.data):<span style={{color:P.orange}}>{i.data||"—"} ⚠</span>}</td><td style={{...S.td,fontWeight:600}}>{fmt(i.valor)}</td><td style={{...S.td,color:P.accent}}>{fmt(i._acum)}</td><td style={S.td}><button style={{background:"transparent",border:"none",color:P.textMuted,cursor:"pointer",fontSize:16,fontFamily:"inherit"}} onClick={e=>{e.stopPropagation();setDel(i.id);}}>✕</button></td></TR>);});})()}</tbody>
    </table></div>):(<div style={{textAlign:"center",padding:60,color:P.textMuted}}>Nenhum registro. Adicione manualmente ou importe CSV.</div>)}
    {modal&&<Mdl title={modal==="new"?"Novo":"Editar"} fields={[{key:"data",label:"Data",type:"date"},{key:"valor",label:"Valor (R$)",type:"number",step:"0.01"}]} initial={modal==="new"?{data:new Date().toISOString().slice(0,10)}:modal} onSave={doSave} onCancel={()=>setModal(null)}/>}
    {del&&<Cfm msg="Excluir?" onOk={()=>{setActive(p=>p.filter(x=>x.id!==del));setDel(null);}} onNo={()=>setDel(null)}/>}
    {delBulk&&<Cfm msg={`Excluir ${selCount} registro${selCount!==1?"s":""} (${fmt(selTotal)})? Esta ação não pode ser desfeita.`} onOk={()=>{setActive(p=>p.filter(x=>!sel.has(x.id)));limparSel();setDelBulk(false);}} onNo={()=>setDelBulk(false)}/>}
  </div>);
}

/* IMÓVEIS TAB — with real estate indices + fetch */
function ImoveisTab({sim,setSim,defSim}){const P=useT();const S=useS();
  const[subImo,setSubImo]=useState("simulador");
  const[incc,setIncc]=useState("—");const[fipezap,setFipezap]=useState("—");const[loading,setLoading]=useState(false);
  const[hovApt,setHovApt]=useState(null);
  const DEF_APT={valorAtual:"750000",prazoAnos:"10",inccAnual:"7",reservaAtual:"0",fgts:"0",aporteMensal:"",rendMensal:"1.0",itbi:"2",escritura:"1.5",corretagem:"6",imovelAtual:"0",valorizacaoImovel:"5"};
  const[apt,setApt]=useState(()=>ld("ip8-simApt",DEF_APT));const setA=(k,v)=>setApt(p=>({...p,[k]:v}));
  useEffect(()=>{sv("ip8-simApt",apt);},[apt]);
  const fetchIdx=async()=>{setLoading(true);try{const r=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.27574/dados/ultimos/1?formato=json");if(r.ok){const d=await r.json();if(d[0])setIncc(d[0].valor);}const r2=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.192/dados/ultimos/1?formato=json");if(r2.ok){const d2=await r2.json();if(d2[0])setFipezap(d2[0].valor+"% (INCC-DI)");}}catch(e){console.error(e);}setLoading(false);};
  const indices=[{nome:"FIPEZAP/INCC-DI",desc:"Índice construção",valor:fipezap,fonte:"BCB 192"},{nome:"IGPM",desc:"Preços mercado",valor:RATES.igpm?fP(RATES.igpm):"—",fonte:"BCB"},{nome:"IPCA",desc:"Inflação consumidor",valor:RATES.ipca12m?fP(RATES.ipca12m):"—",fonte:"BCB"},{nome:"INCC",desc:"Construção civil",valor:incc,fonte:"BCB 27574"}];
  const set=(k,v)=>setSim(p=>({...p,[k]:v}));const[hovChart,setHovChart]=useState(null);
  const vI=Number(sim.valorImovel)||0;const fin=Number(sim.financiamento)||0;const entrada=vI-fin;
  const taxa=Number(sim.taxaJuros)||0;const n=Number(sim.prazoMeses)||360;const aluguelBase=Number(sim.aluguel)||0;
  const reajAnual=sim.reajuste==="igpm"?RATES.igpm:sim.reajuste==="ipca"?RATES.ipca12m:sim.reajuste==="fgv8"?8:Number(sim.reajustePersonalizado)||5;
  const iMes=(taxa/100)/12;const parcela=fin>0&&iMes>0?fin*(iMes*Math.pow(1+iMes,n))/(Math.pow(1+iMes,n)-1):fin>0?fin/n:0;
  const totalPago=parcela*n+entrada;const totalJuros=totalPago-vI;
  const chartPts=[];let saldoDevedor=fin;let aluguelAcum=0;let parcelaAcum=entrada;let breakEvenMes=null;
  const reajMes=Math.pow(1+reajAnual/100,1/12)-1;
  for(let m=1;m<=Math.max(n+240,480);m++){
    const jurosM=saldoDevedor*iMes;const amortM=parcela-jurosM;
    if(m<=n){saldoDevedor=Math.max(0,saldoDevedor-amortM);parcelaAcum+=parcela;}
    aluguelAcum+=aluguelBase*Math.pow(1+reajMes,m-1);
    if(!breakEvenMes&&aluguelAcum>=parcelaAcum)breakEvenMes=m;
    if(m%12===0)chartPts.push({m,parcelaAcum,aluguelAcum,diff:aluguelAcum-parcelaAcum});
    if(breakEvenMes&&m>breakEvenMes+24)break;if(m>600)break;
  }
  const maxChart=Math.max(...chartPts.map(p=>Math.max(p.parcelaAcum,p.aluguelAcum)),1);
  const W=900,H=280,pd={t:20,r:30,b:40,l:90},cW=W-pd.l-pd.r,cH=H-pd.t-pd.b;
  const xS=chartPts.length>1?cW/(chartPts.length-1):cW;const yy=v=>pd.t+cH*(1-v/maxChart);
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:8}}><div style={{fontSize:22,fontWeight:700}}>Imóveis</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button style={subImo==="simulador"?S.btnA():S.btnO} onClick={()=>setSubImo("simulador")}>🏠 Comprar vs Alugar</button><button style={subImo==="apartamento"?S.btnA():S.btnO} onClick={()=>setSubImo("apartamento")}>🏢 Apartamento Cascavel</button><button style={S.btn()} onClick={fetchIdx} disabled={loading}>{loading?"...":"⟳ Índices"}</button>{subImo==="simulador"&&<button style={S.btnO} onClick={()=>setSim(defSim)}>✕ Limpar</button>}{subImo==="apartamento"&&<button style={S.btnO} onClick={()=>setApt(DEF_APT)}>✕ Limpar</button>}</div></div>
    <div style={S.card}><div style={{fontSize:12,fontWeight:700,color:P.textDim,marginBottom:12}}>Índices Imobiliários</div><div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{indices.map(idx=>(<div key={idx.nome} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:8,padding:"10px 14px",minWidth:140}}><div style={{fontSize:11,fontWeight:700,color:P.text}}>{idx.nome}</div><div style={{fontSize:10,color:P.textMuted}}>{idx.desc}</div><div style={{fontSize:18,fontWeight:700,color:P.accent}}>{idx.valor}</div></div>))}</div></div>
    {subImo==="simulador"&&(<div>
    <div style={S.card}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Simulador: Comprar vs Alugar</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:20}}>
        <div><label style={S.lbl}>Valor do Imóvel (R$)</label><input style={S.i} type="number" step="1000" value={sim.valorImovel} onChange={e=>set("valorImovel",e.target.value)}/></div>
        <div><label style={S.lbl}>Financiamento (R$)</label><input style={S.i} type="number" step="1000" value={sim.financiamento} onChange={e=>set("financiamento",e.target.value)}/></div>
        <div><label style={S.lbl}>Entrada (R$)</label><div style={{...S.i,background:P.surfaceAlt,color:P.accent,fontWeight:700,display:"flex",alignItems:"center"}}>{fmt(entrada)}</div></div>
        <div><label style={S.lbl}>Taxa CET (% a.a.)</label><input style={S.i} type="number" step="0.1" value={sim.taxaJuros} onChange={e=>set("taxaJuros",e.target.value)}/></div>
        <div><label style={S.lbl}>Prazo (meses)</label><input style={S.i} type="number" step="12" value={sim.prazoMeses} onChange={e=>set("prazoMeses",e.target.value)}/></div>
        <div><label style={S.lbl}>Aluguel equivalente (R$/mês)</label><input style={S.i} type="number" step="100" value={sim.aluguel} onChange={e=>set("aluguel",e.target.value)}/></div>
        <div><label style={S.lbl}>Índice reajuste aluguel</label><select style={S.sel} value={sim.reajuste} onChange={e=>set("reajuste",e.target.value)}><option value="igpm">IGPM ({(RATES.igpm||3.5).toFixed(1)}% a.a.)</option><option value="ipca">IPCA ({(RATES.ipca12m||4.5).toFixed(1)}% a.a.)</option><option value="fgv8">FGV 8% a.a.</option><option value="personalizado">Personalizado</option></select></div>
        {sim.reajuste==="personalizado"&&<div><label style={S.lbl}>Reajuste (% a.a.)</label><input style={S.i} type="number" step="0.5" value={sim.reajustePersonalizado} onChange={e=>set("reajustePersonalizado",e.target.value)}/></div>}
      </div>
      {parcela>0&&(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:20}}>
        <div style={{...S.card,borderLeft:`4px solid ${P.blue}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Parcela Mensal</div><div style={{fontSize:22,fontWeight:700,color:P.blue}}>{fmt(parcela)}</div></div>
        <div style={{...S.card,borderLeft:`4px solid ${P.orange}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Total Pago (compra)</div><div style={{fontSize:18,fontWeight:700,color:P.orange}}>{fmt(totalPago)}</div><div style={{fontSize:11,color:P.textDim}}>Juros: {fmt(totalJuros)}</div></div>
        <div style={{...S.card,borderLeft:`4px solid ${P.red}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Aluguel acumulado (mesmo período)</div><div style={{fontSize:18,fontWeight:700,color:P.red}}>{fmt(chartPts[chartPts.findIndex(p=>p.m>=n)]?.aluguelAcum)}</div><div style={{fontSize:11,color:P.textDim}}>Reajuste: {reajAnual.toFixed(1)}% a.a.</div></div>
        <div style={{...S.card,borderLeft:`4px solid ${breakEvenMes?P.accent:P.orange}`,background:breakEvenMes?P.accentGlow:P.orangeDim}}>
          <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Ponto de Equilíbrio</div>
          {breakEvenMes?<><div style={{fontSize:22,fontWeight:700,color:P.accent}}>{Math.floor(breakEvenMes/12)}a {breakEvenMes%12}m</div><div style={{fontSize:10,color:P.textDim}}>Mês {breakEvenMes} — compensou comprar</div></>:<><div style={{fontSize:16,fontWeight:700,color:P.orange}}>Não atingido</div><div style={{fontSize:10,color:P.textDim}}>Em {n} meses de financiamento</div></>}
        </div>
      </div>)}
      {chartPts.length>1&&(<div>
        <div style={{display:"flex",gap:16,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,background:P.blue,borderRadius:2}}/><span style={{color:P.textDim}}>Custo total de comprar</span></div>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,background:P.red,borderRadius:2}}/><span style={{color:P.textDim}}>Custo total de alugar</span></div>
          {breakEvenMes&&<div style={{fontSize:11,color:P.accent,fontWeight:600}}>✓ Break-even no mês {breakEvenMes} ({Math.floor(breakEvenMes/12)}a {breakEvenMes%12}m)</div>}
        </div>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>setHovChart(null)}>
          {[0,0.25,0.5,0.75,1].map(p=>(<g key={p}><line x1={pd.l} y1={pd.t+cH*(1-p)} x2={W-pd.r} y2={pd.t+cH*(1-p)} stroke={P.border} strokeWidth="1"/><text x={pd.l-8} y={pd.t+cH*(1-p)+4} textAnchor="end" fontSize="9" fill={P.textMuted}>{fmt(maxChart*p)}</text></g>))}
          {chartPts.map((p,i)=>(<text key={i} x={pd.l+i*xS} y={H-8} textAnchor="middle" fontSize="8" fill={P.textMuted}>{Math.floor(p.m/12)}a</text>))}
          {breakEvenMes&&(()=>{const bi=chartPts.findIndex(p=>p.m>=breakEvenMes);if(bi<0)return null;return<line key="be" x1={pd.l+bi*xS} y1={pd.t} x2={pd.l+bi*xS} y2={pd.t+cH} stroke={P.accent} strokeWidth="2" strokeDasharray="6,3" opacity="0.8"/>})()}
          <path d={`M${pd.l},${yy(chartPts[0]?.parcelaAcum||0)} ${chartPts.map((p,i)=>`L${pd.l+i*xS},${yy(p.parcelaAcum)}`).join(" ")} L${pd.l+(chartPts.length-1)*xS},${pd.t+cH} L${pd.l},${pd.t+cH} Z`} fill={P.blue+"14"}/>
          <polyline points={chartPts.map((p,i)=>`${pd.l+i*xS},${yy(p.parcelaAcum)}`).join(" ")} fill="none" stroke={P.blue} strokeWidth="2.5" strokeLinejoin="round"/>
          <path d={`M${pd.l},${yy(chartPts[0]?.aluguelAcum||0)} ${chartPts.map((p,i)=>`L${pd.l+i*xS},${yy(p.aluguelAcum)}`).join(" ")} L${pd.l+(chartPts.length-1)*xS},${pd.t+cH} L${pd.l},${pd.t+cH} Z`} fill={P.red+"14"}/>
          <polyline points={chartPts.map((p,i)=>`${pd.l+i*xS},${yy(p.aluguelAcum)}`).join(" ")} fill="none" stroke={P.red} strokeWidth="2.5" strokeLinejoin="round"/>
          {chartPts.map((p,i)=>{const isH=hovChart===i;const cx=pd.l+i*xS;return(<g key={i}><rect x={cx-20} y={pd.t} width={40} height={cH} fill="transparent" onMouseEnter={()=>setHovChart(i)}/>{isH&&<><circle cx={cx} cy={yy(p.parcelaAcum)} r="5" fill={P.blue} stroke={P.bg} strokeWidth="2"/><circle cx={cx} cy={yy(p.aluguelAcum)} r="5" fill={P.red} stroke={P.bg} strokeWidth="2"/><rect x={Math.min(cx-65,W-pd.r-135)} y={pd.t} width={135} height={58} rx={5} fill={P.surface} stroke={P.border} strokeWidth="1"/><text x={Math.min(cx,W-pd.r-67)} y={pd.t+14} textAnchor="middle" fontSize="9" fontWeight="700" fill={P.textDim}>{Math.floor(p.m/12)} anos</text><text x={Math.min(cx,W-pd.r-67)} y={pd.t+28} textAnchor="middle" fontSize="9" fill={P.blue}>Compra: {fmt(p.parcelaAcum)}</text><text x={Math.min(cx,W-pd.r-67)} y={pd.t+42} textAnchor="middle" fontSize="9" fill={P.red}>Aluguel: {fmt(p.aluguelAcum)}</text><text x={Math.min(cx,W-pd.r-67)} y={pd.t+56} textAnchor="middle" fontSize="9" fill={p.diff>=0?P.accent:P.orange}>{p.diff>=0?"✓ "+fmt(p.diff):"Falta "+fmt(-p.diff)}</text></>}</g>);})}
        </svg>
      </div>)}
    </div>
    </div>)}
    {subImo==="apartamento"&&(()=>{
      const vA=Number(apt.valorAtual)||750000,anos=Number(apt.prazoAnos)||10,inccA=Number(apt.inccAnual)||7,rendM=Number(apt.rendMensal)||1,reserva=Number(apt.reservaAtual)||0,fgts=Number(apt.fgts)||0,aporte=Number(apt.aporteMensal)||0,itbiPct=Number(apt.itbi)||2,escrituraPct=Number(apt.escritura)||1.5,corretagemPct=Number(apt.corretagem)||6,meses=anos*12,iM=rendM/100;
      const imovelAtual=Number(apt.imovelAtual)||0,valorizImovel=Number(apt.valorizacaoImovel)||5;
      // Custo futuro do apartamento
      const custoFuturo=vA*Math.pow(1+inccA/100,anos),custoAq=custoFuturo*(1+(itbiPct+escrituraPct+corretagemPct)/100);
      // Valor futuro do imóvel atual
      const imovelFuturo=imovelAtual>0?imovelAtual*Math.pow(1+valorizImovel/100,anos):0;
      // Poupança sem vender imóvel
      const calcP=m=>{const fv=reserva*Math.pow(1+iM,m)+(aporte>0&&iM>0?aporte*(Math.pow(1+iM,m)-1)/iM:aporte*m);return fv+fgts;};
      const poupTotal=calcP(meses);
      // Cenário 1: Vende o imóvel atual + poupança
      const totalComVenda=poupTotal+imovelFuturo;
      const saldoVenda=totalComVenda-custoAq;
      // Cenário 2: Mantém imóvel + financia o novo pela Caixa
      // Caixa: entrada mínima 20% para pessoa física (SFH), juros ~10,99% a.a. (média 2026), prazo 30 anos
      const entradaCaixa=custoFuturo*0.20;const finCaixa=custoFuturo*0.80;const taxaCaixa=10.99/100/12;const prazoFinMeses=360;
      const parcelaCaixa=finCaixa*(taxaCaixa*Math.pow(1+taxaCaixa,prazoFinMeses))/(Math.pow(1+taxaCaixa,prazoFinMeses)-1);
      const totalJurosCaixa=parcelaCaixa*prazoFinMeses-finCaixa;
      // Saldo da poupança após pagar entrada
      const saldoPosEntrada=Math.max(0,poupTotal-entradaCaixa);
      const poupCobre20=poupTotal>=entradaCaixa;
      // Quantas parcelas o saldo restante quita (sem rendimento)
      const parcelasQuitadas=parcelaCaixa>0?Math.floor(saldoPosEntrada/parcelaCaixa):0;
      // Saldo residual: usando saldo + rendimento (iM/mês) para amortizar o financiamento
      // Calcular em quantos meses o saldo pós-entrada zera o financiamento
      // FV do saldo - PV das parcelas pagas = 0 → resolve numericamente
      const calcMesesQuitacao=(saldo,fin,taxa,parcela)=>{if(saldo>=fin)return 0;if(saldo<=0)return prazoFinMeses;let saldoFin=fin,saldoPoup=saldo;for(let m=1;m<=prazoFinMeses;m++){saldoPoup=saldoPoup*(1+taxa);if(saldoPoup>=saldoFin){return m;}saldoFin=saldoFin*(1+taxa)-parcela;if(saldoFin<=0)return m;}return prazoFinMeses;};
      const mesesParaQuitar=calcMesesQuitacao(saldoPosEntrada,finCaixa,iM,parcelaCaixa);
      const economiaJuros=totalJurosCaixa-(parcelaCaixa*mesesParaQuitar-finCaixa*(mesesParaQuitar<prazoFinMeses?1:0));
      // Perpetuidade: rendimento mensal do saldo cobre a parcela?
      const rendMensalSaldo=saldoPosEntrada*iM;const poupSustentaFin=rendMensalSaldo>=parcelaCaixa;
      const deficit=custoAq-poupTotal,viavel=deficit<=0;
      const aporteNec=(()=>{const fvR=(reserva+fgts)*Math.pow(1+iM,meses),alvo=custoAq-fvR;if(alvo<=0)return 0;return iM>0?alvo*iM/(Math.pow(1+iM,meses)-1):alvo/meses;})();
      const pts=[];for(let a=0;a<=Math.max(anos+5,15);a++){const p=calcP(a*12),c=vA*Math.pow(1+inccA/100,a)*(1+(itbiPct+escrituraPct+corretagemPct)/100),imFut=imovelAtual>0?imovelAtual*Math.pow(1+valorizImovel/100,a):0;pts.push({a,poup:p,custo:c,diff:p-c,totalVenda:p+imFut});}
      const beAno=pts.find(p=>p.diff>=0)?.a;const beAnoVenda=pts.find(p=>p.totalVenda>=p.custo)?.a;
      const cenarios=[{label:"Conservador",color:P.orange,inccA:8,rendM:0.8},{label:"Moderado",color:P.blue,inccA:6,rendM:1.0},{label:"Otimista",color:P.accent,inccA:5,rendM:1.2}].map(sc=>{const cf=vA*Math.pow(1+sc.inccA/100,anos)*(1+(itbiPct+escrituraPct+corretagemPct)/100),iMsc=sc.rendM/100,fvR=(reserva+fgts)*Math.pow(1+iMsc,meses),alvo=cf-fvR;return{...sc,cf,apNec:Math.max(0,alvo>0&&iMsc>0?alvo*iMsc/(Math.pow(1+iMsc,meses)-1):alvo>0?alvo/meses:0)};});
      const maxV=Math.max(...pts.map(p=>Math.max(p.poup,p.custo,p.totalVenda||0)),1);
      const W=900,H=280,pd={t:20,r:30,b:40,l:100},cW=W-pd.l-pd.r,cH=H-pd.t-pd.b,xS=pts.length>1?cW/(pts.length-1):cW,yy=v=>pd.t+cH*(1-v/maxV);
      return(<div>
        <div style={S.card}><div style={{fontSize:13,fontWeight:700,color:P.textDim,marginBottom:4}}>Cascavel/PR — Apto 100m², 1 suíte + 2 qtos, lazer, próximo ao centro</div>
          <div style={{fontSize:11,color:P.textMuted,marginBottom:16}}>Referência: Ed. Lumini, Ed. Contemporaneau (108m²), Ed. Dr. Alberto Drummond · Faixa R$ 600k–900k</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14}}>
            {[{k:"valorAtual",l:"Valor atual do apto (R$)",s:"10000"},{k:"prazoAnos",l:"Prazo (anos)",s:"1"},{k:"inccAnual",l:"INCC % a.a.",s:"0.5"},{k:"reservaAtual",l:"Reserva acumulada (R$)",s:"1000"},{k:"fgts",l:"FGTS disponível (R$)",s:"1000"},{k:"aporteMensal",l:"Aporte mensal (R$)",s:"100"},{k:"rendMensal",l:"Rendimento mensal %",s:"0.1"},{k:"itbi",l:"ITBI %",s:"0.1"},{k:"escritura",l:"Escritura+Registro %",s:"0.1"},{k:"corretagem",l:"Corretagem %",s:"0.5"}].map(f=>(<div key={f.k}><label style={S.lbl}>{f.l}</label><input style={S.i} type="number" step={f.s} value={apt[f.k]} onChange={e=>setA(f.k,e.target.value)}/></div>))}
          </div>
          <div style={{borderTop:`1px solid ${P.border}`,marginTop:16,paddingTop:16}}>
            <div style={{fontSize:12,fontWeight:700,color:P.textDim,marginBottom:12}}>🏡 Imóvel atual (para projeção de venda)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14}}>
              <div><label style={S.lbl}>Valor do imóvel atual (R$)</label><input style={S.i} type="number" step="10000" value={apt.imovelAtual} onChange={e=>setA("imovelAtual",e.target.value)}/></div>
              <div><label style={S.lbl}>Valorização anual esperada (%)</label><input style={S.i} type="number" step="0.5" value={apt.valorizacaoImovel} onChange={e=>setA("valorizacaoImovel",e.target.value)}/></div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:14,marginBottom:20}}>
          <div style={{...S.card,borderLeft:`4px solid ${P.orange}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Imóvel em {anos} anos (INCC {inccA}%)</div><div style={{fontSize:18,fontWeight:700,color:P.orange}}>{fmt(custoFuturo)}</div><div style={{fontSize:10,color:P.textDim}}>Hoje: {fmt(vA)}</div></div>
          <div style={{...S.card,borderLeft:`4px solid ${P.red}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Custo total com taxas</div><div style={{fontSize:18,fontWeight:700,color:P.red}}>{fmt(custoAq)}</div><div style={{fontSize:10,color:P.textDim}}>+{(itbiPct+escrituraPct+corretagemPct).toFixed(1)}% ({fmt(custoAq-custoFuturo)})</div></div>
          <div style={{...S.card,borderLeft:`4px solid ${P.cyan}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Poupança em {anos} anos</div><div style={{fontSize:18,fontWeight:700,color:P.cyan}}>{fmt(poupTotal)}</div><div style={{fontSize:10,color:P.textDim}}>Reserva+FGTS+Aportes · {rendM}%/mês</div></div>
          <div style={{...S.card,borderLeft:`4px solid ${viavel?P.accent:P.red}`,background:viavel?P.accentGlow:P.redDim}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>{viavel?"✓ Superávit":"⚠ Déficit"}</div><div style={{fontSize:20,fontWeight:700,color:viavel?P.accent:P.red}}>{fmt(Math.abs(deficit))}</div><div style={{fontSize:10,color:P.textDim}}>{viavel?"Objetivo em "+anos+" anos":"Falta para o objetivo"}</div></div>
          {!viavel&&<div style={{...S.card,borderLeft:`4px solid ${P.purple}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Aporte necessário ({anos}a)</div><div style={{fontSize:20,fontWeight:700,color:P.purple}}>{fmt(aporteNec)}/mês</div>{aporte>0&&<div style={{fontSize:10,color:P.orange}}>Atual: {fmt(aporte)} · Falta: {fmt(Math.max(0,aporteNec-aporte))}/mês</div>}</div>}
          {beAno!==undefined&&<div style={{...S.card,borderLeft:`4px solid ${P.accent}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Viável (só poupança)</div><div style={{fontSize:20,fontWeight:700,color:P.accent}}>Ano {beAno}</div><div style={{fontSize:10,color:P.textDim}}>{new Date().getFullYear()+beAno}</div></div>}
          {imovelAtual>0&&<div style={{...S.card,borderLeft:`4px solid ${P.yellow}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Imóvel atual em {anos} anos</div><div style={{fontSize:18,fontWeight:700,color:P.yellow}}>{fmt(imovelFuturo)}</div><div style={{fontSize:10,color:P.textDim}}>Valorização {valorizImovel}% a.a. · hoje: {fmt(imovelAtual)}</div></div>}
          {imovelAtual>0&&<div style={{...S.card,borderLeft:`4px solid ${saldoVenda>=0?P.accent:P.orange}`,background:saldoVenda>=0?P.accentGlow:P.orangeDim}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Cenário: Vende o imóvel atual</div><div style={{fontSize:18,fontWeight:700,color:saldoVenda>=0?P.accent:P.orange}}>{saldoVenda>=0?"✓ Sobra "+fmt(saldoVenda):"Falta "+fmt(-saldoVenda)}</div><div style={{fontSize:10,color:P.textDim}}>Poupança {fmt(poupTotal)} + Imóvel {fmt(imovelFuturo)}</div></div>}
          {beAnoVenda!==undefined&&imovelAtual>0&&<div style={{...S.card,borderLeft:`4px solid ${P.cyan}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Viável (vendendo imóvel)</div><div style={{fontSize:20,fontWeight:700,color:P.cyan}}>Ano {beAnoVenda}</div><div style={{fontSize:10,color:P.textDim}}>{new Date().getFullYear()+beAnoVenda}</div></div>}
        </div>
        <div style={{...S.card,padding:20,marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:P.textDim,marginBottom:10}}>Poupança vs Custo do Imóvel</div>
          <div style={{display:"flex",gap:16,marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,background:P.accent,borderRadius:2}}/><span style={{color:P.textDim}}>Poupança</span></div><div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,background:P.red,borderRadius:2}}/><span style={{color:P.textDim}}>Custo total</span></div>{imovelAtual>0&&<div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,background:P.yellow,borderRadius:2,borderStyle:"dashed"}}/><span style={{color:P.textDim}}>Poupança + Imóvel atual</span></div>}{beAno!==undefined&&<span style={{fontSize:11,color:P.accent,fontWeight:600}}>✓ Poupança: {new Date().getFullYear()+beAno}</span>}{beAnoVenda!==undefined&&imovelAtual>0&&<span style={{fontSize:11,color:P.cyan,fontWeight:600}}>✓ Com venda: {new Date().getFullYear()+beAnoVenda}</span>}</div>
          <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>setHovApt(null)}>
            {[0,0.25,0.5,0.75,1].map(p=>(<g key={p}><line x1={pd.l} y1={pd.t+cH*(1-p)} x2={W-pd.r} y2={pd.t+cH*(1-p)} stroke={P.border} strokeWidth="1"/><text x={pd.l-8} y={pd.t+cH*(1-p)+4} textAnchor="end" fontSize="9" fill={P.textMuted}>{fmt(maxV*p)}</text></g>))}
            {pts.map((p,i)=>(<text key={i} x={pd.l+i*xS} y={H-8} textAnchor="middle" fontSize="8" fill={P.textMuted}>{new Date().getFullYear()+p.a}</text>))}
            {beAno!==undefined&&(()=>{const bi=pts.findIndex(p=>p.a===beAno);return bi>=0?<line key="be" x1={pd.l+bi*xS} y1={pd.t} x2={pd.l+bi*xS} y2={pd.t+cH} stroke={P.accent} strokeWidth="2" strokeDasharray="6,3" opacity="0.8"/>:null;})()}
            {hovApt!==null&&<line x1={pd.l+hovApt*xS} y1={pd.t} x2={pd.l+hovApt*xS} y2={pd.t+cH} stroke={P.textMuted} strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>}
            <path d={`M${pd.l},${yy(pts[0]?.poup||0)} ${pts.map((p,i)=>`L${pd.l+i*xS},${yy(p.poup)}`).join(" ")} L${pd.l+(pts.length-1)*xS},${pd.t+cH} L${pd.l},${pd.t+cH} Z`} fill={P.accent+"14"}/>
            <polyline points={pts.map((p,i)=>`${pd.l+i*xS},${yy(p.poup)}`).join(" ")} fill="none" stroke={P.accent} strokeWidth="2.5" strokeLinejoin="round"/>
            <path d={`M${pd.l},${yy(pts[0]?.custo||0)} ${pts.map((p,i)=>`L${pd.l+i*xS},${yy(p.custo)}`).join(" ")} L${pd.l+(pts.length-1)*xS},${pd.t+cH} L${pd.l},${pd.t+cH} Z`} fill={P.red+"14"}/>
            <polyline points={pts.map((p,i)=>`${pd.l+i*xS},${yy(p.custo)}`).join(" ")} fill="none" stroke={P.red} strokeWidth="2.5" strokeLinejoin="round"/>
            {imovelAtual>0&&<polyline points={pts.map((p,i)=>`${pd.l+i*xS},${yy(p.totalVenda)}`).join(" ")} fill="none" stroke={P.yellow} strokeWidth="2" strokeDasharray="8,4" strokeLinejoin="round"/>}
            {pts.map((p,i)=>{const isH=hovApt===i;const cx=pd.l+i*xS;return(<g key={i}><rect x={cx-22} y={pd.t} width={44} height={cH} fill="transparent" onMouseEnter={()=>setHovApt(i)}/>{isH&&<><circle cx={cx} cy={yy(p.poup)} r="5" fill={P.accent} stroke={P.bg} strokeWidth="2"/><circle cx={cx} cy={yy(p.custo)} r="5" fill={P.red} stroke={P.bg} strokeWidth="2"/><rect x={Math.min(cx-65,W-pd.r-140)} y={pd.t} width={140} height={58} rx={5} fill={P.surface} stroke={P.border} strokeWidth="1"/><text x={Math.min(cx,W-pd.r-70)} y={pd.t+14} textAnchor="middle" fontSize="9" fontWeight="700" fill={P.textDim}>{new Date().getFullYear()+p.a}</text><text x={Math.min(cx,W-pd.r-70)} y={pd.t+28} textAnchor="middle" fontSize="9" fill={P.accent}>Poupança: {fmt(p.poup)}</text><text x={Math.min(cx,W-pd.r-70)} y={pd.t+42} textAnchor="middle" fontSize="9" fill={P.red}>Custo: {fmt(p.custo)}</text><text x={Math.min(cx,W-pd.r-70)} y={pd.t+56} textAnchor="middle" fontSize="9" fill={p.diff>=0?P.accent:P.orange}>{p.diff>=0?"✓ "+fmt(p.diff):"Falta "+fmt(-p.diff)}</text></>}</g>);})}
          </svg>
        </div>
        <div style={S.card}><div style={{fontSize:13,fontWeight:700,color:P.textDim,marginBottom:16}}>Comparativo de Cenários — Aporte para comprar em {anos} anos</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
            {cenarios.map(sc=>(<div key={sc.label} style={{background:P.surfaceAlt,border:`2px solid ${sc.color}44`,borderRadius:12,padding:"16px 18px"}}>
              <div style={{fontSize:13,fontWeight:700,color:sc.color,marginBottom:10}}>{sc.label}</div>
              <div style={{fontSize:11,display:"grid",gap:6}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>INCC</span><b>{sc.inccA}% a.a.</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>Rendimento</span><b>{sc.rendM}%/mês</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>Custo futuro</span><b>{fmt(sc.cf)}</b></div>
                <div style={{borderTop:`1px solid ${P.border}`,paddingTop:8,marginTop:4}}><div style={{fontSize:10,color:P.textMuted}}>Aporte necessário</div>
                  <div style={{fontSize:22,fontWeight:700,color:sc.color}}>{fmt(sc.apNec)}<span style={{fontSize:12}}>/mês</span></div>
                  {aporte>0&&<div style={{fontSize:10,color:sc.apNec<=aporte?P.accent:P.orange,marginTop:2}}>{sc.apNec<=aporte?"✓ Seu aporte já cobre!":"Falta "+fmt(sc.apNec-aporte)+"/mês"}</div>}
                </div>
              </div>
            </div>))}
          </div>
        </div>
        {/* Caixa Econômica Financing */}
        <div style={S.card}><div style={{fontSize:13,fontWeight:700,color:P.textDim,marginBottom:4}}>🏦 Projeção de Financiamento — Caixa Econômica Federal</div>
          <div style={{fontSize:11,color:P.textMuted,marginBottom:16}}>Modalidade SFH · Entrada mínima 20% · Taxa média ~{(10.99).toFixed(2)}% a.a. · Prazo 30 anos</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:16}}>
            <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Valor do apto em {anos} anos</div><div style={{fontSize:16,fontWeight:700,color:P.text}}>{fmt(custoFuturo)}</div></div>
            <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Entrada mínima (20%)</div><div style={{fontSize:16,fontWeight:700,color:P.orange}}>{fmt(entradaCaixa)}</div></div>
            <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Financiamento (80%)</div><div style={{fontSize:16,fontWeight:700,color:P.blue}}>{fmt(finCaixa)}</div></div>
            <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Parcela mensal estimada</div><div style={{fontSize:18,fontWeight:700,color:P.red}}>{fmt(parcelaCaixa)}</div><div style={{fontSize:10,color:P.textDim}}>10,99% a.a. / 30 anos</div></div>
            <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Total pago em 30 anos</div><div style={{fontSize:16,fontWeight:700,color:P.red}}>{fmt(parcelaCaixa*360)}</div><div style={{fontSize:10,color:P.textDim}}>Juros: {fmt(totalJurosCaixa)}</div></div>
            <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Poupança cobre entrada?</div><div style={{fontSize:16,fontWeight:700,color:poupCobre20?P.accent:P.orange}}>{poupCobre20?"✓ Sim":"✗ Não"}</div><div style={{fontSize:10,color:P.textDim}}>{poupCobre20?`Saldo após entrada: ${fmt(saldoPosEntrada)}`:`Falta ${fmt(entradaCaixa-poupTotal)}`}</div></div>
            {poupCobre20&&saldoPosEntrada>0&&<div style={{background:mesesParaQuitar<prazoFinMeses?P.accentGlow:P.orangeDim,border:`1px solid ${mesesParaQuitar<prazoFinMeses?P.accent:P.orange}44`,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:4}}>Quitação antecipada</div><div style={{fontSize:16,fontWeight:700,color:mesesParaQuitar<prazoFinMeses?P.accent:P.orange}}>{mesesParaQuitar<prazoFinMeses?`Ano ${Math.ceil(mesesParaQuitar/12)}`:"Não quita"}</div><div style={{fontSize:10,color:P.textDim}}>{mesesParaQuitar<prazoFinMeses?`${mesesParaQuitar} meses · rend. ${rendM}%/mês`:"Saldo insuficiente"}</div></div>}
          </div>
          {imovelAtual>0&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:P.surfaceAlt,border:`1px solid ${saldoVenda>=0?P.accent:P.orange}44`,borderRadius:10,padding:"16px 18px"}}>
              <div style={{fontSize:12,fontWeight:700,color:P.textDim,marginBottom:10}}>🔄 Opção 1: Vender imóvel + comprar à vista</div>
              <div style={{fontSize:11,display:"grid",gap:5}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>Poupança</span><b>{fmt(poupTotal)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>+ Imóvel atual</span><b>{fmt(imovelFuturo)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${P.border}`,paddingTop:6,marginTop:2}}><span style={{color:P.textMuted}}>Total disponível</span><b>{fmt(totalComVenda)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>Custo aquisição</span><b>{fmt(custoAq)}</b></div>
                <div style={{fontSize:16,fontWeight:700,color:saldoVenda>=0?P.accent:P.orange,marginTop:4,textAlign:"center"}}>{saldoVenda>=0?"✓ Sobra "+fmt(saldoVenda):"⚠ Falta "+fmt(-saldoVenda)}</div>
              </div>
            </div>
            <div style={{background:P.surfaceAlt,border:`1px solid ${P.blue}44`,borderRadius:10,padding:"16px 18px"}}>
              <div style={{fontSize:12,fontWeight:700,color:P.textDim,marginBottom:10}}>🏠 Opção 2: Manter imóvel + Financiar pela Caixa</div>
              <div style={{fontSize:11,display:"grid",gap:5}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>Poupança total</span><b>{fmt(poupTotal)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>- Entrada (20%)</span><b style={{color:P.orange}}>- {fmt(entradaCaixa)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${P.border}`,paddingTop:5,marginTop:2}}><span style={{color:P.textMuted}}>Saldo após entrada</span><b style={{color:poupCobre20?P.accent:P.red}}>{fmt(saldoPosEntrada)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>Parcela mensal</span><b style={{color:P.red}}>{fmt(parcelaCaixa)}</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>Parcelas quitadas (sem rend.)</span><b>{parcelasQuitadas} meses</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>Quitação total (com rend. {rendM}%)</span><b style={{color:mesesParaQuitar<prazoFinMeses?P.accent:P.orange}}>{mesesParaQuitar<prazoFinMeses?mesesParaQuitar+"m ("+Math.round(mesesParaQuitar/12*10)/10+"a)":"Não quita"}</b></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:P.textMuted}}>Mantém imóvel atual</span><b style={{color:P.yellow}}>{fmt(imovelFuturo)}</b></div>
                <div style={{marginTop:6,padding:"8px 10px",borderRadius:6,background:poupSustentaFin?P.accentGlow:mesesParaQuitar<prazoFinMeses?P.blueDim:P.orangeDim}}>
                  {poupSustentaFin?<div style={{fontSize:11,fontWeight:700,color:P.accent}}>✓ Rendimento da poupança ({fmt(rendMensalSaldo)}/mês) cobre a parcela indefinidamente!</div>
                  :mesesParaQuitar<prazoFinMeses?<div style={{fontSize:11,fontWeight:700,color:P.blue}}>✓ Quitação antecipada em {Math.ceil(mesesParaQuitar/12)} anos</div>
                  :<div style={{fontSize:11,fontWeight:700,color:P.orange}}>⚠ Poupança {poupCobre20?"insuficiente para quitar":"insuficiente para a entrada"}</div>}
                </div>
              </div>
            </div>
          </div>)}
        </div>
      </div>);
    })()}
  </div>);
}

/* COMPARAÇÃO: Imóvel vs Investimento */
function CompTab(){const P=useT();const S=useS();
  const[valorImovel,setValorImovel]=useState("500000");
  const[aluguel,setAluguel]=useState("2500");
  const[valoracao,setValoracao]=useState("0.3");
  const[iptu,setIptu]=useState("300");
  const[iptuLocatario,setIptuLocatario]=useState(false);
  const[manutencao,setManutencao]=useState("200");
  const[taxaInv,setTaxaInv]=useState("1.0");
  const[meses,setMeses]=useState("120");
  
  const vi=Number(valorImovel)||0,al=Number(aluguel)||0,va=Number(valoracao)||0;
  const iptuVal=iptuLocatario?0:(Number(iptu)||0);
  const man=Number(manutencao)||0,tx=Number(taxaInv)||0,m=Number(meses)||60;
  
  const rows=[];
  let patInv=vi,patImo=vi;
  for(let i=1;i<=m;i++){
    // Investimento: cresce pela taxa mensal
    const rendInv=patInv*(tx/100);
    patInv+=rendInv;
    // Imóvel: aluguel - iptu - manutenção + valorização
    const rendImo=al-iptuVal-man;
    patImo=patImo*(1+va/100/12);
    const isAno=i%12===0;
    rows.push({mes:i,patInv,rendInv,patImo,rendImo:rendImo*i,totalImo:patImo+rendImo*i,isAno});
  }
  
  return(<div>
    <div style={{fontSize:22,fontWeight:700,marginBottom:28}}>Comparação: Imóvel vs Investimento</div>
    <div style={S.card}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:20}}>
        <div><label style={S.lbl}>Valor do Imóvel</label><input style={S.i} type="number" value={valorImovel} onChange={e=>setValorImovel(e.target.value)}/></div>
        <div><label style={S.lbl}>Aluguel Mensal</label><input style={S.i} type="number" value={aluguel} onChange={e=>setAluguel(e.target.value)}/></div>
        <div><label style={S.lbl}>Valorização a.a. (%)</label><input style={S.i} type="number" step="0.1" value={valoracao} onChange={e=>setValoracao(e.target.value)}/></div>
        <div><label style={S.lbl}>IPTU Mensal</label><input style={{...S.i,opacity:iptuLocatario?0.5:1}} type="number" value={iptu} onChange={e=>setIptu(e.target.value)} disabled={iptuLocatario}/><label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:P.textDim,marginTop:6,cursor:"pointer"}}><input type="checkbox" checked={iptuLocatario} onChange={e=>setIptuLocatario(e.target.checked)}/>A cargo do locatário</label></div>
        <div><label style={S.lbl}>Manutenção Mensal</label><input style={S.i} type="number" value={manutencao} onChange={e=>setManutencao(e.target.value)}/></div>
        <div><label style={S.lbl}>Taxa Inv. Mensal (%)</label><input style={S.i} type="number" step="0.01" value={taxaInv} onChange={e=>setTaxaInv(e.target.value)}/></div>
        <div><label style={S.lbl}>Prazo (meses)</label><input style={S.i} type="number" value={meses} onChange={e=>setMeses(e.target.value)}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
        <SC label="Investimento Final" value={fmt(rows.length>0?rows[rows.length-1].patInv:0)} color={P.accent} dim={P.accentGlow}/>
        <SC label="Imóvel + Aluguéis" value={fmt(rows.length>0?rows[rows.length-1].totalImo:0)} color={P.blue} dim={P.blueDim}/>
        <SC label={rows.length>0&&rows[rows.length-1].patInv>rows[rows.length-1].totalImo?"Investimento vence":"Imóvel vence"} value={fmt(Math.abs((rows.length>0?rows[rows.length-1].patInv:0)-(rows.length>0?rows[rows.length-1].totalImo:0)))} color={rows.length>0&&rows[rows.length-1].patInv>rows[rows.length-1].totalImo?P.accent:P.blue} dim={rows.length>0&&rows[rows.length-1].patInv>rows[rows.length-1].totalImo?P.accentGlow:P.blueDim}/>
      </div>
    </div>
    {rows.length>0&&(<div style={{...S.card,padding:0,overflowX:"auto",maxHeight:500,overflowY:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead style={{position:"sticky",top:0,background:P.thBg||P.surface,zIndex:2}}><tr><th style={S.th}>Mês</th><th style={S.th}>Investimento</th><th style={S.th}>Rend. Inv.</th><th style={S.th}>Imóvel (valor)</th><th style={S.th}>Aluguéis Acum.</th><th style={S.th}>Imóvel Total</th><th style={S.th}>Diferença</th></tr></thead>
        <tbody>{rows.map(r=>{const diff=r.patInv-r.totalImo;return(<tr key={r.mes} style={{fontWeight:r.isAno?700:400,background:r.isAno?P.accentGlow:"transparent"}}><td style={S.td}>{r.mes}{r.isAno?` (${r.mes/12}a)`:""}</td><td style={{...S.td,color:P.accent}}>{fmt(r.patInv)}</td><td style={S.td}>{fmt(r.rendInv)}</td><td style={{...S.td,color:P.blue}}>{fmt(r.patImo)}</td><td style={S.td}>{fmt(r.rendImo)}</td><td style={{...S.td,color:P.blue}}>{fmt(r.totalImo)}</td><td style={{...S.td,color:diff>0?P.accent:P.red,fontWeight:600}}>{diff>0?"+":""}{fmt(diff)}</td></tr>);})}</tbody>
      </table>
    </div>)}
  </div>);
}

/* PROJEÇÕES — Aposentadoria Antecipada */
function ProjecoesTab({tG,tRM,retPct,orc,sim,setSim,defSim}){const P=useT();const S=useS();
  const idadeAtual=sim?.idadeAtual??"40";const setIdadeAtual=v=>setSim(p=>({...p,idadeAtual:v}));
  const idadeApos=sim?.idadeApos??"55";const setIdadeApos=v=>setSim(p=>({...p,idadeApos:v}));
  const aporteMensal=sim?.aporteMensal??"";const setAporteMensal=v=>setSim(p=>({...p,aporteMensal:v}));
  const ipca=sim?.ipca??String(RATES.ipca12m||4.5);const setIpca=v=>setSim(p=>({...p,ipca:v}));
  const inflSaude=sim?.inflSaude??"12";const setInflSaude=v=>setSim(p=>({...p,inflSaude:v}));
  const[hovGraf,setHovGraf]=useState(null);

  // Get gastos fixos from last month with data
  const allOrcM=[...new Set((orc||[]).filter(i=>i.data).map(i=>i.data.slice(0,7)))].sort();
  const lastM=allOrcM[allOrcM.length-1]||"";
  const orcLastM=(orc||[]).filter(i=>i.data&&i.data.startsWith(lastM));
  const gastosFixosBase=orcLastM.filter(i=>i.tipo!=="Receita"&&i.fixo).reduce((a,i)=>a+(Number(i.valor)||0),0);
  const saudeBase=orcLastM.filter(i=>i.tipo!=="Receita"&&(i.categoria||"").toLowerCase().includes("unimed")).reduce((a,i)=>a+(Number(i.valor)||0),0);

  const ia=Number(idadeAtual)||0;const iap=Number(idadeApos)||0;const anos=Math.max(0,iap-ia);const meses=anos*12;
  const ap=Number(aporteMensal)||0;const infl=Number(ipca)||4.5;
  const retNom=(retPct||0);// taxa mensal nominal da carteira atual
  const retReal=Math.max(0,((1+retNom/100)/(1+infl/100/12)-1)*100);// taxa real mensal
  const retAnualNom=retNom*12;const retAnualReal=retReal*12;

  // Patrimônio projetado: carteira atual + aportes durante o período
  const patrimonioAtual=tG||0;
  // FV = PV*(1+r)^n + PMT*((1+r)^n-1)/r
  const calcFV=(pv,pmt,rMes,n)=>{if(n<=0)return pv;const f=Math.pow(1+rMes/100,n);return pv*f+pmt*(f-1)/(rMes/100);};
  const pvNom=calcFV(patrimonioAtual,ap,retNom,meses);
  const pvReal=pvNom/Math.pow(1+infl/100/12,meses);// deflacionar para hoje

  // Renda mensal futura: patrimônio × taxa real mensal (perpetuidade)
  const rendaMensalNomFutura=pvNom*(retNom/100);
  const rendaMensalRealFutura=pvReal*(retReal/100);
  const poderCompraHoje=rendaMensalNomFutura/Math.pow(1+infl/100/12,meses);

  // Sugestão de correção do aporte: aporte cresce com IPCA anual
  const aporteCorrigidoFinal=ap*Math.pow(1+infl/100,anos);

  // Qual aporte necessário para atingir determinada renda real?
  const rendaMeta=tRM*2||5000;// exemplo: 2x a renda atual ou R$ 5k
  const calcAporteNecessario=(meta)=>{const pvNecessario=meta/(retReal/100);const extra=Math.max(0,pvNecessario-patrimonioAtual*Math.pow(1+retNom/100,meses));return meses>0?extra*(retNom/100)/(Math.pow(1+retNom/100,meses)-1):pvNecessario;};
  const aporteParaMeta=calcAporteNecessario(rendaMeta);

  // Gastos fixos futuros (corrigidos pelo IPCA)
  const gastosFixosFuturos=gastosFixosBase*Math.pow(1+infl/100,anos);
  const coberturaPct=rendaMensalNomFutura>0&&gastosFixosFuturos>0?Math.min(999,(rendaMensalNomFutura/gastosFixosFuturos)*100):0;
  const coberturaReal=poderCompraHoje>0&&gastosFixosBase>0?Math.min(999,(poderCompraHoje/gastosFixosBase)*100):0;

  // Plano de saúde futuro
  const saudeFuturo=saudeBase*Math.pow(1+Number(inflSaude)/100,anos);
  // ANS teto histórico ~9%, mas valor real costuma ser ~12%
  const saudeFuturoConservador=saudeBase*Math.pow(1+9/100,anos);

  // Chart: patrimônio ao longo do tempo (a cada 12 meses)
  const chartPts=[];for(let m=0;m<=meses;m+=12){chartPts.push({m,nom:calcFV(patrimonioAtual,ap,retNom,m),real:calcFV(patrimonioAtual,ap,retNom,m)/Math.pow(1+infl/100/12,m)});}
  const maxPat=Math.max(...chartPts.map(p=>p.nom),1);
  const W=900,H=280,pd={t:20,r:30,b:40,l:90},cW=W-pd.l-pd.r,cH=H-pd.t-pd.b;
  const xS=chartPts.length>1?cW/(chartPts.length-1):cW;
  const yy=v=>pd.t+cH*(1-v/maxPat);

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><div style={{fontSize:22,fontWeight:700}}>Projeção — Aposentadoria Antecipada</div><button style={S.btnO} onClick={()=>setSim(defSim)}>✕ Limpar</button></div>
    {/* Inputs */}
    <div style={S.card}>
      <div style={{fontSize:13,fontWeight:700,color:P.textDim,marginBottom:16}}>Parâmetros</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
        <div><label style={S.lbl}>Idade Atual (anos)</label><input style={S.i} type="number" min="1" max="99" value={idadeAtual} onChange={e=>setIdadeAtual(e.target.value)}/></div>
        <div><label style={S.lbl}>Idade Aposentadoria</label><input style={S.i} type="number" min="1" max="99" value={idadeApos} onChange={e=>setIdadeApos(e.target.value)}/></div>
        <div><label style={S.lbl}>Aporte Mensal (R$)</label><input style={S.i} type="number" step="100" value={aporteMensal} onChange={e=>setAporteMensal(e.target.value)}/></div>
        <div><label style={S.lbl}>IPCA Esperado (% a.a.)</label><input style={S.i} type="number" step="0.1" value={ipca} onChange={e=>setIpca(e.target.value)}/></div>
        <div><label style={S.lbl}>Inflação Saúde (% a.a.)</label><input style={S.i} type="number" step="0.5" value={inflSaude} onChange={e=>setInflSaude(e.target.value)}/></div>
      </div>
    </div>

    {anos>0&&retNom>0&&(<div>
      {/* Summary cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:20}}>
        <div style={{...S.card,borderLeft:`4px solid ${P.blue}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Tempo de Contribuição</div><div style={{fontSize:22,fontWeight:700,color:P.blue}}>{anos} anos</div><div style={{fontSize:11,color:P.textDim}}>{meses} meses</div></div>
        <div style={{...S.card,borderLeft:`4px solid ${P.accent}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Patrimônio Nominal</div><div style={{fontSize:20,fontWeight:700,color:P.accent}}>{fmt(pvNom)}</div><div style={{fontSize:11,color:P.textDim}}>em valores de {new Date().getFullYear()+anos}</div></div>
        <div style={{...S.card,borderLeft:`4px solid ${P.cyan}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Patrimônio Real (hoje)</div><div style={{fontSize:20,fontWeight:700,color:P.cyan}}>{fmt(pvReal)}</div><div style={{fontSize:11,color:P.textDim}}>poder de compra atual</div></div>
        <div style={{...S.card,borderLeft:`4px solid ${P.yellow}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Taxa Real Mensal</div><div style={{fontSize:20,fontWeight:700,color:P.yellow}}>{retReal.toFixed(4)}%</div><div style={{fontSize:11,color:P.textDim}}>{retAnualReal.toFixed(2)}% a.a. real</div></div>
        <div style={{...S.card,borderLeft:`4px solid ${P.purple}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Renda Mensal Nominal</div><div style={{fontSize:20,fontWeight:700,color:P.purple}}>{fmt(rendaMensalNomFutura)}</div><div style={{fontSize:11,color:P.textDim}}>em {new Date().getFullYear()+anos}</div></div>
        <div style={{...S.card,borderLeft:`4px solid ${P.orange}`}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Poder de Compra Hoje</div><div style={{fontSize:20,fontWeight:700,color:P.orange}}>{fmt(poderCompraHoje)}</div><div style={{fontSize:11,color:P.textDim}}>equivalente hoje</div></div>
      </div>

      {/* Projection chart */}
      <div style={{...S.card,padding:24,marginBottom:20}}>
        <div style={{display:"flex",gap:16,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,background:P.accent,borderRadius:2}}/><span style={{color:P.textDim}}>Nominal</span></div>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11}}><div style={{width:14,height:3,borderRadius:2,background:P.cyan,opacity:0.7}}/><span style={{color:P.textDim}}>Real (em valores de hoje)</span></div>
        </div>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>setHovGraf(null)}>
          {[0,0.25,0.5,0.75,1].map(p=>(<g key={p}><line x1={pd.l} y1={pd.t+cH*(1-p)} x2={W-pd.r} y2={pd.t+cH*(1-p)} stroke={P.border} strokeWidth="1"/><text x={pd.l-8} y={pd.t+cH*(1-p)+4} textAnchor="end" fontSize="9" fill={P.textMuted}>{fmt(maxPat*p)}</text></g>))}
          {chartPts.map((p,i)=>(<text key={i} x={pd.l+i*xS} y={H-8} textAnchor="middle" fontSize="8" fill={P.textMuted}>{ia+p.m/12}a</text>))}
          {hovGraf!==null&&<line x1={pd.l+hovGraf*xS} y1={pd.t} x2={pd.l+hovGraf*xS} y2={pd.t+cH} stroke={P.textMuted} strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>}
          {/* Area fills */}
          <path d={`M${pd.l},${yy(chartPts[0]?.nom||0)} ${chartPts.map((p,i)=>`L${pd.l+i*xS},${yy(p.nom)}`).join(" ")} L${pd.l+(chartPts.length-1)*xS},${pd.t+cH} L${pd.l},${pd.t+cH} Z`} fill={P.accent+"18"} stroke="none"/>
          <polyline points={chartPts.map((p,i)=>`${pd.l+i*xS},${yy(p.nom)}`).join(" ")} fill="none" stroke={P.accent} strokeWidth="2.5" strokeLinejoin="round"/>
          <polyline points={chartPts.map((p,i)=>`${pd.l+i*xS},${yy(p.real)}`).join(" ")} fill="none" stroke={P.cyan} strokeWidth="2" strokeDasharray="6,3" strokeLinejoin="round"/>
          {chartPts.map((p,i)=>{const isH=hovGraf===i;const cx=pd.l+i*xS;return(<g key={i}><rect x={cx-20} y={pd.t} width={40} height={cH} fill="transparent" onMouseEnter={()=>setHovGraf(i)}/>{isH&&<><circle cx={cx} cy={yy(p.nom)} r="5" fill={P.accent} stroke={P.bg} strokeWidth="2"/><circle cx={cx} cy={yy(p.real)} r="5" fill={P.cyan} stroke={P.bg} strokeWidth="2"/><rect x={cx-70} y={pd.t} width={140} height={48} rx={5} fill={P.surface} stroke={P.border} strokeWidth="1"/><text x={cx} y={pd.t+14} textAnchor="middle" fontSize="9" fontWeight="700" fill={P.textDim}>Aos {ia+p.m/12} anos</text><text x={cx} y={pd.t+27} textAnchor="middle" fontSize="9" fill={P.accent}>Nom: {fmt(p.nom)}</text><text x={cx} y={pd.t+40} textAnchor="middle" fontSize="9" fill={P.cyan}>Real: {fmt(p.real)}</text></>}</g>);})}
        </svg>
      </div>

      {/* Recommendations */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {ap>0&&(<div style={{...S.card,background:`${P.accentGlow}`,border:`1px solid ${P.accent}44`}}>
          <div style={{fontSize:13,fontWeight:700,color:P.accent,marginBottom:12}}>💡 Sugestão: Correção do Aporte pelo IPCA</div>
          <div style={{fontSize:12,color:P.textDim,marginBottom:12}}>Para manter o poder de compra dos seus aportes, recomenda-se corrigi-los anualmente pelo IPCA ({ipca}% a.a.).</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><div style={{fontSize:10,color:P.textMuted}}>Aporte hoje</div><div style={{fontSize:16,fontWeight:700}}>{fmt(ap)}/mês</div></div>
            <div><div style={{fontSize:10,color:P.textMuted}}>Aporte em {anos} anos</div><div style={{fontSize:16,fontWeight:700,color:P.accent}}>{fmt(aporteCorrigidoFinal)}/mês</div></div>
          </div>
          <div style={{marginTop:12,fontSize:11,color:P.textDim}}>Aumento acumulado: {fmt(aporteCorrigidoFinal-ap)} (+{(((aporteCorrigidoFinal/ap)-1)*100).toFixed(0)}%)</div>
        </div>)}
        <div style={{...S.card,background:`${P.blueDim}`,border:`1px solid ${P.blue}44`}}>
          <div style={{fontSize:13,fontWeight:700,color:P.blue,marginBottom:12}}>📊 Aporte para Renda de {fmt(rendaMeta)}/mês real</div>
          <div style={{fontSize:12,color:P.textDim,marginBottom:12}}>Para atingir poder de compra de {fmt(rendaMeta)}/mês (valor de hoje) na aposentadoria:</div>
          <div><div style={{fontSize:10,color:P.textMuted}}>Aporte mensal necessário</div><div style={{fontSize:22,fontWeight:700,color:aporteParaMeta<=ap&&ap>0?P.accent:P.blue}}>{fmt(aporteParaMeta)}/mês</div></div>
          {ap>0&&aporteParaMeta>ap&&<div style={{marginTop:8,fontSize:11,color:P.orange}}>⚠ Faltam {fmt(aporteParaMeta-ap)}/mês para atingir essa meta</div>}
          {ap>0&&aporteParaMeta<=ap&&<div style={{marginTop:8,fontSize:11,color:P.accent}}>✓ Seu aporte atual já cobre essa meta!</div>}
        </div>
      </div>

      {/* Gastos fixos + saúde */}
      {gastosFixosBase>0&&(<div style={{...S.card,marginTop:4}}>
        <div style={{fontSize:13,fontWeight:700,color:P.textDim,marginBottom:4}}>Gastos fixos e saúde no futuro</div>
        <div style={{fontSize:11,color:P.textMuted,marginBottom:16}}>Base: {mL(lastM)} · Gastos fixos: {fmt(gastosFixosBase)}/mês{saudeBase>0?` · Saúde (Unimed): ${fmt(saudeBase)}/mês`:""}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:20}}>
          <div style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:"14px 18px"}}>
            <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Gastos Fixos em {new Date().getFullYear()+anos}</div>
            <div style={{fontSize:20,fontWeight:700,color:P.orange}}>{fmt(gastosFixosFuturos)}/mês</div>
            <div style={{fontSize:11,color:P.textDim,marginTop:4}}>Hoje: {fmt(gastosFixosBase)}/mês (+{((gastosFixosFuturos/gastosFixosBase-1)*100).toFixed(0)}%)</div>
          </div>
          <div style={{background:P.surfaceAlt,border:`1px solid ${coberturaPct>=100?P.accent:P.red}44`,borderRadius:10,padding:"14px 18px"}}>
            <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Cobertura pelo Rendimento Nominal</div>
            <div style={{fontSize:24,fontWeight:700,color:coberturaPct>=100?P.accent:P.red}}>{coberturaPct.toFixed(1)}%</div>
            <div style={{fontSize:11,color:P.textDim,marginTop:4}}>{coberturaPct>=100?"✓ Renda cobre os fixos":"⚠ Renda não cobre os fixos"}</div>
          </div>
          <div style={{background:P.surfaceAlt,border:`1px solid ${coberturaReal>=100?P.cyan:P.yellow}44`,borderRadius:10,padding:"14px 18px"}}>
            <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Cobertura pelo Poder de Compra Real</div>
            <div style={{fontSize:24,fontWeight:700,color:coberturaReal>=100?P.cyan:P.yellow}}>{coberturaReal.toFixed(1)}%</div>
            <div style={{fontSize:11,color:P.textDim,marginTop:4}}>Renda real vs gastos fixos hoje</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:P.textDim}}>Cobertura nominal dos gastos fixos</span><span style={{fontWeight:600,color:coberturaPct>=100?P.accent:P.red}}>{coberturaPct.toFixed(1)}%</span></div>
          <div style={{height:10,background:P.surfaceAlt,borderRadius:5,overflow:"hidden"}}><div style={{width:`${Math.min(100,coberturaPct)}%`,height:"100%",background:coberturaPct>=100?P.accent:P.red,borderRadius:5,transition:"width 0.5s ease"}}/></div>
        </div>
        {saudeBase>0&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{background:P.surfaceAlt,border:`1px solid ${P.red}44`,borderRadius:10,padding:"14px 18px"}}>
            <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Plano de Saúde — Cenário Realista ({inflSaude}% a.a.)</div>
            <div style={{fontSize:20,fontWeight:700,color:P.red}}>{fmt(saudeFuturo)}/mês</div>
            <div style={{fontSize:11,color:P.textDim,marginTop:4}}>Hoje: {fmt(saudeBase)}/mês · Em {anos} anos: +{(((saudeFuturo/saudeBase)-1)*100).toFixed(0)}%</div>
          </div>
          <div style={{background:P.surfaceAlt,border:`1px solid ${P.orange}44`,borderRadius:10,padding:"14px 18px"}}>
            <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Plano de Saúde — Cenário Conservador (9% a.a./ANS)</div>
            <div style={{fontSize:20,fontWeight:700,color:P.orange}}>{fmt(saudeFuturoConservador)}/mês</div>
            <div style={{fontSize:11,color:P.textDim,marginTop:4}}>Hoje: {fmt(saudeBase)}/mês · Em {anos} anos: +{(((saudeFuturoConservador/saudeBase)-1)*100).toFixed(0)}%</div>
          </div>
        </div>)}
      </div>)}
    </div>)}
    {(anos<=0||retNom<=0)&&(<div style={{...S.card,textAlign:"center",padding:60,color:P.textMuted}}>
      <div style={{fontSize:36,marginBottom:12}}>🎯</div>
      <div>{retNom<=0?"Registre investimentos no app para calcular a taxa de retorno atual.":"Preencha sua idade atual e a idade desejada de aposentadoria."}</div>
    </div>)}
  </div>);
}

/* DASHBOARD with pie charts */
function Dash({rf,inco,ac,etfs,fiis,cr,indices,orc,cotCr,crBase,setCrBase,fxUsd}){const P=useT();const S=useS();
  const[hovEvo,setHovEvo]=useState(null);
  const[dashMes,setDashMes]=useState(()=>`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`);
  const[hovCat,setHovCat]=useState(null);
  const dashMesPrev=()=>{const[y,m]=dashMes.split("-").map(Number);const d=new Date(y,m-2,1);setDashMes(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);};
  const dashMesNext=()=>{const[y,m]=dashMes.split("-").map(Number);const d=new Date(y,m,1);setDashMes(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);};
  const tRF=rf.reduce((a,i)=>a+(Number(i.valor)||0),0);const rfE=rf.map(i=>({...i,...calcRF(i)}));const mRF=rfE.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const tIN=inco.reduce((a,i)=>a+(Number(i.valor)||0),0);const inE=inco.map(i=>({...i,...calcINCO(i)}));const mIN=inE.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const tAc=ac.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0);
  const tEt=etfs.reduce((a,i)=>a+etfCustoBRL(i,fxUsd),0);
  const tFi=fiis.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0),dFi=fiis.reduce((a,i)=>a+(Number(i.dividendoMensal)||0),0);
  const tCr=crPatrimonio(cr,cotCr,crBase);const tG=tRF+tIN+tAc+tEt+tFi+tCr;const tRM=mRF+mIN+dFi;
  const retPct=tG>0?((tRM/tG)*100):0;
  const smIdx=indices.find(i=>i.nome==="Sal.Mínimo");const salMin=smIdx&&smIdx.valor?Number(smIdx.valor):1518;const smRatio=salMin>0?(tRM/salMin):0;
  const patD=[{label:"RF",value:tRF,color:P.blue},{label:"INCO",value:tIN,color:P.cyan},{label:"Ações",value:tAc,color:P.yellow},{label:"ETFs",value:tEt,color:"#0891b2"},{label:"FIIs",value:tFi,color:P.purple},{label:"Cripto",value:tCr,color:P.orange}];
  const renD=[{label:"RF",value:mRF,color:P.blue},{label:"INCO",value:mIN,color:P.cyan},{label:"FIIs",value:dFi,color:P.purple}];

  // Orçamento evolution data (last 12 months)
  const allOrcM=[...new Set(orc.filter(i=>i.data).map(i=>i.data.slice(0,7)))].sort().slice(-12);
  const orcEvo=allOrcM.map(m=>{const fl=orc.filter(i=>i.data&&i.data.startsWith(m));return{m,rec:fl.filter(i=>i.tipo==="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0),desp:fl.filter(i=>i.tipo!=="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0)};});
  // Selected month categories (reactive to dashMes)
  const orcMes=orc.filter(i=>i.data&&i.data.startsWith(dashMes));
  const recMes=orcMes.filter(i=>i.tipo==="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0);
  const despMes=orcMes.filter(i=>i.tipo!=="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0);
  const saldoMes=recMes-despMes;
  const byCat={};orcMes.filter(i=>i.tipo!=="Receita").forEach(i=>{byCat[i.categoria||"Outros"]=(byCat[i.categoria||"Outros"]||0)+(Number(i.valor)||0);});
  const catSorted=Object.entries(byCat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const gastosFixos=orcMes.filter(i=>i.tipo!=="Receita"&&i.fixo).reduce((a,i)=>a+(Number(i.valor)||0),0);
  const cobertura=gastosFixos>0?((tRM/gastosFixos)*100):0;
  const cobPct=recMes>0?Math.min(100,Math.round((despMes/recMes)*100)):0;
  // CLT calc
  const calcBrutoCLT=(netTarget)=>{if(netTarget<=0)return 0;let lo=netTarget,hi=netTarget*3;for(let i=0;i<50;i++){const mid=(lo+hi)/2;const inss=Math.min(mid*0.14,908.85);const base=mid-inss;const tributavel=Math.max(0,base-5000);const irrf=tributavel>0?tributavel*0.275:0;const net=mid-inss-irrf;if(net<netTarget)lo=mid;else hi=mid;}return(lo+hi)/2;};
  const salBrutoEquiv=tRM>0?calcBrutoCLT(tRM):0;

  // Area chart dimensions
  const W=560,H=220,pd={t:20,r:20,b:30,l:65};
  const cW=W-pd.l-pd.r,cH=H-pd.t-pd.b;
  const maxEvo=Math.max(...orcEvo.map(p=>Math.max(p.rec,p.desp)),1);
  const xS=orcEvo.length>1?cW/(orcEvo.length-1):cW;
  const yy=v=>pd.t+cH*(1-v/maxEvo);

  return(<div>
    {/* Top bar: Month navigator + Receitas / Despesas / Saldo */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{fontSize:22,fontWeight:700}}>Dashboard</div>
        <div style={{display:"flex",alignItems:"center",gap:4,background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"4px 6px"}}>
          <button onClick={dashMesPrev} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:16,color:P.textDim,padding:"2px 8px",borderRadius:4,fontFamily:"inherit"}} onMouseOver={e=>e.target.style.background=P.hover} onMouseOut={e=>e.target.style.background="transparent"}>◀</button>
          <span style={{fontSize:13,fontWeight:600,color:P.text,minWidth:90,textAlign:"center"}}>{mL(dashMes)}</span>
          <button onClick={dashMesNext} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:16,color:P.textDim,padding:"2px 8px",borderRadius:4,fontFamily:"inherit"}} onMouseOver={e=>e.target.style.background=P.hover} onMouseOut={e=>e.target.style.background="transparent"}>▶</button>
        </div>
      </div>
      <div style={{display:"flex",gap:20,fontSize:14}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:P.accent}}>↑</span><span key={dashMes+"r"} className="num-pop" style={{fontWeight:700}}>{fmt(recMes)}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:P.red}}>↓</span><span key={dashMes+"d"} className="num-pop" style={{fontWeight:700}}>{fmt(despMes)}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:P.blue}}>≈</span><span key={dashMes+"s"} className="num-pop" style={{fontWeight:700,color:saldoMes>=0?P.accent:P.red}}>{fmt(saldoMes)}</span></div>
      </div>
    </div>

    {/* Hero cards row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:20}}>
      <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:12,padding:"18px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Valor Investido</div><div style={{fontSize:22,fontWeight:700,color:P.text}}>{fmt(tG)}</div></div>
      <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:12,padding:"18px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Renda Mensal</div><div style={{fontSize:22,fontWeight:700,color:P.accent}}>{fmt(tRM)}</div></div>
      <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:12,padding:"18px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Retorno Mensal</div><div style={{fontSize:22,fontWeight:700,color:P.cyan}}>{fP(retPct)}</div></div>
      <div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:12,padding:"18px 16px"}}><div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",color:P.textMuted,marginBottom:6}}>Equiv. CLT Bruto</div><div style={{fontSize:22,fontWeight:700,color:P.purple}}>{salBrutoEquiv>0?fmt(salBrutoEquiv):"—"}</div></div>
    </div>

    {/* Main grid: Area chart + Category bars + Donut */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      {/* Area chart: Receitas e Despesas */}
      <div style={{...S.card,padding:20}}>
        <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>Receitas e Despesas</div>
        {orcEvo.length>1?(<svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>setHovEvo(null)}>
          {[0,0.25,0.5,0.75,1].map(p=>(<g key={p}><line x1={pd.l} y1={yy(maxEvo*p)} x2={W-pd.r} y2={yy(maxEvo*p)} stroke={P.border} strokeWidth="1"/><text x={pd.l-6} y={yy(maxEvo*p)+4} textAnchor="end" fontSize="8" fill={P.textMuted}>{fmt(maxEvo*p)}</text></g>))}
          {orcEvo.map((p,i)=>(<text key={i} x={pd.l+i*xS} y={H-6} textAnchor="middle" fontSize="8" fill={P.textMuted}>{mL(p.m)}</text>))}
          {/* Receita area fill */}
          <path d={`M${pd.l},${yy(orcEvo[0]?.rec||0)} ${orcEvo.map((p,i)=>`L${pd.l+i*xS},${yy(p.rec)}`).join(" ")} L${pd.l+(orcEvo.length-1)*xS},${pd.t+cH} L${pd.l},${pd.t+cH} Z`} fill={P.accent+"18"} stroke="none"/>
          <polyline points={orcEvo.map((p,i)=>`${pd.l+i*xS},${yy(p.rec)}`).join(" ")} fill="none" stroke={P.accent} strokeWidth="2.5"/>
          {/* Despesa area fill */}
          <path d={`M${pd.l},${yy(orcEvo[0]?.desp||0)} ${orcEvo.map((p,i)=>`L${pd.l+i*xS},${yy(p.desp)}`).join(" ")} L${pd.l+(orcEvo.length-1)*xS},${pd.t+cH} L${pd.l},${pd.t+cH} Z`} fill={P.red+"18"} stroke="none"/>
          <polyline points={orcEvo.map((p,i)=>`${pd.l+i*xS},${yy(p.desp)}`).join(" ")} fill="none" stroke={P.red} strokeWidth="2"/>
          {/* Hover */}
          {hovEvo!==null&&<line x1={pd.l+hovEvo*xS} y1={pd.t} x2={pd.l+hovEvo*xS} y2={pd.t+cH} stroke={P.textMuted} strokeWidth="1" strokeDasharray="3,3"/>}
          {orcEvo.map((p,i)=>(<g key={i}><rect x={pd.l+i*xS-xS/2} y={pd.t} width={xS} height={cH} fill="transparent" onMouseEnter={()=>setHovEvo(i)}/>{hovEvo===i&&<><circle cx={pd.l+i*xS} cy={yy(p.rec)} r="5" fill={P.accent} stroke={P.surface} strokeWidth="2"/><circle cx={pd.l+i*xS} cy={yy(p.desp)} r="5" fill={P.red} stroke={P.surface} strokeWidth="2"/><rect x={pd.l+i*xS-70} y={pd.t} width={140} height={42} rx={6} fill={P.surface} stroke={P.border} strokeWidth="1"/><text x={pd.l+i*xS} y={pd.t+14} textAnchor="middle" fontSize="9" fontWeight="600" fill={P.textDim}>{mL(p.m)}</text><text x={pd.l+i*xS-4} y={pd.t+27} textAnchor="end" fontSize="9" fill={P.accent}>●</text><text x={pd.l+i*xS} y={pd.t+27} textAnchor="start" fontSize="9" fontWeight="600" fill={P.accent}>Rec: {fmt(p.rec)}</text><text x={pd.l+i*xS-4} y={pd.t+38} textAnchor="end" fontSize="9" fill={P.red}>●</text><text x={pd.l+i*xS} y={pd.t+38} textAnchor="start" fontSize="9" fontWeight="600" fill={P.red}>Desp: {fmt(p.desp)}</text></>}</g>))}
        </svg>):(<div style={{textAlign:"center",padding:40,color:P.textMuted,fontSize:12}}>Insira dados no Orçamento para ver o gráfico</div>)}
      </div>

      {/* Right side: Category bars + Donut */}
      <div style={{display:"grid",gridTemplateRows:"auto",gap:16}}>
        <div style={{...S.card,padding:20,display:"grid",gridTemplateColumns:"1fr auto",gap:20,alignItems:"center"}}>
          <div>
            <div key={dashMes+"catTitle"} className="dash-fade" style={{fontSize:11,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>Despesas por Categoria — {mL(dashMes)}</div>
            {catSorted.slice(0,8).map(([cat,val])=>{
              const pctOfTotal=despMes>0?(val/despMes)*100:0;// % do total gasto
              const pctOfRec=recMes>0?(val/recMes)*100:0;// % da receita (para a barra)
              const isHov=hovCat===cat;
              return(<div key={cat} style={{marginBottom:6,cursor:"pointer"}} onMouseEnter={()=>setHovCat(cat)} onMouseLeave={()=>setHovCat(null)}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                  <span style={{fontWeight:isHov?700:600,color:isHov?P.accent:P.text}}>{catEmoji(cat)} {cat}</span>
                  <span style={{color:P.textDim}}>{pctOfTotal.toFixed(1)}% · {fmt(val)}</span>
                </div>
                <div style={{height:8,background:P.surfaceAlt,borderRadius:4,overflow:"hidden"}}><div key={dashMes+cat} className="bar-grow" style={{width:`${Math.min(100,pctOfRec)}%`,height:"100%",background:isHov?P.accent:pctOfRec>100?P.red:P.orange,borderRadius:4,transition:"background 0.2s"}}/></div>
              </div>);
            })}
          </div>
          {/* Donut: interactive — shows hovCat % or total cobPct */}
          {(()=>{
            const hovVal=hovCat?catSorted.find(([c])=>c===hovCat)?.[1]||0:0;
            const hovPct=recMes>0?(hovVal/recMes)*100:0;
            const hovPctTotal=despMes>0?(hovVal/despMes)*100:0;
            const showHov=hovCat&&hovVal>0;
            const displayPct=showHov?Math.min(200,hovPct):cobPct;
            const arc=Math.min(displayPct,100)*3.01;
            const color=showHov?P.accent:cobPct>100?P.red:P.orange;
            return(<div style={{position:"relative",width:130,height:130}} onMouseLeave={()=>setHovCat(null)}>
              <svg width="130" height="130" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="none" stroke={P.surfaceAlt} strokeWidth="14"/>
                {showHov&&<circle cx="60" cy="60" r="48" fill="none" stroke={P.border} strokeWidth="14" strokeDasharray={`${cobPct*3.01} 999`} strokeLinecap="round" transform="rotate(-90 60 60)" opacity="0.5"/>}
                <circle key={dashMes+(hovCat||"donut")} className="donut-anim" cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="14" strokeDasharray={`${arc} 999`} strokeLinecap="round" transform="rotate(-90 60 60)"/>
              </svg>
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",lineHeight:1.2}}>
                {showHov?(<><div style={{fontSize:14,fontWeight:700,color:P.accent}}>{hovPctTotal.toFixed(1)}%</div><div style={{fontSize:8,color:P.textMuted}}>do total</div><div style={{fontSize:9,fontWeight:600,color:P.textDim}}>{fmt(hovVal)}</div></>):(<><div style={{fontSize:26,fontWeight:700,color:cobPct>100?P.red:P.text}}>{cobPct}%</div><div style={{fontSize:8,color:P.textMuted}}>da receita</div></>)}
              </div>
            </div>);
          })()}
        </div>
      </div>
    </div>

    {/* Metrics row */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:20}}>
      <SC label="Em Salários Mínimos" value={`${smRatio.toFixed(2)} SM`} color={P.yellow} dim={P.yellowDim}/>
      <SC label="Cobertura Gastos Fixos" value={gastosFixos>0?`${cobertura.toFixed(1)}%`:"—"} color={cobertura>=100?P.accent:P.orange} dim={cobertura>=100?P.accentGlow:P.orangeDim}/>
    </div>

    {/* Pie charts + Benchmark */}
    {tG>0&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}><div style={{...S.card,padding:24}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Valor Investido <span style={{textTransform:"none",fontWeight:500}}>(cripto a {crBase==="custo"?"custo":"mercado"} · <span style={{cursor:"pointer",color:P.accent}} onClick={()=>setCrBase(crBase==="custo"?"mercado":"custo")}>alternar</span>)</span></div><Pie data={patD} size={220}/></div>{tRM>0&&<div style={{...S.card,padding:24}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Renda Mensal</div><Pie data={renD} size={220}/></div>}</div>)}
    {tG>0&&<BenchmarkPanel tG={tG} retPctAnual={retPct*12} P={P} S={S}/>}
    {tG>0&&<LiquidezPanel rf={rf} inco={inco} P={P} S={S}/>}
    {indices.some(i=>i.valor)&&(<div style={S.card}><div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>Índices</div><div style={{display:"flex",flexWrap:"wrap",gap:14}}>{indices.filter(i=>i.valor).map(i=>(<div key={i.nome} style={{minWidth:100}}><div style={{fontSize:10,color:P.textMuted}}>{i.nome}</div><div style={{fontSize:14,fontWeight:700}}>{i.unidade==="R$"?fmt(i.valor):fP(i.valor)}</div></div>))}</div></div>)}
  </div>);
}

const DEF_IND=[{nome:"Sal.Mínimo",valor:"",unidade:"R$"},{nome:"SELIC (meta)",valor:"",unidade:"%"},{nome:"SELIC (mês)",valor:"",unidade:"%"},{nome:"SELIC (acum.jan)",valor:"",unidade:"%"},{nome:"IPCA (mês)",valor:"",unidade:"%"},{nome:"IPCA (acum.12m)",valor:"",unidade:"%"},{nome:"CDI (mês)",valor:"",unidade:"%"},{nome:"CDI (acum.12m)",valor:"",unidade:"%"},{nome:"Poupança",valor:"",unidade:"%"},{nome:"INCC",valor:"",unidade:"%"},{nome:"IGPM",valor:"",unidade:"%"},{nome:"Dólar",valor:"",unidade:"R$"}];

export default function App(){
  const FIXED_USER="ivan-nod";
  const[userId]=useState(FIXED_USER);const[loggedIn]=useState(true);const[syncStatus,setSyncStatus]=useState("");
  const doLogout=()=>{};
  const[isDark,setIsDark]=useState(()=>ld(SK.theme,"industrial"));const[tab,setTab]=useState("dashboard");
  const[font,setFont]=useState(()=>ld("ip8-font","montserrat"));
  const[rf,setRf]=useState(()=>ld(SK.rf,[]));const[inco,setInco]=useState(()=>ld(SK.inco,[]));
  const[ac,setAc]=useState(()=>ld(SK.ac,[]));const[etfs,setEtfs]=useState(()=>ld(SK.etf,[]));
  const[fiis,setFiis]=useState(()=>ld(SK.fii,[]));const[cr,setCr]=useState(()=>ld(SK.cr,[]));
  const[etfHist,setEtfHist]=useState(()=>ld(SK.etfHist,{}));const[fxUsd,setFxUsd]=useState(()=>ld(SK.fxUsd,{atual:null,dia:{},desde:null,ultimaOK:null,erro:null}));const[fxLoading,setFxLoading]=useState(false);const fxRef=useRef({etfs:[],fx:null,busy:false});fxRef.current.etfs=etfs;fxRef.current.fx=fxUsd;
  const[cotCr,setCotCr]=useState(()=>ld(SK.cotCr,{quotes:{},ultimaOK:null,ultimaTentativa:null,erro:null}));const[crBase,setCrBase]=useState(()=>ld(SK.crBase,"mercado"));const[crLoading,setCrLoading]=useState(false);
  const crRef=useRef({cr:[],cot:null,busy:false});crRef.current.cr=cr;crRef.current.cot=cotCr;
  const[indices,setIndices]=useState(()=>ld(SK.ind,DEF_IND));
  const[prfRef,setPrfRef]=useState(()=>ld(SK.prfRef,DEF_PRF_REF));
  const[aportes,setAportes]=useState(()=>ld(SK.ap,[]));const[orc,setOrc]=useState(()=>ld(SK.orc,[]));
  const[banks,setBanks]=useState(()=>ld(SK.banks,DBANKS));const[apMeta,setApMeta]=useState(()=>ld(SK.apMeta,0));
  const[fiiMkt,setFiiMkt]=useState(()=>ld(SK.fiiMkt,FII_MKT_DEF));
  const[evo,setEvo]=useState(()=>ld(SK.evo,[]));
  const[tdApos,setTdApos]=useState(()=>ld(SK.tdApos,[]));const[tdLiza,setTdLiza]=useState(()=>ld(SK.tdLiza,[]));
  const DEF_SIM_IMO={valorImovel:"500000",financiamento:"400000",taxaJuros:"10",prazoMeses:"360",aluguel:"2500",reajuste:"igpm",reajustePersonalizado:""};
  const DEF_SIM_PRF={dIni:"",dFim:"",dTipo:"Interior",dHotel:"",dLimpeza:"",dCarroProprio:false,dDistKm:"",dCombustivel:"6.50",dConsumo:"10",dPlantoes:"1",dGecc:false,dHorasGecc:"",adDias:"",gcHoras:"",apNasc:"",apEntrada:"",apFator:"1.0"};
  const DEF_SIM_PROJ={idadeAtual:"40",idadeApos:"55",aporteMensal:"",ipca:String(RATES.ipca12m||4.5),inflSaude:"12"};
  const[simImo,setSimImo]=useState(()=>ld(SK.simImo,DEF_SIM_IMO));
  const[simPrf,setSimPrf]=useState(()=>ld(SK.simPrf,DEF_SIM_PRF));
  const[simProj,setSimProj]=useState(()=>ld(SK.simProj,DEF_SIM_PROJ));
  useEffect(()=>{loadFromFirestore(FIXED_USER);},[]);
  const loadFromFirestore=async(uid)=>{try{setSyncStatus("Sincronizando...");const snap=await getDoc(doc(db,"investpro",uid));if(snap.exists()){const d=snap.data();if(d.rf)setRf(d.rf);if(d.inco)setInco(d.inco);if(d.ac)setAc(d.ac);if(d.etfs)setEtfs(d.etfs);if(d.etfHist)setEtfHist(d.etfHist);if(d.fiis)setFiis(d.fiis);if(d.cr)setCr(d.cr);if(d.indices)setIndices(d.indices);if(d.aportes)setAportes(d.aportes);if(d.orc)setOrc(d.orc);if(d.banks)setBanks(d.banks);if(d.apMeta!=null)setApMeta(d.apMeta);if(d.fiiMkt)setFiiMkt(d.fiiMkt);if(d.evo)setEvo(d.evo);if(d.tdApos)setTdApos(d.tdApos);if(d.tdLiza)setTdLiza(d.tdLiza);if(d.simImo)setSimImo(d.simImo);if(d.simPrf)setSimPrf(d.simPrf);if(d.simProj)setSimProj(d.simProj);if(d.theme!=null)setIsDark(d.theme);if(d.font)setFont(d.font);if(d.prfRef)setPrfRef(d.prfRef);}setSyncStatus("\u2713 Sincronizado");setTimeout(()=>setSyncStatus(""),3000);}catch(e){console.error(e);setSyncStatus("Erro sync");}};
  const saveTimer=useRef(null);const saveToFirestore=useCallback(()=>{if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(async()=>{try{await setDoc(doc(db,"investpro",FIXED_USER),{rf,inco,ac,etfs,etfHist,fiis,cr,indices,aportes,orc,banks,apMeta,fiiMkt,evo,tdApos,tdLiza,simImo,simPrf,simProj,theme:isDark,font,prfRef,updatedAt:new Date().toISOString()},{merge:true});}catch(e){console.error(e);}},2000);},[rf,inco,ac,etfs,etfHist,fiis,cr,indices,aportes,orc,banks,apMeta,fiiMkt,evo,tdApos,tdLiza,simImo,simPrf,simProj,isDark,font,prfRef]);
  useEffect(()=>{sv(SK.theme,isDark);},[isDark]);useEffect(()=>{sv("ip8-font",font);},[font]);useEffect(()=>{sv(SK.rf,rf);},[rf]);useEffect(()=>{sv(SK.inco,inco);},[inco]);useEffect(()=>{sv(SK.ac,ac);},[ac]);useEffect(()=>{sv(SK.etf,etfs);},[etfs]);useEffect(()=>{sv(SK.fii,fiis);},[fiis]);useEffect(()=>{sv(SK.cr,cr);},[cr]);useEffect(()=>{sv(SK.ind,indices);},[indices]);useEffect(()=>{sv(SK.ap,aportes);},[aportes]);useEffect(()=>{sv(SK.orc,orc);},[orc]);useEffect(()=>{sv(SK.banks,banks);},[banks]);useEffect(()=>{sv(SK.apMeta,apMeta);},[apMeta]);useEffect(()=>{sv(SK.fiiMkt,fiiMkt);},[fiiMkt]);useEffect(()=>{sv(SK.evo,evo);},[evo]);useEffect(()=>{sv(SK.prfRef,prfRef);},[prfRef]);useEffect(()=>{sv(SK.tdApos,tdApos);},[tdApos]);useEffect(()=>{sv(SK.tdLiza,tdLiza);},[tdLiza]);useEffect(()=>{sv(SK.simImo,simImo);},[simImo]);useEffect(()=>{sv(SK.simPrf,simPrf);},[simPrf]);useEffect(()=>{sv(SK.simProj,simProj);},[simProj]);
  useEffect(()=>{if(userId)saveToFirestore();},[rf,inco,ac,etfs,etfHist,fiis,cr,indices,aportes,orc,banks,apMeta,fiiMkt,evo,tdApos,tdLiza,simImo,simPrf,simProj,isDark,font,prfRef,saveToFirestore]);
  useEffect(()=>{const c=ld(SK.rates,null);if(c)RATES=c;},[]);
  useEffect(()=>{sv(SK.etfHist,etfHist);},[etfHist]);useEffect(()=>{sv(SK.fxUsd,fxUsd);},[fxUsd]);
  const etfFxDesde=etfs.filter(i=>i.moeda==="USD"&&i.dataCompra).map(i=>i.dataCompra).sort()[0]||"";const etfTemUsd=etfs.some(i=>i.moeda==="USD");
  const fxRefresh=useCallback(async()=>{const r=fxRef.current;if(r.busy)return;const des=r.etfs.filter(i=>i.moeda==="USD"&&i.dataCompra).map(i=>i.dataCompra).sort()[0]||"";const hj=localISO(new Date());if(!r.etfs.some(i=>i.moeda==="USD"))return;
    const cache=r.fx||{};const ult=Object.keys(cache.dia||{}).sort().pop();const ini=(cache.desde&&des&&cache.desde<=des&&ult)?etfAddDias(ult,-10):des;
    r.busy=true;setFxLoading(true);try{const res=await etfBuscarFx(ini,hj);setFxUsd(prev=>etfMesclarFx(prev,res,ini,new Date().toISOString()));}
    catch(e){setFxUsd(prev=>({...prev,ultimaTentativa:new Date().toISOString(),erro:String((e&&e.message)||e)}));}finally{r.busy=false;setFxLoading(false);}},[]);
  useEffect(()=>{if(!etfTemUsd)return;const precisa=()=>{const c=fxRef.current.fx||{};return !c.atual||!c.ultimaTentativa||Date.now()-new Date(c.ultimaTentativa).getTime()>30*60*1000||(!c.desde||(etfFxDesde&&c.desde>etfFxDesde));};
    if(precisa())fxRefresh();const t=setInterval(()=>{if(precisa())fxRefresh();},5*60*1000);return()=>clearInterval(t);},[etfTemUsd,etfFxDesde,fxRefresh]);
  useEffect(()=>{sv(SK.cotCr,cotCr);},[cotCr]);useEffect(()=>{sv(SK.crBase,crBase);},[crBase]);
  const crRefresh=useCallback(async()=>{const r=crRef.current;if(r.busy)return;const tks=crCalcular(r.cr).posicoes.map(p=>p.ticker);if(!tks.length)return;r.busy=true;setCrLoading(true);
    try{const res=await crBuscarCotacoes(tks);setCotCr(prev=>crMesclarCotacoes(prev,res,new Date().toISOString()));}
    catch(e){setCotCr(prev=>({...prev,ultimaTentativa:new Date().toISOString(),erro:String((e&&e.message)||e)}));}
    finally{r.busy=false;setCrLoading(false);}},[]);
  const crTkKey=crCalcular(cr).posicoes.map(p=>p.ticker).join(",");
  useEffect(()=>{const precisa=()=>{const c=crRef.current.cot||{};const tks=crTkKey?crTkKey.split(","):[];if(!tks.length)return false;const faltam=tks.some(t=>!(c.quotes&&c.quotes[t]));return faltam||!c.ultimaTentativa||Date.now()-new Date(c.ultimaTentativa).getTime()>10*60*1000;};
    if(precisa())crRefresh();const t=setInterval(()=>{if(precisa())crRefresh();},60000);return()=>clearInterval(t);},[crTkKey,crRefresh]);
  const allState=()=>({rf,inco,ac,etfs,etfHist,fiis,cr,indices,aportes,orc,banks,apMeta,fiiMkt,evo,tdApos,tdLiza,theme:isDark,prfRef,font});
  const loadState=d=>{if(d.rf)setRf(d.rf);if(d.inco)setInco(d.inco);if(d.ac)setAc(d.ac);if(d.etfs)setEtfs(d.etfs);if(d.etfHist)setEtfHist(d.etfHist);if(d.fiis)setFiis(d.fiis);if(d.cr)setCr(d.cr);if(d.indices)setIndices(d.indices);if(d.aportes)setAportes(d.aportes);if(d.orc)setOrc(d.orc);if(d.banks)setBanks(d.banks);if(d.apMeta!=null)setApMeta(d.apMeta);if(d.fiiMkt)setFiiMkt(d.fiiMkt);if(d.evo)setEvo(d.evo);if(d.tdApos)setTdApos(d.tdApos);if(d.tdLiza)setTdLiza(d.tdLiza);if(d.simImo)setSimImo(d.simImo);if(d.simPrf)setSimPrf(d.simPrf);if(d.simProj)setSimProj(d.simProj);if(d.theme!=null)setIsDark(d.theme);if(d.prfRef)setPrfRef(d.prfRef);};
  const P=isDark==="dark"||isDark===true?DARK:isDark==="industrial"?INDUSTRIAL:isDark==="planner"?PLANNER:isDark==="industrial-light"?INDUSTRIAL_LIGHT:LIGHT;
  const[clock,setClock]=useState("");const[todayStr,setTodayStr]=useState("");const[weekDay,setWeekDay]=useState("");
  useEffect(()=>{const t=setInterval(()=>{const n=new Date();setClock(n.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));setTodayStr(n.toLocaleDateString("pt-BR"));setWeekDay(n.toLocaleDateString("pt-BR",{weekday:"long"}));},1000);return()=>clearInterval(t);},[]);
  // Login/logout functions

  // Calculate monthly return % for SimTab
  const _rfE=rf.map(i=>({...i,...calcRF(i)})),_mRF=_rfE.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const _inE=inco.map(i=>({...i,...calcINCO(i)})),_mIN=_inE.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const _dFi=fiis.reduce((a,i)=>a+(Number(i.dividendoMensal)||0),0);
  const _tG=rf.reduce((a,i)=>a+(Number(i.valor)||0),0)+inco.reduce((a,i)=>a+(Number(i.valor)||0),0)+ac.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0)+etfs.reduce((a,i)=>a+etfCustoBRL(i,fxUsd),0)+fiis.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0)+crPatrimonio(cr,cotCr,crBase);
  const _tRM=_mRF+_mIN+_dFi;const _retPct=_tG>0?((_tRM/_tG)*100):0;
  const rT=()=>{switch(tab){case"dashboard":return<Dash rf={rf} inco={inco} ac={ac} etfs={etfs} fiis={fiis} cr={cr} indices={indices} orc={orc} cotCr={cotCr} crBase={crBase} setCrBase={setCrBase} fxUsd={fxUsd}/>;case"comp":return<CompTab/>;case"evo":return<EvoTab data={evo} setData={setEvo}/>;case"proj":return<ProjecoesTab tG={_tG} tRM={_tRM} retPct={_retPct} orc={orc} sim={simProj} setSim={setSimProj} defSim={DEF_SIM_PROJ}/>;case"rf":return<RFTab data={rf} setData={setRf} banks={banks} dashRetPct={_retPct}/>;case"inco":return<IncoTab data={inco} setData={setInco}/>;case"td":return<TDTab apos={tdApos} setApos={setTdApos} liza={tdLiza} setLiza={setTdLiza}/>;case"ac":return<AcTab data={ac} setData={setAc}/>;case"etf":return<EtfTab data={etfs} setData={setEtfs} hist={etfHist} setHist={setEtfHist} fx={fxUsd} onFxRefresh={fxRefresh} fxLoading={fxLoading}/>;case"fii":return<FiiTab data={fiis} setData={setFiis} fiiMkt={fiiMkt} setFiiMkt={setFiiMkt}/>;case"cr":return<CrTab data={cr} setData={setCr} cot={cotCr} base={crBase} setBase={setCrBase} onRefresh={crRefresh} loading={crLoading}/>;case"ap":return<ApTab data={aportes} setData={setAportes} banks={banks} meta={apMeta} setMeta={setApMeta}/>;case"sim":return<SimTab retPctMensal={_retPct}/>;case"orc":return<OrcTab data={orc} setData={setOrc}/>;case"ind":return<IndTab data={indices} setData={setIndices} prfRef={prfRef} setPrfRef={setPrfRef}/>;case"irpf":return<IrpfTab rf={rf} inco={inco} fiis={fiis} fiiMkt={fiiMkt} ac={ac} etfs={etfs} cr={cr}/>;case"prf":return<PrfTab prfRef={prfRef} sim={simPrf} setSim={setSimPrf} defSim={DEF_SIM_PRF}/>;case"imoveis":return<ImoveisTab sim={simImo} setSim={setSimImo} defSim={DEF_SIM_IMO}/>;case"cfg":return<CfgTab banks={banks} setBanks={setBanks} isDark={isDark} setIsDark={setIsDark} allState={allState} loadState={loadState} font={font} setFont={setFont}/>;default:return null;}};
  const isDarkSidebar=P.sidebarBg&&parseInt(P.sidebarBg.replace("#",""),16)<0x888888;
  const sbText=isDarkSidebar?"#e8e0d6":P.text;const sbTextDim=isDarkSidebar?"#a09890":P.textDim;const sbTextMuted=isDarkSidebar?"#6b635a":P.textMuted;const sbHover=isDarkSidebar?"rgba(255,255,255,0.08)":P.hover;const sbAccentGlow=isDarkSidebar?"rgba(196,98,42,0.20)":P.accentGlow;
  function SBItem({t}){const[h,setH]=useState(false);const active=tab===t.id;return(<div onClick={()=>setTab(t.id)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"10px 16px",cursor:"pointer",fontSize:12,fontWeight:active?600:400,color:active?P.accent:h?sbText:sbTextDim,background:active?sbAccentGlow:h?sbHover:"transparent",borderRight:active?`2px solid ${P.accent}`:"2px solid transparent",transition:"all 0.2s ease",borderRadius:h&&!active?"6px 0 0 6px":"0",transform:h&&!active?"translateX(4px)":"none"}}><span style={{fontSize:14,opacity:active?1:h?1:0.7,transition:"all 0.2s ease"}}>{t.ic}</span>{t.l}</div>);}
  const SBG=({items,label})=>(<div>{label&&<div style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:sbTextMuted,padding:"12px 16px 4px",textAlign:"center"}}>{label}</div>}{items.map(t=>(<SBItem key={t.id} t={t}/>))}</div>);
  // Clock

  const fontFamily=font==="roboto"?"'Roboto',sans-serif":font==="poppins"?"'Poppins',sans-serif":font==="montserrat"?"'Montserrat',sans-serif":"'JetBrains Mono','SF Mono',monospace";
  return(<TC.Provider value={P}><div style={{fontFamily,background:P.bg,color:P.text,minHeight:"100vh",fontSize:13}}>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
    <div className="dsb" style={{position:"fixed",left:0,top:0,bottom:0,width:210,background:P.sidebarBg||P.surface,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",zIndex:10}}><div style={{padding:"16px 16px 10px",borderBottom:`1px solid ${P.border}`,textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:P.accent,letterSpacing:"-0.5px"}}>◉ NOD-INVEST</div><div style={{fontSize:20,fontWeight:300,color:sbTextDim,marginTop:6,letterSpacing:"2px",fontVariantNumeric:"tabular-nums"}}>{clock}</div><div style={{fontSize:11,color:sbTextMuted,marginTop:2}}>{todayStr}</div><div style={{fontSize:10,color:sbTextMuted,textTransform:"capitalize"}}>{weekDay}</div></div><div style={{flex:1,overflowY:"auto"}}><SBG items={TABS_M}/><div style={{borderBottom:`2px solid ${P.textMuted}44`,margin:"4px 16px"}}/><SBG items={TABS_I} label="Investimentos"/><div style={{borderBottom:`2px solid ${P.textMuted}44`,margin:"4px 16px"}}/><SBG items={TABS_G} label="Gestão"/><div style={{borderBottom:`2px solid ${P.textMuted}44`,margin:"4px 16px"}}/><SBG items={TABS_S}/></div><div style={{padding:"10px 16px",borderTop:`1px solid ${P.border}`,fontSize:10,color:sbTextMuted}}>NOD-INVEST v12.0</div>{syncStatus&&<div style={{padding:"4px 16px",fontSize:9,color:syncStatus.includes("\u2713")?P.accent:P.textMuted}}>{syncStatus}</div>}<div style={{padding:"6px 16px 10px",borderTop:"1px solid "+P.border}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:9,color:sbTextMuted}}>{userId}</span><button onClick={doLogout} style={{fontSize:9,color:sbTextDim,background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Sair</button></div></div></div>
    <div className="mn" style={{position:"fixed",top:0,left:0,right:0,height:50,background:P.surface,borderBottom:`1px solid ${P.border}`,display:"none",alignItems:"center",padding:"0 8px",zIndex:20,overflowX:"auto",gap:2}}><span style={{color:P.accent,fontWeight:700,fontSize:13,marginRight:4,flexShrink:0}}>◉ NOD</span>{ALL_T.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"5px 7px",borderRadius:5,fontSize:10,fontWeight:tab===t.id?600:400,color:tab===t.id?P.accent:P.textDim,background:tab===t.id?P.accentGlow:"transparent",border:"none",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{t.l}</button>))}</div>
    <div className="mc" style={{marginLeft:210,padding:"24px 28px",minHeight:"100vh"}}>{rT()}</div>
    <style>{`.mn{display:none!important}@media(max-width:800px){.dsb{display:none!important}.mn{display:flex!important}.mc{margin-left:0!important;padding:60px 12px 20px!important}}`}</style>
  </div></TC.Provider>);
}
