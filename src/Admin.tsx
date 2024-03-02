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
import { useNavigate } from 'react-router-dom';

import './App.css';
const Admin = () => {
    const navigate = useNavigate();
    const [showCreateNewUser, setShowCreateNewUser] = useState(true);
    const [showCreateNewGroup, setShowCreateNewGroup] = useState(false);
    const [showAssociateUsersAndGroups, setShowAssociateUsersAndGroups] = useState(false);
    const [showCreateChangeNotice, setShowCreateChangeNotice] = useState(false);
    const authContext = useAuth();
    const [usersInOrg, setUsersInOrg] = useState<User[]>([])
    const [groupsInOrg, setGroupsInOrg] = useState<Group[]>([]);
    const [group, setGroup] = useState<Group>({ id: '', name: '', description: '', organization: '' });

    useEffect(() => {
        // ebugger;
        RefreshUsersAndGroups();
    }, []);

    const RefreshUsersAndGroups = async () => {
        console.log("getting users and groups")
        // ebugger;
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

    return (
        <>
            <div className="scrollableContainer" >
                <div className="iconContainer" onClick={(e) =>  navigate('/') }  ><i className={`material-icons ent-icon`}>home</i><div>Home</div></div>
                <div className="iconContainer" onClick={(e) => changeDivVis("createNewUser")} ><i className={`material-icons ent-icon ent-red`}>person</i><div>Users</div></div>
                <div className="iconContainer" onClick={(e) => changeDivVis("createNewGroup")}><i className={`material-icons ent-icon ent-green`}>groups</i><div>Groups</div></div>
                <div className="iconContainer" onClick={(e) => changeDivVis("associateUsersAndGroups")}><i className={`material-icons ent-icon ent-orange`}>person_add_alt_1</i><div>Assign</div></div>
                {/* <div className="iconContainer" onClick={(e) => changeDivVis("createChangeNotice")}><i className={`material-icons ent-icon`}>keyboard_double_arrow_right</i><div>Change</div></div> */}
            </div>
            <hr></hr>

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