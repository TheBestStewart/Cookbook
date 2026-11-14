// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAnPbE62ha1zIxXFMai-Si3-HwT0E7eFqo",
  authDomain: "cookbook-ab3e6.firebaseapp.com",
  projectId: "cookbook-ab3e6",
  storageBucket: "cookbook-ab3e6.firebasestorage.app",
  messagingSenderId: "662911931676",
  appId: "1:662911931676:web:0eef958b5f973e08bc96d9",
  measurementId: "G-M0VZ5GS62Q"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export {auth};