import{test,expect}from'vitest';import React,{useState}from'react';import TR from'react-test-renderer';
import{useCloudSync}from'../src/useCloudSync.js';import*as L from'../src/lib/sync.js';
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const clone=o=>JSON.parse(JSON.stringify(o));const wait=ms=>new Promise(r=>setTimeout(r,ms));
function fakeFs(){const docs=new Map();const snap=p=>({exists:()=>docs.has(p),data:()=>clone(docs.get(p))});
  return{docs,docRef:u=>"investpro/"+u,backupRef:(u,id)=>`investpro/${u}/backups/${id}`,getDoc:async r=>snap(r),
    setDoc:async(r,d,o)=>{docs.set(r,o&&o.merge?{...(docs.get(r)||{}),...clone(d)}:clone(d));},deleteDoc:async r=>{docs.delete(r);},
    runTransaction:async fn=>fn({get:async r=>snap(r),set:(r,d,o)=>{docs.set(r,o&&o.merge?{...(docs.get(r)||{}),...clone(d)}:clone(d));}}),
    listarBackups:async u=>[...docs.keys()].filter(k=>k.startsWith(`investpro/${u}/backups/`)).map(k=>k.split("/").pop())};}
let tick=0;const agora=()=>new Date(Date.UTC(2026,10,12,10,0,tick++)).toISOString();
function montar(fs,uid,inicial,legado){let api,setSt;function H(){const[st,s]=useState(inicial);setSt=s;api=useCloudSync({fs,uid,payload:st,aplicar:d=>s(x=>({...x,...Object.fromEntries(Object.keys(x).filter(k=>d[k]!==undefined).map(k=>[k,d[k]]))})),deps:[st],debounceMs:5,agora,legado});api.st=st;return null;}
  let r;TR.act(()=>{r=TR.create(React.createElement(H));});return{get api(){return api;},get st(){return api.st;},set:fn=>TR.act(()=>setSt(fn)),r};}
const flush=async(ms=60)=>{await TR.act(async()=>{await wait(ms);});};
const vazio={rf:[],cr:[],aportes:[]};

test('puro: decisões e comparação',()=>{
  expect(L.syncDecidirCarga({existe:false})).toBe("criar");
  expect(L.syncDecidirCarga({existe:true,igual:true})).toBe("manter");
  expect(L.syncDecidirCarga({existe:true,nuvemEm:"b",ultimoSync:"a",sujo:false,localTemDados:true})).toBe("aplicar");
  expect(L.syncDecidirCarga({existe:true,nuvemEm:"b",ultimoSync:"a",sujo:true,localTemDados:true})).toBe("conflito");
  expect(L.syncDecidirCarga({existe:true,nuvemEm:"b",ultimoSync:null,localTemDados:true})).toBe("conflito");
  expect(L.syncDecidirCarga({existe:true,nuvemEm:"b",ultimoSync:null,localTemDados:false})).toBe("aplicar");
  expect(L.syncDecidirCarga({existe:true,nuvemEm:"a",ultimoSync:"a",localTemDados:true})).toBe("manter");
  expect(L.syncIgual({a:[1],b:{y:1,x:2}},{b:{x:2,y:1},a:[1],updatedAt:"z",extra:1})).toBe(true);
  expect(L.syncIgual({a:[1]},{a:[2]})).toBe(false);
});
test('aparelho novo (local vazio) aplica a nuvem e não escreve de volta nada diferente',async()=>{
  store.clear();const fs=fakeFs();fs.docs.set("investpro/u1",{rf:[{id:"1"}],cr:[],aportes:[],updatedAt:"2026-01-01T00:00:00.000Z"});
  const h=montar(fs,"u1",vazio);await flush();expect(h.st.rf).toEqual([{id:"1"}]);expect(h.api.status).toBe("ok");
  await flush(100);expect(fs.docs.get("investpro/u1").rf).toEqual([{id:"1"}]);
});
test('edição é gravada com updatedAt novo e cria cópia diária',async()=>{
  store.clear();const fs=fakeFs();const h=montar(fs,"u1",vazio);await flush();
  h.set(s=>({...s,aportes:[{id:"a",valor:"10"}]}));await flush(100);
  const d=fs.docs.get("investpro/u1");expect(d.aportes).toEqual([{id:"a",valor:"10"}]);expect(d.updatedAt).toBeTruthy();
  expect([...fs.docs.keys()].some(k=>k.includes("/backups/2026-11-12"))).toBe(true);
});
test('dois aparelhos: o segundo recebe conflito em vez de sobrescrever',async()=>{
  store.clear();const fs=fakeFs();const A=montar(fs,"u1",vazio);await flush();A.set(s=>({...s,rf:[{id:"A"}]}));await flush(100);
  const upA=fs.docs.get("investpro/u1").updatedAt;
  // aparelho B abre com cópia antiga (lastSync = upA) e a nuvem avança por A
  const B=montar(fs,"u1",{...vazio,rf:[{id:"A"}]});await flush();expect(B.api.status).toBe("ok");
  A.set(s=>({...s,rf:[{id:"A"},{id:"A2"}]}));await flush(100);
  B.set(s=>({...s,rf:[{id:"A"},{id:"B"}]}));await flush(100);
  expect(B.api.status).toBe("conflito");expect(fs.docs.get("investpro/u1").rf).toEqual([{id:"A"},{id:"A2"}]);
  expect(fs.docs.get("investpro/u1").updatedAt).not.toBe(upA);
  // escolher "nuvem" aplica a nuvem
  await TR.act(async()=>{await B.api.resolver("nuvem");});await flush(100);expect(B.st.rf).toEqual([{id:"A"},{id:"A2"}]);expect(B.api.status).toBe("ok");
});
test('conflito: "local" sobrescreve mas guarda a nuvem em cópia',async()=>{
  store.clear();const fs=fakeFs();fs.docs.set("investpro/u1",{rf:[{id:"nuvem"}],cr:[],aportes:[],updatedAt:"2026-01-01T00:00:00.000Z"});
  const h=montar(fs,"u1",{...vazio,rf:[{id:"local"}]});await flush();expect(h.api.status).toBe("conflito");expect(fs.docs.get("investpro/u1").rf).toEqual([{id:"nuvem"}]);
  await TR.act(async()=>{await h.api.resolver("local");});await flush(100);
  expect(fs.docs.get("investpro/u1").rf).toEqual([{id:"local"}]);
  expect([...fs.docs.keys()].some(k=>k.includes("pre-sobrescrita"))).toBe(true);
  const bk=[...fs.docs.entries()].find(([k])=>k.includes("pre-sobrescrita"))[1];expect(bk.rf).toEqual([{id:"nuvem"}]);
});
test('migração: usuário novo herda o documento legado',async()=>{
  store.clear();const fs=fakeFs();fs.docs.set("investpro/ivan-nod",{rf:[{id:"L"}],cr:[],aportes:[],updatedAt:"2026-01-01T00:00:00.000Z"});
  const h=montar(fs,"uidX",vazio);await flush(150);expect(h.st.rf).toEqual([{id:"L"}]);expect(fs.docs.get("investpro/uidX").rf).toEqual([{id:"L"}]);
});
test('falha de leitura NÃO grava dados vazios por cima da nuvem',async()=>{
  store.clear();const fs=fakeFs();fs.docs.set("investpro/u1",{rf:[{id:"1"}],cr:[],aportes:[],updatedAt:"x"});const g=fs.getDoc;fs.getDoc=async()=>{throw new Error("offline");};
  const h=montar(fs,"u1",vazio);await flush();h.set(s=>({...s,rf:[]}));await flush(100);expect(h.api.status).toBe("erro");expect(fs.docs.get("investpro/u1").rf).toEqual([{id:"1"}]);fs.getDoc=g;
});
test('poda mantém só as 14 cópias mais recentes',async()=>{
  const fs=fakeFs();for(let i=1;i<=20;i++)fs.docs.set(`investpro/u/backups/2026-10-${String(i).padStart(2,"0")}`,{x:i});
  const n=await L.syncBackupDiario(fs,"u",{x:99},"2026-11-12");expect(n).toBe(7);expect((await fs.listarBackups("u")).length).toBe(14);
});

test('aparelho parado e sem alterações recebe a nuvem ao voltar (sem conflito)',async()=>{
  store.clear();const fs=fakeFs();const A=montar(fs,"u1",vazio);await flush();A.set(s=>({...s,rf:[{id:"1"}]}));await flush(100);
  store.clear();const B=montar(fs,"u1",vazio);await flush(100);expect(B.st.rf).toEqual([{id:"1"}]);
  A.set(s=>({...s,rf:[{id:"1"},{id:"2"}]}));await flush(100);
  await TR.act(async()=>{await B.api.verificar();});await flush(100);expect(B.st.rf).toEqual([{id:"1"},{id:"2"}]);expect(B.api.status).toBe("ok");
  // e depois disso B pode editar normalmente (sem conflito)
  B.set(s=>({...s,aportes:[{id:"x"}]}));await flush(100);expect(B.api.status).toBe("ok");expect(fs.docs.get("investpro/u1").aportes).toEqual([{id:"x"}]);
});
test('aparelho vazio com lastSync igual ao da nuvem não apaga a nuvem (aplica)',async()=>{
  store.clear();const fs=fakeFs();fs.docs.set("investpro/u1",{rf:[{id:"1"}],cr:[],aportes:[],updatedAt:"T1"});store.set("ip8-lastSync-u1","T1");
  const h=montar(fs,"u1",vazio);await flush(100);expect(h.st.rf).toEqual([{id:"1"}]);expect(fs.docs.get("investpro/u1").rf).toEqual([{id:"1"}]);
});
