import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, setDoc, getDoc, query, where, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";

// WARNING: Keep your API keys secure. Consider using environment variables or server-side configuration in a real production app.
const firebaseConfig = {
  apiKey: "AIzaSyDGJ_vqWhpsVventFO-WodRkt92CnegGHI", // Replace with your actual API key
  authDomain: "silverseat-970f8.firebaseapp.com",    // Replace with your actual auth domain
  projectId: "silverseat-970f8",                   // Replace with your actual project ID
  storageBucket: "silverseat-970f8.firebasestorage.app", // Replace with your actual storage bucket
  messagingSenderId: "325755356028",              // Replace with your actual sender ID
  appId: "1:325755356028:web:ecac64881861c10b185af9", // Replace with your actual app ID
  measurementId: "G-P33JSRC9HB"                    // Replace with your actual measurement ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Optional: Only if you use analytics
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase Initialized");

export { app, db, auth, collection, getDocs, addDoc, doc, setDoc, getDoc, query, where, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp, onSnapshot, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut };