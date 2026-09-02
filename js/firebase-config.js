import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxrWpPkeGkJlUFQ2v7riPUUq5phJfMa_4",
  authDomain: "vexornull.firebaseapp.com",
  projectId: "vexornull",
  storageBucket: "vexornull.firebasestorage.app",
  messagingSenderId: "1096477994848",
  appId: "1:1096477994848:web:037df6a720ab0420b0b805"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
