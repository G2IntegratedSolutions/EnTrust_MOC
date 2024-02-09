import React, { useState, ChangeEvent, FormEvent, ReactNode, useEffect, useRef } from 'react';
import InputMask, { Props as InputProps } from 'react-input-mask';
import styles from './Admin.module.css';
import { Group, User } from './Interfaces'
import { getFirestore, query, where, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { generateRandomString } from './common';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import { is } from '@babel/types';

interface ManageUsersProps {
    usersInOrg: User[];
    setUsersInOrg: React.Dispatch<React.SetStateAction<User[]>>
    refreshUsersInOrg: () => Promise<void>;
}

const ManageUsers: React.FC<ManageUsersProps> = ({ usersInOrg, setUsersInOrg, refreshUsersInOrg }) => {
    //
    // user and setUser are for new users
    const [user, setUser] = useState<User>({ id: '', email: '', phone: '', organization: '', groups: [], isAdmin: false });
    const [existingUserIndex, setExistingUserIndex] = useState<number>(0);
    const [existingUserPhone, setExistingUserPhone] = useState<string>('');
    const [existingUserEmail, setExistingUserEmail] = useState<string>('');
    const [existingUserIsAdmin, setExistingUserIsAdmin] = useState<boolean>(false);
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    const [deleteLinkVisible, setDeleteLinkVisible] = useState(false);
    const authContext = useAuth();

    useEffect(() => {
        if(usersInOrg.length > 0){
            setExistingUserIsAdmin(usersInOrg[existingUserIndex].isAdmin);
            setDeleteLinkVisible(usersInOrg[existingUserIndex].email !== authContext.user?.email);
        }
       
    }, [usersInOrg]);


    const handleNewUserChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setUser({ ...user, [name]: newValue });
    }


    const handleNewUserSubmit = async (e: FormEvent) => {
        // This creates a new user in Firebase Auth and Cloud Firestore
        e.preventDefault();
        try {
            // Create a new user in Firebase Auth based on the email address provided and a default password
            const { email, phone, organization, groups, isAdmin } = user;
            const password = 'defaultPassword'; // Replace with your default password
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('User created successfully');
            // Create a new user in Cloud Firestore
            const newUser = {
                id: generateRandomString(8),
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
            refreshUsersInOrg();
            toast.success('User successfully added!');
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Error creating user: ' + error);
        }
    }

    const handlExistingUserChange = async (e: ChangeEvent<HTMLSelectElement>) => {
        const newIndex = (e.target as unknown as HTMLSelectElement).selectedIndex
        setExistingUserIndex(newIndex);
        setExistingUserIsAdmin(usersInOrg[newIndex].isAdmin);
        setDeleteLinkVisible(usersInOrg[newIndex].email !== authContext.user?.email);
    };

    const handleExistingUserUpdateSubmit = async (e: FormEvent) => {
        e.preventDefault();
        let currentUser = usersInOrg[existingUserIndex];
        let newPhone = existingUserPhone !== "" ? existingUserPhone : currentUser.phone;
        let newEmail = existingUserEmail !== "" ? existingUserEmail : currentUser.email;
        let newIsAdmin = currentUser.isAdmin;
        const idOfUserToUpdate = currentUser.id;
        const db = getFirestore();
        // find the user in the Users collection with the id of the user to update using a query
        const usersCollectionRef = collection(db, 'Users');
        const q = query(usersCollectionRef, where("id", "==", idOfUserToUpdate));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            let newDoc = {email: newEmail, phone: newPhone, isAdmin: newIsAdmin};
            updateDoc(doc.ref, newDoc).then(() => {
                refreshUsersInOrg();
                toast.success('Users successfully updated!');
            }).catch((error) => {
                console.error('Error updating users:', error);
                toast.error('Error updating users: ' + error);
            });
        });
    }


    const deleteExistingUser = async () => {
        let currentUser = usersInOrg[existingUserIndex];
        const idOfUserToDelete = currentUser.id;
        const emailOfUserToDelete = currentUser.email;
        const db = getFirestore();
        // delete the user in the database with the id of the user to delete using a query
        const usersCollectionRef = collection(db, 'Users');
        const q = query(usersCollectionRef, where("id", "==", idOfUserToDelete));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            deleteDoc(doc.ref);
        });
        // In addition to deleting the user from the database, we also need to delete the user from Firebase Auth
        // This process requires the use of the firebase server SDK, which is not available in the browser
        // NOT IMPLEMENTED YET
        setExistingUserIndex(0);
        refreshUsersInOrg()

    }

    return (
        <div className={styles.createNewUser}>
            <h2>Manage Users</h2>
            <p>On this page, you can create a new user for the EnTrust Solutions Management of Change (Moc) application or if necessary update or remove existing users.  Every user you
                create will receive an invitation to EnTrust MoC at the email you provide.  On their first visit, each user will
                be required to change their default password.   </p>
            <h4>Create New User</h4>
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
            <hr></hr>
            <h4>Update/Remove Existing User</h4>
            {deleteLinkVisible && <span onClick={deleteExistingUser} className={styles.deleteSelected}>Remove this User</span>}
            <div>Existing User's Email:</div>
            <select className='form-control' onChange={handlExistingUserChange}>
                {usersInOrg.map((userInOrg, index) => (
                    <option key={index} value={userInOrg.email}>{userInOrg.email}</option>
                ))}
            </select>
            <div>
                <br></br>
                <div>Update this User</div>
                <form onSubmit={handleExistingUserUpdateSubmit} >
                    {/* <div>
                        <label>Email :</label>
                        <input className={`${styles.narrow} form-control`} type="email"
                            placeholder=
                            {usersInOrg && existingUserIndex >= 0 && existingUserIndex < usersInOrg.length ? usersInOrg[existingUserIndex].email : ''}
                            value={existingUserEmail} onChange={(e) => setExistingUserEmail(e.target.value)}
                        />
                    </div> */}
                    <div>
                        <label>Phone:</label>
                        <InputMask mask="(999)999-9999" className={`${styles.narrow} form-control`} type="phone" name="phone"
                            placeholder=
                            {usersInOrg && existingUserIndex >= 0 && existingUserIndex < usersInOrg.length ? usersInOrg[existingUserIndex].phone : ''}
                            value={existingUserPhone}
                            onChange={(e) => {
                                setExistingUserPhone(e.target.value);
                                const phoneRegex = /^\(\d{3}\)\d{3}-\d{4}$/;
                                let isValidPhone = phoneRegex.test(e.target.value)
                                setIsPhoneValid(isValidPhone);
                                if(isValidPhone){
                                    
                                    console.log("Phone number valid and set to " + e.target.value)
                                }
                                
                            }}
                        >
                        </InputMask>
                    </div>
                    <div><label>Administrator:</label><input type="checkbox" name="isAdmin"
                        onChange={(e) => setExistingUserIsAdmin(e.target.checked)}
                        checked={existingUserIsAdmin}
                    /></div>
                    <button className='btn btn-primary' disabled={!isPhoneValid}  type="submit" >Update User</button>
                </form>



            </div>
        </div>
    );
};

export default ManageUsers;
// checked={usersInOrg && existingUserIndex >= 0 && existingUserIndex < usersInOrg.length ? usersInOrg[existingUserIndex].isAdmin : false}
