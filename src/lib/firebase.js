import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-483ff.firebaseapp.com",
  projectId: "reactchat-483ff",
  storageBucket: "reactchat-483ff.appspot.com",
  messagingSenderId: "777355703977",
  appId: "1:777355703977:web:35ee303b63710618d0dbb8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
