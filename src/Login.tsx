import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getFirestore } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";

import 'firebase/firestore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Initialize Firestore
  const db = getFirestore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const usersCollectionRef = collection(db, 'Users');
      const q = query(usersCollectionRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
        login(email, doc.data().UserName, doc.data().isAdmin);
      });      
      navigate('/');
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    }
  };

  
  
  const handleForgotPassword = () => {
    debugger
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset link sent!");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="card p-4" style={{ width: '300px' }}>
        <h2 className="mb-4 text-center">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email.toLowerCase()}

              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 text-end">
<<<<<<< HEAD
            <a href="#" className="text-decoration-none" onClick={() => handleForgotPassword()}>Forgot Password?</a>
=======
            <a href="#" className="text-decoration-none" onClick={handleForgotPassword}>Forgot password?</a>
>>>>>>> 6629e09880aff9f7805699e9f1c696e74b9272f4
          </div>
          /* Give button blue background */
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
};


export default Login;
