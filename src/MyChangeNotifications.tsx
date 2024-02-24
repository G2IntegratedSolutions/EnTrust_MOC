import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MyChangeNotifications.css';
import './App.css';
import { useAuth } from './AuthContext';
import { getFirestore, query, where, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ChangeNotification } from './Interfaces';
import { useNavigate } from 'react-router-dom';
import ChangeNotificationDetailForm from './ChangeNotficiationDetailForm';

const MyChangeNotifications = () => {
    const scrollableContainerRef = useRef(null);
    const navigate = useNavigate();
    const columns = ['MOC#', 'Status', 'Date of Creation', 'Date of Publication', 'Change Type', 'Time', 'Change Topic', 'Groups', 'Short Description', 'Long Description', 'Impacts', 'Required Date of Completion', 'Notes', 'Attachments'];
    const columnWidths = [100, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200]; // Adjust these values as needed
    //const sampleData = ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4', 'Sample 5', 'Sample 6', 'Sample 7', 'Sample 8', 'Sample 9', 'Sample 10', 'Sample 11', 'Sample 12'];
    //const sampleCNs: string[][] =  [sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData];
    const [selectedRow, setSelectedRow] = useState(0);
    const [activeCN, setActiveCN] = useState<ChangeNotification | null>(null);
    //The icons in order are (0) Search 91) Create (2) Acknowledge (3) Edit (4) Accept (5) Reject (6) Re-Schedule (7) Archive (8) Email (9) Notify
    const [iconDisplayState, setIconDisplayState] = useState<number[]>([.3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3])
    const authContext = useAuth();
    const [selectedUserEmail, setSelectedUserEmail] = useState(authContext.user?.email);
    const [cnsForThisUser, setCnsForThisUser] = useState<ChangeNotification[]>([]);

    useEffect(() => {
        console.log('selectedRow:', selectedRow);
    }, [cnsForThisUser, selectedRow]);

    useEffect(() => {
        // This code will be executed whenever selectedUserEmail changes
        //console.log(selectedUserEmail);
        let selectedUser_Email = selectedUserEmail;
        let org = authContext.user?.organization;
        if (selectedUser_Email && org) {
            const db = getFirestore();
            const usersCollection = collection(db, 'Users');
            const qUsers = query(usersCollection, where("organization", "==", authContext.user?.organization), where("email", "==", selectedUser_Email));
            const userSnapshot = getDocs(qUsers).then(async (querySnapshot) => {
                const selectedUserInOrg = querySnapshot.docs.map(doc => doc.data());
                if (selectedUserInOrg.length > 0) {
                    const groupsForUser = selectedUserInOrg[0].groups;
                    const q = query(collection(db, "changeNotifications"), where("groupIds", "array-contains-any", groupsForUser));
                    const querySnapshot = await getDocs(q);
                    // ebugger;
                    const docs = querySnapshot.docs;
                    // Initialize an empty array to hold the change notifications
                    let changeNotifications = [];

                    // Loop through the documents
                    for (let i = 0; i < docs.length; i++) {
                        // Get the data from the current document
                        let docData = docs[i].data();

                        // Cast the data to a ChangeNotification and add it to the array
                        changeNotifications.push(docData as ChangeNotification);
                    }
                    setCnsForThisUser(changeNotifications);
                    // ebugger;
                    // querySnapshot.forEach((doc) => {
                    //     debugger;
                    //     console.log(doc.id, " => ", doc.data());
                    // });
                }
                else {
                    //setGroupsForSelectedUser([]);
                }
            });
        }
    }, []);

    const displayState = (icon: string): string => {

        if (icon === "create" && authContext.user?.isCreator == true) {
            return "unset";
        }
        if (cnsForThisUser.length == 0) {
            return ".3"
        }
        if (icon === "find") {
            return "unset";
        }
        if (icon === "acknowledge" && authContext.user?.isStakeholder == true) {
            return "unset";
        }
        if (icon === "edit" && (authContext.user?.isApprover == true || authContext.user?.isCreator) == true) {
            return "unset";
        }
        return ".3";
    }

    const handleRowClick = (index: number) => {
        console.log('Row clicked:', index);
        setActiveCN(cnsForThisUser[index]);
        //debugger;
        setSelectedRow(index);
    }


    const renderRow = (cn: ChangeNotification, rowIndex: number) => {
        const rowDataArray = [
            cn.id,
            cn.creator
            // cn.mocNumber,
            // cn.status,
            // cn.dateOfCreation,
            // cn.dateOfPublication,
            // cn.type,
            // cn.timeOfImplementation,
            // cn.topic,
            // cn.groupNames,
            // cn.shortReasonForChange,
            // cn.descriptionOfChange,
            // cn.impacts,
            // cn.requiredDateOfCompletion,
            // cn.notes
        ];
        // ebugger;
        return (
            <tr key={rowIndex} onClick={() => handleRowClick(rowIndex)} style={rowIndex === selectedRow ? { color: 'white', backgroundColor: 'var(--ent-blue)' } : {}}>
                {rowDataArray.map((data, index) => (
                    <td key={index} className="column" style={{ minWidth: columnWidths[index] }}>
                        {data.toString().length > 50 ? data.toString().slice(0, 50) + '...' : data.toString()}
                    </td>
                ))}
            </tr>
        );
    }

    const onHandleSetIconDisplayState = (icon: string, state: boolean) => {
        let newState = [...iconDisplayState];
        newState[4] = 1
        setIconDisplayState(newState)
    }
    return (
        <>
            {cnsForThisUser.length > 0 || authContext.user?.isCreator == true ? (
                <div className="scrollableContainer" ref={scrollableContainerRef} >
                    <div className="iconContainer ent-requires-selection"  onClick={() => navigate(-1)} ><i className={`material-icons ent-icon`}>home</i><div>Back</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[0] }} onClick={(e) => navigate('/')}  ><i className={`material-icons ent-icon`}>search</i><div>Search</div></div>
                    <div className="iconContainer" style={{ opacity: iconDisplayState[1] }} onClick={(e) => navigate('/')}  ><i className={`material-icons ent-icon`}>create</i><div>Create CN</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[2] }} onClick={(e) => navigate('/')}  ><i className={`material-icons ent-icon`}>star</i><div>Acknowledge</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[3] }} onClick={(e) => navigate('/')} ><i className={`material-icons ent-icon`}>edit</i><div>Edit</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[4] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon`}>done</i><div>Accept</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[5] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon`}>delete</i><div>Reject</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[6] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon`}>calendar_month</i><div>Re-Schedule</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[7] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon`}>archive</i><div>Archive</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[8] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon`}>email</i><div>Email</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[9] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon`}>notifications</i><div>Notifications</div></div>
                </div>
            ) : <></>}
            <hr></hr>
            <div className='mocPage'>
                <h2>My Change Notifications</h2>

                {cnsForThisUser.length === 0 ? (
                    <div>No data to display</div>
                ) : (
                    <div className="tableContainer">
                        <table className="table table-bordered">
                            <thead className='th columnHeader'>
                                <tr>
                                    {columns.map((column, index) => (
                                        <th key={index} className="column th columnHeader" style={{ minWidth: columnWidths[index] }}>
                                            {column}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cnsForThisUser.map(renderRow)}
                            </tbody>
                        </table>

                    </div>

                )}
                <hr>
                </hr>

                <ChangeNotificationDetailForm changeNotice={activeCN}></ChangeNotificationDetailForm>
                <button className='btn btn-primary' onClick={() => navigate(-1)}>Back</button>
            </div>
        </>
    );
}

export default MyChangeNotifications;