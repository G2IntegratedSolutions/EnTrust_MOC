import React, { useState, ChangeEvent, FormEvent, ReactNode, useEffect, useRef } from 'react';
import InputMask, { Props as InputProps } from 'react-input-mask';
import styles from './Admin.module.css';
import { Group, User } from './Interfaces'
import { collection, getFirestore, query, where, getDocs,addDoc,deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { generateRandomString } from './common';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';


interface ManageGroupsProps {
    groupsInOrg: Group[];
    setGroupsInOrg: React.Dispatch<React.SetStateAction<Group[]>>
    refreshUsersAndGroupsInOrg: () => Promise<void>;
}

const ManageGroups: React.FC<ManageGroupsProps> = ({ groupsInOrg, setGroupsInOrg, refreshUsersAndGroupsInOrg }) => {
    const [group, setGroup] = useState<Group>({ id: '', name: '', description: '', organization: '' });
    const [existingGroupIndex, setExistingGroupIndex] = useState<number>(0);
    const [existingGroupName, setExistingGroupName] = useState<string>('');
    const [existingGroupDescription, setExistingGroupDescription] = useState<string>('');
    const authContext = useAuth();

    const handleNewGroupChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const newValue = value;
        setGroup({ ...group, [name]: newValue });
    }

    const handleNewGroupSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const { id, name, description, organization } = group;
            const db = getFirestore();
            const newGroup = {
                id: generateRandomString(8),
                name,
                description,
                organization: authContext.user?.organization,
            };
            const docRef = await addDoc(collection(db, 'Groups'), newGroup);
            console.log('New group added with ID: ', docRef.id);
            refreshUsersAndGroupsInOrg();
            toast.success('Group successfully added!');
        } catch (error) {
            console.error('Error creating group:', error);
            toast.error('Error creating group: ' + error);
        }
    }

    const handlExistingGroupChange = async (e: ChangeEvent<HTMLSelectElement>) => {
        const newIndex = (e.target as unknown as HTMLSelectElement).selectedIndex
        setExistingGroupIndex(newIndex);
    };

    const handleExistingGroupUpdateSubmit = async (e: FormEvent) => {
        e.preventDefault();
        let currentGroup = groupsInOrg[existingGroupIndex];
        console.log(groupsInOrg, existingGroupIndex)
        let newName = existingGroupName !== "" ? existingGroupName : currentGroup.name;
        let newDescription = existingGroupDescription !== "" ? existingGroupDescription : currentGroup.description;
        const db = getFirestore();
        const usersCollectionRef = collection(db, 'Groups');
        const q = query(usersCollectionRef, where("id", "==", currentGroup.id));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            let newDoc = {name: newName, description: newDescription, id: currentGroup.id, organization: currentGroup.organization}
            updateDoc(doc.ref, newDoc).then(() => {
                refreshUsersAndGroupsInOrg();
                toast.success('Group successfully updated!');
            }).catch((error) => {
                console.error('Error updating group:', error);
                toast.error('Error updating group: ' + error);
            });
        });
    }


    async function deleteExistingGroup() {
        try{
            const db = getFirestore();
            let currentGroup = groupsInOrg[existingGroupIndex];
            const idOfGroupToDelete = currentGroup.id;
            const groupRef = collection(db, 'Groups');
            const q = query(groupRef, where('id', '==', idOfGroupToDelete));
            console.log('Group deleted  ' + idOfGroupToDelete);
            const querySnapshot = await getDocs(q);
            const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    
            await Promise.all(deletePromises);
            //.console.log('Group deleted 1');
            setExistingGroupIndex(0);
            refreshUsersAndGroupsInOrg();
            console.log('Group deleted');
            toast.success('Group successfully deleted!');
        }
        catch(ex){
            console.error('Error deleting group:', ex);
            toast.error('Error deleting group: ' + ex);
        }

    }

    return (
        <div className={`${styles.createNewUser} mocPage` }>
            <h2>Manage Groups</h2>
            <p>On this page, you can create a new groups for the EnTrust Solutions Management of Change (Moc) application or if necessary update or remove existing groups.  </p>
            <h4>Create New Group</h4>
            <form className={styles.formContainer} >
                <div className="form-group">
                    <label className='form-label' htmlFor="groupName">Name:</label>
                    <input type="text" className='form-control' name="name" value={group.name} onChange={handleNewGroupChange} required />
                </div>
                <div className="form-group">
                    <label className='form-label' htmlFor="description">Description:</label>
                    <input type="text" className='form-control' name="description" value={group.description} onChange={handleNewGroupChange} required />
                </div>
                <div><button className='btn btn-primary' onClick={handleNewGroupSubmit}>Create Group</button></div>

            </form>
            <hr></hr>
            <h4>Update/Remove Existing Group</h4>
            <span onClick={deleteExistingGroup} className={styles.deleteSelected}>Remove Group</span>
            <label>Group Name:</label>
            <select className='form-control' onChange={handlExistingGroupChange}>
                {groupsInOrg.map((groupInOrg, index) => (
                    <option key={index} value={groupInOrg.name}>{groupInOrg.name}</option>
                ))}
            </select>
            <div>
                <br></br>
                <div>Update this Group</div>
                <form  >
                    <div>
                        <label className='form-label'>Group Name:</label>
                        <input className={`${styles.narrow} form-control`} type="text" name="groupName"
                            placeholder=
                            {groupsInOrg && existingGroupIndex >= 0 && existingGroupIndex < groupsInOrg.length ? groupsInOrg[existingGroupIndex].name : ''}
                            value={existingGroupName}
                            onChange={(e) => {
                                setExistingGroupName(e.target.value);
                                let isValidGroupName = e.target.value.length > 3;
                            }}
                        >
                        </input>
                    </div>
                    <div>
                        <label className='form-label'>Group Description:</label>
                        <input className={`${styles.narrow} form-control`} type="text" name="groupDescription"
                            placeholder=
                            {groupsInOrg && existingGroupIndex >= 0 && existingGroupIndex < groupsInOrg.length ? groupsInOrg[existingGroupIndex].description : ''}
                            value={existingGroupDescription}
                            onChange={(e) => {
                                setExistingGroupDescription(e.target.value);
                                let isValidGroupDescription = e.target.value.length > 5;

                            }}
                        >
                        </input>
                    </div>
                    <button className='btn btn-primary' disabled={false} type="button" onClick={handleExistingGroupUpdateSubmit} >Update Group</button>
                </form>



            </div>
        </div>
    );
};

export default ManageGroups;
