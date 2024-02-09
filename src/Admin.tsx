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
import ManageGroups from './ManageGroups';
import ManagerUserGroupAssoc from './ManageUserGroupAssoc';

const Admin = () => {
    const [showCreateNewUser, setShowCreateNewUser] = useState(true);
    const [showCreateNewGroup, setShowCreateNewGroup] = useState(false);
    const [showAssociateUsersAndGroups, setShowAssociateUsersAndGroups] = useState(false);
    const [showCreateChangeNotice, setShowCreateChangeNotice] = useState(false);
    const authContext = useAuth();
    const [usersInOrg, setUsersInOrg] = useState<User[]>([])
    const [groupsInOrg, setGroupsInOrg] = useState<Group[]>([]);
    const [group, setGroup] = useState<Group>({ id: '', name: '', description: '', organization: '' });

    useEffect(() => {
        RefreshUsersAndGroups();
    }, []);

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
        // if (selectedGroupMembershipRef.current) {
        //     console.log("Ref is current");
        //     //debugger;
        //     console.log("Setting selected index to: " + selectedGroupMembershipIndex ?? 0);
        //     (selectedGroupMembershipRef.current as any).selectedIndex = selectedGroupMembershipIndex ?? 0;
        // }
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

    return (
        <>
            <span onClick={(e) => changeDivVis("createNewUser")} className={styles.actionOption}>Manage Users</span>
            <span onClick={(e) => changeDivVis("createNewGroup")} className={styles.actionOption}>Manage Groups</span>
            <span onClick={(e) => changeDivVis("associateUsersAndGroups")} className={styles.actionOption}>Assign Users to Groups</span>
            <span onClick={(e) => changeDivVis("createChangeNotice")} className={styles.actionOption}>Manage Change Notifications (CNs)</span>
            {showCreateNewUser &&
                <ManageUsers usersInOrg={usersInOrg} setUsersInOrg={setUsersInOrg} refreshUsersInOrg={RefreshUsersAndGroups}></ManageUsers>
            }
            {showCreateNewGroup &&
                <ManageGroups groupsInOrg={groupsInOrg} setGroupsInOrg={setGroupsInOrg} refreshUsersAndGroupsInOrg={RefreshUsersAndGroups}></ManageGroups>
            }
            {showAssociateUsersAndGroups &&
                <ManagerUserGroupAssoc usersInOrg={usersInOrg} groupsInOrg={groupsInOrg} setUsersInOrg={setUsersInOrg} refreshUsersInOrg={RefreshUsersAndGroups}></ManagerUserGroupAssoc>

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