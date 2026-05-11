import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALomkXfya_3myf0vmay3GQjREXsDPBevM",
  authDomain: "investpro-46453.firebaseapp.com",
  projectId: "investpro-46453",
  storageBucket: "investpro-46453.firebasestorage.app",
  messagingSenderId: "593091540259",
  appId: "1:593091540259:web:cbf3cf4aef154a9baa4896",
  measurementId: "G-NQERBKYLKR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, getDoc, setDoc };
