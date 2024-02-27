import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MyChangeNotifications.css';
import './App.css';
import { useAuth } from './AuthContext';
import { getFirestore, query, where, collection, addDoc, Query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ChangeNotification } from './Interfaces';
import { useNavigate } from 'react-router-dom';
import ChangeNotificationDetailForm from './ChangeNotficiationDetailForm';

const MyChangeNotifications = () => {
    const scrollableContainerRef = useRef(null);
    const navigate = useNavigate();
    const columns = ['MOC#', 'Creator', 'Owner', 'Approver', 'Short Description', 'Groups', 'State', 'Topic', 'Creation Date', 'Publication Date', 'Time of Implementation', 'Required Date', 'Category', 'Change Type', 'Long Description', 'Impacts', 'Location', 'Notes', 'Attachments']
    const columnWidths = [100, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200]; // Adjust these values as needed

    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [activeCN, setActiveCN] = useState<ChangeNotification | null>(null);
    //The icons in order are (0) Search 91) Create (2) Acknowledge (3) Edit (4) Accept (5) Reject (6) Re-Schedule (7) Archive (8) Email (9) Notify
    const [iconDisplayState, setIconDisplayState] = useState<number[]>([.3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3])
    const authContext = useAuth();
    const [selectedUserEmail, setSelectedUserEmail] = useState(authContext.user?.email);
    const [cnsForThisUser, setCnsForThisUser] = useState<ChangeNotification[]>([]);
    const [showDetailForm, setShowDetailForm] = useState(false);
    const [showTable, setShowTable] = useState(true);
    const [isNewCN, setIsNewCN] = useState(false);
    const [refreshCNs, setRefreshCNs] = useState(false);

    useEffect(() => {
        // console.log('selectedRow:', selectedRows[0]);
        //The icons in order are:
        // (0) Search (1) Create (2) Acknowledge (3) Seek Approval (4) Accept (5) Reject (6) Request Edit 
        // (7) Reschedule (8) Pause (9) Cancel (10) Complete (11) Archive (12) Send Emails (13) Notify (14) Object to CN

        let newOpacityArray = [.3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3, .3];

        // Anyone can search(0)
        if (cnsForThisUser.length > 0) {
            newOpacityArray[0] = 1;
        }
        // Creators can create(1)
        if (authContext.user?.isCreator == true) {
            newOpacityArray[1] = 1;
        }
        // Stakeholders can acknowledge(2)
        if (authContext.user?.isStakeholder == true && selectedRows.length === 1) {
            newOpacityArray[2] = 1;
        }
        // Approvers and Creators can edit(6)
        if ((authContext.user?.isApprover == true || authContext.user?.isCreator) == true && selectedRows.length === 1) {
            newOpacityArray[6] = 1;
        }
        // Approvers can reject(5), reschedule(7), pause(8) and archive(11)
        if (authContext.user?.isApprover == true && selectedRows.length === 1) {
            newOpacityArray[4] = 1;
            newOpacityArray[5] = 1;
            newOpacityArray[6] = 1;
            newOpacityArray[7] = 1;
            newOpacityArray[8] = 1;
            newOpacityArray[9] = 1;
            newOpacityArray[10] = 1;
            newOpacityArray[11] = 1;
            newOpacityArray[12] = 1;
            newOpacityArray[13] = 1;
        }


        setIconDisplayState(newOpacityArray);
    }, [cnsForThisUser, selectedRows, refreshCNs]);

    const getLastValueInArray = (arr: any[]) => {
        return arr[arr.length - 1];
    }
    useEffect(() => {
        // ebugger;
        let selectedUser_Email = selectedUserEmail;
        let org = authContext.user?.organization;
        if (selectedUser_Email && org) {
            const db = getFirestore();
            const usersCollection = collection(db, 'Users');
            const qUsers = query(usersCollection, where("organization", "==", authContext.user?.organization), where("email", "==", selectedUser_Email));
            const userSnapshot = getDocs(qUsers).then(async (querySnapshot) => {
                const selectedUserInOrg = querySnapshot.docs.map(doc => doc.data());
                if (selectedUserInOrg.length > 0) {
                    // ebugger;
                    const groupsForUser = selectedUserInOrg[0].groups;
                    let q: Query;
                    if (authContext.user?.isCreator == true) {
                        q = query(collection(db, "changeNotifications"),
                            where("organization", "==", authContext.user?.organization),
                            where("latestOwner", "==", authContext.user?.email)
                        );
                    }
                    else {
                        return;
                    }
                    const querySnapshot = await getDocs(q);
                    // ebugger;
                    const docs = querySnapshot.docs;
                    // Initialize an empty array to hold the change notifications
                    let changeNotifications = [];

                    // Loop through the documents
                    for (let i = 0; i < docs.length; i++) {
                        // ebugger;
                        let docData = docs[i].data();
                        let latest: any = {};
                        latest["mocNumber"] = docData["mocNumber"];
                        latest["creator"] = docData["creator"];
                        const fields = ["owner", "approver", "shortReasonForChange", "groups", "cnState", "changeTopic",
                            "dateOfCreation", "dateOfPublication", "timeOfImplementation", "requiredDateOfCompletion",
                            "category", "changeType", "descriptionOfChange", "impacts", "location", "notes", "attachments"];
                        for (const field of fields) {
                            const array = docData[field];

                            if (Array.isArray(array) && array.length > 0) {
                                const lastElement = array[array.length - 1];
                                latest[field as keyof typeof latest] = lastElement.value as never;
                            }
                        }

                        // Cast the data to a ChangeNotification and add it to the array
                        changeNotifications.push(latest as ChangeNotification);
                    }
                    setCnsForThisUser(changeNotifications);
                }
                else {
                    //setGroupsForSelectedUser([]);
                }
            });
        }
    }, [refreshCNs]);

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
        // console.log('Row clicked:', index);
        // console.log('Active CN:', cnsForThisUser[index]);
        console.log('Selected rows:', index);
        setActiveCN(cnsForThisUser[index]);
        //debugger;
        setSelectedRows([]);
        setSelectedRows([index]);
        setShowTable(true);
        setShowDetailForm(true);
    }


    const renderRow = (cn: ChangeNotification, rowIndex: number) => {
        //console.log('Rendering row:', rowIndex);
        const rowDataArray = [
            cn.mocNumber,
            cn.creator,
            cn.owner,
            cn.approver,
            cn.shortReasonForChange,
            cn.groups,
            cn.cnState,
            cn.changeTopic,
            cn.dateOfCreation,
            cn.dateOfPublication,
            cn.timeOfImplementation,
            cn.requiredDateOfCompletion,
            cn.category,
            cn.changeType,
            cn.descriptionOfChange,
            cn.impacts,
            cn.location,
            cn.notes,
            cn.attachments
        ];
        // ebugger;
        return (
            <tr key={rowIndex} onClick={() => handleRowClick(rowIndex)} style={rowIndex in selectedRows ? { color: 'white', backgroundColor: 'var(--ent-blue)' } : {}}>
                {rowDataArray.map((data, index) => (
                    <td key={index} className="column" style={{ minWidth: columnWidths[index] }}>
                        {data !== undefined
                            ? data.toString().length > 50
                                ? data.toString().slice(0, 50) + '...'
                                : data.toString()
                            : null
                        }
                    </td>
                ))}
            </tr>
        );
    }

    const onShowDetailsFormDismissed = () => {
        setShowDetailForm(false);
        setShowTable(true);
        setIsNewCN(false);
    }
    // const onHandleSetIconDisplayStatex = (icon: string, state: boolean) => {
    //     let newState = [...iconDisplayState];
    //     newState[4] = 1
    //     setIconDisplayState(newState)
    // }
    const onCreateChangeNotification = () => {
        if (iconDisplayState[1] === 1) {
            setIsNewCN(true);
            setShowDetailForm(true);
            setShowTable(false);
        }
        else {
            setIsNewCN(false);
            setShowTable(true);
        }

    }
    return (
        <>
            {(cnsForThisUser.length > 0 || authContext.user?.isCreator == true) && (showTable) ? (
                <div className="scrollableContainer" ref={scrollableContainerRef} >
                    <div className="iconContainer ent-requires-selection" onClick={() => navigate(-1)} ><i className={`material-icons ent-icon`}>home</i><div>Back</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[0] }} onClick={(e) => navigate('/')}  ><i className={`material-icons ent-icon ent-purple`}>search</i><div>Search</div></div>
                    <div className="iconContainer" style={{ opacity: iconDisplayState[1] }} onClick={(e) => onCreateChangeNotification()}  ><i className={`material-icons ent-icon ent-orange`}>edit_square</i><div>Create CN</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[2] }} onClick={(e) => navigate('/')}  ><i className={`material-icons ent-icon ent-green`}>star</i><div>Acknowledge</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[3] }} onClick={(e) => navigate('/')}  ><i className={`material-icons ent-icon ent-blue`}>send</i><div>Seek Approval</div></div>

                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[4] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-green`}>done</i><div>Accept CN</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[5] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-red`}>delete</i><div>Reject CN</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[6] }} onClick={(e) => navigate('/')} ><i className={`material-icons ent-icon ent-orange`}>edit</i><div>Edit</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[7] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-blue`}>calendar_month</i><div>Reschedule CN</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[8] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-green`}>pause</i><div>Pause CN</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[9] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-red`}>cancel</i><div>Cancel CN</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[10] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-green`}>done_all</i><div>Complete CN</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[11] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-purple`}>archive</i><div>Archive CN</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[12] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-orange`}>email</i><div>Send Emails</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[13] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-green`}>notifications</i><div>Notifications</div></div>
                    <div className="iconContainer ent-requires-selection" style={{ opacity: iconDisplayState[14] }} onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-red`}>emoji_people</i><div>Object to CN</div></div>
                </div>
            ) : <></>}
            {showTable && showTable &&
                <hr></hr>}
            <div className='mocPage'>
                {(showTable) &&
                    <>
                        <h2>Change Notifications</h2>

                        {cnsForThisUser.length === 0 ? (
                            <>
                                <div>No data to display</div>
                                <button className='btn btn-primary' onClick={() => navigate(-1)}>Back</button></>
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
                                        {cnsForThisUser.map((cn: ChangeNotification, rowIndex: number) => {
                                            // console.log('SELECTED ROWS ', selectedRows);
                                            // if(selectedRows[0] == 1){
                                            //     debugger
                                            // }
                                            // if(1 in selectedRows){
                                            //     debugger;
                                            // }
                                            const rowDataArray = [
                                                cn.mocNumber,
                                                cn.creator,
                                                cn.owner,
                                                cn.approver,
                                                cn.shortReasonForChange,
                                                cn.groups,
                                                cn.cnState,
                                                cn.changeTopic,
                                                cn.dateOfCreation,
                                                cn.dateOfPublication,
                                                cn.timeOfImplementation,
                                                cn.requiredDateOfCompletion,
                                                cn.category,
                                                cn.changeType,
                                                cn.descriptionOfChange,
                                                cn.impacts,
                                                cn.location,
                                                cn.notes,
                                                cn.attachments
                                            ];
                                            // ebugger;
                                            return (
                                                <tr key={rowIndex} onClick={() => handleRowClick(rowIndex)} style={selectedRows.includes(rowIndex) ? { color: 'white', backgroundColor: 'var(--ent-blue)' } : {}}>
                                                    {rowDataArray.map((data, index) => (
                                                        <td key={index} className="column" style={{ minWidth: columnWidths[index] }}>
                                                            {data !== undefined
                                                                ? data.toString().length > 50
                                                                    ? data.toString().slice(0, 50) + '...'
                                                                    : data.toString()
                                                                : null
                                                            }
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                            </div>

                        )}
                        <hr>
                        </hr>
                    </>
                }
                {showDetailForm && <ChangeNotificationDetailForm isNewCN={isNewCN} changeNotice={activeCN} onShowDetailsFormDismissed={onShowDetailsFormDismissed} setRefreshCNs={setRefreshCNs}></ChangeNotificationDetailForm>
                }

            </div>
        </>
    );
}

export default MyChangeNotifications;