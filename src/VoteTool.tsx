import { get } from 'http';
import { ChangeNotification, expression } from './Interfaces' // Replace 'path/to/notification' with the actual path to the 'Notification' type
import styles from './SelectionTool.module.css';
import React, { useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';


interface VoteToolProps {
    onDismiss: () => void;
    onApply: (vote: boolean, comments: string) => void;
}



const VoteTool: React.FC<VoteToolProps | null> = (props) => {

    const isYesRef = useRef<HTMLInputElement | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleApply = () => {
        props?.onApply(isYesRef.current?.checked ?? true, textAreaRef.current?.value ?? "");
        props?.onDismiss();
    }

    return (<div className={styles.selectionTool}>
        <h2>Vote on this Change Notification</h2>
        <p>With this tool, you can vote YES or NO and include a comment to the approver of the Change Notification. </p>
        <p>On this Change Notification, as a registered Reviewer my vote is:</p>
        <div className="form-check">
            <input ref={isYesRef} className="form-check-input" type="radio" name="yesNoOptions" id="optionYes" value="yes" checked />
            <label style={{ marginLeft: "5px" }} className="form-check-label" htmlFor="optionYes">
                YES
            </label>
        </div>
        <div className="form-check">
            <input className="form-check-input" type="radio" name="yesNoOptions" id="optionNo" value="no" />
            <label style={{ marginLeft: "5px" }} className="form-check-label" htmlFor="optionNo">
                NO
            </label>
        </div>

        <hr></hr>
        <div>Comments:</div>
        <textarea ref={textAreaRef} style={{ width: "100%", height: "15vh" }} >

        </textarea>
        <br></br>
        <button className='btn btn-primary' onClick={handleApply}>OK</button>
        <button className='btn btn-primary' onClick={props?.onDismiss}>Dismiss</button>
    </div>)
}
export default VoteTool;
