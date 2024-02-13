import React, { useState, ChangeEvent, FormEvent, ReactNode, useEffect, useRef } from 'react';
import { useContext } from 'react';
import styles from './CreateChangeNotification.module.css';
import { getFirestore, query, where } from "firebase/firestore";
import { useAuth } from './AuthContext';
import { collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { Group, User } from './Interfaces'
import { generateRandomString } from './common';
import { toast } from 'react-toastify';

const CreateChangeNotification: React.FC = () => {

    const [groupsForOrganization, setGroupsForOrganization] = useState<Group[]>([]); // Update the type of initial state
    const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
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

    const onCreateRandomCN = async () => {
        setMocNumber(generateRandomString(8));
        //const randomDate = getRandomDate();
        setDateOfPublication(getRandomDate()); // Convert randomDate to string
        setDateOfCreation(getRandomDate()); // Convert randomDate to string
        setTimeOfImplementation(getRandomTime());
        // debugger
        setSelectedChangeCategory(changeCategories[Math.floor(Math.random() * changeCategories.length)]);
        setChangeType(getRandomText(16));
        setChangeTopic(getRandomText(48));
        setShortReasonForChange(getRandomText(100));
        setDescriptionOfChange(getRandomText(300));
        setImpacts(getRandomText(50));
        setRequiredDateOfCompletion(getRandomDate());
        setNotes(getRandomText(200));
        setAttachments([]);

        const numGroupsToSelect = Math.floor(Math.random() * (groupsForOrganization.length + 1));
        const xselectedGroups : Group[] = [];

        for (let i = 0; i < numGroupsToSelect; i++) {
            let randomIndex = Math.floor(Math.random() * groupsForOrganization.length);
            let randomGroup = groupsForOrganization[randomIndex];

            // Ensure the group isn't already selected
            if (!xselectedGroups.some(group => group.id === randomGroup.id)) {
                xselectedGroups.push(randomGroup);
            } else {
                // Decrement the counter to try again
                i--;
            }
        }

        setSelectedGroups(xselectedGroups);
    }
    function getRandomTime() {
        const hours = ("0" + Math.floor(Math.random() * 24)).slice(-2);
        const minutes = ("0" + Math.floor(Math.random() * 60)).slice(-2);
        return `${hours}:${minutes}`;
    }
    function getRandomDate() {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + Math.floor(Math.random() * 365));

        const year = futureDate.getFullYear();
        const month = ("0" + (futureDate.getMonth() + 1)).slice(-2); // Months are 0-indexed in JavaScript
        const day = ("0" + futureDate.getDate()).slice(-2);

        return `${year}-${month}-${day}`;
    }
    const onCreateChangeNotification = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const cn = {
                mocNumber,
                dateOfCreation,
                dateOfPublication,
                timeOfImplementation,
                category: selectedChangeCategory,
                type: changeType,
                topic: changeTopic,
                groups: selectedGroups,
                shortReasonForChange,
                descriptionOfChange,
                impacts,
                requiredDateOfCompletion,
                notes,
                attachments
            };
            const db = getFirestore();
            const docRef = await addDoc(collection(db, 'ChangeNotifications'), cn);
            console.log('New Change Notification added with ID: ', docRef.id);
            toast.success('Change Notification successfully added!');
        } catch (error) {
            console.error('Error creating Change Notification:', error);
            toast.error('Error creating Change Notification: ' + error);
        }
    }
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, group: Group) => {
        if (e.target.checked) {
            setSelectedGroups(prevGroups => [...prevGroups, group]);
        } else {
            setSelectedGroups(prevGroups => prevGroups.filter(g => g.id !== group.id));
        }
    };

    const getRandomText = (length: number) => {
        const longString = "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar. The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen. She packed her seven versalia, put her initial into the belt and made herself on the way. When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane. Pityful a rethoric question ran over her cheek, then"

        let start = Math.floor(Math.random() * (longString.length - length - 1));

        // Find the next space after the random start index
        while (longString[start] !== ' ' && start < longString.length) {
            start++;
        }

        // Start from the character after the space
        start++;

        return longString.substring(start, start + length);
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
                        value={dateOfPublication}
                        onChange={(e) => setDateOfPublication(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="timeOfImplementation" className="form-label">Time of Implementation</label>
                    <input
                        type="time"
                        className="form-control"
                        id="timeOfImplementation"
                        value={timeOfImplementation}
                        onChange={(e) => setTimeOfImplementation(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select className='form-control'
                        value={selectedChangeCategory}
                        onChange={(e) => setSelectedChangeCategory(e.target.value)}>
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
                        value={changeType}
                        id="changeType"
                        onChange={(e) => setChangeType(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="topic" className="form-label">Topic</label>
                    <input
                        type="text"
                        className="form-control"
                        value={changeTopic}
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
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value={group.name}
                                        id={group.id}
                                        onChange={(e) => handleCheckboxChange(e, group)}
                                        checked={selectedGroups.some(selectedGroup => selectedGroup.id === group.id)}
                                    />
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
                        value={shortReasonForChange}
                        onChange={(e) => setShortReasonForChange(e.target.value)}
                        id="shortReasonForChange" />
                </div>
                <div className="mb-3">
                    <label htmlFor="descriptionOfChange" className="form-label">Description Of Change</label>
                    <textarea
                        className="form-control"
                        value={descriptionOfChange}
                        id="descriptionOfChange"
                        onChange={(e) => setDescriptionOfChange(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="impacts" className="form-label">Impacts</label>
                    <input
                        type="text"
                        className="form-control"
                        value={impacts}
                        id="impacts"
                        onChange={(e) => setImpacts(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="requiredDateOfCompletion" className="form-label">Required Date Of Completion</label>
                    <input
                        type="date"
                        className="form-control"
                        value={requiredDateOfCompletion}
                        id="requiredDateOfCompletion"
                        onChange={(e) => setRequiredDateOfCompletion(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <input
                        type="text"
                        className="form-control"
                        value={notes}
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
                <br />
                <button type="button" onClick={onCreateRandomCN} className="btn btn-primary">!DEBUG! Create RANDOM Change Notice</button>
            </form>
        </div>
    );
};

export default CreateChangeNotification;
