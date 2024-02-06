// Admin.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useContext } from 'react';
import styles from './Admin.module.css';
import { createUserWithEmailAndPassword, indexedDBLocalPersistence } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getFirestore, query, where } from "firebase/firestore";
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
    organization: '';
}
interface ChangeNotice {
    mocNumber: string;
    dateOfCreation: Date;
    dateOfPublication: Date;
    timeOfImplemenation: Date;
    categoryOfMOC: string;
    typeOfMOC: string;
    specificTopic: string;
    affectedGroups: string;
    reasonForChange: string;
    reasonForChangeDescription: string;
    impacts: string;
    requiredDateOfCompletion: Date;
    openNotes: string;
    attachments: string;
}

const Admin = () => {

    const [showCreateNewUser, setShowCreateNewUser] = useState(true);
    const [showCreateNewGroup, setShowCreateNewGroup] = useState(false);
    const [showAssociateUsersAndGroups, setShowAssociateUsersAndGroups] = useState(false);
    const [showCreateChangeNotice, setShowCreateChangeNotice] = useState(false);

    const authContext = useAuth();
    const [selectedUser, setSelectedUser] = useState(authContext.user?.email);
    const [usersInOrg, setUsersInOrg] = useState<User[]>([]);
    const [groupsInOrg, setGroupsInOrg] = useState<Group[]>([]);

    const [user, setUser] = useState<User>({ email: '', phone: '', organization: '', groups: [], isAdmin: false });
    const [group, setGroup] = useState<Group>({ groupName: '', groupDescription: '', organization: '' });

    const handleNewUserChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setUser({ ...user, [name]: newValue });
    }
    const handleNewGroupChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setGroup({ ...group, [name]: value });
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
                userName: email,
                isAdmin: isAdmin,
                organization: authContext.user?.organization,
                groups: groups,
            };
            const db = getFirestore();
            const docRef = await addDoc(collection(db, 'Users'), newUser);
            console.log('New user added with ID: ', docRef.id);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    }

    const RefreshUsersAndGroups = async () => {
        console.log("getting users and groups")
        const db = getFirestore();
        const usersCollection = collection(db, 'Users');
        const qUsers = query(usersCollection, where("organization", "==", authContext.user?.organization));
        const userSnapshot = await getDocs(qUsers).then((querySnapshot) => {
            const users = querySnapshot.docs.map(doc => doc.data());
            setUsersInOrg(users as User[]);

        });
        const groupsCollection = collection(db, 'Groups');
        const qGroups = query(groupsCollection, where("organization", "==", authContext.user?.organization));
        const groupsSnapshot = await getDocs(qGroups).then((querySnapshot) => {
            const groups = querySnapshot.docs.map(doc => doc.data());
            setGroupsInOrg(groups as Group[]);

        });
    }

    const changeDivVis = (divName: string) => {

        // Hide all spans
        setShowCreateNewUser(false);
        setShowCreateNewGroup(false);
        setShowAssociateUsersAndGroups(false);
        setShowCreateChangeNotice(false)
        // Show the selected span
        switch (divName) {
            case 'createNewUser':
                setShowCreateNewUser(true);
                break;
            case 'createNewGroup':
                setShowCreateNewGroup(true);
                break;
            case 'associateUsersAndGroups':
                setShowAssociateUsersAndGroups(true);
                break;
            case 'createChangeNotice':
                setShowCreateChangeNotice(true);
                break;
            default:
                break;
        }
    };


    const handleNewGroupSubmit = async (e: FormEvent) => {

        e.preventDefault();

        try {
            // Create a new user in Firebase Auth based on the email address provided and a default password

            const { groupName, groupDescription, organization } = group;

            // Create a new group in Cloud Firestore
            const newGroup = {
                groupName,
                groupDescription,
                organization: authContext.user?.organization,
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
            <span onClick={(e) => changeDivVis("createNewUser")} className={styles.actionOption}>Create New User</span>
            <span onClick={(e) => changeDivVis("createNewGroup")} className={styles.actionOption}>Create New Group</span>
            <span onClick={(e) => changeDivVis("associateUsersAndGroups")} className={styles.actionOption}>Associate User to Groups</span>
            <span onClick={(e) => changeDivVis("createChangeNotice")} className={styles.actionOption}>Create Change Notice</span>
            {showCreateNewUser &&
                <div className={styles.createNewUser}>
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
            }
            {showCreateNewGroup &&
                <div className={styles.createNewGroup}>
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
            }
            {showAssociateUsersAndGroups &&
                <div className={styles.associateUserAndGroups}>
                    <h2>Associate Users to Groups</h2>

                    <button className='btn btn-success' onClick={() => { RefreshUsersAndGroups() }}>Refresh Users</button>
                    <br />
                    <label>
                        User:
                    </label>
                    <select onChange={(e) => setSelectedUser(e.target.value)}>
                        {usersInOrg.map((user, index) => (
                            <option key={index} value={user.email}>{user.email}</option>
                        ))}
                    </select>
                    <br />
                    <label>
                        Group:
                    </label>
                    <select>
                        {groupsInOrg.map((group, index) => (
                            <option key={index} value={group.groupName}>{group.groupName}</option>
                        ))}
                    </select>
                    <p>{selectedUser} Group Membership</p>
                </div>
            }
            {showCreateChangeNotice &&
                <div className={styles.createChangeNotice}>
                    <h2>Create Change Notice</h2>
                </div>
            }
        </>

    );
}

export default Admin;