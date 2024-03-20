import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MyChangeNotifications.css';
import './App.css';
import { useAuth } from './AuthContext';
import { ChangeNotification } from './Interfaces';
import { useNavigate } from 'react-router-dom';
import ChangeNotificationDetailForm from './ChangeNotficiationDetailForm';
import { CNState, expression } from './Interfaces';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { toast } from 'react-toastify';
import { getFirestore, query, where, collection, addDoc, Query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import StateChange from './StateChange';
import { auth } from './firebaseConfig';
import { group } from 'console';
import { act } from 'react-dom/test-utils';
import { getApproversForOrg, acknowledgeActiveCN, updateExistingCN } from './dataAccess';
import SelectionTool from './SelectionTool';
import ReportsTool from './ReportsTool';
import { getLastValueInArray, getLastArrayInArray } from './dataAccess';
import VoteTool from './VoteTool';

const MyChangeNotifications = () => {
    const scrollableContainerRef = useRef(null);
    const navigate = useNavigate();
    const columns = [' ', 'MOC#', 'Creator', 'Approver', 'Short Description', 'Groups', 'State', 'Topic', 'Creation Date', 'Publication Date', 'Date of Implementation', 'Required Date', 'Category', 'Change Type', 'Long Description', 'Impacts', 'Location', 'Notes', 'Attachments', 'Reviewer Votes'];
    const columnWidths = [25, 100, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200]; // Adjust these values as needed
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [wasAcknowledged, setWasAcknowledged] = useState([false, false]);
    const [activeCN, setActiveCN] = useState<ChangeNotification | null>(null);
    const [showSelectionTools, setShowSelectionTools] = useState(false);
    const [showVoteTool, setShowVoteTool] = useState(false);
    const [showReportTool, setShowReportTool] = useState(false);
    const [updateExisting, setUpdateExisting] = useState(false);
    //The icons in order are:
    // ALL USERS:  (0) Back (1) Search
    // STAKHOLDERS: (2) Acknowledge (3) Object to CN
    // CREATORS: (4) Create New CN (5) Edit CN (6) Seek Approval 
    // APPROVERS (workflow): (7) Review (8) Approve 
    // (9) Reject (10) Request Edit (11) Reschedule 
    // (12) Pause (13) Complete (14) Cancel  (15) Archive
    // APPROVERS (other):  (16) Send Reminders  (17) Reports 
    let newOpacityArray = new Array(16).fill(0.45);
    //const [iconDisplayState, setIconDisplayState] = useState<number[]>(newOpacityArray)
    const authContext = useAuth();

    //let approvers: string[] = [];
    const [currentUserEmail, setCurrentUserEmail] = useState(authContext.user?.email);
    const [cnsForThisUser, setCnsForThisUser] = useState<ChangeNotification[]>([]);
    //allCNsForThisUser is set in useEffect and is used to select from when the user clicks the find button
    const [originalCnsForThisUser, setOriginalCnsForThisUser] = useState<ChangeNotification[]>([]);
    console.log('allCNsForThisUser RESET')
    const [showDetailForm, setShowDetailForm] = useState(false);
    const [showTable, setShowTable] = useState(true);
    const [isNewCN, setIsNewCN] = useState(false);
    const [requestedToState, setRequestedToState] = useState(CNState.CREATED);
    // This state determines whether we show/hide the state change form
    const [showStateChange, setShowStateChange] = useState(false);

    //When the child details component creates a new CN, 
    //Then setRequestedMocID is updated to the MoCID of that CN. 
    //setRequestedMocID is also used when the user clicks on a CN in the table.
    //RequestedMocID is used to populate the details form with CN data when isNewCN is false.
    const [requestedMocID, setRequestedMocID] = useState('');

    const [approvers, setApprovers] = useState<string[]>([]);
    useEffect(() => {
        const organization = authContext.user?.organization ?? '';
        getApproversForOrg(organization, authContext.user?.email).then((approvers) => {
            setApprovers(approvers)
        });

    }, []);

    const getCNStateForSelectedRow = () => {
        if (selectedRows.length === 1) {
            return getLastValueInArray(cnsForThisUser[selectedRows[0]].cnState);
        }
        return '';
    }
    //This useEffect creates the changeNotifications array.  It runs when the component
    //loads or when the CN Details form in newCN mode creates a new CN. 
    useEffect(() => {
        setSelectedRows([]);
        setShowDetailForm(false);
        console.log('useEffect: requestedMocID: ' + requestedMocID + ' showStateChange: ' + showStateChange)
        let org = authContext.user?.organization;
        if (currentUserEmail && org) {
            let indexOfNewlyCreatedCNtoSelect = -1;
            const db = getFirestore();
            const usersCollection = collection(db, 'Users');
            const qUsers = query(usersCollection, where("organization", "==", org), where("email", "==", currentUserEmail));
            const userSnapshot = getDocs(qUsers).then(async (querySnapshot) => {
                const selectedUserInOrg = querySnapshot.docs.map(doc => doc.data());
                let docs: any[] = [];
                if (selectedUserInOrg.length > 0) {
                    const groupsForUser = selectedUserInOrg[0].groups;
                    let q: Query;
                    if (authContext.user?.isStakeholder == false) {
                        q = query(collection(db, "changeNotifications"),
                            where("organization", "==", org)
                        );
                        const querySnapshot = await getDocs(q);
                        docs = querySnapshot.docs;
                    }
                    else {
                        const cnCollection = collection(db, 'changeNotifications');
                        for (let gr of groupsForUser) {

                            if (gr !== "NONE") {
                                let noOrgGroup = gr.substring(gr.indexOf('_') + 1);
                                console.log("Looking for CNs for group: " + noOrgGroup);
                                const qCNQuery = query(cnCollection, where("organization", "==", org), where("latestGroups", "array-contains", noOrgGroup));
                                const cnsForStakeholder = []
                                await getDocs(qCNQuery).then(async (cnSnapshot) => {
                                    docs = cnSnapshot.docs;
                                })
                            }
                        }

                    }

                    // Initialize an empty array to hold the change notifications
                    let changeNotifications = [];

                    // Loop through the documents
                    for (let i = 0; i < docs.length; i++) {
                        // ebugger;
                        let docData = docs[i].data();
                        let latest: any = {};
                        latest["mocNumber"] = docData["mocNumber"];
                        latest["creator"] = docData["creator"];
                        latest["organization"] = org;
                        const fields = ["approver", "shortReasonForChange", "groups", "cnState", "changeTopic",
                            "dateOfCreation", "dateOfPublication", "timeOfImplementation", "requiredDateOfCompletion",
                            "category", "changeType", "descriptionOfChange", "impacts", "location", "notes", "attachments", "version", "reviewerVotes"];
                        for (const field of fields) {
                            // if(field === "reviewerVotes" && docData["mocNumber"].indexOf("DK") > -1) {
                            //     debugger;
                            // }
                           
                            const array = docData[field];

                            if (Array.isArray(array) && array.length > 0) {
                                const lastElement = array[array.length - 1];
                                latest[field as keyof typeof latest] = array; // lastElement;//.value as never;
                            }
                        }
                        // before pushing to the change notifications array, we need to test if the user has the 
                        // correct role for the given state
                        let addToChangeNotifications = true;
                        if (latest.cnState !== undefined) {
                            const lastState = getLastValueInArray(latest.cnState);
                            if (lastState === CNState.PENDING_APPROVAL) {
                                if (authContext.user?.isCreator === true) {
                                    addToChangeNotifications = false;
                                }
                            }
                            if (lastState === CNState.UNDER_REVIEW) {
                                //ebugger;
                                if (authContext.user?.isReviewer === false && authContext.user?.isApprover === false) {
                                    addToChangeNotifications = false;
                                }
                            }
                            if (lastState === CNState.CREATED) {
                                if (authContext.user?.isCreator === false) {
                                    addToChangeNotifications = false;
                                }
                            }
                            if (lastState === CNState.APPROVED) {
                                if (authContext.user?.isCreator === true) {
                                    addToChangeNotifications = false;
                                }
                            }
                        }
                        if (addToChangeNotifications) {
                            changeNotifications.push(latest as ChangeNotification);
                            if (latest.mocNumber === requestedMocID) {
                                indexOfNewlyCreatedCNtoSelect = changeNotifications.length - 1;
                            }
                        }
                    }
                    setOriginalCnsForThisUser([...changeNotifications]);
                    setCnsForThisUser(changeNotifications);
                    if (indexOfNewlyCreatedCNtoSelect !== -1) {
                        handleRowClick(indexOfNewlyCreatedCNtoSelect, changeNotifications[indexOfNewlyCreatedCNtoSelect]);
                    }
                }
                else {
                    //setGroupsForSelectedUser([]);
                }
            });
        }
    }, [requestedMocID, showStateChange]);


    const handleRowClick = (index: number, changeNotification?: ChangeNotification) => {
        console.log('Selected rows:', index);
        //ebugger;
        if (changeNotification === undefined) {
            changeNotification = cnsForThisUser[index];
        }
        //setActiveCN({ ...activeCN, ...changeNotification })
        setActiveCN(changeNotification);
        setSelectedRows([]);
        setSelectedRows([index]);
        setShowTable(true);
        setShowDetailForm(true);
    }

    //When the child details component is dismissed, reset the view
    const onShowDetailsFormDismissed = () => {
        setShowDetailForm(false);
        setShowTable(true);
        setIsNewCN(false);
    }

    // This occurs when the user clicks on the CreateCN button.  By setting
    // isNewCN to true, we are telling the details form to create a new CN
    // and by setting showDetailForm to true, we are telling the details form to show.
    const onCreateChangeNotification = () => {
        setIsNewCN(true);
        setShowDetailForm(true);
        setShowTable(false);
    }

    // This occurs when the user clicks on the EditCN button.  By setting
    // isNewCN to false, we are telling the details form to edit the existing CN
    // and by setting showDetailForm to true, we are telling the details form to show.
    const onEditChangeNotification = () => {
        setUpdateExisting(true);
        setIsNewCN(false);
        setShowDetailForm(true);
        setShowTable(false);
    }

    const onSeekApproval = async () => {
        setRequestedToState(CNState.PENDING_APPROVAL);
        const approver = getLastValueInArray(activeCN?.approver ?? []);
        if (approver === 'UNSET' || approver === '' || approver === undefined) {
            alert("You must set an approver before seeking approval");
            return;
        }
        setShowStateChange(true);
    }

    const handleAcknowledgeCN = async () => {
        const indexToToggle = selectedRows[0];
        let newWasAcknowledged = [...wasAcknowledged];
        newWasAcknowledged[indexToToggle] = !newWasAcknowledged[indexToToggle];
        setWasAcknowledged(newWasAcknowledged);
        if (activeCN !== null) {
            acknowledgeActiveCN(activeCN, newWasAcknowledged[indexToToggle], currentUserEmail ?? '');
        }
    }

    const onVoteForCN = async () => {
        setShowVoteTool(true);
    }

    const onReviewCN = async () => {
        console.log(approvers);
        setRequestedToState(CNState.UNDER_REVIEW);
        setShowStateChange(true);
    }

    const onApproveCN = async () => {
        setRequestedToState(CNState.APPROVED);
        setShowStateChange(true);
    }

    const onRejectCN = async () => {
    }

    const onRequestEdit = async () => {
    }
    const onCompleteCN = async () => {
        setRequestedToState(CNState.COMPLETED);
        setShowStateChange(true);
    }
    const onArchiveCN = async () => {
        setRequestedToState(CNState.ARCHIVED);
        setShowStateChange(true);
    }
    const onActivateCN = async () => {
        setRequestedToState(CNState.ACTIVATED);
        setShowStateChange(true);
    }
    const handleClickSelectTool = () => {
        setShowSelectionTools(true);
    }

    const handleClickReportTool = () => {
        setShowReportTool(true);
    }

    const formatDataForTable = (data: any) => {
        if (data !== undefined) {
            if (data === "*") {
                return <i className={`material-icons ent-icon ent-green`}>star</i>
            }
            if (data.toString().length > 50) {
                return data.toString().slice(0, 50) + '...'
            }
            else {
                return data.toString()
            }
        }
        else {
            return '??'
        }
    }

    const handleVote = (votedYes: boolean, comments: string): void => {
        let version = 1;
        //Target the active version of the CN (which updates after going to PENDING_APPROVAL)
        if (activeCN?.version[0].version) {
            version =  activeCN?.version[0].version;
        }
        //ebugger;
        const newCN = { ...activeCN };
        const reviewerVotes = activeCN?.reviewerVotes ?? [];

        const thisVersionIndex = reviewerVotes.findIndex((entry) => entry.version == version);
        const votesForThisVersion = thisVersionIndex > -1 ? reviewerVotes[thisVersionIndex].value : [];
        debugger;
        const user = authContext.user?.email;
        const vote = votedYes ? "YES" : "NO";
        const entry = user + "|" + vote + "|" + comments;
        if (votesForThisVersion) {
            votesForThisVersion.push(entry);
        }
        if (thisVersionIndex > -1) {
            reviewerVotes[thisVersionIndex].value = votesForThisVersion;
        }
        else {
            reviewerVotes.push({ version: version, value: votesForThisVersion });
        }

        newCN.reviewerVotes = reviewerVotes;


        if (activeCN) {
            updateExistingCN(activeCN, newCN).then(() => {
                console.log("UPDATED CN:    ");
            }).catch((error: any) => {
            });
        }

        console.log('Voted Yes: ' + votedYes + ' emailNotes: ' + comments);
    }

    const handleApplyExpression = (expressions: expression[]) => {
        const newCNsForThisUser: ChangeNotification[] = []
        originalCnsForThisUser.forEach(cn => {
            let expressionsMatch = true
            expressions.forEach(exp => {
                let cnValue = "";
                if (exp.fieldName !== "mocNumber") {
                    cnValue = getLastValueInArray(cn[exp.fieldName]);
                }
                else {
                    cnValue = cn[exp.fieldName];
                }
                if (exp.operator === "equals") {
                    if (cnValue !== exp.value) {
                        expressionsMatch = false
                    }
                }
                if (exp.operator === "not equals") {
                    if (cnValue === exp.value) {
                        expressionsMatch = false
                    }
                }
            });
            if (expressionsMatch) {
                newCNsForThisUser.push(cn)
            }
        });
        setCnsForThisUser(newCNsForThisUser);
    }

    return (
        <>
            {showVoteTool && <VoteTool onApply={handleVote} onDismiss={() => setShowVoteTool(false)} ></VoteTool>}
            {showSelectionTools && <SelectionTool onApply={handleApplyExpression} onDismiss={() => setShowSelectionTools(false)} ></SelectionTool>}
            {showReportTool && <ReportsTool onDismiss={() => setShowReportTool(false)} changeNotices={cnsForThisUser}></ReportsTool>}
            {showStateChange ?
                <StateChange changeNotification={activeCN} toState={requestedToState} approvers={approvers} setShowStateChange={setShowStateChange} /> :
                <>
                    {(cnsForThisUser.length > 0 || authContext.user?.isCreator == true) && (showTable) ? (
                        <div className="scrollableContainer" ref={scrollableContainerRef} >
                            {/* (0) HOME */}
                            <div className="iconContainer ent-requires-selection" onClick={() => navigate(-1)} ><i className={`material-icons ent-icon`}>home</i><div>Back</div></div>
                            {/* (1) SEARCH - users can search for one or many CNs*/}
                            <div className="iconContainer ent-requires-selection" onClick={() => handleClickSelectTool()}  ><i className={`material-icons ent-icon ent-orange`}>search</i><div>Search</div></div>
                            {authContext?.user?.isStakeholder && selectedRows.length === 1 && <>
                                {/* (2) ACKNOWLEDGE - stakeholders can acknowledge or unacknowledge*/}
                                <div className="iconContainer ent-requires-selection" onClick={(e) => handleAcknowledgeCN()}  ><i className={`material-icons ent-icon ent-green`}>star</i><div>Acknowledge</div></div>
                                {/* (3) OBJECT - stakeholders can object to a CN or remove their objection*/}
                                <div className="iconContainer ent-requires-selection" onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-purple`}>emoji_people</i><div>Object to CN</div></div>
                            </>}
                            {authContext?.user?.isCreator && <>
                                {/* (4) CREATE NEW CN */}
                                <div className="iconContainer ent-workflow" onClick={(e) => onCreateChangeNotification()}  ><i className={`material-icons ent-icon ent-red`}>add_circle</i><div>New CN</div></div>
                                {selectedRows.length === 1 && <>
                                    {getCNStateForSelectedRow() === CNState.CREATED && <>
                                        {/* (5) EDIT */}
                                        <div className="iconContainer ent-requires-selection " onClick={(e) => onEditChangeNotification()} ><i className={`material-icons ent-icon ent-blue`}>edit</i><div>Edit</div></div>
                                        {/* (5) SEEK APPROVAL */}
                                        <div className="iconContainer ent-requires-selection" onClick={(e) => onSeekApproval()}  ><i className={`material-icons ent-icon ent-orange`}>send</i><div>Seek Approval</div></div>
                                    </>}
                                </>}
                            </>}
                            {authContext?.user?.isReviewer && <>
                                {selectedRows.length === 1 && <>
                                    <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => onVoteForCN()}  ><i className={`material-icons ent-icon ent-green`}>how_to_vote</i><div>Vote</div></div>
                                </>}
                            </>}
                            {authContext?.user?.isApprover && <>
                                {selectedRows.length === 1 && <>
                                    {(getLastValueInArray(activeCN?.cnState ?? []) === CNState.PENDING_APPROVAL) || (getLastValueInArray(activeCN?.cnState ?? []) === CNState.UNDER_REVIEW) ?
                                        <>
                                            <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => onReviewCN()}  ><i className={`material-icons ent-icon ent-green`}>visibility</i><div>Review CN</div></div>
                                            <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => onApproveCN()}><i className={`material-icons ent-icon ent-purple`}>done</i><div>Approve CN</div></div>
                                            <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => onRejectCN()}><i className={`material-icons ent-icon ent-red`}>delete</i><div>Reject CN</div></div>
                                            <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => onRequestEdit()} ><i className={`material-icons ent-icon ent-blue`}>draw</i><div>Request Edit</div></div>
                                        </> : <></>}
                                    {getLastValueInArray(activeCN?.cnState ?? []) === CNState.ACTIVATED && <>
                                        <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-orange`}>calendar_month</i><div>Reschedule CN</div></div>
                                        <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-green`}>pause</i><div>Pause CN</div></div>
                                        <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => onActivateCN()}><i className={`material-icons ent-icon ent-purple`}>directions_run</i><div>Activate</div></div>
                                        <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => onCompleteCN()}><i className={`material-icons ent-icon ent-red`}>done_all</i><div>Complete CN</div></div>
                                        <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-blue`}>cancel</i><div>Cancel CN</div></div>
                                        <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => onArchiveCN()}><i className={`material-icons ent-icon ent-orange`}>archive</i><div>Archive CN</div></div>
                                    </>}
                                </>}
                                {selectedRows.length > -1 && <>
                                    <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => navigate('/')}><i className={`material-icons ent-icon ent-green`}>email</i><div>Send Emails</div></div>
                                    <div className="iconContainer ent-requires-selection ent-approver" onClick={(e) => handleClickReportTool()}><i className={`material-icons ent-icon ent-purple`}>bar_chart</i><div>Reports</div></div>
                                </>}
                            </>}

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
                                            <tbody >
                                                {cnsForThisUser.map((cn: ChangeNotification, rowIndex: number) => {
                                                    const rowDataObject = {
                                                        X: wasAcknowledged[rowIndex] ? '*' : '',
                                                        mocNumber: cn.mocNumber,
                                                        creator: getLastValueInArray(cn.creator),
                                                        approver: getLastValueInArray(cn.approver),
                                                        shortReasonForChange: getLastValueInArray(cn.shortReasonForChange),
                                                        groups: getLastArrayInArray(cn.groups),
                                                        cnState: getLastValueInArray(cn.cnState),
                                                        changeTopic: getLastValueInArray(cn.changeTopic),
                                                        dateOfCreation: getLastValueInArray(cn.dateOfCreation),
                                                        dateOfPublication: getLastValueInArray(cn.dateOfPublication),
                                                        timeOfImplementation: getLastValueInArray(cn.timeOfImplementation),
                                                        requiredDateOfCompletion: getLastValueInArray(cn.requiredDateOfCompletion),
                                                        category: getLastValueInArray(cn.category),
                                                        changeType: getLastValueInArray(cn.changeType),
                                                        descriptionOfChange: getLastValueInArray(cn.descriptionOfChange),
                                                        impacts: getLastValueInArray(cn.impacts),
                                                        location: getLastValueInArray(cn.location),
                                                        notes: getLastValueInArray(cn.notes),
                                                        attachments: getLastArrayInArray(cn.attachments),
                                                        reviewerVotes: getLastArrayInArray(cn.reviewerVotes)
                                                    };
                                                    return (
                                                        <tr className='tableRow' key={rowIndex} onClick={() => handleRowClick(rowIndex)} style={selectedRows.includes(rowIndex) ? { color: 'white', backgroundColor: 'var(--ent-blue)' } : {}}>
                                                            {Object.values(rowDataObject).map((data, index) => (
                                                                <td key={index} className="column" style={{ minWidth: columnWidths[index] }}>
                                                                    {formatDataForTable(data)}
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
                        {showDetailForm &&
                            <ChangeNotificationDetailForm isNewCN={isNewCN} updateExisting={updateExisting} changeNotice={activeCN} onShowDetailsFormDismissed={onShowDetailsFormDismissed} setRequestedMocID={setRequestedMocID} approvers={approvers}></ChangeNotificationDetailForm>
                        }

                    </div>
                </>}
        </>
    );
}
export default MyChangeNotifications;