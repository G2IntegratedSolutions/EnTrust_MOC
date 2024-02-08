// Admin.tsx
import React, { useState, ChangeEvent, FormEvent, ReactNode, useEffect, useRef } from 'react';
import { useContext } from 'react';
import styles from './Admin.module.css';
import { auth } from './firebaseConfig'; // Adjust the path as needed
import { collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { getFirestore, query, where } from "firebase/firestore";
import { useAuth } from './AuthContext';
import { List } from 'react-bootstrap/lib/Media';
import InputMask, { Props as InputProps } from 'react-input-mask';
import CreateChangeNotification from './CreateChangeNotification';
import { Group, User } from './Interfaces'
import { generateRandomString } from './common';
import { toast } from 'react-toastify';
import ManageUsers from './ManageUsers';


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
    const selectedGroupMembershipRef = useRef(null)
    const groupNameRef = useRef<HTMLInputElement>(null);
    const groupDescriptionRef = useRef<HTMLInputElement>(null);
    const [showCreateNewUser, setShowCreateNewUser] = useState(true);
    const [showCreateNewGroup, setShowCreateNewGroup] = useState(false);
    const [showAssociateUsersAndGroups, setShowAssociateUsersAndGroups] = useState(false);
    const [showCreateChangeNotice, setShowCreateChangeNotice] = useState(false);
    const [selectedGroupMembershipIndex, setSelectedGroupMembershipIndex] = useState<number | undefined>(0);
    const authContext = useAuth();
    const [selectedUserEmail, setSelectedUserEmail] = useState(authContext.user?.email);
    const [groupsForSelectedUser, setGroupsForSelectedUser] = useState<string[]>(['A', 'B']); // [ 'group1', 'group2'
    const [selectedGroup, setSelectedGroup] = useState('');
    const [usersInOrg, setUsersInOrg] = useState<User[]>([])
    const [groupsInOrg, setGroupsInOrg] = useState<Group[]>([]);
    const [selectedGroupMembersip, setSelectedGroupMembership] = useState<string>('');
    const [group, setGroup] = useState<Group>({ id: '', name: '', description: '', organization: '' });

    useEffect(() => {
        refreshUsersInOrg();
    }, []);

    const refreshUsersInOrg = async () => {
        const db = getFirestore();
        const usersCollection = collection(db, 'Users');
        const qUsers = query(usersCollection, where("organization", "==", authContext.user?.organization));
        const userSnapshot = getDocs(qUsers).then((querySnapshot) => {
            const users = querySnapshot.docs.map(doc => doc.data());
            setUsersInOrg(users as User[]);
            // if (users.length > 0) {
            //     setExistingUserIndex(0);
            // }
        });
    }

    const handleNewGroupChange = (e: ChangeEvent<HTMLInputElement>) => {
        // const { name, value, type, checked } = e.target;
        // setGroup({ ...group, [name]: value });
    }



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
            //debugger;
            if (selectedGroupMembershipRef.current) {
                (selectedGroupMembershipRef.current as HTMLSelectElement).selectedIndex = 0;
            }
        }
        else {
            setSelectedGroupMembershipIndex(undefined);
        }
    }, [groupsForSelectedUser])


    useEffect(() => {
        // This code will be executed whenever selectedUserEmail changes
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
                    setGroupsForSelectedUser(selectedUserInOrg[0].groups as string[]);
                }
                else {
                    setGroupsForSelectedUser([]);
                }
            });
        }
    }, [selectedUserEmail]);



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
        if (selectedGroupMembershipRef.current) {
            console.log("Ref is current");
            //debugger;
            console.log("Setting selected index to: " + selectedGroupMembershipIndex ?? 0);
            (selectedGroupMembershipRef.current as any).selectedIndex = selectedGroupMembershipIndex ?? 0;
        }
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
        let groupToAdd = selectedGroup
        if (groupToAdd === '') {
            groupToAdd = groupsInOrg[0].name;
        }
        let currentUser = selectedUserEmail;
        let currentOrg = authContext.user?.organization;

        // Open the users collection in Firebase
        const db = getFirestore();
        const usersCollection = collection(db, 'Users');
        // Query the users collection for the selected user with an organization matching currentOrg
        const qUsers = query(usersCollection, where("organization", "==", currentOrg), where("email", "==", currentUser));
        getDocs(qUsers).then((querySnapshot) => {
            querySnapshot.forEach(async (doc) => {
                // Get the user's groups
                let groups = doc.data().groups;
                // Remove the selected group from the user's groups
                if (groups.includes(groupToAdd) == false) {
                    let newGroups = [...groups, groupToAdd];
                    // Update the user's groups in the database
                    const userRef = doc.ref;
                    await updateDoc(userRef, { groups: newGroups });
                    setGroupsForSelectedUser(newGroups);
                }
            });
        });
    }



    const handleNewGroupSubmit = async (e: FormEvent) => {

        e.preventDefault();

        try {
            // Create a new user in Firebase Auth based on the email address provided and a default password

            //const { name, description, organization } = group;
            // Create a random string of 8 characters with the letters A-Z, and a-z
            const randomString = generateRandomString(8);
            // Create a new group in Cloud Firestore
            const newGroup = {
                id: randomString,
                name: groupNameRef.current?.value,
                description: groupDescriptionRef.current?.value,
                organization: authContext.user?.organization,
            };
            const db = getFirestore();
            const docRef = await addDoc(collection(db, 'Groups'), newGroup);
            console.log('New group added with ID: ', docRef.id);
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }

    const handleSelectedUserEmail = async (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedUserEmail(e.target.value);

    }

    function deletedSelectedGroup() {
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
                // Remove the selected group from the user's groups
                let newGroups = groups.filter((group: string) => group !== groupToDelete);
                // Update the user's groups in the database
                const userRef = doc.ref;
                await updateDoc(userRef, { groups: newGroups });
                setGroupsForSelectedUser(newGroups);
            });
        });
        console.log("Deleting selected group: " + groupToDelete)
    }
    return (
        <>
            <span onClick={(e) => changeDivVis("createNewUser")} className={styles.actionOption}>Manage Users</span>
            <span onClick={(e) => changeDivVis("createNewGroup")} className={styles.actionOption}>Manage Groups</span>
            <span onClick={(e) => changeDivVis("associateUsersAndGroups")} className={styles.actionOption}>Assign Users to Groups</span>
            <span onClick={(e) => changeDivVis("createChangeNotice")} className={styles.actionOption}>Manage Change Notifications (CNs)</span>
            {showCreateNewUser &&
                <ManageUsers  usersInOrg={usersInOrg} refreshUsersInOrg={refreshUsersInOrg}></ManageUsers>
            }
            {showCreateNewGroup &&
                <div className={styles.createNewGroup}>
                    <h2>Manage Groups</h2>
                    <p>On this page, you can create groups which users of EnTrust Moc will ultimately be assigned to.  When you create
                        Change Notifications (CNs), you will assign the CN to one or more groups. If required, you can also update or remove groups.
                    </p>
                    <h4>Create New Group</h4>
                    <form className={styles.formContainer} >
                        <div className="form-group">
                            <label htmlFor="groupName">Group Name:</label>
                            <input ref={groupNameRef} type="text" className='form-control' name="groupName" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="groupDescription">Group Description:</label>
                            <input ref={groupDescriptionRef} type="text" className='form-control' name="groupDescription" required />
                        </div>
                        <button className={`${styles.btn} btn btn-primary`} onClick={handleNewGroupSubmit}>Create Group</button>
                    </form>
                    <hr></hr>
                    <h4>Update/Remove Existing Group</h4>
                </div>
            }
            {showAssociateUsersAndGroups &&
                <div className={styles.associateUserAndGroups}>
                    <h2>Assign Users to Groups</h2>

                    {/* <button className='btn btn-success' onClick={() => { RefreshUsersAndGroups() }}>Refresh Users</button> */}
                    <p>On this page, you can assign groups to users.  When you create a "Change Notification" (CN), you will assign the
                        CN to one or more groups.  Every person in the group will be emailed when the CN is created or its status changes. </p>
                    <div className="form-group">
                        <label htmlFor="group">Select a user in your organization</label>
                        <select className='form-control' onChange={handleSelectedUserEmail}>
                            {usersInOrg.map((user, index) => (
                                <option key={index} value={user.email}>{user.email}</option>
                            ))}
                        </select>
                    </div>
                    <div><label>Current Group Membership</label>
                        {selectedGroupMembershipIndex !== undefined && <span onClick={deletedSelectedGroup} className={styles.deleteSelected}>Deleted Selected</span>}
                    </div>
                    <div>
                        <select ref={selectedGroupMembershipRef} className='form-control' size={5} onChange={(e) => {
                            setSelectedGroupMembership(e.target.value);
                            console.log("SELECTED INDEX IS: " + e.target.selectedIndex);
                            setSelectedGroupMembershipIndex(e.target.selectedIndex);
                        }
                        }
                        >
                            {groupsForSelectedUser.map((groupName, index) => (
                                <option key={index} value={groupName}>{groupName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="group">Select a new group to associate to the selected user:</label>
                        <select className='form-control' onChange={(e) => setSelectedGroup(e.target.value)}>
                            {groupsInOrg.map((group, index) => (
                                <option key={index} value={group.name}>{group.name}</option>
                            ))}
                        </select>
                    </div>
                    <button className={`${styles.btn} btn btn-success`} onClick={handleAssignToGroup}>Assign {selectedUserEmail} to selected group</button>
                    <br></br>

                    {/* <button className={`${styles.btn} btn btn-danger`} onClick={handleAssignToGroup}>Remove selected group for user</button> */}
                </div>
            }
            {showCreateChangeNotice &&
                <div className={styles.createChangeNotice}>

                    <CreateChangeNotification></CreateChangeNotification>
                </div>
            }
            <br></br>
        </>

    );
}

export default Admin;