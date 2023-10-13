import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (error) {
            const err = error as Error;
            setError(err.message);
        }
    };

    const handleForgotPassword = () => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("Password reset link sent!");
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    return (
        <div>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p>{error}</p>}
            <div>
              <button type="submit">Login</button>
            </div>
          </form>
          <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
        </div>
      );
};

export default Login;
