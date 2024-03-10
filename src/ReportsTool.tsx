import { get } from 'http';
import { ChangeNotification, expression } from './Interfaces' // Replace 'path/to/notification' with the actual path to the 'Notification' type
import styles from './ReportsTool.module.css';
import React, { useState, useEffect, useRef } from 'react';
import { changeStates, changeTopics, changeTypes, changeCategories } from './Interfaces';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getLastValueInArray } from './common';
import 'chart.js/auto'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ReportsToolProps {
    changeNotices: ChangeNotification[];
    onDismiss: () => void;
}

const barColors = [
    'hsla(0, 100%, 50%, 0.2)',
    'hsla(30, 100%, 50%, 0.2)',
    'hsla(60, 100%, 50%, 0.2)',
    'hsla(90, 100%, 50%, 0.2)',
    'hsla(120, 100%, 50%, 0.2)',
    'hsla(150, 100%, 50%, 0.2)',
    'hsla(180, 100%, 50%, 0.2)',
    'hsla(210, 100%, 50%, 0.2)',
    'hsla(240, 100%, 50%, 0.2)',
    'hsla(270, 100%, 50%, 0.2)',
    'hsla(300, 100%, 50%, 0.2)',
    'hsla(330, 100%, 50%, 0.2)'
];

const ReportsTool: React.FC<ReportsToolProps | null> = (props) => {
    const reports = ['Select a Report', 'Change Notifications by Type|types', 'Change Notifications by Topic|topics', 'Change Notifications by State|states', 'Change Notifications by Category|categories', 'Acknowledgement by Stakeholder|stakeholders'];
    const [cnSateTopicTypeCategory, setCnStateTopicTypeCategory] = useState<any>();
    const [barData, setBarData] = useState({});
    const [barGraphData, setBarGraphData] = useState({ labels: [], datasets: [] } as any);
    const [showBarGraph, setShowBarGraph] = useState(false);
    const [showPieGraph, setShowPieGraph] = useState(false);

    // UseEffect iterates through all of the CNs to populate an object that contains all four
    // type of bar graph reports (state, topic, type, category). This object is then used to
    // populate the bar graph when the user selects a specific report. 
    useEffect(() => {
        console.log("USE EFFECT");
        const cnData = {
            states: { created: 0, pending_approval: 0, under_review: 0, approved: 0, activated: 0, completed: 0, archived: 0, rejected: 0, updates_required: 0, paused: 0, rescheduled: 0, cancelled: 0 },
            topics: { technical: 0, design: 0, physical: 0, environmental: 0, procedural: 0, operational: 0, maintenance: 0, organizational: 0 },
            types: { temporary: 0, permanent: 0, emergency: 0 },
            categories: { safety: 0, quality: 0, production: 0, facilities: 0, IT: 0, HR: 0, finance: 0, other: 0 },
        }
        props?.changeNotices.forEach(cn => {
            if (getLastValueInArray(cn.cnState) === 'CREATED') cnData.states.created++;
            if (getLastValueInArray(cn.cnState) === 'PENDING_APPROVAL') cnData.states.pending_approval++;
            if (getLastValueInArray(cn.cnState) === 'UNDER_REVIEW') cnData.states.under_review++;
            if (getLastValueInArray(cn.cnState) === 'APPROVED') cnData.states.approved++;
            if (getLastValueInArray(cn.cnState) === 'ACTIVATED') cnData.states.activated++;
            if (getLastValueInArray(cn.cnState) === 'COMPLETED') cnData.states.completed++;
            if (getLastValueInArray(cn.cnState) === 'ARCHIVED') cnData.states.archived++;
            if (getLastValueInArray(cn.cnState) === 'REJECTED') cnData.states.rejected++;
            if (getLastValueInArray(cn.cnState) === 'UPDATES_REQUIRED') cnData.states.updates_required++;
            if (getLastValueInArray(cn.cnState) === 'PAUSED') cnData.states.paused++;
            if (getLastValueInArray(cn.cnState) === 'RESCHEDULED') cnData.states.rescheduled++;
            if (getLastValueInArray(cn.cnState) === 'CANCELLED') cnData.states.cancelled++;
            if (getLastValueInArray(cn.changeTopic) === 'Technical') cnData.topics.technical++;
            if (getLastValueInArray(cn.changeTopic) === 'Design') cnData.topics.design++;
            if (getLastValueInArray(cn.changeTopic) === 'Physical') cnData.topics.physical++;
            if (getLastValueInArray(cn.changeTopic) === 'Environmental') cnData.topics.environmental++;
            if (getLastValueInArray(cn.changeTopic) === 'Procedural') cnData.topics.procedural++;
            if (getLastValueInArray(cn.changeTopic) === 'Operational') cnData.topics.operational++;
            if (getLastValueInArray(cn.changeTopic) === 'Maintenance') cnData.topics.maintenance++;
            if (getLastValueInArray(cn.changeTopic) === 'Organizational') cnData.topics.organizational++;
            if (getLastValueInArray(cn.changeType) === 'Temporary') cnData.types.temporary++;
            if (getLastValueInArray(cn.changeType) === 'Permanent') cnData.types.permanent++;
            if (getLastValueInArray(cn.changeType) === 'Emergency') cnData.types.emergency++;
            if (getLastValueInArray(cn.category) === 'Safety') cnData.categories.safety++;
            if (getLastValueInArray(cn.category) === 'Quality') cnData.categories.quality++;
            if (getLastValueInArray(cn.category) === 'Production') cnData.categories.production++;
            if (getLastValueInArray(cn.category) === 'Facilities') cnData.categories.facilities++;
            if (getLastValueInArray(cn.category) === 'IT') cnData.categories.IT++;
            if (getLastValueInArray(cn.category) === 'HR') cnData.categories.HR++;
            if (getLastValueInArray(cn.category) === 'Finance') cnData.categories.finance++;
            if (getLastValueInArray(cn.category) === 'Other') cnData.categories.other++;
        });
        //debugger;
        setCnStateTopicTypeCategory({ ...cnData });
    }, []);

    const chartRef = useRef(null);

    //Sample Pie Data
    const pieData = {
        labels: ['Acknowledged', 'Not-Acknowledged'],
        datasets: [
            {
                data: [300, 50], // Example data: 300 acknowledged, 50 not-acknowledged
                backgroundColor: ['#80a739', '#295f82'],
                hoverBackgroundColor: ['hsl(81, 49%, 50%)', 'hsl(204, 52%, 40%)'],
            }
        ]
    };
    //Sample Data
    const sampleData = {
        labels: ['January', 'February', 'March'],
        datasets: [
            {
                label: 'Topic',
                data: [65, 59, 80, 81],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(175, 192, 192, 0.2)',
                    'rgba(75, 92, 192, 0.2)',
                    'rgba(75, 192, 65, 0.2)',
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(175, 192, 192, 0.2)',
                    'rgba(75, 92, 192, 0.2)',
                    'rgba(75, 192, 65, 0.2)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            },
        },
    };

    const handleOnSwitchReport = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const words = e.target.value.split(' ');
        const report = words[words.length - 1];
        if (report === 'stakeholders') {
            setShowBarGraph(false);
            setShowPieGraph(true);
        }
        else {
            let labels: string[] = [];
            let data: number[] = [];
            const localBarGraphData = { labels, datasets: [{ label: report.toUpperCase() + " REPORT", data, backgroundColor: barColors, borderColor: barColors, borderWidth: 1 }] }
            console.log(cnSateTopicTypeCategory);
            for (let label in cnSateTopicTypeCategory[report]) {
                localBarGraphData.labels.push(label.toUpperCase());
                if (cnSateTopicTypeCategory[report]) {
                    localBarGraphData.datasets[0].data.push((cnSateTopicTypeCategory[report] as any)[label] as number);
                }
            }
            setBarGraphData(localBarGraphData);
            setShowBarGraph(true);
            setShowPieGraph(false);
        }



    }

    return (<div className={styles.selectionTool}>
        <h2>Report Tool</h2>
        <p>With this tool, you can view bar graphs broken out by change type, category, topic, or state.  You can also view the
            percentage of stakeholders who have acknowledged the Change Notifications in the table.  Note that this tool
            operates on a selected set of Change Notifications - you can create a selected set using the "Search" tool. </p>
        <hr></hr>
        <label htmlFor="reportDropdown">Select a report:</label>
        <select className="form-control" name="reportDropdown" onChange={(e) => handleOnSwitchReport(e)}   >
            {reports.map((report, index) => {
                let name = report.split('|')[0];
                let key = report.split('|')[1];
                return <option key={index} value={key}>{name}</option>
            })}
        </select>

        <hr></hr>
        {showBarGraph &&
            <Bar data={barGraphData} height={80} options={options} />
        }
        {showPieGraph &&
            <div style={{ display: 'flex', alignItems: 'top' }}>
                <div style={{ flexGrow: 1, height: '400px', width: '400px' }}>
                    <Pie data={pieData} />
                </div>
                <div style={{ width: '200px', marginLeft: '20px' }}>
                    {/* You can put any text or content here */}
                    <p>List of individual stakeholders who have not acknowledged the Change Notifications in the table.</p>
                    <div>
                        <ul>
                            <li>Stakeholder 1</li>
                            <li>Stakeholder 2</li>
                            <li>Stakeholder 3</li>
                            <li>Stakeholder 4</li>
                            <li>Stakeholder 5</li>
                        </ul>
                    </div>
                </div>
            </div>
        }
        <button className='btn btn-primary' onClick={props?.onDismiss}>Dismiss</button>
    </div>)
}
export default ReportsTool;
