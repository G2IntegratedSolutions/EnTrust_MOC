import React, { useEffect } from 'react';
import { ChangeNotification, CNState } from './Interfaces';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { toast } from 'react-toastify';
import { getFirestore, query, where, collection, addDoc, Query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { OnSeekApprovalCN } from './TransitionEvents';
import { useAuth } from './AuthContext';


interface StateChangeProps {
    changeNotification: ChangeNotification | null;
    toState: string;
    setShowStateChange: React.Dispatch<React.SetStateAction<boolean>>;
}

const StateChange: React.FC<StateChangeProps> = ({ changeNotification, toState, setShowStateChange }) => {
    const authContext = useAuth();
    const [emailNotes, setEmailNotes] = React.useState('');

    const advanceChange = () => {
        const theEmailNotes = emailNotes;
        // ebugger;
        const mocNumber = changeNotification?.mocNumber;
        const db = getFirestore();
        const cnCollection = collection(db, 'changeNotifications');
        const qCN = query(cnCollection, where("mocNumber", "==", mocNumber));
        const cnSnapshot = getDocs(qCN).then(async (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let newDoc = { ...doc.data() };//name: newName, description: newDescription, id: currentGroup.id, organization: currentGroup.organization}
                let cnState = newDoc.cnState;
                cnState.push({ value: CNState.PENDING_APPROVAL, timeStamp: Date.now() });
                newDoc.cnState = cnState;
                updateDoc(doc.ref, newDoc).then(() => {
                    //refreshUsersAndGroupsInOrg();
                    toast.success('Change Notification successfully updated!');
                    OnSeekApprovalCN( changeNotification, authContext.user,emailNotes);
                }).catch((error) => {
                    toast.error('Error updating Change Notification: ' + error);
                    console.error('Error updating group:', error);
                    //toast.error('Error updating group: ' + error);
                });
            });
        });
    }

    return (
        <div style={{ padding: '10px' }}>
            <h2>Advance Change from {(changeNotification?.cnState[0] as any).value} to {toState}</h2>
            On this page, you can advance the Change Notification of your CN (MoC# {changeNotification?.mocNumber}) from
            from <b>{(changeNotification?.cnState[0] as any).value}</b> to <b>{toState}.</b>
            <br></br>
            <p>
                <p>You can optionally include text that will be sent to registered email/text recipents:</p>
                <textarea onChange={(e) => setEmailNotes(e.target.value)} placeholder='Enter detail about this change - they will be sent to the email/text recipients and optionally become a permanent part of the CN.' style={{ width: '100%', height: '25vw' }}></textarea>
            </p>
            <div style={{marginLeft:'0px'}} className=""  >
                <input
                    checked={true}
                    className="form-check-input"
                    id='includeInCN'
                    type="checkbox"

                />
                <label style={{ marginLeft: '4px' }} className="form-check-label" htmlFor='includeInCN'>
                    Save these notes in the database as part of the CN.
                </label>
            </div>
            <br></br>
            <button style={{ marginLeft: '10px' }} className='btn btn-primary' onClick={(e) => advanceChange()}>Advance Change</button>
            <button className='btn btn-primary' onClick={(e) => setShowStateChange(false)}>Dismiss</button>
        </div>
    );
};

export default StateChange;