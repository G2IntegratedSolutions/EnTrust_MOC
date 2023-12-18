import './firebaseConfig';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import Login from './Login';
import { AuthProvider } from './AuthContext';
import Admin from './Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<HomePage message='test' />} />
        </Routes>
      </Router>
    </AuthProvider>

  );
}

export default App;
