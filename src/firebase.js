import{initializeApp}from"firebase/app";
import{getFirestore,doc,getDoc,setDoc,runTransaction,collection,getDocs,deleteDoc}from"firebase/firestore";
import{getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged}from"firebase/auth";
const app=initializeApp({apiKey:"AIzaSyALomkXfya_3myf0vmay3GQjREXsDPBevM",authDomain:"investpro-46453.firebaseapp.com",projectId:"investpro-46453",storageBucket:"investpro-46453.firebasestorage.app",messagingSenderId:"593091540259",appId:"1:593091540259:web:cbf3cf4aef154a9baa4896"});
const db=getFirestore(app),auth=getAuth(app);
/* Adaptador usado pelo motor de sincronização (permite testar com um Firestore falso) */
const fsReal={
  docRef:uid=>doc(db,"investpro",uid),
  backupRef:(uid,id)=>doc(db,"investpro",uid,"backups",id),
  getDoc:ref=>getDoc(ref),
  setDoc:(ref,data,opts)=>setDoc(ref,data,opts),
  deleteDoc:ref=>deleteDoc(ref),
  runTransaction:fn=>runTransaction(db,fn),
  listarBackups:async uid=>(await getDocs(collection(db,"investpro",uid,"backups"))).docs.map(d=>d.id)
};
const entrarComGoogle=()=>signInWithPopup(auth,new GoogleAuthProvider());
const sair=()=>signOut(auth);
const observarLogin=cb=>onAuthStateChanged(auth,cb);
export{db,doc,getDoc,setDoc,fsReal,entrarComGoogle,sair,observarLogin};
