// Importe as funções necessárias dos SDKs que você precisa
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query,
  where,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Sua configuração do Firebase. SUBSTITUA PELAS SUAS PRÓPRIAS CREDENCIAIS!
// Obtenha esses valores no console do Firebase: https://console.firebase.google.com
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "finanpro-df3cb.firebaseapp.com",
  projectId: "finanpro-df3cb",
  storageBucket: "finanpro-df3cb.appspot.com",
  messagingSenderId: "SUA_MESSAGING_SENDER_ID",
  appId: "SUA_APP_ID",
  measurementId: "SUA_MEASUREMENT_ID" // Se você habilitou o Google Analytics
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Inicialize o Cloud Firestore e obtenha uma referência ao serviço
const db = getFirestore(app);

// Inicialize a autenticação
const auth = getAuth(app);

// Exporte os serviços para usar em outras partes do aplicativo
export { 
  db, 
  auth,
  collection, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
