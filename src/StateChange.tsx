import React, { useState, ChangeEvent } from 'react';
import { ChangeNotification, CNState } from './Interfaces';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { toast } from 'react-toastify';
import { getFirestore, query, where, collection, addDoc, Query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { OnSeekApprovalCN, OnApproveCN,OnUnderReviewCN } from './TransitionEvents';
import { useAuth } from './AuthContext';


interface StateChangeProps {
    changeNotification: ChangeNotification | null;
    toState: CNState;
    newOwner: string;
    setShowStateChange: React.Dispatch<React.SetStateAction<boolean>>;
    approvers: string[];
}
const getLastValueInArray = (arr: any[]) => {
    return arr[arr.length - 1].value;
}
const StateChange: React.FC<StateChangeProps> = ({ changeNotification, toState, approvers, newOwner, setShowStateChange }) => {
    const authContext = useAuth();
    const [emailNotes, setEmailNotes] = React.useState('');
    const [checkedValues, setCheckedValues] = useState<string[]>([]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setCheckedValues([...checkedValues, event.target.value]);
        } else {
            setCheckedValues(checkedValues.filter(value => value !== event.target.value));
        }
    };
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
                cnState.push({ value: toState, timeStamp: Date.now() });
                newDoc.cnState = cnState;
                newDoc.latestState = toState;
                if (toState === CNState.PENDING_APPROVAL) {
                    const lastApprover = getLastValueInArray(changeNotification?.approver ?? []);
                    newDoc.latestOwner = lastApprover
                }
                updateDoc(doc.ref, newDoc).then(() => {
                    //refreshUsersAndGroupsInOrg();
                    toast.success('Change Notification successfully updated!');
                    switch (toState) {
                        case CNState.PENDING_APPROVAL:
                            OnSeekApprovalCN(changeNotification, authContext.user, emailNotes);
                            // const lastApprover = getLastValueInArray(changeNotification?.approver ?? []);
                            // newDoc.latestOwner = lastApprover
                            break;
                        case CNState.APPROVED:
                            if (changeNotification) {
                                OnApproveCN(changeNotification, authContext.user, emailNotes);
                            }
                            break;
                        case CNState.UNDER_REVIEW:
                            OnUnderReviewCN(changeNotification, authContext.user, approvers, emailNotes);
                            break;
                    }
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
            <h2>Advance Change from {getLastValueInArray(changeNotification?.cnState as any)} to {toState}</h2>
            On this page, you can advance the Change Notification of your CN (MoC# {changeNotification?.mocNumber}) from
            from <b>{getLastValueInArray(changeNotification?.cnState as any)}</b> to <b>{toState}.</b>
            <br></br>
            {toState === CNState.UNDER_REVIEW &&
                <>
                    <hr></hr>
                    <div>To Transition to this state, you must select one or more approvers to review the CN. The approvers
                        you select will be notified by email.  As the
                        primary approver for this Change Notificiation, it is your responsibility to determine based on the reviewers 
                        feedback whether to approve or reject the CN.
                    </div>
                    {approvers.map((approver, index) => {
                        return (
                            <div key={index}>
                                <input
                                    type="checkbox"
                                    id={approver}
                                    name={approver}
                                    value={approver}
                                    onChange={handleChange}
                                />
                                <label style={{ marginLeft: '4px' }} htmlFor={approver}>{approver}</label>
                            </div>
                        )
                    })}
                    <hr></hr>
                </>
            }
            <p>
                <p>You can optionally include text that will be sent to registered email/text recipents:</p>
                <textarea onChange={(e) => setEmailNotes(e.target.value)} placeholder='Enter detail about this change - they will be sent to the email/text recipients and optionally become a permanent part of the CN.' style={{ width: '100%', height: '25vw' }}></textarea>
            </p>

            <div style={{ marginLeft: '0px' }} className=""  >
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