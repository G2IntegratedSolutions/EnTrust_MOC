// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCf4Rm-56AyQnvZHQMgEytnnB9RXPmR5kI",
  authDomain: "entrust-moc.firebaseapp.com",
  projectId: "entrust-moc",
  storageBucket: "entrust-moc.appspot.com",
  messagingSenderId: "1000766264389",
  appId: "1:1000766264389:web:62a57952552cb753fc3f2c",
  measurementId: "G-2B5KV3TMF9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
