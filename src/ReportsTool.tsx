import { get } from 'http';
import { ChangeNotification, expression } from './Interfaces' // Replace 'path/to/notification' with the actual path to the 'Notification' type
import styles from './ReportsTool.module.css';
import React, { useState, useRef } from 'react';
import { changeStates, changeTopics, changeTypes, changeCategories } from './Interfaces';



interface ReportsToolProps {
    changeNotices: ChangeNotification[];
    onDismiss: () => void;
    onApply: (expressions: expression[]) => void;
}

const handleOnSwitchReport = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
}

const ReportsTool: React.FC<ReportsToolProps | null> = (props) => {
    const reports = ['Change Notifications by Type', 'Change Notifications by Topic', 'Change Notifications by State', 'Change Notifications by Category', 'Acknowledgement by Stakeholder'];
    return (<div className={styles.selectionTool}>
        <h2>Report Tool</h2>
        <p>With this tool, you can view bar graphs broken out by change type, category, topic, or state.  You can also view the
            percentage of stakeholders who have acknowledged the Change Notifications in the table.  Note that this tool
            operates on a selected set of Change Notifications - you can create a selected set using the "Search" tool. </p>
        <hr></hr>
        <label htmlFor="reportDropdown">Select a report:</label>
        <select className="form-control" name="reportDropdown" onChange={(e) => handleOnSwitchReport(e)}   >
            {reports.map((report, index) => {
                return <option key={index} value={report}>{report}</option>
            })}
        </select>
        
        <hr></hr>
        <button className='btn btn-primary' onClick={props?.onDismiss}>Dismiss</button>
    </div>)
}
export default ReportsTool;
