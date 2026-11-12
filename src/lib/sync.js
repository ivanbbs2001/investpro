/* Regras puras da sincronização com a nuvem (sem React, sem Firebase) */
export const SYNC_LEGADO="ivan-nod";
export const SYNC_BACKUPS_MAX=14;
export const SYNC_LIMITE_BYTES=1048576;
const LISTAS=["rf","inco","ac","etfs","fiis","cr","aportes","orc","evo","tdApos","tdLiza"];
/* JSON com chaves ordenadas: compara conteúdo sem depender da ordem; descarta undefined como o Firestore faz */
export const syncEstavel=v=>JSON.stringify(v,(k,x)=>(x&&typeof x==="object"&&!Array.isArray(x))?Object.keys(x).sort().reduce((o,c)=>{if(x[c]!==undefined)o[c]=x[c];return o;},{}):x);
export const syncLocalTemDados=p=>LISTAS.some(k=>Array.isArray(p&&p[k])&&p[k].length>0);
export const syncTamanhoBytes=p=>{const s=JSON.stringify(p);return typeof TextEncoder!=="undefined"?new TextEncoder().encode(s).length:s.length;};
/* Só as chaves que o app grava, sem o carimbo de atualização */
export const syncRecorte=(nuvem,chaves)=>{const o={};chaves.forEach(k=>{if(nuvem&&nuvem[k]!==undefined)o[k]=nuvem[k];});return o;};
export const syncIgual=(local,nuvem)=>!!nuvem&&syncEstavel(syncRecorte(nuvem,Object.keys(local)))===syncEstavel(local);
/* O que fazer ao abrir: "criar" | "aplicar" | "manter" | "conflito" */
export const syncDecidirCarga=({existe,nuvemEm,ultimoSync,sujo,localTemDados,igual,nuvemTemDados})=>{
  if(!existe)return"criar";
  if(igual)return"manter";
  if(!localTemDados&&nuvemTemDados)return"aplicar";                 // nunca empurra um aparelho vazio por cima de uma nuvem com dados
  if(ultimoSync&&nuvemEm===ultimoSync)return"manter";                 // nuvem não mudou desde a última sincronização: o local é o mais novo
  const localMudou=sujo||(!ultimoSync&&localTemDados);
  return localMudou?"conflito":"aplicar";
};
/* Gravação protegida: só escreve se a nuvem ainda está na versão que este aparelho conhece */
export const syncGravar=(fs,ref,payload,ultimoSync,agoraISO)=>fs.runTransaction(async tx=>{
  const s=await tx.get(ref);const cur=s.exists()?(s.data().updatedAt||null):null;
  if(cur!=null&&cur!==ultimoSync)return{ok:false,conflito:true,nuvemEm:cur};
  tx.set(ref,{...payload,updatedAt:agoraISO},{merge:true});return{ok:true,updatedAt:agoraISO};});
/* Cópia diária (uma por dia) e poda das mais antigas */
export const syncBackupDiario=async(fs,uid,dados,hojeISO)=>{
  const ref=fs.backupRef(uid,hojeISO);const s=await fs.getDoc(ref);if(!s.exists())await fs.setDoc(ref,{...dados,backupEm:new Date().toISOString()});
  const ids=(await fs.listarBackups(uid)).sort();const sobra=ids.slice(0,Math.max(0,ids.length-SYNC_BACKUPS_MAX));
  for(const id of sobra)await fs.deleteDoc(fs.backupRef(uid,id));return sobra.length;};
/* Estado local esperado depois de aplicar a nuvem (para saber, sem gravar, que não há alterações pendentes) */
export const syncAplicado=(local,nuvem)=>{const o={...local};Object.keys(local).forEach(k=>{if(nuvem[k]!==undefined&&nuvem[k]!==null)o[k]=nuvem[k];});return o;};
