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