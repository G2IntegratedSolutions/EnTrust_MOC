// Admin.tsx
import React, { useState, ChangeEvent, FormEvent, ReactNode } from 'react';
import { useContext } from 'react';
import styles from './Admin.module.css';
import { createUserWithEmailAndPassword, indexedDBLocalPersistence } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getFirestore, query, where } from "firebase/firestore";
import { useAuth } from './AuthContext';
import { List } from 'react-bootstrap/lib/Media';
import InputMask, { Props as InputProps } from 'react-input-mask';

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
    const [selectedGroup, setSelectedGroup] = useState('');
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
                RefreshUsersAndGroups();
                setShowAssociateUsersAndGroups(true);
                break;
            case 'createChangeNotice':
                setShowCreateChangeNotice(true);
                break;
            default:
                break;
        }
    };

    const handleAssignToGroup = async () => {
        console.log("Assigning user to group")
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
                    <p>On this page, you can create a new user for the EnTrust Solutions Management of Change (Moc) application.  Every user you 
                        create will receive an invitation to EnTrust Moc at the email you provide.  On their first visit, each user will 
                        be required to change their default password.   </p>
                    <form className={styles.formContainer} >
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input type="email" className='form-control' name="email" value={user.email} onChange={handleNewUserChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone:</label>
                            {/* <input className='form-control' type="phone" name="phone" value={user.phone} onChange={handleNewUserChange} required /> */}
                            <InputMask mask="(999)999-9999" className='form-control' type="phone" name="phone" value={user.phone} onChange={handleNewUserChange}>
                               
                            </InputMask>
                        </div>
                        <div className="form-group">
                            <label htmlFor="isAdmin">Make Administrator:</label>
                            <input type="checkbox" name="isAdmin" checked={user.isAdmin} onChange={handleNewUserChange} />

                        </div>
                        <button className='btn btn-primary' onClick={handleNewUserSubmit}>Create User</button>
                    </form>
                </div>
            }
            {showCreateNewGroup &&
                <div className={styles.createNewGroup}>
                    <h2>Create New Group</h2>
                    <p>On this page, you can create groups which users of EnTrust Moc will ultimately be assigned to.  When you create 
                        Change Notifications (CNs), you will assign the CN to one or more groups.  
                    </p>
                    <form className={styles.formContainer} >
                        <div className="form-group">
                            <label htmlFor="groupName">Group Name:</label>
                            <input type="text" className='form-control' name="groupName" value={group.groupName} onChange={handleNewGroupChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="groupDescription">Group Description:</label>
                            <input type="text" className='form-control' name="groupDescription" value={group.groupDescription} onChange={handleNewGroupChange} required />
                        </div>
                        <button className={`${styles.btn} btn btn-primary`} onClick={handleNewGroupSubmit}>Create Group</button>
                    </form>
                </div>
            }
            {showAssociateUsersAndGroups &&
                <div className={styles.associateUserAndGroups}>
                    <h2>Associate Users to Groups</h2>

                    {/* <button className='btn btn-success' onClick={() => { RefreshUsersAndGroups() }}>Refresh Users</button> */}
                    <p>On this page, you can assign users to groups.  When you create a "Change Notification" (CN), you will assign the
                        CN to one or more groups.  Every person in the group will be emailed when the CN is created or its status changes. </p>
                    <div className="form-group">
                        <label htmlFor="group">Select a user in your organization</label>
                        <select className='form-control' onChange={(e) => setSelectedUser(e.target.value)}>
                            {usersInOrg.map((user, index) => (
                                <option key={index} value={user.email}>{user.email}</option>
                            ))}
                        </select>
                    </div>
                    <label> Current Group Membership</label>
                    <div>
                        <select className='form-control' size={5}>
                            <option>Aardvark</option>
                            <option>Bannana</option>
                            <option>Chimp</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="group">Add a new group?</label>
                        <select className='form-control'  onChange={(e) => setSelectedGroup(e.target.value)}>
                            {groupsInOrg.map((group, index) => (
                                <option key={index} value={group.groupName}>{group.groupName}</option>
                            ))}
                        </select>
                    </div>
                    <button className={`${styles.btn} btn btn-success`} onClick={handleAssignToGroup}>Assign {selectedUser} to {selectedGroup}</button>
                    <br></br>

                    {/* <button className={`${styles.btn} btn btn-danger`} onClick={handleAssignToGroup}>Remove selected group for user</button> */}
                </div>
            }
            {showCreateChangeNotice &&
                <div className={styles.createChangeNotice}>
                    <h2>Create Change Notice</h2>
                    <p>On this page, you can create a Change Notification and assign it to one or more groups in your organization. 
                    </p>
                </div>
            }
        </>

    );
}

export default Admin;