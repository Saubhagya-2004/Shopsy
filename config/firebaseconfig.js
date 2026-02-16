// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCU0Y5y9632Gfo-3JBVFuFt_qy5_ojx6l0",
  authDomain: "dinner-time-551f3.firebaseapp.com",
  projectId: "dinner-time-551f3",
  storageBucket: "dinner-time-551f3.firebasestorage.app",
  messagingSenderId: "436755467457",
  appId: "1:436755467457:web:4026e3a791ee3b28fd1840",
  measurementId: "G-6QVCLRP92B"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);