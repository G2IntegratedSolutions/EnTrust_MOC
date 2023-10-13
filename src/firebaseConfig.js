// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArUu5OXdh7pMFOoNW942AtOZwRwJGXcBM",
  authDomain: "entrustmoc.firebaseapp.com",
  projectId: "entrustmoc",
  storageBucket: "entrustmoc.appspot.com",
  messagingSenderId: "662359441453",
  appId: "1:662359441453:web:dcead63e22d866254db8a4",
  measurementId: "G-PHXQDW139V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
