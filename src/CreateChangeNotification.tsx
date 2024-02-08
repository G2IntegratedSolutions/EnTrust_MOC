import React, { useState, ChangeEvent, FormEvent, ReactNode, useEffect, useRef } from 'react';
import { useContext } from 'react';
import styles from './CreateChangeNotification.module.css';
import { getFirestore, query, where } from "firebase/firestore";
import { useAuth } from './AuthContext';
import { collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import {Group, User} from './Interfaces'
import { generateRandomString } from './common';

const CreateChangeNotification: React.FC = () => {

    const [groupsForOrganization, setGroupsForOrganization] = useState<Group[]>([]); // Update the type of initial state
    const authContext = useAuth();
    useEffect(() => {
        let org = authContext.user?.organization;
        const db = getFirestore();
        const groupsCollection = collection(db, 'Groups');
        const qGroups = query(groupsCollection, where("organization", "==", authContext.user?.organization));
        const groupsSnapshot =  getDocs(qGroups).then((querySnapshot) => {
            const groups = querySnapshot.docs.map(doc => doc.data());
            setGroupsForOrganization(groups as Group[]); // Update the type of the state
        });
    },[]);

    return (
        <div>
            <h2>Create Change Notice</h2>
            <p>On this page, you can create a Change Notification and assign it to one or more groups in your organization.
            </p>
            {/* mocNumber, dateOfCreate, dateOfPublication, timeOfImplemenation, category, type, topic, groups, shortReasonForChange, 
            descriptionOfChange, impacts, requiredDateOfCompletion, notes, attachments */}
            <form>
                <div className="mb-3">
                    <label htmlFor="mocNumber" className="form-label">MOC Number</label>
                    <input
                        type="text"
                        className="form-control"
                        id="mocNumber"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="dateOfCreate" className="form-label">Date of Create</label>
                    <input
                        type="date"
                        className="form-control"
                        id="dateOfCreate"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="dateOfPublication" className="form-label">Date of Publication</label>
                    <input
                        type="date"
                        className="form-control"
                        id="dateOfPublication"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="timeOfImplemenation" className="form-label">Time of Implemenation</label>
                    <input
                        type="time"
                        className="form-control"
                        id="timeOfImplemenation"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <input
                        type="text"
                        className="form-control"
                        id="category"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Type</label>
                    <input
                        type="text"
                        className="form-control"
                        id="type"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="topic" className="form-label">Topic</label>
                    <input
                        type="text"
                        className="form-control"
                        id="topic"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="groups" className="form-label">Groups</label>
                    <div id="groups">
                        {groupsForOrganization.map((group) => {
                            return (
                                <div className="form-check" key={group.id}>
                                    <input className="form-check-input" type="checkbox" value={group.name} id={group.id} />
                                    <label className="form-check-label" htmlFor={group.id}>
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
                        id="shortReasonForChange" />
                </div>
                <div className="mb-3">
                    <label htmlFor="descriptionOfChange" className="form-label">Description Of Change</label>
                    <input
                        type="text"
                        className="form-control"
                        id="descriptionOfChange"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="impacts" className="form-label">Impacts</label>
                    <input
                        type="text"
                        className="form-control"
                        id="impacts"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="requiredDateOfCompletion" className="form-label">Required Date Of Completion</label>
                    <input
                        type="date"
                        className="form-control"
                        id="requiredDateOfCompletion"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <input
                        type="text"
                        className="form-control"
                        id="notes"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="attachments" className="form-label">Attachments</label>
                    <input
                        type="file"
                        className="form-control"
                        id="attachments"
                    />
                </div>
            </form>
        </div>
    );
};

export default CreateChangeNotification;
