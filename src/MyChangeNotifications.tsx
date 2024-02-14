import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MyChangeNotifications.css';

const MyChangeNotifications = () => {
    const columns = ['MOC#', 'Date of Creation', 'Date of Publication', 'Change Type', 'Change Topic', 'Groups', 'Short Description', 'Long Description', 'Impacts', 'Required Date of Completion', 'Notes', 'Attachments'];
    const columnWidths = [100, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200]; // Adjust these values as needed
    const sampleData = ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4', 'Sample 5', 'Sample 6', 'Sample 7', 'Sample 8', 'Sample 9', 'Sample 10', 'Sample 11', 'Sample 12'];
    const [selectedRow, setSelectedRow] = useState(0);

    const handleRowClick = (index: number) => {
        console.log('Row clicked:', index);
        setSelectedRow(index);
    }

    return (
        <>
            <h1>My Change Notifications</h1>
            <div className="tableContainer">
                <table className="table table-bordered">
                    <thead className='th columnHeader'>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} className="column th columnHeader" style={{minWidth: columnWidths[index]}}>
                                {column}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {[sampleData,sampleData,sampleData,sampleData,sampleData,sampleData,sampleData,sampleData,sampleData, sampleData].map((rowData, rowIndex) => (
                        <tr key={rowIndex} onClick={() => handleRowClick(rowIndex)} style={rowIndex === selectedRow ? {backgroundColor: 'yellow'} : {}}>
                            {rowData.map((data, index) => (
                                <td key={index} className="column" style={{minWidth: columnWidths[index]}}>
                                    {data}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                </table>
                <hr>
                </hr>
            </div>
        </>
    );
}

export default MyChangeNotifications;