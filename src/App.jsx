import React,{useState,useEffect,useRef,useMemo,createContext,useContext,useCallback} from"react";
import{db,doc,getDoc,setDoc}from"./firebase.js";
const TC=createContext();const useT=()=>useContext(TC);
const DARK={bg:"#0b0f14",surface:"#12171e",surfaceAlt:"#181e27",border:"#1e2630",borderLight:"#2a3342",text:"#e2e8f0",textDim:"#8494a7",textMuted:"#556677",accent:"#10b981",accentGlow:"rgba(16,185,129,0.12)",red:"#ef4444",redDim:"rgba(239,68,68,0.12)",blue:"#3b82f6",blueDim:"rgba(59,130,246,0.12)",yellow:"#f59e0b",yellowDim:"rgba(245,158,11,0.12)",purple:"#a855f7",purpleDim:"rgba(168,85,247,0.12)",orange:"#f97316",orangeDim:"rgba(249,115,22,0.12)",cyan:"#06b6d4",cyanDim:"rgba(6,182,212,0.12)",hover:"rgba(255,255,255,0.04)",sidebarBg:"#0f1319",thBg:"#181e27"};
const LIGHT={bg:"#f0f2f5",surface:"#ffffff",surfaceAlt:"#f7f8fa",border:"#e2e5ea",borderLight:"#d0d5dd",text:"#1a1d23",textDim:"#5f6b7a",textMuted:"#9ca3af",accent:"#059669",accentGlow:"rgba(5,150,105,0.10)",red:"#dc2626",redDim:"rgba(220,38,38,0.08)",blue:"#2563eb",blueDim:"rgba(37,99,235,0.08)",yellow:"#d97706",yellowDim:"rgba(217,119,6,0.08)",purple:"#7c3aed",purpleDim:"rgba(124,58,237,0.08)",orange:"#ea580c",orangeDim:"rgba(234,88,12,0.08)",cyan:"#0891b2",cyanDim:"rgba(8,145,178,0.08)",hover:"rgba(0,0,0,0.03)",sidebarBg:"#e8eaed",thBg:"#dfe1e5"};
const INDUSTRIAL_LIGHT={bg:"#faf8f5",surface:"#ffffff",surfaceAlt:"#f5f2ee",border:"#d8d3cc",borderLight:"#e0dbd4",text:"#2c2a26",textDim:"#6b6860",textMuted:"#908d85",accent:"#4a7c59",accentGlow:"rgba(74,124,89,0.10)",red:"#b33a3a",redDim:"rgba(179,58,58,0.06)",blue:"#3d6b99",blueDim:"rgba(61,107,153,0.06)",yellow:"#a67c3d",yellowDim:"rgba(166,124,61,0.06)",purple:"#7a5ea8",purpleDim:"rgba(122,94,168,0.06)",orange:"#c47a35",orangeDim:"rgba(196,122,53,0.06)",cyan:"#3d8a8a",cyanDim:"rgba(61,138,138,0.06)",hover:"rgba(0,0,0,0.03)",sidebarBg:"#f0ede8",thBg:"#e8e3dd"};
const INDUSTRIAL={bg:"#f5f0eb",surface:"#ebe6df",surfaceAlt:"#e0dbd4",border:"#c8c3bc",borderLight:"#d5d0c9",text:"#2c2a26",textDim:"#6b6860",textMuted:"#908d85",accent:"#4a7c59",accentGlow:"rgba(74,124,89,0.12)",red:"#b33a3a",redDim:"rgba(179,58,58,0.08)",blue:"#3d6b99",blueDim:"rgba(61,107,153,0.08)",yellow:"#a67c3d",yellowDim:"rgba(166,124,61,0.08)",purple:"#7a5ea8",purpleDim:"rgba(122,94,168,0.08)",orange:"#c47a35",orangeDim:"rgba(196,122,53,0.08)",cyan:"#3d8a8a",cyanDim:"rgba(61,138,138,0.08)",hover:"rgba(0,0,0,0.04)",sidebarBg:"#d8d3cc",thBg:"#cec9c2"};
const TABS_M=[{id:"dashboard",l:"Dashboard",ic:"◉"},{id:"comp",l:"Comparação",ic:"⚖"},{id:"evo",l:"Evolução",ic:"📈"}];
const TABS_I=[{id:"rf",l:"Renda Fixa",ic:"▤"},{id:"inco",l:"INCO",ic:"⌂"},{id:"ac",l:"Ações",ic:"▲"},{id:"etf",l:"ETFs",ic:"◆"},{id:"fii",l:"FIIs",ic:"⬡"},{id:"cr",l:"Cripto",ic:"◈"},{id:"ap",l:"Aportes",ic:"↗"},{id:"sim",l:"Simulação",ic:"🧮"}];
const TABS_G=[{id:"orc",l:"Orçamento",ic:"☰"},{id:"irpf",l:"IRPF",ic:"📋"},{id:"prf",l:"PRF",ic:"📊"},{id:"imoveis",l:"Imóveis",ic:"🏠"}];
const TABS_S=[{id:"ind",l:"Índices",ic:"≡"},{id:"cfg",l:"Config",ic:"⚙"}];
const ALL_T=[...TABS_M,...TABS_I,...TABS_G,...TABS_S];
const SK={rf:"ip8-rf",ac:"ip8-ac",etf:"ip8-etf",fii:"ip8-fii",cr:"ip8-cr",ind:"ip8-ind",indLF:"ip8-indLF",ap:"ip8-ap",orc:"ip8-orc",inco:"ip8-inco",banks:"ip8-banks",theme:"ip8-theme",apMeta:"ip8-apMeta",fiiMkt:"ip8-fiiMkt",rates:"ip8-rates",evo:"ip8-evo",cryptoQ:"ip8-cryptoQ",prfRef:"ip8-prfRef"};
const DEF_PRF_REF={diariaInterior:335,diariaCapitais:380,diariaSPRJ:425,horaGECC:151.78,horaADFRON:11.50,diaADFRON:92};
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
  btnO:{background:"transparent",color:P.textDim,border:`1px solid ${P.borderLight}`,borderRadius:6,padding:"8px 16px",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"},
  tag:(c,bg)=>({display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:600,color:c,background:bg}),
}),[P]);}
function SC({label,value,color,dim}){const P=useT();return(<div style={{background:P.surface,border:`1px solid ${P.border}`,borderRadius:10,padding:"18px 20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,right:0,width:60,height:60,background:dim||P.accentGlow,borderRadius:"0 0 0 60px",opacity:0.5}}/><div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px",color:P.textDim,marginBottom:8}}>{label}</div><div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.5px",color:color||P.accent}}>{value}</div></div>);}
function TR({children,onClick,baseBg}){const P=useT();const[h,setH]=useState(false);return(<tr style={{cursor:"pointer",background:h?P.hover:baseBg||"transparent",transition:"background 0.15s"}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onClick}>{children}</tr>);}
function STH({label,field,sb,sd,onS,style}){const P=useT();const a=sb===field;return(<th style={style} onClick={()=>onS(field)}>{label} {a&&<span style={{color:P.accent}}>{sd==="asc"?"▲":"▼"}</span>}</th>);}
const PC=["#3b82f6","#10b981","#f59e0b","#a855f7","#f97316","#06b6d4","#ef4444","#ec4899","#84cc16","#6366f1","#14b8a6","#0ea5e9","#8b5cf6","#d946ef","#78716c","#64748b","#ca8a04","#059669","#dc2626","#ea580c","#d97706","#65a30d","#0d9488","#7c3aed","#a3a3a3"];
function Pie({data,size=260}){const P=useT();const[hover,setHover]=useState(null);const total=data.reduce((a,d)=>a+d.value,0);if(total<=0)return null;let cum=0;const r=size/2-4,cx=size/2,cy=size/2;
  const sl=data.filter(d=>d.value>0).map((d,i)=>{const pct=d.value/total;const sa=cum;cum+=pct*2*Math.PI;const ea=cum;const la=pct>0.5?1:0;
    if(pct>=0.999)return{p:`M ${cx} ${cy-r} A ${r} ${r} 0 1 1 ${cx-0.01} ${cy-r} Z`,c:d.color||PC[i%PC.length],l:d.label,pct,val:d.value,idx:i};
    const x1=cx+r*Math.cos(sa-Math.PI/2),y1=cy+r*Math.sin(sa-Math.PI/2),x2=cx+r*Math.cos(ea-Math.PI/2),y2=cy+r*Math.sin(ea-Math.PI/2);
    return{p:`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`,c:d.color||PC[i%PC.length],l:d.label,pct,val:d.value,idx:i};
  });
  return(<div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}><div style={{position:"relative"}}><svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{sl.map((s,i)=>(<path key={i} d={s.p} fill={s.c} stroke={P.bg} strokeWidth="2" opacity={hover===null||hover===s.idx?1:0.4} style={{transition:"opacity 0.15s",cursor:"pointer"}} onMouseEnter={()=>setHover(s.idx)} onMouseLeave={()=>setHover(null)}/>))}</svg>{hover!==null&&sl[hover]&&(<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}><div style={{fontSize:13,fontWeight:700,color:P.text}}>{sl[hover].l}</div><div style={{fontSize:16,fontWeight:700,color:sl[hover].c}}>{fmt(sl[hover].val)}</div><div style={{fontSize:11,color:P.textDim}}>{(sl[hover].pct*100).toFixed(1)}%</div></div>)}</div><div style={{display:"flex",flexDirection:"column",gap:4}}>{sl.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,opacity:hover===null||hover===s.idx?1:0.5,cursor:"pointer",transition:"opacity 0.15s"}} onMouseEnter={()=>setHover(s.idx)} onMouseLeave={()=>setHover(null)}><div style={{width:10,height:10,borderRadius:2,background:s.c,flexShrink:0}}/><span style={{color:P.textDim}}>{s.l}</span><span style={{fontWeight:600}}>{fmt(s.val)}</span><span style={{color:P.textMuted}}>({(s.pct*100).toFixed(1)}%)</span></div>))}</div></div>);
}

function Mdl({title,fields,onSave,onCancel,initial,banks,autoFocus}){const P=useT();const S=useS();const[v,setV]=useState(initial||{});const set=(k,val)=>setV(p=>({...p,[k]:val}));const firstRef=useRef(null);
  useEffect(()=>{if(firstRef.current)firstRef.current.focus();},[]);
  const rf=fields.map(f=>{
    if(f.key==="banco"&&f.type==="select"&&f.useBanks)return{...f,options:banks||DBANKS};
    if(f.key==="categoria"&&f.dynamicOptions)return{...f,options:v.tipo==="Receita"?ORC_REC:ORC_C};
    return f;
  });
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}} onClick={onCancel}><div style={{...S.card,maxWidth:560,width:"100%",margin:0,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{fontSize:16,fontWeight:700,marginBottom:20}}>{title}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:16}}>{rf.map(f=>{if(f.hidden)return null;
    // showWhen: "key=value" conditional visibility
    if(f.showWhen){const[sk,sv2]=f.showWhen.split("=");if((v[sk]||"")!==sv2)return null;}
    return(<div key={f.key} style={f.wide?{gridColumn:"1/-1"}:{}}><label style={S.lbl}>{f.label}</label>{f.type==="select"?(<select style={S.sel} value={v[f.key]||""} onChange={e=>{set(f.key,e.target.value);if(f.key==="categoria"&&typeof AUTO_FIXO!=="undefined"&&AUTO_FIXO.includes(e.target.value))set("fixo",true);}}><option value="">Selecione</option>{f.options.map(o=><option key={o} value={o}>{o}</option>)}</select>):f.type==="checkbox"?(<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={!!v[f.key]} onChange={e=>set(f.key,e.target.checked)}/><span style={{fontSize:13,color:P.text}}>{f.checkLabel||"Sim"}</span></label>):f.readOnly?(<div style={{...S.i,background:P.bg,color:P.textDim}}>{v[f.key]||"Auto"}</div>):(<input ref={(autoFocus===f.key)?firstRef:null} style={S.i} type={f.type||"text"} step={f.step} placeholder={f.placeholder||""} value={v[f.key]||""} max={f.type==="date"?"2099-12-31":undefined} min={f.type==="date"?"2020-01-01":undefined} onChange={e=>set(f.key,e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();let out={...v,id:v.id||uid()};if(fields.some(ff=>ff.key==="rendAnual")){const c=calcRF(v);out={...out,...c};}onSave(out);}}}/>)}</div>);})}</div><div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button style={S.btnO} onClick={onCancel}>Cancelar</button><button style={S.btn()} onClick={()=>{let out={...v,id:v.id||uid()};if(fields.some(f=>f.key==="rendAnual")){const c=calcRF(v);out={...out,...c};}onSave(out);}}>Salvar</button></div></div></div>);}
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
function VencSec({title,items,P}){if(!items.length)return null;const[open,setOpen]=useState(false);const total=items.reduce((a,i)=>a+(Number(i.valor)||0),0);const S=useS();return(<div style={{marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:title.includes("30d")?P.red:title.includes("180")?P.yellow:P.accent,marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:8}} onClick={()=>setOpen(!open)}><span style={{fontSize:14}}>{open?"▼":"▶"}</span>{title} ({items.length}) — Total: {fmt(total)}</div>{open&&<div style={{display:"flex",gap:8,flexWrap:"wrap",paddingLeft:22}}>{items.map(i=>(<div key={i.id} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:6,padding:"8px 12px",fontSize:11}}><b>{i.tipo||i.incorporadora||""}</b> {i.emissor||i.empreendimento||""} — {fmt(i.valor)} — {fD(i.dataVencimento)} ({diasV(i.dataVencimento)}d)</div>))}</div>}</div>);}

/* ═══ RF — columns reordered: ...Valor, Rend.Anual, Rend.Líq, Rend.Mensal, IR%, ... + 3 pie charts ═══ */
const RF_FIELDS=[{key:"dataInicio",label:"Data Início",type:"date"},{key:"dataVencimento",label:"Vencimento",type:"date"},{key:"tipo",label:"Tipo",type:"select",options:["CDB","CRA","CRI","LCI","LCA","Debênture","Tesouro Selic","Tesouro IPCA+","Tesouro Prefixado","LC","Outro"]},{key:"indexador",label:"Indexador",type:"select",options:["Pré","CDI","IPCA","Selic","IGPM","Outro"]},{key:"taxa",label:"Taxa (%)",type:"number",step:"0.01"},{key:"valor",label:"Valor",type:"number",step:"0.01"},{key:"rendAnual",label:"Rend.Anual",readOnly:true},{key:"rendMensal",label:"Rend.Mensal",readOnly:true},{key:"emissor",label:"Emissor"},{key:"banco",label:"Banco",type:"select",useBanks:true}];
// Columns: Data, Venc, Tipo, Idx, TaxaNom, TaxaReal, Valor, Rend.Anual, Rend.Líq, Rend.Mensal, IR%, Emissor, Banco
const RF_C=[{k:"dataInicio",l:"Data"},{k:"dataVencimento",l:"Venc."},{k:"tipo",l:"Tipo"},{k:"indexador",l:"Idx"},{k:"taxaNomLabel",l:"Taxa Nom."},{k:"taxaReal",l:"Taxa Real"},{k:"taxaRealMensal",l:"Tx Real/Mês"},{k:"valor",l:"Valor"},{k:"rendAnual",l:"Rend.Anual"},{k:"rendLiq",l:"Rend.Líq."},{k:"rendMensal",l:"Rend.Mensal"},{k:"irPct",l:"IR%"},{k:"emissor",l:"Emissor"},{k:"banco",l:"Banco"}];

function RFTab({data,setData,banks,dashRetPct}){const P=useT();const S=useS();const[sub,setSub]=useState("lista");const{sb,sd,onS,doS}=useSort("dataVencimento","asc");const[rebalVal,setRebalVal]=useState("");
  const[slIPCA,setSlIPCA]=useState(45);const[slCDI,setSlCDI]=useState(30);const[slPre,setSlPre]=useState(25);
  const[aporteProj,setAporteProj]=useState("");const[hovProj1,setHovProj1]=useState(null);const[hovProj2,setHovProj2]=useState(null);
  const enriched=data.map(i=>({...i,...calcRF(i)}));const sorted=doS(enriched);
  const tV=enriched.reduce((a,i)=>a+(Number(i.valor)||0),0),tRA=enriched.reduce((a,i)=>a+(Number(i.rendAnual)||0),0),tRL=enriched.reduce((a,i)=>a+(Number(i.rendLiq)||0),0),tRM=enriched.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const v30=data.filter(i=>diasV(i.dataVencimento)<=30),v180=data.filter(i=>{const d=diasV(i.dataVencimento);return d>30&&d<=180;}),vP=data.filter(i=>diasV(i.dataVencimento)>180);
  const[modal,setModal]=useState(null);const[del,setDel]=useState(null);
  const doSave=item=>{const c=calcRF(item);const out={...item,...c,id:item.id||uid()};setData(p=>{const i=p.findIndex(x=>x.id===out.id);if(i>=0){const n=[...p];n[i]=out;return n;}return[...p,out];});setModal(null);};
  // Pie data
  const byTipo={},byIdx={},byBanco={};enriched.forEach(i=>{byTipo[i.tipo||"Outro"]=(byTipo[i.tipo||"Outro"]||0)+(Number(i.valor)||0);byIdx[i.indexador||"Outro"]=(byIdx[i.indexador||"Outro"]||0)+(Number(i.valor)||0);byBanco[i.banco||"Outro"]=(byBanco[i.banco||"Outro"]||0)+(Number(i.valor)||0);});
  const pieTipo=Object.entries(byTipo).map(([l,v],i)=>({label:l,value:v,color:PC[i%PC.length]}));
  const pieIdx=Object.entries(byIdx).map(([l,v],i)=>({label:l,value:v,color:PC[(i+5)%PC.length]}));
  const pieBanco=Object.entries(byBanco).map(([l,v],i)=>({label:l,value:v,color:PC[(i+10)%PC.length]}));

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}><div style={{fontSize:22,fontWeight:700}}>Renda Fixa</div><div style={{display:"flex",gap:8}}><button style={sub==="lista"?S.btn():S.btnO} onClick={()=>setSub("lista")}>Lista</button><button style={sub==="venc"?S.btn():S.btnO} onClick={()=>setSub("venc")}>Vencimentos</button><button style={sub==="graf"?S.btn():S.btnO} onClick={()=>setSub("graf")}>Gráficos</button><button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button></div></div>
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
  const enriched=data.map(i=>({...i,...calcINCO(i)}));const sorted=doS(enriched);
  const tV=enriched.reduce((a,i)=>a+(Number(i.valor)||0),0),tRP=enriched.reduce((a,i)=>a+(Number(i.rendPeriodo)||0),0),tRM=enriched.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const v30=data.filter(i=>diasV(i.dataVencimento)<=30),v180=data.filter(i=>{const d=diasV(i.dataVencimento);return d>30&&d<=180;}),vP=data.filter(i=>diasV(i.dataVencimento)>180);
  const[modal,setModal]=useState(null);const[del,setDel]=useState(null);
  const doSave=item=>{const c=calcINCO(item);const out={...item,...c,id:item.id||uid()};setData(p=>{const i=p.findIndex(x=>x.id===out.id);if(i>=0){const n=[...p];n[i]=out;return n;}return[...p,out];});setModal(null);};
  // Pie data for Gráficos
  const byIdx={},byRisco={};enriched.forEach(i=>{byIdx[i.indexador||"Outro"]=(byIdx[i.indexador||"Outro"]||0)+(Number(i.valor)||0);byRisco[i.risco||"—"]=(byRisco[i.risco||"—"]||0)+(Number(i.valor)||0);});
  const pieIdx=Object.entries(byIdx).map(([l,v],i)=>({label:l,value:v,color:PC[(i+5)%PC.length]}));
  const pieRisco=Object.entries(byRisco).map(([l,v])=>({label:`Risco ${l}`,value:v,color:RISCO_COLORS[l]?RISCO_COLORS[l].c:PC[0]}));
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}><div style={{fontSize:22,fontWeight:700}}>INCO</div><div style={{display:"flex",gap:8}}><button style={sub==="lista"?S.btn():S.btnO} onClick={()=>setSub("lista")}>Lista</button><button style={sub==="venc"?S.btn():S.btnO} onClick={()=>setSub("venc")}>Vencimentos</button><button style={sub==="graf"?S.btn():S.btnO} onClick={()=>setSub("graf")}>Gráficos</button><button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button></div></div>
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
const ETF_F=[{key:"ticker",label:"Ticker"},{key:"nome",label:"Nome"},{key:"indiceRef",label:"Índice"},{key:"quantidade",label:"Qtd",type:"number",step:"1"},{key:"precoMedio",label:"PM",type:"number",step:"0.01"},{key:"precoAtual",label:"Atual",type:"number",step:"0.01"},{key:"taxaAdm",label:"TxAdm%",type:"number",step:"0.01"},{key:"dataCompra",label:"Data",type:"date"},{key:"corretora",label:"Corretora"}];
function EtfTab({data,setData}){const P=useT();const S=useS();const tI=data.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0),tA=data.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoAtual)||Number(i.precoMedio)||0),0),lp=tA-tI;
  // International ETF quotes panel (static estimates, user can update)
  const[etfQuotes,setEtfQuotes]=useState(()=>ld("ip8-etfQ",[{ticker:"VOO",nome:"Vanguard S&P 500",precoUSD:520,precoBRL:0},{ticker:"BLK",nome:"BlackRock Inc",precoUSD:850,precoBRL:0},{ticker:"GLD",nome:"SPDR Gold",precoUSD:230,precoBRL:0}]));
  const[loadQ,setLoadQ]=useState(false);
  const fetchQuotes=async()=>{setLoadQ(true);try{
    // AwesomeAPI for real-time USD/BRL
    const r=await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
    if(r.ok){const d=await r.json();if(d.USDBRL){const usd=Number(d.USDBRL.bid);const updated=etfQuotes.map(q=>({...q,precoBRL:(q.precoUSD*usd).toFixed(2)}));setEtfQuotes(updated);sv("ip8-etfQ",updated);}}
  }catch{}setLoadQ(false);};
  useEffect(()=>{if(!etfQuotes[0].precoBRL)fetchQuotes();},[]);
  return(<div>
    {/* International ETF Quotes */}
    <div style={{...S.card,marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim}}>Cotações ETFs Internacionais (em R$)</div><button style={S.btnO} onClick={fetchQuotes} disabled={loadQ}>{loadQ?"...":"⟳"}</button></div><div style={{display:"flex",gap:16,flexWrap:"wrap"}}>{etfQuotes.map(q=>(<div key={q.ticker} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:8,padding:"12px 18px",minWidth:150}}><div style={{fontSize:13,fontWeight:700,color:P.text}}>{q.ticker}</div><div style={{fontSize:10,color:P.textMuted,marginBottom:4}}>{q.nome}</div><div style={{fontSize:11,color:P.textDim}}>USD {q.precoUSD.toLocaleString("en-US",{style:"currency",currency:"USD"})}</div><div style={{fontSize:16,fontWeight:700,color:P.accent}}>{q.precoBRL?fmt(q.precoBRL):"—"}</div></div>))}</div></div>
    <CRUD title="ETFs" icon="◆" fields={ETF_F} data={data} setData={setData} cards={<React.Fragment><SC label="Investido" value={fmt(tI)} color={P.cyan} dim={P.cyanDim}/><SC label="Atual" value={fmt(tA)} color={P.blue} dim={P.blueDim}/><SC label="L/P" value={fmt(lp)} color={lp>=0?P.accent:P.red} dim={lp>=0?P.accentGlow:P.redDim}/></React.Fragment>} columns={["Ticker","Nome","Índice","Qtd","PM","Atual","Investido","Atual","L/P","TxAdm","Corretora"]} renderRow={i=>{const inv=(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),at=(Number(i.quantidade)||0)*(Number(i.precoAtual)||Number(i.precoMedio)||0),l=at-inv;return(<React.Fragment><td style={{...S.td,fontWeight:700}}>{i.ticker||"—"}</td><td style={S.td}>{i.nome||"—"}</td><td style={S.td}>{i.indiceRef||"—"}</td><td style={S.td}>{i.quantidade||"—"}</td><td style={S.td}>{fmt(i.precoMedio)}</td><td style={S.td}>{fmt(i.precoAtual)}</td><td style={S.td}>{fmt(inv)}</td><td style={S.td}>{fmt(at)}</td><td style={{...S.td,color:l>=0?P.accent:P.red,fontWeight:600}}>{fmt(l)}</td><td style={S.td}>{i.taxaAdm?`${i.taxaAdm}%`:"—"}</td><td style={S.td}>{i.corretora||"—"}</td></React.Fragment>);}}/></div>);
}
const CR_F=[{key:"moeda",label:"Moeda"},{key:"ticker",label:"Ticker"},{key:"quantidade",label:"Qtd",type:"number",step:"0.00000001"},{key:"valorInvestido",label:"Investido",type:"number",step:"0.01"},{key:"valorAtual",label:"Atual",type:"number",step:"0.01"},{key:"exchange",label:"Exchange"},{key:"wallet",label:"Wallet"},{key:"dataCompra",label:"Data",type:"date"}];
function CrTab({data,setData}){const P=useT();const S=useS();const tI=data.reduce((a,i)=>a+(Number(i.valorInvestido)||0),0),tA=data.reduce((a,i)=>a+(Number(i.valorAtual)||Number(i.valorInvestido)||0),0),lp=tA-tI;return(<div><CryptoPanel/><CRUD title="Cripto" icon="◈" fields={CR_F} data={data} setData={setData} cards={<React.Fragment><SC label="Investido" value={fmt(tI)} color={P.orange} dim={P.orangeDim}/><SC label="Atual" value={fmt(tA)} color={P.blue} dim={P.blueDim}/><SC label="L/P" value={fmt(lp)} color={lp>=0?P.accent:P.red} dim={lp>=0?P.accentGlow:P.redDim}/></React.Fragment>} columns={["Ticker","Moeda","Qtd","Investido","Atual","L/P","Exchange","Custódia"]} renderRow={i=>{const l=(Number(i.valorAtual)||Number(i.valorInvestido)||0)-(Number(i.valorInvestido)||0);return(<React.Fragment><td style={{...S.td,fontWeight:700}}>{i.ticker||"—"}</td><td style={S.td}>{i.moeda||"—"}</td><td style={S.td}>{i.quantidade||"—"}</td><td style={S.td}>{fmt(i.valorInvestido)}</td><td style={S.td}>{fmt(i.valorAtual)}</td><td style={{...S.td,color:l>=0?P.accent:P.red,fontWeight:600}}>{fmt(l)}</td><td style={S.td}>{i.exchange||"—"}</td><td style={S.td}>{i.wallet||"—"}</td></React.Fragment>);}}/></div>);
}

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
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{fontSize:22,fontWeight:700}}>FIIs</div><div style={{display:"flex",gap:8}}><button style={sub==="cart"?S.btn():S.btnO} onClick={()=>setSub("cart")}>Carteira</button><button style={sub==="mkt"?S.btn():S.btnO} onClick={()=>setSub("mkt")}>Mercado</button></div></div>
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
const ORC_C=["Água","Almoços","Assinaturas","Clube","Comer Fora","Diarista","Educação","Gasolina","iFood","INSS","Internet","Investimentos","Jardim","Lazer","Luz","Mercado","Moradia","Netflix","Piscina","Preta","Remédio","Seguro Vida","Sepal","Shopee","Telefone","Unimed","Outros"].sort();
const ORC_REC=["Salário","Honorários","Outros"];
const AUTO_FIXO=["Água","Luz","Internet","Telefone","Unimed","Diarista","Clube","Educação","Preta","Gasolina","Jardim","Seguro Vida","Piscina","Assinaturas","Sepal","INSS"];
const ORC_F=[{key:"data",label:"Data",type:"date"},{key:"tipo",label:"Tipo",type:"select",options:["Despesa","Receita"]},{key:"categoria",label:"Categoria",type:"select",options:ORC_C,dynamicOptions:true},{key:"descricao",label:"Descrição",showWhen:"categoria=Outros"},{key:"valor",label:"Valor",type:"number",step:"0.01"},{key:"fixo",label:"Gasto Fixo",type:"checkbox",checkLabel:"Gasto fixo mensal",showWhen:"tipo=Despesa"}];
function OrcTab({data,setData}){const P=useT();const S=useS();
  const{sb:orcSb,sd:orcSd,onS:orcOnS,doS:orcDoS}=useSort("valor","desc");
  const[mF,setMF]=useState(()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;});
  const[modal,setModal]=useState(null);const[del,setDel]=useState(null);const[sub,setSub]=useState("visao");
  const[repCats,setRepCats]=useState([]);const[repMonths,setRepMonths]=useState([]);const[hoverPt,setHoverPt]=useState(null);
  const fl=data.filter(i=>i.data&&i.data.startsWith(mF));
  const rec=fl.filter(i=>i.tipo==="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0);
  const desp=fl.filter(i=>i.tipo!=="Receita").reduce((a,i)=>a+(Number(i.valor)||0),0);
  const sal=rec-desp;
  const bC={};fl.filter(i=>i.tipo!=="Receita").forEach(i=>{bC[i.categoria||"Outros"]=(bC[i.categoria||"Outros"]||0)+(Number(i.valor)||0);});const cS=Object.entries(bC).sort((a,b)=>b[1]-a[1]);
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
      const dup=data.find(x=>x.tipo!=="Receita"&&x.categoria===out.categoria&&x.data&&x.data.startsWith(month)&&x.id!==out.id);
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
        <button style={sub==="visao"?S.btn():S.btnO} onClick={()=>setSub("visao")}>Visão</button>
        <button style={sub==="relatorio"?S.btn():S.btnO} onClick={()=>setSub("relatorio")}>Relatório</button>
        <select style={{...S.sel,width:"auto",minWidth:140}} value={mF} onChange={e=>setMF(e.target.value)}>{aM.map(m=><option key={m} value={m}>{mL(m)}</option>)}</select>
        <button style={S.btn()} onClick={()=>setModal("new")}>+ Novo</button>
      </div>
    </div>

    {sub==="relatorio"?(<div>
      <div style={S.card}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Relatório Comparativo</div>
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
              <tbody>{repCats.map(cat=>(<tr key={cat}><td style={{...S.td,fontWeight:700}}>{cat}</td>{sortedM.map(m=>{const v=data.filter(i=>i.tipo!=="Receita"&&(i.categoria||"Outros")===cat&&i.data&&i.data.startsWith(m)).reduce((a,i)=>a+(Number(i.valor)||0),0);return(<td key={m} style={{...S.td,color:v>0?P.red:P.textMuted}}>{v>0?fmt(v):"—"}</td>);})}</tr>))}</tbody>
            </table>
          </div>
        </div>);
      })()}
    </div>):(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:24}}><SC label="Receitas" value={fmt(rec)} color={P.accent} dim={P.accentGlow}/><SC label="Despesas" value={fmt(desp)} color={P.red} dim={P.redDim}/><SC label="Saldo" value={fmt(sal)} color={sal>=0?P.accent:P.red} dim={sal>=0?P.accentGlow:P.redDim}/><SC label="Gastos Fixos" value={fmt(despFixo)} color={P.blue} dim={P.blueDim}/><SC label="Gastos Eventuais" value={fmt(despVar)} color={P.orange} dim={P.orangeDim}/></div>
    {(rec>0||desp>0)&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20}}>
      {(rec>0&&desp>0)&&<div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Receita vs Despesa</div><Pie data={pieRecDesp} size={200}/></div>}
      {desp>0&&<div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Por Categoria</div><Pie data={pieData}/></div>}
      {desp>0&&<div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Fixos vs Eventuais</div><Pie data={pieFixVar} size={200}/></div>}
    </div>)}
    {sF.length>0&&(<div style={{...S.card,padding:0,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr><STH label="Data" field="data" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Tipo" field="tipo" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Categoria" field="categoria" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Descrição" field="descricao" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Valor" field="valor" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><STH label="Fixo" field="fixo" sb={orcSb} sd={orcSd} onS={orcOnS} style={S.th}/><th style={S.th}></th></tr></thead><tbody>{sF.map(i=>(<TR key={i.id} onClick={()=>setModal(i)}><td style={S.td}>{fD(i.data)}</td><td style={S.td}><span style={S.tag(i.tipo==="Receita"?P.accent:P.red,i.tipo==="Receita"?P.accentGlow:P.redDim)}>{i.tipo||"Despesa"}</span></td><td style={S.td}>{i.categoria||"—"}</td><td style={S.td}>{i.descricao||"—"}</td><td style={{...S.td,fontWeight:600,color:i.tipo==="Receita"?P.accent:P.red}}>{fmt(i.valor)}</td><td style={S.td}>{i.fixo?<span style={S.tag(P.blue,P.blueDim)}>Fixo</span>:"—"}</td><td style={S.td}><button style={{background:"transparent",border:"none",color:P.textMuted,cursor:"pointer",fontSize:16,fontFamily:"inherit"}} onClick={e=>{e.stopPropagation();setDel(i.id);}}>✕</button></td></TR>))}</tbody></table></div>)}
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
    <div style={S.card}><div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Aparência</div><div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}><button style={isDark==="dark"||isDark===true?S.btn():S.btnO} onClick={()=>setIsDark("dark")}>🌙 Noturno</button><button style={isDark==="light"||isDark===false?S.btn():S.btnO} onClick={()=>setIsDark("light")}>☀️ Diurno</button><button style={isDark==="industrial"?S.btn():S.btnO} onClick={()=>setIsDark("industrial")}>🏭 Industrial</button><button style={isDark==="industrial-light"?S.btn():S.btnO} onClick={()=>setIsDark("industrial-light")}>🏛 Industrial Claro</button></div><div style={{fontSize:12,fontWeight:600,color:P.textDim,marginBottom:8}}>Fonte</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[{id:"mono",l:"JetBrains Mono"},{id:"roboto",l:"Roboto"},{id:"poppins",l:"Poppins"},{id:"montserrat",l:"Montserrat"}].map(f=>(<button key={f.id} style={font===f.id?S.btn():S.btnO} onClick={()=>setFont(f.id)}><span style={{fontFamily:f.id==="mono"?"'JetBrains Mono',monospace":f.l}}>{f.l}</span></button>))}</div></div>
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
function CryptoPanel(){const P=useT();const S=useS();
  const[quotes,setQuotes]=useState(()=>ld(SK.cryptoQ,[]));const[loading,setLoading]=useState(false);const[lastUp,setLastUp]=useState(()=>ld("ip8-cryptoLF",null));
  const fetchCrypto=async()=>{setLoading(true);try{
    // AwesomeAPI: BTC-BRL, ETH-BRL, DOGE-BRL
    const awR=await fetch("https://economia.awesomeapi.com.br/last/BTC-BRL,ETH-BRL,DOGE-BRL");
    let usdBrl=5.70;
    const usdR=await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
    if(usdR.ok){const ud=await usdR.json();if(ud.USDBRL)usdBrl=Number(ud.USDBRL.bid);}
    const q=[];
    if(awR.ok){const d=await awR.json();
      if(d.BTCBRL)q.push({id:"bitcoin",symbol:"BTC",name:"Bitcoin",usd:(Number(d.BTCBRL.bid)/usdBrl).toFixed(0),brl:Number(d.BTCBRL.bid).toFixed(2)});
      if(d.ETHBRL)q.push({id:"ethereum",symbol:"ETH",name:"Ethereum",usd:(Number(d.ETHBRL.bid)/usdBrl).toFixed(0),brl:Number(d.ETHBRL.bid).toFixed(2)});
      if(d.DOGEBRL)q.push({id:"dogecoin",symbol:"DOGE",name:"Dogecoin",usd:(Number(d.DOGEBRL.bid)/usdBrl).toFixed(4),brl:Number(d.DOGEBRL.bid).toFixed(4)});
    }
    // SHIB: not on AwesomeAPI, use estimate with USD rate
    const shibUsd=0.000014;q.push({id:"shiba-inu",symbol:"SHIB",name:"Shiba Inu",usd:shibUsd,brl:(shibUsd*usdBrl).toFixed(6)});
    if(q.length)setQuotes(q);sv(SK.cryptoQ,q);
    const now=new Date().toISOString();setLastUp(now);sv("ip8-cryptoLF",now);
  }catch{}setLoading(false);};
  useEffect(()=>{if(!quotes.length)fetchCrypto();},[]);
  return(<div style={{...S.card,marginBottom:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim}}>Cotações Criptomoedas (tempo real)</div><button style={S.btnO} onClick={fetchCrypto} disabled={loading}>{loading?"...":"⟳ Atualizar"}</button></div>
    {lastUp&&<div style={{fontSize:11,color:P.textMuted,marginBottom:12}}>Última: {new Date(lastUp).toLocaleDateString("pt-BR")} às {new Date(lastUp).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>}
    <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{quotes.map(q=>(<div key={q.id} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:8,padding:"12px 18px",minWidth:160}}><div style={{fontSize:13,fontWeight:700,color:P.text}}>{q.symbol}</div><div style={{fontSize:10,color:P.textMuted,marginBottom:4}}>{q.name}</div><div style={{fontSize:11,color:P.textDim}}>USD {Number(q.usd)<0.01?`$${q.usd}`:`$${Number(q.usd).toLocaleString("en-US")}`}</div><div style={{fontSize:16,fontWeight:700,color:P.orange}}>{q.brl?fmt(q.brl):"—"}</div></div>))}</div>
  </div>);
}

/* 3. BENCHMARK COMPARISON (used in Dashboard) */
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
  const crTotal=cr.reduce((a,i)=>a+(Number(i.valorInvestido)||0),0);
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
      {crTotal>0&&(<IrpfExpand label={`08 - Criptoativos (${cr.length} moedas) — ${fmt(crTotal)}`} P={P} S={S}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={{...S.th,fontSize:10}}>Moeda</th><th style={{...S.th,fontSize:10}}>Qtd</th><th style={{...S.th,fontSize:10}}>Investido</th></tr></thead>
        <tbody>{cr.map(i=>(<tr key={i.id}><td style={{...S.td,fontWeight:700}}>{i.ticker||i.moeda}</td><td style={S.td}>{i.quantidade}</td><td style={{...S.td,fontWeight:600}}>{fmt(i.valorInvestido)}</td></tr>))}</tbody></table>
      </IrpfExpand>)}
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
function PrfTab({prfRef}){const P=useT();const S=useS();const[sub,setSub]=useState("diarias");
  const ref=prfRef||DEF_PRF_REF;
  // Diárias
  const[dIni,setDIni]=useState("");const[dFim,setDFim]=useState("");const[dTipo,setDTipo]=useState("Interior");
  const[dHotel,setDHotel]=useState("");const[dLimpeza,setDLimpeza]=useState("");
  // NETWORKDAYS helper (count weekdays between two dates)
  const networkDays=(start,end)=>{if(!start||!end)return 0;let d=new Date(start),e=new Date(end),count=0;while(d<=e){const dow=d.getDay();if(dow!==0&&dow!==6)count++;d.setDate(d.getDate()+1);}return count;};
  // EOMONTH helper
  const eoMonth=(dt,offset)=>{const d=new Date(dt);d.setMonth(d.getMonth()+1+offset);d.setDate(0);return d;};
  const dDias=(()=>{if(!dIni||!dFim)return 0;const d=Math.max(0,Math.floor((new Date(dFim)-new Date(dIni))/(864e5)));return d>0?d+0.5:0;})();
  const dValor=dTipo==="Capitais"?(ref.diariaCapitais||380):dTipo==="Interior"?(ref.diariaInterior||335):(ref.diariaSPRJ||425);
  const dTotal=dDias*dValor;
  // Desc Alimentação: (1175/NETWORKDAYS(EOMONTH(dIni,-1)+1, EOMONTH(dIni,0))) * NETWORKDAYS(dIni,dFim)
  const dDescAlim=(()=>{if(!dIni||!dFim)return 0;
    const eoMonthPrev=eoMonth(dIni,-1);const firstOfMonth=new Date(eoMonthPrev);firstOfMonth.setDate(firstOfMonth.getDate()+1);
    const eoMonthCur=eoMonth(dIni,0);
    const wdMonth=networkDays(firstOfMonth,eoMonthCur);
    if(wdMonth<=0)return 0;
    const wdTrip=networkDays(new Date(dIni),new Date(dFim));
    return(1175/wdMonth)*wdTrip;
  })();
  const dLiquido=dTotal-dDescAlim;
  const dHotelNum=Number(dHotel)||0;const dLimpezaNum=Number(dLimpeza)||0;
  const dHospTotal=dHotelNum*Math.floor(dDias)+dLimpezaNum;
  const dRestante=dLiquido-dHospTotal;
  // ADFRON lost: days away × daily ADFRON rate
  const diasInteiros=Math.ceil(dDias);
  const adfronPerdido=diasInteiros*(ref.diaADFRON||92);
  const saldoVsAdfron=dRestante-adfronPerdido;
  // ADFRON/GECC
  const[adDias,setAdDias]=useState("");const[gcHoras,setGcHoras]=useState("");
  const adTotal=(Number(adDias)||0)*(ref.diaADFRON||92);
  const gcBruto=(Number(gcHoras)||0)*(ref.horaGECC||151.78);
  const gcLiq=gcBruto*(1-0.275);
  const adWin=adTotal>=gcLiq;
  // Aposentadoria
  const[apNasc,setApNasc]=useState("");const[apEntrada,setApEntrada]=useState("");const[apFator,setApFator]=useState("1.0");
  const calcApos=(targetDate)=>{const now=new Date();const t=new Date(targetDate);if(isNaN(t.getTime()))return"—";const diff=t-now;if(diff<=0)return"Atingido!";const totalDias=Math.floor(diff/(864e5));const anos=Math.floor(totalDias/365);const meses=Math.floor((totalDias%365)/30);const dias=totalDias%30;return`${anos}a ${meses}m ${dias}d`;};
  // With factor: target date comes CLOSER by factor (fewer effective days to wait)
  const calcDataFator=(targetDate,fator)=>{const now=new Date();const t=new Date(targetDate);if(isNaN(t.getTime()))return{text:"—",date:null};const diff=t-now;if(diff<=0)return{text:"Atingido!",date:null};const totalDias=Math.floor(diff/(864e5));const diasFator=Math.floor(totalDias/Number(fator||1));const novaData=new Date(now.getTime()+diasFator*864e5);const anos=Math.floor(diasFator/365);const meses=Math.floor((diasFator%365)/30);const dias=diasFator%30;return{text:`${anos}a ${meses}m ${dias}d`,date:novaData.toISOString().slice(0,10)};};
  const idade55=(()=>{if(!apNasc)return null;const n=new Date(apNasc);const t=new Date(n);t.setFullYear(t.getFullYear()+55);return t.toISOString().slice(0,10);})();
  const tempo30=(()=>{if(!apEntrada)return null;const e=new Date(apEntrada);const t=new Date(e);t.setFullYear(t.getFullYear()+30);return t.toISOString().slice(0,10);})();
  const id55f=idade55?calcDataFator(idade55,apFator):null;
  const tp30f=tempo30?calcDataFator(tempo30,apFator):null;

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}><div style={{fontSize:22,fontWeight:700}}>PRF</div><div style={{display:"flex",gap:8}}><button style={sub==="diarias"?S.btn():S.btnO} onClick={()=>setSub("diarias")}>Diárias</button><button style={sub==="adfron"?S.btn():S.btnO} onClick={()=>setSub("adfron")}>ADFRON/GECC</button><button style={sub==="apos"?S.btn():S.btnO} onClick={()=>setSub("apos")}>Aposentadoria</button></div></div>

    {sub==="diarias"&&(<div style={S.card}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Diárias</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:20}}>
        <div><label style={S.lbl}>Data Início</label><input style={S.i} type="date" value={dIni} onChange={e=>setDIni(e.target.value)}/></div>
        <div><label style={S.lbl}>Data Final</label><input style={S.i} type="date" value={dFim} onChange={e=>setDFim(e.target.value)}/></div>
        <div><label style={S.lbl}>Destino</label><select style={S.sel} value={dTipo} onChange={e=>setDTipo(e.target.value)}><option value="Capitais">Capitais — R$ 380,00</option><option value="SP/RJ/AM/BSB">SP/RJ/AM/BSB — R$ 425,00</option><option value="Interior">Interior — R$ 335,00</option></select></div>
        <div><label style={S.lbl}>Diária Hotel</label><input style={S.i} type="number" step="0.01" placeholder="R$/noite" value={dHotel} onChange={e=>setDHotel(e.target.value)}/></div>
        <div><label style={S.lbl}>Taxa Limpeza</label><input style={S.i} type="number" step="0.01" placeholder="R$ total" value={dLimpeza} onChange={e=>setDLimpeza(e.target.value)}/></div>
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
          {(dHotelNum>0||dLimpezaNum>0)&&<><div style={{color:P.textDim,fontSize:14,fontWeight:700,borderTop:`2px solid ${P.accent}`,paddingTop:8}}>Valor Restante</div><div style={{fontSize:20,fontWeight:700,color:dRestante>=0?P.accent:P.red,textAlign:"right",borderTop:`2px solid ${P.accent}`,paddingTop:8}}>{fmt(dRestante)}</div></>}
          {dDias>0&&<><div style={{color:P.textDim,borderTop:`2px solid ${P.border}`,paddingTop:10,marginTop:4}}>ADFRON perdido ({diasInteiros}d × {fmt(ref.diaADFRON||92)})</div><div style={{fontWeight:600,textAlign:"right",color:P.red,borderTop:`2px solid ${P.border}`,paddingTop:10}}>- {fmt(adfronPerdido)}</div>
          <div style={{color:P.textDim,fontSize:14,fontWeight:700,borderTop:`2px solid ${P.border}`,paddingTop:8}}>Saldo Final (Diárias − ADFRON)</div><div style={{fontSize:22,fontWeight:700,color:saldoVsAdfron>=0?P.accent:P.red,textAlign:"right",borderTop:`2px solid ${P.border}`,paddingTop:8}}>{fmt(saldoVsAdfron)}</div>
          <div colSpan={2} style={{gridColumn:"1/-1",textAlign:"center",fontSize:11,marginTop:8,padding:"8px 12px",borderRadius:6,background:saldoVsAdfron>=0?P.accentGlow:P.redDim,color:saldoVsAdfron>=0?P.accent:P.red,fontWeight:600}}>{saldoVsAdfron>=0?"✓ Compensa viajar — saldo positivo após ADFRON":"✗ Não compensa — você perde dinheiro viajando"}</div></>}
        </div>
      </div>
    </div>)}

    {sub==="adfron"&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={S.card}><div style={{fontSize:14,fontWeight:700,marginBottom:16}}>ADFRON</div><div><label style={S.lbl}>Dias ADFRON</label><input style={S.i} type="number" value={adDias} onChange={e=>setAdDias(e.target.value)}/></div><div style={{marginTop:12,fontSize:11,color:P.textDim}}>Valor/dia: {fmt(ref.diaADFRON||92)}</div><div style={{marginTop:12,padding:16,borderRadius:8,fontSize:20,fontWeight:700,textAlign:"center",background:adWin?"rgba(16,185,129,0.12)":P.surfaceAlt,color:adWin?P.accent:P.text}}>{fmt(adTotal)}</div>{adWin&&<div style={{textAlign:"center",fontSize:11,color:P.accent,marginTop:6,fontWeight:600}}>Melhor opção</div>}</div>
      <div style={S.card}><div style={{fontSize:14,fontWeight:700,marginBottom:16}}>GECC</div><div><label style={S.lbl}>Horas GECC</label><input style={S.i} type="number" value={gcHoras} onChange={e=>setGcHoras(e.target.value)}/></div><div style={{marginTop:12,fontSize:11,color:P.textDim}}>Valor/hora: {fmt(ref.horaGECC||151.78)} · Desconto: 27,5%</div><div style={{marginTop:4,fontSize:11,color:P.textMuted}}>Bruto: {fmt(gcBruto)}</div><div style={{marginTop:8,padding:16,borderRadius:8,fontSize:20,fontWeight:700,textAlign:"center",background:!adWin?"rgba(16,185,129,0.12)":P.surfaceAlt,color:!adWin?P.accent:P.text}}>{fmt(gcLiq)}</div>{!adWin&&gcLiq>0&&<div style={{textAlign:"center",fontSize:11,color:P.accent,marginTop:6,fontWeight:600}}>Melhor opção</div>}</div>
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

/* IMÓVEIS TAB — with real estate indices + fetch */
function ImoveisTab(){const P=useT();const S=useS();
  const[incc,setIncc]=useState("—");const[fipezap,setFipezap]=useState("—");const[loading,setLoading]=useState(false);
  const fetchIdx=async()=>{setLoading(true);try{
    const r=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.27574/dados/ultimos/1?formato=json");
    if(r.ok){const d=await r.json();if(d[0])setIncc(d[0].valor);}
    // FIPEZAP not available via free API, use BCB INCC-DI as proxy
    const r2=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.192/dados/ultimos/1?formato=json");
    if(r2.ok){const d2=await r2.json();if(d2[0])setFipezap(d2[0].valor+"% (INCC-DI)");}
  }catch(e){console.error(e);}setLoading(false);};
  const indices=[
    {nome:"FIPEZAP / INCC-DI",desc:"Índice de custo da construção",valor:fipezap,fonte:"BCB SGS 192"},
    {nome:"IGPM",desc:"Índice Geral de Preços do Mercado",valor:RATES.igpm?fP(RATES.igpm):"—",fonte:"BCB"},
    {nome:"IPCA",desc:"Índice de Preços ao Consumidor Amplo",valor:RATES.ipca12m?fP(RATES.ipca12m):"—",fonte:"BCB"},
    {nome:"INCC",desc:"Índice Nacional da Construção Civil",valor:incc,fonte:"BCB SGS 27574"},
  ];
  return(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}><div style={{fontSize:22,fontWeight:700}}>Imóveis</div><button style={S.btn()} onClick={fetchIdx} disabled={loading}>{loading?"Carregando...":"⟳ Atualizar Índices"}</button></div>
    <div style={S.card}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Índices Imobiliários</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
        {indices.map(idx=>(<div key={idx.nome} style={{background:P.surfaceAlt,border:`1px solid ${P.border}`,borderRadius:10,padding:"16px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:P.text,marginBottom:4}}>{idx.nome}</div>
          <div style={{fontSize:10,color:P.textMuted,marginBottom:8}}>{idx.desc}</div>
          <div style={{fontSize:22,fontWeight:700,color:P.accent}}>{idx.valor}</div>
          <div style={{fontSize:9,color:P.textMuted,marginTop:4}}>Fonte: {idx.fonte}</div>
        </div>))}
      </div>
    </div>
    <div style={{...S.card,textAlign:"center",padding:40}}><div style={{fontSize:14,color:P.textMuted}}>Simulador de financiamento em desenvolvimento</div></div>
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

/* DASHBOARD with pie charts */
function Dash({rf,inco,ac,etfs,fiis,cr,indices,orc}){const P=useT();const S=useS();
  const tRF=rf.reduce((a,i)=>a+(Number(i.valor)||0),0);const rfE=rf.map(i=>({...i,...calcRF(i)}));const mRF=rfE.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const tIN=inco.reduce((a,i)=>a+(Number(i.valor)||0),0);const inE=inco.map(i=>({...i,...calcINCO(i)}));const mIN=inE.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const tAc=ac.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0);
  const tEt=etfs.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0);
  const tFi=fiis.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0),dFi=fiis.reduce((a,i)=>a+(Number(i.dividendoMensal)||0),0);
  const tCr=cr.reduce((a,i)=>a+(Number(i.valorInvestido)||0),0);const tG=tRF+tIN+tAc+tEt+tFi+tCr;const tRM=mRF+mIN+dFi;
  const retPct=tG>0?((tRM/tG)*100):0;
  // Salário mínimo from indices
  const smIdx=indices.find(i=>i.nome==="Sal.Mínimo");
  const salMin=smIdx&&smIdx.valor?Number(smIdx.valor):1518;
  const smRatio=salMin>0?(tRM/salMin):0;
  const patD=[{label:"RF",value:tRF,color:P.blue},{label:"INCO",value:tIN,color:P.cyan},{label:"Ações",value:tAc,color:P.yellow},{label:"ETFs",value:tEt,color:"#0891b2"},{label:"FIIs",value:tFi,color:P.purple},{label:"Cripto",value:tCr,color:P.orange}];
  const renD=[{label:"RF",value:mRF,color:P.blue},{label:"INCO",value:mIN,color:P.cyan},{label:"FIIs",value:dFi,color:P.purple}];
  return(<div><div style={{fontSize:22,fontWeight:700,marginBottom:24}}>Dashboard</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      <div style={{background:`linear-gradient(135deg, ${P.accent}22, ${P.accent}08)`,border:`2px solid ${P.accent}44`,borderRadius:14,padding:"28px 24px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-20,right:-20,width:120,height:120,background:P.accentGlow,borderRadius:"50%",opacity:0.3}}/><div style={{fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:P.accent,marginBottom:10,opacity:0.8}}>Valor Investido</div><div style={{fontSize:32,fontWeight:700,color:P.accent,letterSpacing:"-1px"}}>{fmt(tG)}</div></div>
      <div style={{background:`linear-gradient(135deg, ${P.purple}22, ${P.purple}08)`,border:`2px solid ${P.purple}44`,borderRadius:14,padding:"28px 24px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-20,right:-20,width:120,height:120,background:P.purpleDim,borderRadius:"50%",opacity:0.3}}/><div style={{fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:P.purple,marginBottom:10,opacity:0.8}}>Renda Mensal Passiva</div><div style={{fontSize:32,fontWeight:700,color:P.purple,letterSpacing:"-1px"}}>{fmt(tRM)}</div><div style={{fontSize:11,color:P.textDim,marginTop:6}}>RF: {fmt(mRF)} · INCO: {fmt(mIN)} · FIIs: {fmt(dFi)}</div></div>
    </div>
    {/* Return metrics */}
    {(()=>{
      // Gastos fixos from current month budget
      const cm=`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
      const orcMes=orc.filter(i=>i.data&&i.data.startsWith(cm));
      const gastosFixos=orcMes.filter(i=>i.tipo!=="Receita"&&i.fixo).reduce((a,i)=>a+(Number(i.valor)||0),0);
      const cobertura=gastosFixos>0?((tRM/gastosFixos)*100):0;
      // Gross salary CLT equivalent (nova regra: isento até R$ 5.000)
      // Above 5k: INSS ~14% + IRRF progressivo
      // Simplified: net ≈ gross - INSS(14%) - IRRF on (gross-INSS-5000) at ~27.5%
      const calcBrutoCLT=(netTarget)=>{if(netTarget<=0)return 0;
        // Iterative: find gross where net(gross)=target
        let lo=netTarget,hi=netTarget*3;
        for(let i=0;i<50;i++){const mid=(lo+hi)/2;
          const inss=Math.min(mid*0.14,908.85); // teto INSS
          const base=mid-inss;const isento=5000;
          const tributavel=Math.max(0,base-isento);
          // Tabela progressiva simplificada 27.5% para faixa alta
          const irrf=tributavel>0?tributavel*0.275:0;
          const net=mid-inss-irrf;
          if(net<netTarget)lo=mid;else hi=mid;
        }return(lo+hi)/2;
      };
      const salBrutoEquiv=tRM>0?calcBrutoCLT(tRM):0;
      return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:20}}>
        <SC label="Taxa de Retorno Mensal" value={fP(retPct)} color={P.cyan} dim={P.cyanDim}/>
        <SC label="Em Salários Mínimos" value={`${smRatio.toFixed(2)} salários`} color={P.yellow} dim={P.yellowDim}/>
        <SC label="Cobertura Gastos Fixos" value={gastosFixos>0?`${cobertura.toFixed(1)}%`:"—"} color={cobertura>=100?P.accent:P.orange} dim={cobertura>=100?P.accentGlow:P.orangeDim}/>
        <SC label="Equiv. Salário Bruto CLT" value={salBrutoEquiv>0?fmt(salBrutoEquiv):"—"} color={P.purple} dim={P.purpleDim}/>
      </div>);
    })()}
    {tG>0&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}><div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Valor Investido</div><Pie data={patD} size={240}/></div>{tRM>0&&<div style={{...S.card,padding:24}}><div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",color:P.textDim,marginBottom:18}}>Renda Mensal</div><Pie data={renD} size={240}/></div>}</div>)}
    {tG>0&&<BenchmarkPanel tG={tG} retPctAnual={retPct*12} P={P} S={S}/>}
    {indices.some(i=>i.valor)&&(<div style={S.card}><div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",color:P.textDim,marginBottom:14}}>Índices</div><div style={{display:"flex",flexWrap:"wrap",gap:14}}>{indices.filter(i=>i.valor).map(i=>(<div key={i.nome} style={{minWidth:100}}><div style={{fontSize:10,color:P.textMuted}}>{i.nome}</div><div style={{fontSize:14,fontWeight:700}}>{i.unidade==="R$"?fmt(i.valor):fP(i.valor)}</div></div>))}</div></div>)}
  </div>);
}

const DEF_IND=[{nome:"Sal.Mínimo",valor:"",unidade:"R$"},{nome:"SELIC (meta)",valor:"",unidade:"%"},{nome:"SELIC (mês)",valor:"",unidade:"%"},{nome:"SELIC (acum.jan)",valor:"",unidade:"%"},{nome:"IPCA (mês)",valor:"",unidade:"%"},{nome:"IPCA (acum.12m)",valor:"",unidade:"%"},{nome:"CDI (mês)",valor:"",unidade:"%"},{nome:"CDI (acum.12m)",valor:"",unidade:"%"},{nome:"Poupança",valor:"",unidade:"%"},{nome:"INCC",valor:"",unidade:"%"},{nome:"IGPM",valor:"",unidade:"%"},{nome:"Dólar",valor:"",unidade:"R$"}];

export default function App(){
  const[userId,setUserId]=useState(()=>localStorage.getItem("ip8-userId")||"");const[loggedIn,setLoggedIn]=useState(()=>!!localStorage.getItem("ip8-userId"));const[syncStatus,setSyncStatus]=useState("");const[loginCode,setLoginCode]=useState("");
  const[isDark,setIsDark]=useState(()=>ld(SK.theme,"industrial"));const[tab,setTab]=useState("dashboard");
  const[font,setFont]=useState(()=>ld("ip8-font","montserrat"));
  const[rf,setRf]=useState(()=>ld(SK.rf,[]));const[inco,setInco]=useState(()=>ld(SK.inco,[]));
  const[ac,setAc]=useState(()=>ld(SK.ac,[]));const[etfs,setEtfs]=useState(()=>ld(SK.etf,[]));
  const[fiis,setFiis]=useState(()=>ld(SK.fii,[]));const[cr,setCr]=useState(()=>ld(SK.cr,[]));
  const[indices,setIndices]=useState(()=>ld(SK.ind,DEF_IND));
  const[prfRef,setPrfRef]=useState(()=>ld(SK.prfRef,DEF_PRF_REF));
  const[aportes,setAportes]=useState(()=>ld(SK.ap,[]));const[orc,setOrc]=useState(()=>ld(SK.orc,[]));
  const[banks,setBanks]=useState(()=>ld(SK.banks,DBANKS));const[apMeta,setApMeta]=useState(()=>ld(SK.apMeta,0));
  const[fiiMkt,setFiiMkt]=useState(()=>ld(SK.fiiMkt,FII_MKT_DEF));
  const[evo,setEvo]=useState(()=>ld(SK.evo,[]));
  useEffect(()=>{if(userId)loadFromFirestore(userId);},[]);
  const loadFromFirestore=async(uid)=>{try{setSyncStatus("Sincronizando...");const snap=await getDoc(doc(db,"investpro",uid));if(snap.exists()){const d=snap.data();if(d.rf)setRf(d.rf);if(d.inco)setInco(d.inco);if(d.ac)setAc(d.ac);if(d.etfs)setEtfs(d.etfs);if(d.fiis)setFiis(d.fiis);if(d.cr)setCr(d.cr);if(d.indices)setIndices(d.indices);if(d.aportes)setAportes(d.aportes);if(d.orc)setOrc(d.orc);if(d.banks)setBanks(d.banks);if(d.apMeta!=null)setApMeta(d.apMeta);if(d.fiiMkt)setFiiMkt(d.fiiMkt);if(d.evo)setEvo(d.evo);if(d.theme!=null)setIsDark(d.theme);if(d.font)setFont(d.font);if(d.prfRef)setPrfRef(d.prfRef);}setSyncStatus("\u2713 Sincronizado");setTimeout(()=>setSyncStatus(""),3000);}catch(e){console.error(e);setSyncStatus("Erro sync");}};
  const saveTimer=useRef(null);const saveToFirestore=useCallback(()=>{if(!userId)return;if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(async()=>{try{await setDoc(doc(db,"investpro",userId),{rf,inco,ac,etfs,fiis,cr,indices,aportes,orc,banks,apMeta,fiiMkt,evo,theme:isDark,font,prfRef,updatedAt:new Date().toISOString()},{merge:true});}catch(e){console.error(e);}},2000);},[userId,rf,inco,ac,etfs,fiis,cr,indices,aportes,orc,banks,apMeta,fiiMkt,evo,isDark,font,prfRef]);
  useEffect(()=>{sv(SK.theme,isDark);},[isDark]);useEffect(()=>{sv("ip8-font",font);},[font]);useEffect(()=>{sv(SK.rf,rf);},[rf]);useEffect(()=>{sv(SK.inco,inco);},[inco]);useEffect(()=>{sv(SK.ac,ac);},[ac]);useEffect(()=>{sv(SK.etf,etfs);},[etfs]);useEffect(()=>{sv(SK.fii,fiis);},[fiis]);useEffect(()=>{sv(SK.cr,cr);},[cr]);useEffect(()=>{sv(SK.ind,indices);},[indices]);useEffect(()=>{sv(SK.ap,aportes);},[aportes]);useEffect(()=>{sv(SK.orc,orc);},[orc]);useEffect(()=>{sv(SK.banks,banks);},[banks]);useEffect(()=>{sv(SK.apMeta,apMeta);},[apMeta]);useEffect(()=>{sv(SK.fiiMkt,fiiMkt);},[fiiMkt]);useEffect(()=>{sv(SK.evo,evo);},[evo]);useEffect(()=>{sv(SK.prfRef,prfRef);},[prfRef]);
  useEffect(()=>{if(userId)saveToFirestore();},[rf,inco,ac,etfs,fiis,cr,indices,aportes,orc,banks,apMeta,fiiMkt,evo,isDark,font,prfRef,saveToFirestore]);
  useEffect(()=>{const c=ld(SK.rates,null);if(c)RATES=c;},[]);
  const allState=()=>({rf,inco,ac,etfs,fiis,cr,indices,aportes,orc,banks,apMeta,fiiMkt,evo,theme:isDark,prfRef,font});
  const loadState=d=>{if(d.rf)setRf(d.rf);if(d.inco)setInco(d.inco);if(d.ac)setAc(d.ac);if(d.etfs)setEtfs(d.etfs);if(d.fiis)setFiis(d.fiis);if(d.cr)setCr(d.cr);if(d.indices)setIndices(d.indices);if(d.aportes)setAportes(d.aportes);if(d.orc)setOrc(d.orc);if(d.banks)setBanks(d.banks);if(d.apMeta!=null)setApMeta(d.apMeta);if(d.fiiMkt)setFiiMkt(d.fiiMkt);if(d.evo)setEvo(d.evo);if(d.theme!=null)setIsDark(d.theme);if(d.prfRef)setPrfRef(d.prfRef);};
  const P=isDark==="dark"||isDark===true?DARK:isDark==="industrial"?INDUSTRIAL:isDark==="industrial-light"?INDUSTRIAL_LIGHT:LIGHT;
  const[clock,setClock]=useState("");const[todayStr,setTodayStr]=useState("");const[weekDay,setWeekDay]=useState("");
  useEffect(()=>{const t=setInterval(()=>{const n=new Date();setClock(n.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));setTodayStr(n.toLocaleDateString("pt-BR"));setWeekDay(n.toLocaleDateString("pt-BR",{weekday:"long"}));},1000);return()=>clearInterval(t);},[]);
  // Login/logout functions
  const doLogin=()=>{if(!loginCode.trim())return;const code=loginCode.trim().toLowerCase().replace(/\s+/g,"-");localStorage.setItem("ip8-userId",code);setUserId(code);setLoggedIn(true);loadFromFirestore(code);};
  const doLogout=()=>{localStorage.removeItem("ip8-userId");setUserId("");setLoggedIn(false);};
  if(!loggedIn)return(<div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:INDUSTRIAL.bg,fontFamily:"'Montserrat',sans-serif"}}><div style={{textAlign:"center",background:INDUSTRIAL.surface,border:"1px solid "+INDUSTRIAL.border,borderRadius:16,padding:"48px 40px",minWidth:360}}><div style={{fontSize:32,fontWeight:700,color:INDUSTRIAL.accent,marginBottom:8}}>◉ NOD-INVEST</div><div style={{fontSize:13,color:INDUSTRIAL.textDim,marginBottom:32}}>Gestão de Investimentos</div><div style={{fontSize:12,color:INDUSTRIAL.textDim,marginBottom:10,textAlign:"left"}}>Código de acesso:</div><input value={loginCode} onChange={e=>setLoginCode(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doLogin();}} placeholder="Ex: ivan-2026" style={{width:"100%",padding:"14px 16px",fontSize:16,fontWeight:600,border:"1px solid "+INDUSTRIAL.border,borderRadius:10,background:INDUSTRIAL.surfaceAlt,color:INDUSTRIAL.text,fontFamily:"inherit",marginBottom:16,boxSizing:"border-box",textAlign:"center",letterSpacing:"1px"}}/><button onClick={doLogin} style={{width:"100%",padding:"14px 24px",fontSize:14,fontWeight:600,color:"#fff",background:INDUSTRIAL.accent,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit"}}>Entrar</button><div style={{fontSize:10,color:INDUSTRIAL.textMuted,marginTop:16}}>Use o mesmo código em qualquer dispositivo para sincronizar seus dados.</div></div></div>);

  // Calculate monthly return % for SimTab
  const _rfE=rf.map(i=>({...i,...calcRF(i)})),_mRF=_rfE.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const _inE=inco.map(i=>({...i,...calcINCO(i)})),_mIN=_inE.reduce((a,i)=>a+(Number(i.rendMensal)||0),0);
  const _dFi=fiis.reduce((a,i)=>a+(Number(i.dividendoMensal)||0),0);
  const _tG=rf.reduce((a,i)=>a+(Number(i.valor)||0),0)+inco.reduce((a,i)=>a+(Number(i.valor)||0),0)+ac.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0)+etfs.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0)+fiis.reduce((a,i)=>a+(Number(i.quantidade)||0)*(Number(i.precoMedio)||0),0)+cr.reduce((a,i)=>a+(Number(i.valorInvestido)||0),0);
  const _tRM=_mRF+_mIN+_dFi;const _retPct=_tG>0?((_tRM/_tG)*100):0;
  const rT=()=>{switch(tab){case"dashboard":return<Dash rf={rf} inco={inco} ac={ac} etfs={etfs} fiis={fiis} cr={cr} indices={indices} orc={orc}/>;case"comp":return<CompTab/>;case"evo":return<EvoTab data={evo} setData={setEvo}/>;case"rf":return<RFTab data={rf} setData={setRf} banks={banks} dashRetPct={_retPct}/>;case"inco":return<IncoTab data={inco} setData={setInco}/>;case"ac":return<AcTab data={ac} setData={setAc}/>;case"etf":return<EtfTab data={etfs} setData={setEtfs}/>;case"fii":return<FiiTab data={fiis} setData={setFiis} fiiMkt={fiiMkt} setFiiMkt={setFiiMkt}/>;case"cr":return<CrTab data={cr} setData={setCr}/>;case"ap":return<ApTab data={aportes} setData={setAportes} banks={banks} meta={apMeta} setMeta={setApMeta}/>;case"sim":return<SimTab retPctMensal={_retPct}/>;case"orc":return<OrcTab data={orc} setData={setOrc}/>;case"ind":return<IndTab data={indices} setData={setIndices} prfRef={prfRef} setPrfRef={setPrfRef}/>;case"irpf":return<IrpfTab rf={rf} inco={inco} fiis={fiis} fiiMkt={fiiMkt} ac={ac} etfs={etfs} cr={cr}/>;case"prf":return<PrfTab prfRef={prfRef}/>;case"imoveis":return<ImoveisTab/>;case"cfg":return<CfgTab banks={banks} setBanks={setBanks} isDark={isDark} setIsDark={setIsDark} allState={allState} loadState={loadState} font={font} setFont={setFont}/>;default:return null;}};
  function SBItem({t}){const[h,setH]=useState(false);const active=tab===t.id;return(<div onClick={()=>setTab(t.id)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"10px 16px",cursor:"pointer",fontSize:12,fontWeight:active?600:400,color:active?P.accent:h?P.text:P.textDim,background:active?P.accentGlow:h?P.hover:"transparent",borderRight:active?`2px solid ${P.accent}`:"2px solid transparent",transition:"all 0.15s",borderRadius:h&&!active?"4px 0 0 4px":"0"}}><span style={{fontSize:14,opacity:active?1:h?0.9:0.7,transition:"opacity 0.15s"}}>{t.ic}</span>{t.l}</div>);}
  const SBG=({items,label})=>(<div>{label&&<div style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:P.textMuted,padding:"12px 16px 4px",textAlign:"center"}}>{label}</div>}{items.map(t=>(<SBItem key={t.id} t={t}/>))}</div>);
  // Clock

  const fontFamily=font==="roboto"?"'Roboto',sans-serif":font==="poppins"?"'Poppins',sans-serif":font==="montserrat"?"'Montserrat',sans-serif":"'JetBrains Mono','SF Mono',monospace";
  return(<TC.Provider value={P}><div style={{fontFamily,background:P.bg,color:P.text,minHeight:"100vh",fontSize:13}}>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
    <div className="dsb" style={{position:"fixed",left:0,top:0,bottom:0,width:210,background:P.sidebarBg||P.surface,borderRight:`1px solid ${P.border}`,display:"flex",flexDirection:"column",zIndex:10}}><div style={{padding:"16px 16px 10px",borderBottom:`1px solid ${P.border}`,textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:P.accent,letterSpacing:"-0.5px"}}>◉ NOD-INVEST</div><div style={{fontSize:20,fontWeight:300,color:P.textDim,marginTop:6,letterSpacing:"2px",fontVariantNumeric:"tabular-nums"}}>{clock}</div><div style={{fontSize:11,color:P.textMuted,marginTop:2}}>{todayStr}</div><div style={{fontSize:10,color:P.textMuted,textTransform:"capitalize"}}>{weekDay}</div></div><div style={{flex:1,overflowY:"auto"}}><SBG items={TABS_M}/><div style={{borderBottom:`2px solid ${P.textMuted}44`,margin:"4px 16px"}}/><SBG items={TABS_I} label="Investimentos"/><div style={{borderBottom:`2px solid ${P.textMuted}44`,margin:"4px 16px"}}/><SBG items={TABS_G} label="Gestão"/><div style={{borderBottom:`2px solid ${P.textMuted}44`,margin:"4px 16px"}}/><SBG items={TABS_S}/></div><div style={{padding:"10px 16px",borderTop:`1px solid ${P.border}`,fontSize:10,color:P.textMuted}}>NOD-INVEST v12.0</div>{syncStatus&&<div style={{padding:"4px 16px",fontSize:9,color:syncStatus.includes("\u2713")?P.accent:P.textMuted}}>{syncStatus}</div>}<div style={{padding:"6px 16px 10px",borderTop:"1px solid "+P.border}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:9,color:P.textMuted}}>{userId}</span><button onClick={doLogout} style={{fontSize:9,color:P.textMuted,background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Sair</button></div></div></div>
    <div className="mn" style={{position:"fixed",top:0,left:0,right:0,height:50,background:P.surface,borderBottom:`1px solid ${P.border}`,display:"none",alignItems:"center",padding:"0 8px",zIndex:20,overflowX:"auto",gap:2}}><span style={{color:P.accent,fontWeight:700,fontSize:13,marginRight:4,flexShrink:0}}>◉ NOD</span>{ALL_T.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"5px 7px",borderRadius:5,fontSize:10,fontWeight:tab===t.id?600:400,color:tab===t.id?P.accent:P.textDim,background:tab===t.id?P.accentGlow:"transparent",border:"none",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{t.l}</button>))}</div>
    <div className="mc" style={{marginLeft:210,padding:"24px 28px",minHeight:"100vh"}}>{rT()}</div>
    <style>{`.mn{display:none!important}@media(max-width:800px){.dsb{display:none!important}.mn{display:flex!important}.mc{margin-left:0!important;padding:60px 12px 20px!important}}`}</style>
  </div></TC.Provider>);
}
