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
  const [availableRoles, setAvailableRoles] = useState<string[]>([]); // This will be an array of strings
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loggedInUserData, setLoggedInUserData]: any = useState({});
  let loggedInUserUserID: string;
  // Initialize Firestore
  const db = getFirestore();
  let firstName: string;
  let lastName: string;
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      loggedInUserUserID = userCred.user.uid;
      // ebugger;
      const usersCollectionRef = collection(db, 'Users');
      const q = query(usersCollectionRef, where("email", "==", email));
      // ebugger;
      const querySnapshot = await getDocs(q);

      //We should only have one user with this email address
      querySnapshot.forEach((doc) => {
        setLoggedInUserData({
          ...loggedInUserData,
          uid: loggedInUserUserID,
          userName: userCred.user.email,
          organization: doc.data().organization,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
        }
        );
        firstName = doc.data().firstName;
        lastName = doc.data().lastName;
        // Initialize an empty array
        let roles = [];
        // Populate the roles array
        if (doc.data().isAdmin) {
          roles.push('Admin');
        }
        if (doc.data().isApprover) {
          roles.push('Approver');
        }
        if (doc.data().isCreator) {
          roles.push('Creator');
        }
        if (doc.data().isStakeholder) {
          roles.push('Stakeholder');
        }
        if (doc.data().isReviewer) {
          roles.push('Reviewer');
        }
        if (roles.length === 1) {
          login(email, doc.data().UserName, doc.data().isAdmin, doc.data().isApprover, doc.data().isCreator, doc.data().isStakeholder, doc.data().isReviewer, doc.data().organization, userCred.user.uid, doc.data().firstName, doc.data().lastName);
          navigate('/');
        }
        if (roles.length === 0) {
          alert("You have no roles associated with your account.  Please contact your administrator.");
        }
        if (roles.length > 1) {
          //alert("You have multiple roles associated with your account.  Please choose one for this session.");
          //add a new role to the roles array at index 0?
          roles.unshift("Choose a role");
          setAvailableRoles(roles);
        }
      });
      //ebugger;
    } catch (error) {
      debugger;
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

  const handleOnChangeRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //ebugger;
    const isAdmin = e.target.value === 'Admin';
    const isApprover = e.target.value === 'Approver';
    const isCreator = e.target.value === 'Creator';
    const isStakeholder = e.target.value === 'Stakeholder';
    const isReviewer = e.target.value === 'Reviewer';
    //ebugger;
    login(email, loggedInUserData.userName, isAdmin, isApprover, isCreator, isStakeholder,isReviewer, loggedInUserData.organization, loggedInUserData.uid, loggedInUserData.firstName, loggedInUserData.lastName);
    navigate('/');
  }

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
            <a href="#" className="text-decoration-none" onClick={() => handleForgotPassword()}>Forgot Password?</a>
          </div>
          {availableRoles.length > 0 && (
            <div>
              <p>Multiple roles are associated with your login.  Please choose one for this session.</p>
              <select className="form-select" aria-label="Default select example" onChange={(e) => handleOnChangeRole(e)} >
                {availableRoles.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100" onClick={(e) => handleLogin}>Login</button>
        </form>
      </div>
    </div>
  );
};


export default Login;
