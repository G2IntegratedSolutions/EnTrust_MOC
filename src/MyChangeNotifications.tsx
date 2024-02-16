import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MyChangeNotifications.css';
import './App.css';
import { useAuth } from './AuthContext';
import { getFirestore, query, where, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import {ChangeNotification } from './Interfaces';

const MyChangeNotifications = () => {
    const columns = ['MOC#','Status' , 'Date of Creation', 'Date of Publication', 'Change Type','Time', 'Change Topic', 'Groups', 'Short Description', 'Long Description', 'Impacts', 'Required Date of Completion', 'Notes', 'Attachments'];
    const columnWidths = [100, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200]; // Adjust these values as needed
    //const sampleData = ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4', 'Sample 5', 'Sample 6', 'Sample 7', 'Sample 8', 'Sample 9', 'Sample 10', 'Sample 11', 'Sample 12'];
    //const sampleCNs: string[][] =  [sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData, sampleData];
    const [selectedRow, setSelectedRow] = useState(0);
    const authContext = useAuth();
    const [selectedUserEmail, setSelectedUserEmail] = useState(authContext.user?.email);
    const [cnsForThisUser, setCnsForThisUser] = useState<ChangeNotification[]>([]);

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
                    const q = query(collection(db, "ChangeNotifications"), where("groupIds", "array-contains-any", groupsForUser));
                    const querySnapshot = await getDocs(q);
                    setCnsForThisUser(querySnapshot.docs.map(doc => doc.data()) as ChangeNotification[]);
                    // debugger;
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

    const handleRowClick = (index: number) => {
        console.log('Row clicked:', index);
        setSelectedRow(index);
    }

  
    const renderRow = (cn: ChangeNotification, rowIndex: number) => {
        const rowDataArray = [
            cn.mocNumber,
            cn.status,
            cn.dateOfCreation,
            cn.dateOfPublication,
            cn.type,
            cn.timeOfImplementation,
            cn.topic, 
            cn.groupNames,
            cn.shortReasonForChange,
            cn.descriptionOfChange,
            cn.impacts,
            cn.requiredDateOfCompletion,
            cn.notes
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

    return (
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

            <div className="details">
                {/* {columns.map((column, index) => (
                    <div key={index}>
                        <label>{column}</label>
                        <input type="text" value={cnsForThisUser[selectedRow][index]} disabled={authContext.user?.isAdmin !== true} />
                    </div>
                ))} */}
            </div>
        </div>
    );
}

export default MyChangeNotifications;