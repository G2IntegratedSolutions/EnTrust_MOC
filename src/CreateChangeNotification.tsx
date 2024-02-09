import React, { useState, ChangeEvent, FormEvent, ReactNode, useEffect, useRef } from 'react';
import { useContext } from 'react';
import styles from './CreateChangeNotification.module.css';
import { getFirestore, query, where } from "firebase/firestore";
import { useAuth } from './AuthContext';
import { collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { Group, User } from './Interfaces'
import { generateRandomString } from './common';

const CreateChangeNotification: React.FC = () => {

    const [groupsForOrganization, setGroupsForOrganization] = useState<Group[]>([]); // Update the type of initial state
    const [selectedChangeCategory, setSelectedChangeCategory] = useState('');
    const timeStamp = Date.now();
    const date = new Date(timeStamp);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0-indexed in JavaScript
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    const [dateOfCreation, setDateOfCreation] = useState(formattedDate);
    const [dateOfPublication, setDateOfPublication] = useState(formattedDate);
    const [timeOfImplementation, setTimeOfImplementation] = useState('12:00');
    const [changeType, setChangeType] = useState('');
    const [changeTopic, setChangeTopic] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const [shortReasonForChange, setShortReasonForChange] = useState('');
    const [descriptionOfChange, setDescriptionOfChange] = useState('');
    const [impacts, setImpacts] = useState('');
    const [requiredDateOfCompletion, setRequiredDateOfCompletion] = useState('');
    const [notes, setNotes] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);

    const authContext = useAuth();
    const [mocNumber, setMocNumber] = useState(generateRandomString(8));
    const changeCategories = ['Safety', 'Quality', 'Production', 'Facilities', 'IT', 'HR', 'Finance', 'Other'];
    
    useEffect(() => {
        let org = authContext.user?.organization;
        const db = getFirestore();
        const groupsCollection = collection(db, 'Groups');
        const qGroups = query(groupsCollection, where("organization", "==", authContext.user?.organization));
        const groupsSnapshot = getDocs(qGroups).then((querySnapshot) => {
            const groups = querySnapshot.docs.map(doc => doc.data());
            setGroupsForOrganization(groups as Group[]); // Update the type of the state
        });
    }, []);

    const onCreateChangeNotification = async (e: FormEvent) => {
        debugger;
    }

    return (
        <div>
            <h2>Create Change Notice</h2>
            <p>On this page, you can create a Change Notification and assign it to one or more groups in your organization.
            </p>
            {/* mocNumber, dateOfCreate, dateOfPublication, timeOfImplemenation, category, type, topic, groups, shortReasonForChange, 
            descriptionOfChange, impacts, requiredDateOfCompletion, notes, attachments */}
            <form >
                <div className="mb-3">
                    <label htmlFor="mocNumber" className="form-label">MOC Number</label>
                    <input
                        type="text"
                        className="form-control"
                        id="mocNumber"
                        value={mocNumber}
                        disabled
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="dateOfCreation" className="form-label">Date of Creation</label>
                    <input
                        type="date"
                        className="form-control"
                        id="dateOfCreation"
                        value={dateOfCreation}
                        onChange={(e) => setDateOfCreation(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="dateOfPublication" className="form-label">Date of Publication</label>
                    <input
                        type="date"
                        className="form-control"
                        id="dateOfPublication"
                        onChange={(e) => setDateOfPublication(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="timeOfImplementation" className="form-label">Time of Implementation</label>
                    <input
                        type="time"
                        className="form-control"
                        id="timeOfImplementation"
                        onChange={(e) => setTimeOfImplementation(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select className='form-control' onChange={(e) => setSelectedChangeCategory(e.target.value)}>
                        {changeCategories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Type</label>
                    <input
                        type="text"
                        className="form-control"
                        id="type"
                        onChange={(e) => setChangeType(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="topic" className="form-label">Topic</label>
                    <input
                        type="text"
                        className="form-control"
                        id="topic"
                        onChange={(e) => setChangeTopic(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="groups" className="form-label">Groups</label>
                    <div id="groups">
                        {groupsForOrganization.map((group) => {
                            return (
                                <div className="form-check" key={group.id}>
                                    <input className="form-check-input" type="checkbox" value={group.name} id={group.id} />
                                    <label style={{ marginLeft: '4px' }} className="form-check-label" htmlFor={group.id}>
                                        {group.name}
                                    </label>
                                </div>
                            );
                        })}

                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="shortReasonForChange" className="form-label">Short Reason For Change</label>
                    <input
                        type="text"
                        className="form-control"
                        onChange={(e) => setShortReasonForChange(e.target.value)}
                        id="shortReasonForChange" />  
                </div>
                <div className="mb-3">
                    <label htmlFor="descriptionOfChange" className="form-label">Description Of Change</label>
                    <textarea
                        className="form-control"
                        id="descriptionOfChange"
                        onChange={(e) => setDescriptionOfChange(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="impacts" className="form-label">Impacts</label>
                    <input
                        type="text"
                        className="form-control"
                        id="impacts"
                        onChange={(e) => setImpacts(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="requiredDateOfCompletion" className="form-label">Required Date Of Completion</label>
                    <input
                        type="date"
                        className="form-control"
                        id="requiredDateOfCompletion"
                        onChange={(e) => setRequiredDateOfCompletion(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <input
                        type="text"
                        className="form-control"
                        id="notes"
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="attachments" className="form-label">Attachments</label>
                    <input
                        type="file"
                        className="form-control"
                        id="attachments"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            setAttachments(file ? [file] : []);
                        }}
                    />
                </div>
                <button type="button" onClick={onCreateChangeNotification} className="btn btn-primary">Create Change Notice</button>
            </form>
        </div>
    );
};

export default CreateChangeNotification;
