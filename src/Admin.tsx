// Admin.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import styles from './Admin.module.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import { collection, addDoc } from 'firebase/firestore';
import { getFirestore } from "firebase/firestore";

interface User {
    email: string;
    phone: string;
    organization: string;
    groups: string;
    isAdmin: boolean;
}

const Admin = () => {
    const [user, setUser] = useState<User>({ email: '', phone: '', organization: '', groups: '', isAdmin: false });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setUser({ ...user, [name]: newValue });
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // Create a new user in Firebase Auth based on the email address provided and a default password
            const { email, phone, organization, groups, isAdmin} = user;
            const password = 'defaultPassword'; // Replace with your default password
            await createUserWithEmailAndPassword(auth, email, password);

            console.log('User created successfully');

            // Create a new user in Cloud Firestore
            const newUser = {
                email,
                phone,
                userName: email, // Replace with the desired username logic
                isAdmin: isAdmin,
                groups: groups,
            };
            const db = getFirestore();
            const docRef = await addDoc(collection(db, 'Users'), newUser);
            console.log('New user added with ID: ', docRef.id);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    }

    return (
        <div>
            <h2>Create new User</h2>
            <form className={styles.formContainer} onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="email" name="email" value={user.email} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Phone:
                    <input type="phone" name="phone" value={user.phone} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Groups:
                    <input type="text" name="groups" value={user.groups} onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Make Administrator?
                    <input type="checkbox" name="isAdmin" checked={user.isAdmin} onChange={handleChange} />
                </label>
                <br />
                <input type="submit" value="Create User" />
            </form>
        </div>
    );
}

export default Admin;