import{useState,useEffect,useRef,useCallback}from"react";
import{syncAplicado,syncEstavel,syncIgual,syncLocalTemDados,syncDecidirCarga,syncGravar,syncBackupDiario,SYNC_LEGADO}from"./lib/sync.js";
const lsGet=k=>{try{return localStorage.getItem(k);}catch{return null;}};const lsSet=(k,v)=>{try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch{}};
const clone=o=>JSON.parse(JSON.stringify(o));
/* Motor de sincronização: carrega, detecta conflito, grava com checagem de versão e guarda cópia diária.
   uid=null → ainda não decidido (não faz nada). */
export function useCloudSync({fs,uid,payload,aplicar,deps,debounceMs=2000,agora=()=>new Date().toISOString(),legado=SYNC_LEGADO}){
  const[status,setStatus]=useState(uid?"carregando":"aguardando");const[erro,setErro]=useState(null);const[conflito,setConflito]=useState(null);const[ultimoOk,setUltimoOk]=useState(null);
  const P=useRef(payload);P.current=payload;const A=useRef(aplicar);A.current=aplicar;
  const R=useRef({ready:false,busy:false,lastSync:null,hash:null,timer:null,uid:null,origem:null});
  const kSync=u=>"ip8-lastSync-"+u;
  const marcarSincronizado=(updatedAt,hash)=>{R.current.lastSync=updatedAt;R.current.hash=hash;lsSet(kSync(R.current.uid),updatedAt);};
  const agendar=useCallback((ms)=>{const r=R.current;if(r.timer)clearTimeout(r.timer);r.timer=setTimeout(()=>{salvar();},ms==null?debounceMs:ms);},[]);// eslint-disable-line
  const salvar=async()=>{const r=R.current;if(!r.ready||r.busy||!r.uid)return;const pl=clone(P.current);const h=syncEstavel(pl);if(h===r.hash)return;
    r.busy=true;setStatus("salvando");let retry=false;
    try{const res=await syncGravar(fs,fs.docRef(r.uid),pl,r.lastSync,agora());
      if(res.conflito){r.ready=false;setConflito({origem:"gravacao",nuvemEm:res.nuvemEm});setStatus("conflito");}
      else{marcarSincronizado(res.updatedAt,h);setUltimoOk(res.updatedAt);setErro(null);setStatus("ok");
        syncBackupDiario(fs,r.uid,pl,res.updatedAt.slice(0,10)).catch(()=>{});}}
    catch(e){setErro(String((e&&e.message)||e));setStatus("erro");retry=true;}
    finally{r.busy=false;}
    if(r.ready&&(retry||syncEstavel(P.current)!==r.hash))agendar(retry?30000:debounceMs);};
  /* carga inicial ao definir o usuário */
  useEffect(()=>{if(!uid)return;const r=R.current;r.uid=uid;r.ready=false;r.lastSync=lsGet(kSync(uid));r.hash=null;let vivo=true;
    (async()=>{setStatus("carregando");setErro(null);setConflito(null);
      try{let snap=await fs.getDoc(fs.docRef(uid));let origem="nuvem";
        if(!snap.exists()&&uid!==legado){try{const l=await fs.getDoc(fs.docRef(legado));if(l.exists()){snap=l;origem="legado";}}catch{}}
        if(!vivo)return;const nuvem=snap.exists()?snap.data():null;const local=clone(P.current);
        const acao=syncDecidirCarga({existe:!!nuvem,nuvemEm:nuvem&&nuvem.updatedAt,ultimoSync:origem==="legado"?null:r.lastSync,sujo:false,localTemDados:syncLocalTemDados(local),nuvemTemDados:!!nuvem&&syncLocalTemDados(nuvem),igual:syncIgual(local,nuvem)});
        r.origem=origem;
        if(acao==="aplicar"){const prev=syncEstavel(syncAplicado(local,nuvem));A.current(nuvem);r.ready=true;if(origem==="nuvem")marcarSincronizado(nuvem.updatedAt,prev);else r.lastSync=null;setStatus("ok");setUltimoOk(nuvem.updatedAt);if(origem==="legado")agendar();}
        else if(acao==="manter"){r.ready=true;if(origem==="nuvem")marcarSincronizado(nuvem.updatedAt,syncIgual(local,nuvem)?syncEstavel(local):null);else r.lastSync=null;setStatus("ok");setUltimoOk(nuvem&&nuvem.updatedAt);agendar();}
        else if(acao==="criar"){r.ready=true;setStatus("ok");if(syncLocalTemDados(local))agendar();}
        else{setConflito({origem,nuvem,nuvemEm:nuvem.updatedAt});setStatus("conflito");}
      }catch(e){if(vivo){setErro(String((e&&e.message)||e));setStatus("erro");}}})();
    return()=>{vivo=false;if(r.timer)clearTimeout(r.timer);};},[uid]);// eslint-disable-line
  /* mudanças locais */
  useEffect(()=>{const r=R.current;if(!r.ready)return;if(syncEstavel(P.current)===r.hash)return;agendar();},deps);// eslint-disable-line
  const resolver=useCallback(async(escolha)=>{const r=R.current;const c=conflito;if(!c)return;
    try{let snap=await fs.getDoc(fs.docRef(c.origem==="legado"?legado:r.uid));const nuvem=snap.exists()?snap.data():null;
      if(escolha==="nuvem"){if(nuvem){const prev=syncEstavel(syncAplicado(clone(P.current),nuvem));A.current(nuvem);if(c.origem!=="legado")marcarSincronizado(nuvem.updatedAt,prev);else r.lastSync=null;}r.ready=true;setConflito(null);setStatus("ok");if(c.origem==="legado")agendar();}
      else if(escolha==="local"){if(nuvem){try{await fs.setDoc(fs.backupRef(r.uid,"pre-sobrescrita-"+agora().replace(/[:.]/g,"-")),{...nuvem,backupEm:agora()});}catch{}}
        r.lastSync=c.origem==="legado"?null:(nuvem?nuvem.updatedAt:null);if(c.origem!=="legado")lsSet(kSync(r.uid),r.lastSync);r.hash=null;r.ready=true;setConflito(null);agendar(0);}
    }catch(e){setErro(String((e&&e.message)||e));setStatus("erro");}},[conflito]);// eslint-disable-line
  const listarBackups=useCallback(async()=>R.current.uid?(await fs.listarBackups(R.current.uid)).sort().reverse():[],[]);// eslint-disable-line
  const restaurar=useCallback(async id=>{const s=await fs.getDoc(fs.backupRef(R.current.uid,id));if(!s.exists())throw new Error("cópia não encontrada");A.current(s.data());},[]);// eslint-disable-line
  const verificar=useCallback(async()=>{const r=R.current;if(!r.ready||r.busy||!r.uid)return;
    try{const s=await fs.getDoc(fs.docRef(r.uid));if(!s.exists())return;const n=s.data();if(!n.updatedAt||n.updatedAt===r.lastSync)return;
      if(syncEstavel(P.current)===r.hash){const prev=syncEstavel(syncAplicado(clone(P.current),n));A.current(n);marcarSincronizado(n.updatedAt,prev);setUltimoOk(n.updatedAt);}
      else{r.ready=false;setConflito({origem:"gravacao",nuvemEm:n.updatedAt});setStatus("conflito");}}catch{}},[]);// eslint-disable-line
  useEffect(()=>{if(typeof document==="undefined")return;const f=()=>{if(document.visibilityState==="visible")verificar();};document.addEventListener("visibilitychange",f);window.addEventListener("focus",f);return()=>{document.removeEventListener("visibilitychange",f);window.removeEventListener("focus",f);};},[verificar]);
  const forcar=useCallback(()=>{R.current.hash=null;return salvar();},[]);// eslint-disable-line
  return{status,erro,conflito,ultimoOk,resolver,verificar,listarBackups,restaurar,forcar};
}
