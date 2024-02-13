import React from 'react';
import './MyChangeNotifications.css';

const MyChangeNotifications = () => {
    const columns = ['MOC#', 'Date of Creation', 'Date of Publication', 'Change Type', 'Change Topic', 'Groups', 'Short Description', 'Long Description', 'Impacts', 'Required Date of Completion', 'Notes', 'Attachments'];

    return (
        <div className="cnContainer">
            <div className="scrollableDiv">
                {columns.map((column, index) => (
                    <div key={index} className="column">
                        {column}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyChangeNotifications;