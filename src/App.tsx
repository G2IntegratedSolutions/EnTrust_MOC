import './firebaseConfig';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import Login from './Login';
import Header from './Header';
import { AuthProvider } from './AuthContext';
import Admin from './Admin';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import MyChangeNotifications  from './MyChangeNotifications';
function App() {
  return (
    <>
      <ToastContainer />
      <AuthProvider>

        <Router>
          <Header />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/myChangeNotifications" element={<MyChangeNotifications />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>


  );
}

export default App;
