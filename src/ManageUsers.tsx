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

interface ManageUsersProps {
    usersInOrg: User[];
    refreshUsersInOrg: () => Promise<void>;
}

const ManageUsers: React.FC<ManageUsersProps> = ({ usersInOrg, refreshUsersInOrg }) => {
    //
    // user and setUser are for new users
    const [user, setUser] = useState<User>({ id: '', email: '', phone: '', organization: '', groups: [], isAdmin: false });
    const [existingUserIndex, setExistingUserIndex] = useState<number>(0);
    const authContext = useAuth();



    const setExistingUserAdmin = ((e: ChangeEvent<HTMLInputElement>) => {
        //debugger;
        let newUsersInOrg = [...usersInOrg];
        newUsersInOrg[existingUserIndex].isAdmin = e.target.checked;
        //setUsersInOrg(newUsersInOrg);
    });


    const handleNewUserChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setUser({ ...user, [name]: newValue });
    }

    const handleExistingUserChange = (e: ChangeEvent<HTMLInputElement>) => {
        setExistingUserIndex((e.target as unknown as HTMLSelectElement).selectedIndex);
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
        setExistingUserIndex(e.target.selectedIndex);
    };

    const handleExistingUserUpdateSubmit = async (e: FormEvent) => {
        debugger;
    }

    const deleteExistingUser = async () => {
        debugger
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
            <h4>Update/Remove Existing User</h4><span onClick={deleteExistingUser} className={styles.deleteSelected}>Remove this User</span>
            <div>Existing User's Email:</div>
            <select className='form-control' onChange={handlExistingUserChange}>
                {usersInOrg.map((userInOrg, index) => (
                    <option key={index} value={userInOrg.email}>{userInOrg.email}</option>
                ))}
            </select>
            <div>
                <br></br>
                <div>Update this User</div>
                <div>
                    <label>Email :</label>
                    <input className={`${styles.narrow} form-control`} type="text" placeholder=
                        {usersInOrg && existingUserIndex >= 0 && existingUserIndex < usersInOrg.length ? usersInOrg[existingUserIndex].email : ''}
                    />
                </div>
                <div>
                    <label>Phone:</label>
                    <InputMask mask="(999)999-9999" className={`${styles.narrow} form-control`} type="phone" name="phone"
                        placeholder=
                        {usersInOrg && existingUserIndex >= 0 && existingUserIndex < usersInOrg.length ? usersInOrg[existingUserIndex].phone : ''}
                    >
                    </InputMask>
                </div>
                <div><label>Administrator:</label><input type="checkbox" name="isAdmin" onChange={setExistingUserAdmin}
                    checked={usersInOrg && existingUserIndex >= 0 && existingUserIndex < usersInOrg.length ? usersInOrg[existingUserIndex].isAdmin : false}
                /></div>
                <button className='btn btn-primary' onClick={handleExistingUserUpdateSubmit}>Update User</button>
            </div>
        </div>
    );
};

export default ManageUsers;
