import { ChangeNotification, User } from "./Interfaces";
import { getFirestore, collection, query, where, getDocs, addDoc } from '@firebase/firestore';
// Sends on Create CN Email
export const OnCreateCN = async (cn: ChangeNotification|any, user: any) => {
    const db = getFirestore();
    const mail = {
        to: user.email,
        message: {
            html: `
            <h1>Change Notification Created</h1>
            <hr>
            <p>Change Notification ${cn.mocNumber} has been created by ${user.firstName} ${user.lastName}</p>
            <p>Short Description: ${cn.shortReasonForChange[0].value}</p>
            `,
            subject: `ENTRUST Moc Manager - Change Notification Created by ${user.firstName} ${user.lastName}`,
        }
    }
    const docRef = await addDoc(collection(db, 'mail'), mail);
    
}
export const OnSeekApprovalCN = async (cn: ChangeNotification|any, user: any) => {
    const db = getFirestore();
    const mail = {
        to: cn.approver[0].value,
        message: {
            html: `
            <h1>Request Approval for Change Notification</h1>
            <hr>
            <p>A Change Notification (CN) created by ${cn.owner[0].value} is seeking to have their Change Notification approved.  You
            have been designated as the approval officer for this CN.  Please log into ENTRUST Moc Manager and 
            search for <b>Moc Number ${cn.mocNumber}</b> </p>
            <p>Short Description: ${cn.shortReasonForChange[0].value}</p>
            `,
            subject: `Request Approval for Change Notification ${cn.mocNumber}`,
        }
    }
    const docRef = await addDoc(collection(db, 'mail'), mail);
    
}