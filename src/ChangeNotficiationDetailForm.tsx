// ChangeNotificationDetailForm.tsx
import React, { useState, ChangeEvent, FormEvent, ReactNode, useEffect, useRef } from 'react';
import { ChangeNotification } from './Interfaces';
import { useAuth } from './AuthContext';
import { Group, User } from './Interfaces'
import { generateRandomString } from './common';
import { getFirestore, collection, query, where, getDocs, addDoc } from '@firebase/firestore';
import { toast } from 'react-toastify';
import mapImage from './assets/map.png';
import ModalComponent from './ModalComponent';
import { map } from '@firebase/util';
import { assertQualifiedTypeIdentifier } from '@babel/types';
import { OnCreateCN } from './TransitionEvents';

interface ChangeNotificationDetailFormProps {
    changeNotice: ChangeNotification | null;
    isNewCN: boolean;
    onShowDetailsFormDismissed: () => void;
    setRequestedMocID: React.Dispatch<React.SetStateAction<string>>;
}


const ChangeNotificationDetailForm: React.FC<ChangeNotificationDetailFormProps | null> = (props) => {
    // ebugger
    const [cn, setCN] = useState<ChangeNotification | null>(props?.changeNotice ?? null);

    useEffect(() => {
        setCN(props?.changeNotice ?? null);
        getApprovers();
    }, [props?.changeNotice?.mocNumber]);

    const hideFieldsForNew = true;
    const timeStamp = Date.now();
    const date = new Date(timeStamp);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-indexed in JavaScript
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    const [approvers, setApprovers] = useState<string[]>([]);

    //The following state variables are used to manage the form state for
    //fields that have domains of values that are not free text
    const [selectedApprover, setSelectedApprover] = useState('UNSET');
    const [selectedCNStatus, setCNStatus] = useState('UNSET');
    const [selectedChangeCategory, setSelectedChangeCategory] = useState('UNSET');
    const [selectedChangeTopic, setSelectedChangeTopic] = useState('UNSET');
    const [selectedChangeType, setSelectedChangeType] = useState('UNSET');

    // Change Notification Form State
    const [mocNumber, setMocNumber] = useState('');
    const [creator, setCreator] = useState('');
    const [owner, setOwner] = useState('');
    const [approver, setApprover] = useState('');
    const [shortReasonForChange, setShortReasonForChange] = useState('');
    //Note that the array "groups" here is NOT an array of group names, but rather an array of different times when group might have been changed for a sepecific CN. 
    //The value of the last element in the groups array might be, for example, "North|South". When the pipe delimited 
    //string is read in useEffect it is split into an array of group names which feed another state
    //variable called groupSelectionState which would look like {North: true, South: true, East:false}
    //groupSelectionState gets mutated in the checkbox change event handler. 
    //Finally, another stateful variable, groupsForOrganization, is used to store the actual group names for the organization
    //and could exend beyond just the CN (e.g. "North", "South", "East", "West", "Central" etc.)
    const [groups, setGroups] = useState<string[]>([]);
    const [groupSelectionState, setGroupSelectionState] = useState<Record<string, boolean>>({});
    const [groupsForOrganization, setGroupsForOrganization] = useState<string[]>([]); // Update the type of initial state

    const [cnState, setCNState] = useState('CREATED'); // [ 'Approved', 'Rejected', 'Under Review', 'Activated', 'Completed', 'Archived'
    const [changeTopic, setChangeTopic] = useState('');
    const [dateOfCreation, setDateOfCreation] = useState(formattedDate);
    const [dateOfPublication, setDateOfPublication] = useState(formattedDate);
    const [timeOfImplementation, setTimeOfImplementation] = useState(formattedDate);
    const [requiredDateOfCompletion, setRequiredDateOfCompletion] = useState(formattedDate);
    const [category, setCategory] = useState('');
    const [changeType, setChangeType] = useState('');
    const [descriptionOfChange, setDescriptionOfChange] = useState('');
    const [impacts, setImpacts] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [attachments, setAttachments] = useState('');


    const authContext = useAuth();
    const changeCategories = ['SELECT ONE', 'Safety', 'Quality', 'Production', 'Facilities', 'IT', 'HR', 'Finance', 'Other'];
    const changeTypes = ['SELECT ONE', 'Temporary', 'Permanent', 'Emergency'];
    const changeTopics = ['SELECT ONE', 'Technical', 'Design', 'Physical', 'Environmental', 'Procedural', 'Operational', 'Maintenance', 'Organizational']

    const [infoContent, setInfoContent] = useState('');
    const [infoHeader, setInfoHeader] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [mapModalIsOpen, setMapModalIsOpen] = useState(false);
    const [mapSource, setMapSource] = useState<string>();


    useEffect(() => {
        let theMocNumber: string = '';
        let theCreator: string = '';
        let theOwner: string = '';
        let theApprover: string = '';
        let groupsForThisCN = "";
        if (props?.isNewCN) {
            theMocNumber = generateRandomString(10);
            theCreator = authContext.user?.userName ? authContext.user?.userName : '';
            theOwner = theCreator;
            theApprover = 'UNSET';
            setDateOfCreation(new Date().toISOString().split('T')[0]);
            setDateOfPublication(new Date().toISOString().split('T')[0]);
            setTimeOfImplementation(new Date().toISOString().split('T')[0]);
            setRequiredDateOfCompletion(new Date().toISOString().split('T')[0]);
            setShortReasonForChange('');
            setGroups([]);
            setCNState('CREATED');
            setSelectedChangeCategory(changeCategories[0]);
            setSelectedChangeTopic(changeTopics[0]);
            setSelectedChangeType(changeTypes[0]);
            setDescriptionOfChange('');
            setImpacts('');
            setNotes('');
            setLocation('');
            setAttachments('');
        }
        else {
            theMocNumber = cn?.mocNumber ? cn?.mocNumber : '';
            theCreator = cn?.creator ? (authContext.user?.userName || '') : '';
            theOwner = getLastInArray(cn, 'owner');
            theApprover = getLastInArray(cn, 'owner');

            setShortReasonForChange(getLastInArray(cn, 'shortReasonForChange'));
            setCNState(getLastInArray(cn, 'cnState'));
            setChangeTopic(getLastInArray(cn, 'changeTopic'));
            setSelectedChangeTopic(getLastInArray(cn, 'changeTopic'));
            setDateOfCreation(getLastInArray(cn, 'dateOfCreation'));
            setChangeType(getLastInArray(cn, 'changeType'));
            setSelectedChangeType(getLastInArray(cn, 'changeType'));
            setCategory(getLastInArray(cn, 'category'));
            setSelectedChangeCategory(getLastInArray(cn, 'category'));
            // Here we get the pipe delimited groups (e.g. "North"|"South") for this CN
            // Later, when we get all of the groups for the organziation, we pass this in 
            // and it gets used to create the selection state (true or false) for the groups.
            groupsForThisCN = getLastInArray(cn, 'groups')

        }
        setMocNumber(theMocNumber);
        setCreator(theCreator);
        setOwner(theOwner)
        setApprover(theApprover);
        getGroupsForOrganization(groupsForThisCN)


    }, [cn?.mocNumber, props?.isNewCN]);

    interface ChangeNotification {
        [key: string]: any;
    }

    const getCNFieldValue = (fieldName: string) => {
        return cn && cn[fieldName] ? cn[fieldName] : '';
    }
    const getLastInArray = (cn: ChangeNotification | null, cnPropName: string): string => {
        if (!cn) return '';
        const array = cn[cnPropName];
        if (Array.isArray(array) && array.length > 0) {
            return array[array.length - 1].value;
        }
        return ''
    };

    const handleInfoClick = (id: string) => {
        setInfoContent("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut nisl a ligula eleifend finibus non quis justo. Duis eu interdum nulla. Nullam mollis leo vestibulum, rhoncus nulla in, interdum magna. Morbi in metus sit amet ligula tempus pharetra. Sed ac urna quis sapien maximus fermentum. Nunc velit dui, finibus in ultrices in, blandit eget massa. Praesent in mi faucibus, posuere nisl ut, pulvinar urna. In hac habitasse platea dictumst. Nam aliquet convallis augue id dignissim. Maecenas ac congue mauris.");
        setInfoHeader(id);
        setMapSource('');
        console.log("setting modelisOpen to true")
        setModalIsOpen(true);
    };

    const showMap = () => {
        setInfoContent("");
        setInfoHeader("MAP");
        setMapSource(mapImage);
        setModalIsOpen(true);

    };

    const setRandomTime = () => {
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        const randomTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        setTimeOfImplementation(randomTime);
    };
    const getRandomDate = () => {
        const start = new Date(2022, 0, 1); // Start date (January 1, 2022)
        const end = new Date(); // End date (today)
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate;
    };
    const generateRandomGeoJSON = () => {
        const generateRandomCoordinate = () => {
            return [
                (Math.random() * 360 - 180).toFixed(6), // Longitude
                (Math.random() * 180 - 90).toFixed(6) // Latitude
            ].map(Number);
        };

        const geojson = {
            type: 'Polygon',
            coordinates: [
                [
                    generateRandomCoordinate(),
                    generateRandomCoordinate(),
                    generateRandomCoordinate(),
                    generateRandomCoordinate(),
                    generateRandomCoordinate() // Repeat the first coordinate to close the polygon
                ]
            ]
        };

        return JSON.stringify(geojson);
    };

    const onChangeShortReasonForChange = (e: ChangeEvent<HTMLInputElement>) => {
        let srfc = e.target.value;

        if (srfc === "    ") {
            srfc = generateRandomString(10) + " Sample short reason for change. ";
            setDescriptionOfChange(generateRandomString(10) + " Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change.Sample LONG description of change. ");
            setSelectedChangeTopic(changeTopics[Math.floor(Math.random() * (changeTopics.length - 1)) + 1]);
            setSelectedChangeCategory(changeCategories[Math.floor(Math.random() * (changeCategories.length - 1)) + 1]);
            setImpacts(generateRandomString(10) + " Sample impacts. ");
            setNotes(generateRandomString(10) + " Sample notes. ");
            setSelectedChangeType(changeTypes[Math.floor(Math.random() * (changeTypes.length - 1)) + 1]);
            //setRandomTime();
            setTimeOfImplementation(getRandomDate().toISOString().split('T')[0]);
            setDateOfCreation(new Date().toISOString().split('T')[0]);
            setDateOfPublication(getRandomDate().toISOString().split('T')[0]);
            setRequiredDateOfCompletion(getRandomDate().toISOString().split('T')[0]);
            setLocation(generateRandomGeoJSON());
        }
        setShortReasonForChange(srfc);

    }

    // When groups are checked on and off we need to update the groups array which contains the selected groups for this CN
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>, groupName: string) => {
        setGroupSelectionState({ ...groupSelectionState, [groupName]: e.target.checked });
    }

    const getApprovers = async () => {
        const organization = authContext.user?.organization;
        const db = getFirestore();
        const usersCollection = collection(db, 'Users');
        const qApprovers = query(usersCollection, where("organization", "==", authContext.user?.organization), where("isApprover", "==", true));
        const approverSnapshot = getDocs(qApprovers).then(async (querySnapshot) => {
            const approvers: string[] = ["UNSET"];
            querySnapshot.forEach((doc) => {
                const user = doc.data() as User;
                approvers.push(user.email);
            });
            setApprovers(approvers);
        });
    };

    const getGroupsForOrganization = async (groupsForThisCN = '') => {
        const existingSelectedGroups = groupsForThisCN.split(('|'))
        const organization = authContext.user?.organization;
        const db = getFirestore();
        const usersCollection = collection(db, 'Groups');
        const qGroupsForOrg = query(usersCollection, where("organization", "==", authContext.user?.organization));
        const groupsSnapshot = getDocs(qGroupsForOrg).then(async (querySnapshot) => {
            const groups: string[] = [];
            let obj: Record<string, boolean> = {};
            querySnapshot.forEach((doc) => {
                const group = doc.data() as Group;
                groups.push(group.name);
                if (existingSelectedGroups.includes(group.name)) {
                    obj[group.name] = true;
                }
                else {
                    obj[group.name] = false;
                }
            });
            setGroupsForOrganization(groups);
            setGroupSelectionState(obj);
        });
    };


    const formatCnField = (newValue: string): { timeStamp: number, value: string }[] => {
        return [{
            timeStamp: Date.now(),
            value: newValue,
        }];
    };

    const getPipeDelimitedGroups = () => {
        const selectedGroups = Object.entries(groupSelectionState)
            .filter(([key, value]) => value)
            .map(([key, value]) => key);
        return selectedGroups.join('|');
    }

    const handleCreateCN = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const cn: ChangeNotification = {
                mocNumber,
                creator,
                owner: formatCnField(owner),
                approver: formatCnField(approver),
                shortReasonForChange: formatCnField(shortReasonForChange),
                groups: formatCnField(getPipeDelimitedGroups()),
                cnState: formatCnField(cnState),
                changeTopic: formatCnField(selectedChangeTopic),
                dateOfCreation: formatCnField(dateOfCreation),
                dateOfPublication: formatCnField(dateOfPublication),
                timeOfImplementation: formatCnField(timeOfImplementation),
                requiredDateOfCompletion: formatCnField(requiredDateOfCompletion),
                category: formatCnField(selectedChangeCategory),
                changeType: formatCnField(selectedChangeType),
                descriptionOfChange: formatCnField(descriptionOfChange),
                impacts: formatCnField(impacts),
                location: formatCnField(location),
                notes: formatCnField(notes),
                attachments: formatCnField(attachments),
                organization: authContext?.user?.organization,
                onCreatedNotes: [],
                onUnderReviewNotes: [],
                onActivatedNotes: [],
                onCompletedNotes: [],
                onArchivedNotes: [],
                onRejectedNotes: [],
                onUpdatesRequiredNotes: [],
                onCancelledNotes: [],
                acknowledgements: [],
                objections: [],
                latestOwner: owner,
                latestApprover: approver,
                latestState: cnState,
                latestGroups: groups,
                latestDescriptionOfChange: descriptionOfChange,
                latestShortReasonForChange: shortReasonForChange,
            };

            const db = getFirestore();
            const docRef = await addDoc(collection(db, 'changeNotifications'), cn);
            console.log('New Change Notification added with ID: ', docRef.id);
            toast.success("Change Notification successfully created! Remember to submit this CN for review.");
            OnCreateCN(cn, authContext.user);
            props?.onShowDetailsFormDismissed();
            props?.setRequestedMocID(mocNumber);
        } catch (error) {
            console.error('Error creating Change Notification:', error);
            toast.error('Error creating Change Notification: ' + error);
        }
    }

    const handleApproverChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setApprover(event.target.value);
    };

    return (
        <div>
            <ModalComponent
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Example Modal"
                infoContent={infoContent}
                imgSrc={mapSource}
                infoHeader={infoHeader}
            />

            <form >
                {/* MocNumber */}
                <div className="mb-3" style={{ display: props?.isNewCN && hideFieldsForNew ? 'none' : 'unset' }}>
                    <label htmlFor="mocNumber" className="form-label">MoC Number (ID)</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Moc Number')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        id="mocNumber"
                        value={mocNumber}
                        disabled
                    />
                </div>
                {/* Created By */}
                <div className="mb-3" style={{ display: props?.isNewCN && hideFieldsForNew ? 'none' : 'unset' }}>
                    <label htmlFor="createdBy" className="form-label">Created By</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Created By')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        id="createdBy"
                        value={creator}
                        disabled
                    />
                </div>
                {/* Owner */}
                <div className="mb-3" style={{ display: props?.isNewCN && hideFieldsForNew ? 'none' : 'unset' }}>
                    <label htmlFor="owner" className="form-label">Owner</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Owner')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        value={owner}
                        disabled
                    />
                </div>
                {/* Approver */}
                <div className="mb-3">
                    <label htmlFor="approver" className="form-label">Select the Approver for this change</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Approver')}>info</i>
                    <select className='form-control' onChange={handleApproverChange} value={approver} disabled={props?.isNewCN == false}>
                        {approvers.map((approver, index) => {
                            return (
                                <option key={index} value={approver}>
                                    {approver}
                                </option>
                            );
                        })}
                    </select>
                </div>
                {/* Short Reason For Change */}
                <div className="mb-3">
                    <label htmlFor="shortReasonForChange" className="form-label">Short Reason For Change</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Short Description')}>info</i>
                    <input
                        type="text"
                        disabled={props?.isNewCN == false}
                        className="form-control"
                        value={shortReasonForChange}
                        onChange={onChangeShortReasonForChange}
                        id="shortReasonForChange" />
                </div>
                {/* Groups */}
                <div className="mb-3">
                    <label htmlFor="groups" className="form-label">Assgined Groups</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Groups')}>info</i>
                    <div id="groups">
                        {groupsForOrganization.map((groupName, index) => {
                            return (
                                <div className="form-check" key={index}>
                                    <input
                                        checked={groupSelectionState[groupName]}
                                        className="form-check-input"
                                        id={groupName}
                                        type="checkbox"
                                        disabled={props?.isNewCN == false}
                                        onChange={(e) => handleCheckboxChange(e, groupName)}
                                    />
                                    <label style={{ marginLeft: '4px' }} className="form-check-label" htmlFor={groupName}>
                                        {groupName}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* State of Change Notification */}
                <div className="mb-3" style={{ display: props?.isNewCN && hideFieldsForNew ? 'none' : 'unset' }}>
                    <label htmlFor="state" className="form-label">State of Change Notification</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('State')}>info</i>
                    <input
                        type="text"
                        disabled
                        className="form-control"
                        value={cnState}
                        onChange={(e) => setCNState(e.target.value)}
                    />
                </div>
                {/* <div className="mb-3">
                    <label htmlFor="topic" className="form-label">Change Topic</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Change Topic')}>info</i>
                    <input
                        type="text"
                        disabled = {props?.isNewCN == false}
                        className="form-control"
                        value={changeTopic}
                        onChange={(e) => setChangeTopic(e.target.value)}
                    />
                </div> */}

                {/* ChangeTopic */}
                <div className="mb-3">
                    <label htmlFor="topic" className="form-label">Change Topic</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Change Topic')}>info</i>
                    <select className='form-control'
                        value={selectedChangeTopic ? selectedChangeTopic : changeTopic}
                        disabled={props?.isNewCN == false}
                        onChange={(e) => setSelectedChangeTopic(e.target.value)}>
                        {changeTopics.map((ct, index) => (
                            <option key={index} value={ct}>{ct}</option>
                        ))}
                    </select>
                </div>
                {/* Date of Creation */}
                <div className="mb-3">
                    <label htmlFor="dateOfCreation" className="form-label">Date of Creation</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Date of Creation')}>info</i>
                    <input
                        type="date"
                        disabled={props?.isNewCN == false}
                        className="form-control"
                        value={dateOfCreation}
                        onChange={(e) => setDateOfCreation(e.target.value)}
                    />
                </div>
                {/* Date of Publication */}
                <div className="mb-3">
                    <label htmlFor="dateOfPublication" className="form-label">Date of Publication</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Date of Publication')}>info</i>
                    <input
                        type="date"
                        disabled={props?.isNewCN == false}
                        className="form-control"
                        id="dateOfPublication"
                        value={dateOfPublication}
                        onChange={(e) => setDateOfPublication(e.target.value)}
                    />
                </div>
                {/* Time of Implementation */}
                <div className="mb-3">
                    <label htmlFor="timeOfImplementation" className="form-label">Time of Implementation</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Time of Implementation')}>info</i>
                    <input
                        type="date"
                        disabled={props?.isNewCN == false}
                        className="form-control"
                        id="timeOfImplementation"
                        value={timeOfImplementation} // Convert the value to a string
                        onChange={(e) => setTimeOfImplementation(e.target.value)}
                    />
                </div>
                {/* Required Date of Completion */}
                <div className="mb-3">
                    <label htmlFor="requiredDateOfCompletion" className="form-label">Required Date Of Completion</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Required Date of Completion')}>info</i>
                    <input
                        type="date"
                        disabled={props?.isNewCN == false}
                        className="form-control"
                        value={requiredDateOfCompletion}
                        onChange={(e) => setRequiredDateOfCompletion(e.target.value)}
                    />
                </div>
                {/* Category */}
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Category')}>info</i>
                    <select className='form-control'
                        value={selectedChangeCategory}
                        disabled={props?.isNewCN == false}
                        onChange={(e) => setSelectedChangeCategory(e.target.value)}>
                        {changeCategories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                {/* Change Type */}
                <div className="mb-3">
                    <label htmlFor="changeType" className="form-label">Change Type</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Change Type')}>info</i>
                    <select className='form-control'
                        value={selectedChangeType}
                        disabled={props?.isNewCN == false}
                        onChange={(e) => setSelectedChangeType(e.target.value)}>
                        {changeTypes.map((ct, index) => (
                            <option key={index} value={ct}>{ct}</option>
                        ))}
                    </select>
                </div>
                {/* Description of Change */}
                <div className="mb-3">
                    <label htmlFor="descriptionOfChange" className="form-label">Description Of Change</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Long Description')}>info</i>
                    <textarea
                        className="form-control"
                        disabled={props?.isNewCN == false}
                        value={descriptionOfChange}
                        onChange={(e) => setDescriptionOfChange(e.target.value)}
                    />
                </div>
                {/* Impacts */}
                <div className="mb-3">
                    <label htmlFor="impacts" className="form-label">Impacts</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Impacts')}>info</i>
                    <input
                        type="text"
                        disabled={props?.isNewCN == false}
                        className="form-control"
                        value={impacts}
                        onChange={(e) => setImpacts(e.target.value)}
                    />
                </div>
                {/* Location */}
                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Location</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Location')}>info</i>
                    <input
                        type="text"
                        disabled={props?.isNewCN == false}
                        className="form-control"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onClick={() => showMap()}
                    />
                </div>
                {/* Notes */}
                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Notes')}>info</i>
                    <input
                        type="text"
                        disabled={props?.isNewCN == false}
                        className="form-control"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                {/* Attachments */}
                <div className="mb-3">
                    <label htmlFor="attachments" className="form-label">Attachments</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Attachments')}>info</i>
                    <input
                        type="file"
                        disabled={props?.isNewCN == false}
                        className="form-control"
                        id="attachments"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            setAttachments('');
                        }}
                    />
                </div>
            </form>
            {props?.isNewCN &&
                <>
                    <button className="btn btn-primary" onClick={handleCreateCN} >Create Change Notification</button>
                    <button className="btn btn-primary" onClick={() => props?.onShowDetailsFormDismissed()} >Cancel</button>
                </>
            }
        </div>

    );
};

export default ChangeNotificationDetailForm;
