/* ===== Orçamento: frescor dos gastos e simulação de gastos fixos ===== */
import{localISO,ymdToUTC}from"./util.js";
const n=x=>Number(x)||0;
const gastoReal=i=>i&&i.tipo!=="Receita"&&n(i.valor)>0&&/^\d{4}-\d{2}-\d{2}/.test(i.data||"");
/* Aviso de atualização. Só conta gasto real (valor > 0, até hoje); linhas-modelo dos fixos (valor vazio) não contam.
   ok = há gasto nos últimos 15 dias. last/dias = último gasto registrado (mesmo quando desatualizado; null se não há nenhum). */
export const orcFrescor=(data,agora=new Date())=>{
  if(!data||!data.length)return null;
  const hoje=localISO(agora),q15=localISO(new Date(agora.getFullYear(),agora.getMonth(),agora.getDate()-15));
  const reais=data.filter(i=>gastoReal(i)&&i.data.slice(0,10)<=hoje);
  if(!reais.length)return{ok:false,last:null,dias:null};
  const last=reais.reduce((a,b)=>b.data>a.data?b:a).data.slice(0,10);
  return{ok:last>=q15,last,dias:Math.round((ymdToUTC(hoje)-ymdToUTC(last))/864e5)};
};
/* Base dos gastos fixos: uma linha por categoria marcada como fixa.
   Valor = soma no mês atual; se a categoria ainda não tem valor lançado no mês (linha-modelo em branco),
   usa a soma do mês mais recente com valor (ref = esse mês) — até 12 meses para trás. */
export const orcFixosBase=(data,mesAtual)=>{
  const fixos=(data||[]).filter(i=>i&&i.fixo&&i.tipo!=="Receita"&&/^\d{4}-\d{2}/.test(i.data||"")&&i.data.slice(0,7)<=mesAtual);
  const porCat={};fixos.forEach(i=>{const c=i.categoria||"Outros",m=i.data.slice(0,7);(porCat[c]=porCat[c]||{})[m]=((porCat[c][m])||0)+n(i.valor);});
  const lim=(()=>{const t=(+mesAtual.slice(0,4))*12+(+mesAtual.slice(5,7)-1)-12;return `${Math.floor(t/12)}-${String(t%12+1).padStart(2,"0")}`;})();
  const linhas=[];
  Object.entries(porCat).forEach(([categoria,meses])=>{
    const noMes=meses[mesAtual]||0;
    if(noMes>0){linhas.push({categoria,valor:noMes,ref:mesAtual,doMes:true});return;}
    const ant=Object.keys(meses).filter(m=>m<mesAtual&&m>=lim&&meses[m]>0).sort().pop();
    if(ant)linhas.push({categoria,valor:meses[ant],ref:ant,doMes:false});
    else if(mesAtual in meses)linhas.push({categoria,valor:0,ref:null,doMes:false});      // modelo em branco sem histórico
  });
  return linhas.sort((a,b)=>b.valor-a.valor||a.categoria.localeCompare(b.categoria));
};
/* Simulação (não altera os lançamentos).
   sim: {pctGeral, ajustes:{categoria: valor simulado}, cortes:{categoria:true}, novos:[{id,nome,valor}]}
   Ordem: corte > valor ajustado na linha > reajuste geral (%) > valor atual. */
export const orcSimularFixos=(base,sim)=>{
  const s=sim||{},pg=Number(s.pctGeral),temPg=s.pctGeral!==""&&s.pctGeral!=null&&isFinite(pg),aj=s.ajustes||{},ct=s.cortes||{};
  const linhas=(base||[]).map(l=>{const a=aj[l.categoria],temAj=a!==""&&a!=null&&isFinite(Number(a))&&Number(a)>=0;
    const cortado=!!ct[l.categoria],simulado=cortado?0:temAj?Number(a):temPg?l.valor*(1+pg/100):l.valor;
    return{...l,simulado,cortado,ajustado:temAj,dif:simulado-l.valor,pct:l.valor>0?(simulado/l.valor-1)*100:null};});
  const novos=(s.novos||[]).map(x=>({...x,valorNum:Math.max(0,n(x.valor))}));
  const atual=linhas.reduce((a,l)=>a+l.valor,0),simL=linhas.reduce((a,l)=>a+l.simulado,0),simN=novos.reduce((a,x)=>a+x.valorNum,0),simulado=simL+simN;
  return{linhas,novos,atual,simulado,novosTotal:simN,dif:simulado-atual,difAno:(simulado-atual)*12,pct:atual>0?(simulado/atual-1)*100:null};
};
