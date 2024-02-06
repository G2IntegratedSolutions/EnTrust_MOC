// Admin.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useContext } from 'react';
import styles from './Admin.module.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import { collection, addDoc } from 'firebase/firestore';
import { getFirestore } from "firebase/firestore";
import { useAuth } from './AuthContext';

interface User {
    email: string;
    phone: string;
    organization: string;
    groups: string[];
    isAdmin: boolean;
}
interface Group {
    groupName: string;
    groupDescription: string;
    organization:'';
}
interface ChangeNotice {
    mocNumber: string;
    dateOfCreation:Date;
    dateOfPublication:Date;
    timeOfImplemenation:Date;
    categoryOfMOC:string;
    typeOfMOC:string;
    specificTopic:string;
    affectedGroups:string;
    reasonForChange:string;
    reasonForChangeDescription:string;
    impacts:string;
    requiredDateOfCompletion:Date;
    openNotes:string;
    attachments:string;
}

const Admin = () => {
    const authContext = useAuth();
    const [user, setUser] = useState<User>({ email: '', phone: '', organization: '', groups: [], isAdmin: false });
    const [group, setGroup] = useState<Group>({ groupName: '', groupDescription: '', organization:'' });

    const handleNewUserChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setUser({ ...user, [name]: newValue });
    }
    const handleNewGroupChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setGroup({...group, [name]: value});
    }
    const handleNewUserSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // Create a new user in Firebase Auth based on the email address provided and a default password
            const { email, phone, organization, groups, isAdmin } = user;
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

    const handleNewGroupSubmit = async (e: FormEvent) => {

        e.preventDefault();

        try {
            // Create a new user in Firebase Auth based on the email address provided and a default password

            const { groupName, groupDescription, organization } = group;

            // Create a new group in Cloud Firestore
            const newGroup = {
                groupName,
                groupDescription,
                organization : authContext.user?.organization,
            };
            const db = getFirestore();
            const docRef = await addDoc(collection(db, 'Groups'), newGroup);
            console.log('New group added with ID: ', docRef.id);
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }
    return (
        <>
            <div>
                <h2>Create new User</h2>
                <form className={styles.formContainer} onSubmit={handleNewUserSubmit}>
                    <label>
                        Email:
                        <input type="email" name="email" value={user.email} onChange={handleNewUserChange} required />
                    </label>
                    <br />
                    <label>
                        Phone:
                        <input type="phone" name="phone" value={user.phone} onChange={handleNewUserChange} required />
                    </label>
                    <br />
                    <label>
                        Make Administrator?
                        <input type="checkbox" name="isAdmin" checked={user.isAdmin} onChange={handleNewUserChange} />
                    </label>
                    <br />
                    <input type="submit" value="Create User" />
                </form>
            </div>
            <div>
                <h2>Create New Group</h2>
                <form className={styles.formContainer} onSubmit={handleNewGroupSubmit}>
                    <label>
                        Group Name:
                        <input type="text" name="groupName" value={group.groupName} onChange={handleNewGroupChange} required />
                    </label>
                    <br />
                    <label>
                        Group Description
                        <input type="text" name="groupDescription" value={group.groupDescription} onChange={handleNewGroupChange} required />
                    </label>
                    <br />
                    <input type="submit" value="Create Group" />
                </form>
            </div>
            <div>
            <h2>Associate Users to Groups</h2>
            </div>
        </>

    );
}

export default Admin;