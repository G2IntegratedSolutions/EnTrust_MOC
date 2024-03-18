import React, { useState, ChangeEvent, FormEvent, ReactNode, useEffect, useRef } from 'react';
import InputMask, { Props as InputProps } from 'react-input-mask';
import styles from './Admin.module.css';
import { Group, User } from './Interfaces'
import { getFirestore, query, where, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { generateRandomString } from './common';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { handleAssignToGroup } from './dataAccess';

interface ManageUserGroupAssocProps {
    usersInOrg: User[];
    groupsInOrg: Group[];
    setUsersInOrg: React.Dispatch<React.SetStateAction<User[]>>
    refreshUsersInOrg: () => Promise<void>;
}

const ManagerUserGroupAssoc: React.FC<ManageUserGroupAssocProps> = ({ usersInOrg, groupsInOrg, setUsersInOrg, refreshUsersInOrg }) => {
    const selectedGroupMembershipRef = useRef(null)
    const groupNameRef = useRef<HTMLInputElement>(null);
    const groupDescriptionRef = useRef<HTMLInputElement>(null);
    const authContext = useAuth();
    const [selectedGroupMembershipIndex, setSelectedGroupMembershipIndex] = useState<number | undefined>(0);
    const [groupsForSelectedUser, setGroupsForSelectedUser] = useState<Group[]>([]); // [ 'group1', 'group2'
    const [selectedUserEmail, setSelectedUserEmail] = useState("");//authContext.user?.email);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedGroupMembersip, setSelectedGroupMembership] = useState<string>('');
    const [isReviewer, setIsReviewer] = useState<boolean>(false);
    const [isReviewerCheckVisisble, setIsReviewerCheckVisisble] = useState<boolean>(false);
    const userSelectElementRef = useRef<HTMLSelectElement>(null);

    const handleSelectedUserEmail = async (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedUserEmail(e.target.value);
    }

    useEffect(() => {
        // debugger;
        const initialUser = userSelectElementRef.current?.value;
        setSelectedUserEmail(initialUser ?? '');
        const selectedUser = usersInOrg.filter((user) => user.email === initialUser);
        if (selectedUser.length > 0) {
            updateIsReviewer(selectedUser[0]);
            
        }
        
    }, []);

    const updateIsReviewer = (user: User) => {
        if (user.isReviewer) {
            setIsReviewer(true);
            setIsReviewerCheckVisisble(true);
        }
        else {
            setIsReviewer(false);
            setIsReviewerCheckVisisble(false);
        }
    }

    useEffect(() => {
        // This code will be executed whenever selectedUserEmail changes
        //debugger;
        console.log(selectedUserEmail);
        let selectedUser_Email = selectedUserEmail;
        let org = authContext.user?.organization;
        if (selectedUser_Email && org) {
            const db = getFirestore();
            const usersCollection = collection(db, 'Users');
            const qUsers = query(usersCollection, where("organization", "==", authContext.user?.organization), where("email", "==", selectedUser_Email));
            const userSnapshot = getDocs(qUsers).then((querySnapshot) => {
                const selectedUserInOrg = querySnapshot.docs.map(doc => doc.data());
                if (selectedUserInOrg.length > 0) {
                    setGroupsForSelectedUser(selectedUserInOrg[0].groups);
                    updateIsReviewer(selectedUserInOrg[0] as User);

                }
                else {
                    setGroupsForSelectedUser([]);
                }
            });
        }
    }, [selectedUserEmail]);

    //When the groups for the selected user changes, we need to reset the selected group membership index
    useEffect(() => {
        console.log("Groups for selected user changed")
        if (selectedGroupMembershipRef.current) {
            console.log("Ref is current");
        }
        else {
            console.log("NOT current");
        }
        if (groupsForSelectedUser.length > 0) {
            setSelectedGroupMembershipIndex(0);
            // ebugger;
            if (selectedGroupMembershipRef.current) {
                (selectedGroupMembershipRef.current as HTMLSelectElement).selectedIndex = 0;
            }
        }
        else {
            setSelectedGroupMembershipIndex(undefined);
        }
    }, [groupsForSelectedUser])


    // const handleNewGroupSubmit = async (e: FormEvent) => {
    //     e.preventDefault();
    //     try {
    //         const randomString = generateRandomString(8);
    //         // Create a new group in Cloud Firestore
    //         const newGroup = {
    //             id: randomString,
    //             name: groupNameRef.current?.value,
    //             description: groupDescriptionRef.current?.value,
    //             organization: authContext.user?.organization,
    //         };
    //         const db = getFirestore();
    //         const docRef = await addDoc(collection(db, 'Groups'), newGroup);
    //         console.log('New group added with ID: ', docRef.id);
    //     } catch (error) {
    //         console.error('Error creating group:', error);
    //     }
    // }

    const getGroupFromIndex = (id: string) => {
        return groupsInOrg.find((group) => group.id === id);
    }
    function deleteSelectedGroup() {
        let groupToDelete = (selectedGroupMembershipRef.current as HTMLSelectElement | null)?.value;
        let currentUser = selectedUserEmail;
        let currentOrg = authContext.user?.organization;
        // Open the users collection in Firebase
        const db = getFirestore();
        const usersCollection = collection(db, 'Users');
        // Query the users collection for the selected user with an organization matching currentOrg
        const qUsers = query(usersCollection, where("organization", "==", currentOrg), where("email", "==", currentUser));
        // Get the user document
        getDocs(qUsers).then((querySnapshot) => {
            querySnapshot.forEach(async (doc) => {
                // Get the user's groups
                let groups = doc.data().groups;
                let reviewerFor = doc.data().reviewerFor;
                // Remove the selected group from the user's groups
                //ebugger;
                let newGroups = groups.filter((group: string) => group !== groupToDelete);
                debugger;
                let newReviewerFor = reviewerFor.filter((group: string) => group !== groupToDelete);
                // Update the user's groups in the database
                const userRef = doc.ref;
                await updateDoc(userRef, { reviewerFor: newReviewerFor, groups: newGroups });
                setGroupsForSelectedUser(newGroups);
                return true;
            });
        });
        console.log("Deleting selected group: " + groupToDelete)
    }

    return (
        <div className={`${styles.associateUsersAndGroups} mocPage`}>

            <h2>Assign Users to Groups</h2>

            {/* <button className='btn btn-success' onClick={() => { RefreshUsersAndGroups() }}>Refresh Users</button> */}
            <p>On this page, you can assign groups to users.  When you create a "Change Notification" (CN), you will assign the
                CN to one or more groups.  Every person in the group will be emailed when the CN is created or its status changes. </p>
            <div className="form-group">
                <label htmlFor="group">Select a User</label>
                <select ref={userSelectElementRef} className='form-control' onChange={handleSelectedUserEmail}>
                    {usersInOrg.map((user, index) => (
                        <option key={index} value={user.email}>{user.email}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Current Group Membership</label>
                {selectedGroupMembershipIndex !== undefined && <span onClick={deleteSelectedGroup} className={styles.deleteSelected}>Delete Selected</span>}
                <select ref={selectedGroupMembershipRef} className='form-control' size={5} onChange={(e) => {
                    setSelectedGroupMembership(e.target.value);
                    console.log("SELECTED INDEX IS: " + e.target.selectedIndex);
                    setSelectedGroupMembershipIndex(e.target.selectedIndex);
                }
                }
                >
                    {groupsForSelectedUser.map((group, index) => {
                        // ebugger;
                        let hydratedGroup = getGroupFromIndex(group.toString());
                        // ebugger;
                        return (
                            hydratedGroup && <option key={index} value={hydratedGroup.id}>{hydratedGroup.name}</option>
                        );
                    })}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="group">Select a new group to associate to the selected user:</label>
                <select className='form-control' onChange={(e) => setSelectedGroup(e.target.value)}>
                    {groupsInOrg.map((group, index) => {
                        // ebugger;
                        //let hydratedGroup = getGroupFromIndex(group.toString());
                        // ebugger;
                        return (
                            <option key={index} value={group.id}>{group.name}</option>
                        );
                    })}
                </select>
            </div>
            {isReviewerCheckVisisble &&
                <div className="form-group">
                    <input type="checkbox" onChange={e => setIsReviewer(e.target.checked)} className='form-check-input' checked={isReviewer} id="makeReviewerForGroup" />
                    <label style={{ marginLeft: '5px' }} className='' htmlFor="makeReviewerForGroup">Make Reviewer for Group</label>
                </div>
            }
            <button className={`${styles.btn} btn btn-primary`} onClick={() => handleAssignToGroup(selectedUserEmail ?? '', authContext.user?.organization ?? '', selectedGroup, groupsInOrg, setGroupsForSelectedUser, isReviewer)}>Assign {selectedUserEmail} to selected group</button>
            <br></br>

            {/* <button className={`${styles.btn} btn btn-danger`} onClick={handleAssignToGroup}>Remove selected group for user</button> */}
        </div>
    );

}
export default ManagerUserGroupAssoc;