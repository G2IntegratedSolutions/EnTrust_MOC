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

interface ChangeNotificationDetailFormProps {
    changeNotice: ChangeNotification | null;
    isNewCN: boolean;
    setShowDetailForm: (showDetailForm: boolean) => void;
}

const ChangeNotificationDetailForm: React.FC<ChangeNotificationDetailFormProps | null> = (props) => {
    // ebugger
    const [cn, setCN] = useState<ChangeNotification | null>(props?.changeNotice ?? null);

    useEffect(() => {
        // ebugger
        setCN(props?.changeNotice ?? null);
    }, [props?.changeNotice?.creator]);

    const hideFieldsForNew = false;
    const timeStamp = Date.now();
    const date = new Date(timeStamp);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-indexed in JavaScript
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    const [approvers, setApprovers] = useState<string[]>([]);
    const [selectedChangeCategory, setSelectedChangeCategory] = useState('');

    // Change Notification Form State
    const [mocNumber, setMocNumber] = useState('');
    const [creator, setCreator] = useState('');
    const [owner, setOwner] = useState('');
    const [approver, setApprover] = useState('');
    const [shortReasonForChange, setShortReasonForChange] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const [cnState, setCNState] = useState('CREATE'); // [ 'Approved', 'Rejected', 'Under Review', 'Activated', 'Completed', 'Archived'
    const [changeTopic, setChangeTopic] = useState('');
    const [dateOfCreation, setDateOfCreation] = useState(formattedDate);
    const [dateOfPublication, setDateOfPublication] = useState(formattedDate);
    const [timeOfImplementation, setTimeOfImplementation] = useState('12:00');
    const [requiredDateOfCompletion, setRequiredDateOfCompletion] = useState(formattedDate);
    const [category, setCategory] = useState('');
    const [changeType, setChangeType] = useState('');
    const [descriptionOfChange, setDescriptionOfChange] = useState('');
    const [impacts, setImpacts] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [attachments, setAttachments] = useState('');


    const authContext = useAuth();
    const changeCategories = ['Safety', 'Quality', 'Production', 'Facilities', 'IT', 'HR', 'Finance', 'Other'];
    const [groupsForOrganization, setGroupsForOrganization] = useState<string[]>([]); // Update the type of initial state
    //const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
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
        if (props?.isNewCN) {
            theMocNumber = generateRandomString(10);
            theCreator = authContext.user?.userName ? authContext.user?.userName : '';
            theOwner = theCreator;
            theApprover = 'UNSET';
        }
        else {
            theMocNumber = cn?.mocNumber ? cn?.mocNumber : '';
            theCreator = cn?.creator ? (authContext.user?.userName || '') : '';
            theOwner = getLastInArray(cn, 'owner')
            theApprover = getLastInArray(cn, 'approver');
        }
        setMocNumber(theMocNumber);
        setCreator(theCreator);
        setOwner(theOwner)
        setApprover(theApprover);

        // debugger;
        // getApprovers();
        getGroupsForOrganization()
    }, []);

    interface ChangeNotification {
        [key: string]: any;
    }

    const getLastInArray = (cn: ChangeNotification|null, cnPropName: string): string => {
        if(!cn) return '';
        const array = cn[cnPropName];
        if (Array.isArray(array) && array.length > 0) {
            return array[array.length - 1];
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
            setChangeTopic(generateRandomString(10) + " Sample change topic. ");
            setImpacts(generateRandomString(10) + " Sample impacts. ");
            setNotes(generateRandomString(10) + " Sample notes. ");
            setChangeType(generateRandomString(10) + " Sample change type. ");
            setRandomTime();
            setDateOfCreation(getRandomDate().toISOString().split('T')[0]);
            setDateOfPublication(getRandomDate().toISOString().split('T')[0]);
            setRequiredDateOfCompletion(getRandomDate().toISOString().split('T')[0]);
            setLocation(generateRandomGeoJSON());
        }
        setShortReasonForChange(srfc);

    }

    // When groups are checked on and off we need to update the groups array which contains the selected groups for this CN
    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>, groupName: string) => {
        let currentGroups = groups;
        if(e.target.checked) {
            if(!currentGroups.includes(groupName)) {
                currentGroups.push(groupName);
            }
        }
        else{
            currentGroups = currentGroups.filter(group => group !== groupName);
        }
        setGroups(currentGroups);
        console.log('Groups:', groups);
        // ebugger;

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
            //setApprovers(approvers);
        });
    };

    const getGroupsForOrganization = async () => {
        const organization = authContext.user?.organization;
        const db = getFirestore();
        const usersCollection = collection(db, 'Groups');
        const qGroupsForOrg = query(usersCollection, where("organization", "==", authContext.user?.organization));
        const groupsSnapshot = getDocs(qGroupsForOrg).then(async (querySnapshot) => {
            const groups: string[] = [];
            querySnapshot.forEach((doc) => {
                const group = doc.data() as Group;
                groups.push(group.name);
            });
            setGroupsForOrganization(groups);
        });
    };

    const formatCnField = (newValue: string): { timeStamp: number, value: string }[] => {
        return [{
            timeStamp: Date.now(),
            value: newValue,
        }];
    };

    const handleCreateCN = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const cn = {
                mocNumber:
                creator,
                owner:formatCnField(owner),
                approver:formatCnField(approver),
                shortReasonForChange:formatCnField(shortReasonForChange),
                groups:formatCnField(groups.join('|')),
                cnState:formatCnField(cnState),
                changeTopic:formatCnField(changeTopic),
                dateOfCreation:formatCnField(dateOfCreation),
                dateOfPublication:formatCnField(dateOfPublication),
                timeOfImplementation:formatCnField(timeOfImplementation),
                requiredDateOfCompletion:formatCnField(requiredDateOfCompletion),
                category:formatCnField(category),
                changeType:formatCnField(changeType),
                descriptionOfChange:formatCnField(descriptionOfChange),
                impacts:formatCnField(impacts),
                location:formatCnField(location),
                notes:formatCnField(notes),
                attachments:formatCnField(attachments),
                organization: authContext?.user?.organization,

            };
            // ebugger;
            //return;
            const db = getFirestore();
            const docRef = await addDoc(collection(db, 'changeNotifications'), cn);
            console.log('New Change Notification added with ID: ', docRef.id);
            toast.success('Change Notification successfully added!');
            props?.setShowDetailForm(false);
        } catch (error) {
            console.error('Error creating Change Notification:', error);
            toast.error('Error creating Change Notification: ' + error);
        }
    }

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
                <div className="mb-3" style={{ display: props?.isNewCN  && hideFieldsForNew ? 'none' : 'unset' }}>
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
                <div className="mb-3" style={{ display: props?.isNewCN  && hideFieldsForNew? 'none' : 'unset' }}>
                    <label htmlFor="owner" className="form-label">Owner</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Owner')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        value={owner}
                        disabled
                    />
                </div>
                <div className="mb-3" style={{ display: props?.isNewCN  && hideFieldsForNew? 'none' : 'unset' }}>
                    <label htmlFor="owner" className="form-label">Approver</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Approver')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        value={approver}
                        disabled
                    />
                </div>
                {/* <div className="mb-3" style={{ display: props?.isNewCN  && hideFieldsForNew? 'none' : 'unset' }}>
                    <label htmlFor="approver" className="form-label" >Approver</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Approver')}>info</i>
                    <select className='form-control'>
                        {approvers.map((approver, index) => {
                            return (
                                <option key={index} value={approver}>
                                    {approver}
                                </option>
                            );
                        })}
                    </select>
                </div> */}
                <div className="mb-3">
                    <label htmlFor="shortReasonForChange" className="form-label">Short Reason For Change</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Short Description')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        value={shortReasonForChange}
                        onChange={onChangeShortReasonForChange}
                        id="shortReasonForChange" />
                </div>
                <div className="mb-3">
                    <label htmlFor="groups" className="form-label">Assgined Groups</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Groups')}>info</i>
                    <div id="groups">
                        {groupsForOrganization.map((groupName, index) => {
                            return (
                                <div className="form-check" key={index}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value={groupName}
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
                <div className="mb-3" style={{ display: props?.isNewCN  && hideFieldsForNew? 'none' : 'unset' }}>
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
                <div className="mb-3">
                    <label htmlFor="topic" className="form-label">Change Topic</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Change Topic')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        value={changeTopic}
                        onChange={(e) => setChangeTopic(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="dateOfCreation" className="form-label">Date of Creation</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Date of Creation')}>info</i>
                    <input
                        type="date"
                        className="form-control"
                        value={dateOfCreation}
                        onChange={(e) => setDateOfCreation(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="dateOfPublication" className="form-label">Date of Publication</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Date of Publication')}>info</i>
                    <input
                        type="date"
                        className="form-control"
                        id="dateOfPublication"
                        value={dateOfPublication}
                        onChange={(e) => setDateOfPublication(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="timeOfImplementation" className="form-label">Time of Implementation</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Time of Implementation')}>info</i>
                    <input
                        type="time"
                        className="form-control"
                        id="timeOfImplementation"
                        value={timeOfImplementation} // Convert the value to a string
                        onChange={(e) => setTimeOfImplementation(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="requiredDateOfCompletion" className="form-label">Required Date Of Completion</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Required Date of Completion')}>info</i>
                    <input
                        type="date"
                        className="form-control"
                        value={requiredDateOfCompletion}
                        onChange={(e) => setRequiredDateOfCompletion(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Category')}>info</i>
                    <select className='form-control'
                        value={category}
                        onChange={(e) => setSelectedChangeCategory(e.target.value)}>
                        {changeCategories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Change Type</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Change Type')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        value={changeType}
                        onChange={(e) => setChangeType(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="descriptionOfChange" className="form-label">Description Of Change</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Long Description')}>info</i>
                    <textarea
                        className="form-control"
                        value={descriptionOfChange}
                        onChange={(e) => setDescriptionOfChange(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="impacts" className="form-label">Impacts</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Impacts')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        value={impacts}
                        onChange={(e) => setImpacts(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Location</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Location')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onClick={() => showMap()}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Notes')}>info</i>
                    <input
                        type="text"
                        className="form-control"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="attachments" className="form-label">Attachments</label>
                    <i className={`material-icons ent-mini-icon`} onClick={() => handleInfoClick('Attachments')}>info</i>
                    <input
                        type="file"
                        className="form-control"
                        id="attachments"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            setAttachments('');
                        }}
                    />
                </div>
            </form>
            <button className="btn btn-primary" onClick={handleCreateCN} >Create Change Notification</button>
        </div>

    );
};

export default ChangeNotificationDetailForm;
