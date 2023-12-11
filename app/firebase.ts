// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6HxjXsl347lsFWyiC6_dRt2Va0TWijPw",
  authDomain: "eduflowau.firebaseapp.com",
  projectId: "eduflowau",
  storageBucket: "eduflowau.appspot.com",
  messagingSenderId: "911044059845",
  appId: "1:911044059845:web:1355b18ee0390c2b7886ac",
  measurementId: "G-RD7QKVQ21X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
