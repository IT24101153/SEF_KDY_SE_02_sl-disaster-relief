// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMY-6ycoCsZ-GnTfHRKvhyUIIQrDvbTXg",
  authDomain: "sl-disaster-relief-connect.firebaseapp.com",
  projectId: "sl-disaster-relief-connect",
  storageBucket: "sl-disaster-relief-connect.firebasestorage.app",
  messagingSenderId: "873171326606",
  appId: "1:873171326606:web:83ea023117524d782f5bdf",
  measurementId: "G-F8D3L5TSE2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
