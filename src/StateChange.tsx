import React from 'react';
import { ChangeNotification } from './Interfaces';

interface StateChangeProps {
    changeNotification: ChangeNotification | null;
    toState: string;
    setShowStateChange: React.Dispatch<React.SetStateAction<boolean>>;
}

const StateChange: React.FC<StateChangeProps> = ({ changeNotification, toState, setShowStateChange }) => {
    // Component logic goes here

    return (
        <div style={{ padding: '10px' }}>
            <h2>Advance Change from {(changeNotification?.cnState[0] as any).value} to {toState}</h2>
            On this page, you can advance the Change Notification of your CN (MoC# {changeNotification?.mocNumber}) from
            from <b>{(changeNotification?.cnState[0] as any).value}</b> to <b>{toState}.</b>
            <br></br>
            <p>
                <p>You can optionally include text that will be sent to registered email/text recipents:</p>
                <textarea placeholder='Enter detail about this change - they will be sent to the email/text recipients and optionally become a permanent part of the CN.' style={{ width: '100%', height: '25vw' }}></textarea>
            </p>
            <div style={{marginLeft:'0px'}} className=""  >
                <input
                    checked={true}
                    className="form-check-input"
                    id='includeInCN'
                    type="checkbox"
                />
                <label style={{ marginLeft: '4px' }} className="form-check-label" htmlFor='includeInCN'>
                    Save these notes in the database as part of the CN.
                </label>
            </div>
            <br></br>
            <button style={{ marginLeft: '10px' }} className='btn btn-primary' onClick={(e) => setShowStateChange(false)}>Advance Change</button>
            <button className='btn btn-primary' onClick={(e) => setShowStateChange(false)}>Dismiss</button>
        </div>
    );
};

export default StateChange;