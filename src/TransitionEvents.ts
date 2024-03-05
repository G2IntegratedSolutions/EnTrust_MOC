import { ChangeNotification, User } from "./Interfaces";
import { getFirestore, collection, query, where, getDocs, addDoc } from '@firebase/firestore';
// Sends on Create CN Email
export const OnCreateCN = async (cn: ChangeNotification | any, user: any) => {
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
const getLastValueInArray = (arr: any[]) => {
    return arr[arr.length - 1].value;
}
const commonFields = (cn: ChangeNotification | any, user: any, emailNotes: string) => {
    return `
    <p>Change Type: ${cn.changeType[0].value}</p>
    <p>Change Topic: ${cn.changeTopic[0].value}</p>
    <p>Change Category: ${cn.category[0].value}</p>
    <p>Short Description: ${cn.shortReasonForChange[0].value}</p>
    <br>
    <b>Notes from ${user.firstName} ${user.lastName}</b>
    <p>${emailNotes}</p>`
}

//Also passed in is an array of approvers to email that were chosen by the primary approver
export const OnUnderReviewCN = async (cn: ChangeNotification | any, user: any, approvers: string[], emailNotes: string) => {
    const recipients = approvers.join(";");
    const html = `
    <h1>Request Review for Change Notification</h1>
    <hr>
    <p>A Change Notification (CN) created by ${cn.owner[0].value} is currently pending approval by ${cn.approver[0].value}.
    They are seeking your peer review of the CN. Please log into ENTRUST Moc Manager and 
    search for <b>Moc Number ${cn.mocNumber}</b>.  Please reach out to ${cn.approver[0].value} directly with your
    concerns, questions, or comments.   </p>
    ${commonFields(cn, user, emailNotes)}`;
    const subject = `Request Reivew for Change Notification ${cn.mocNumber}`;
    sendEmail(recipients, subject, html);
}


export const OnApproveCN = async (cn: ChangeNotification , user: any, emailNotes: string) => {

    const organization = cn.organization;
    const groups = getLastValueInArray(cn.groups);
    const groupArray = groups.split('|').map((group: string) => `${organization}_${group}`);
    let usersToEmail: string[] = [];
    const db = getFirestore();
    const usersCollection = collection(db, 'Users');
    for (let i = 0; i < groupArray.length; i++) {
        const userQuery = query(usersCollection, where("organization", "==", organization), where("groups", "array-contains", groupArray[i]));
        const userSnap = await getDocs(userQuery).then(async (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                usersToEmail.push(doc.data().email)
            });

        });
    }
    let emailString = usersToEmail.join(";");
    const html = `
    <h1>Change Notification!</h1>
    <hr>
    <p>A Change Notification (CN) has been approved by ${getLastValueInArray(cn.approver)} and, as an assigned stakeholder,
     is awaiting your acknowledgment.  You are kindly requested to follow the link below and log into ENTRUST MoC Manager 
     where you can review and acknowledge your understanding of the change in question. If necessary, you can also raise 
     an official objection to the change.  You may also reach out to   ${getLastValueInArray(cn.owner)} or   ${cn.creator} with 
     any questions you may have. </p>
    ${commonFields(cn, user, emailNotes)}`;
    const subject = `Request Acknowledgment for Change Notification ${cn.mocNumber}`;
    sendEmail(emailString, subject, html); //Check to ensure two users are being returned
}

export const OnSeekApprovalCN = async (cn: ChangeNotification | any, user: any, emailNotes: string) => {
    const html = `
    <h1>Request Approval for Change Notification</h1>
    <hr>
    <p>A Change Notification (CN) created by ${cn.owner[0].value} is seeking to have a Change Notification approved.  You
    have been designated as the approval officer for this CN.  Please log into ENTRUST Moc Manager and 
    search for <b>Moc Number ${cn.mocNumber}</b>.  As the approval officer, you will typically have the ability to 
    Approve, Reject, Require Updates, or place the CN "Under Review" so that its consequences can be properly studied. </p>
    ${commonFields(cn, user, emailNotes)}`;
    const subject = `Request Approval for Change Notification ${cn.mocNumber}`;
    sendEmail(cn.approver[0].value, subject, html);
}

export const sendEmail = async (to: string, subject: string, html: string) => {
    const db = getFirestore();
    const mail = {
        to: to,
        message: {
            html: html,
            subject: subject,
        }
    }
    const docRef = await addDoc(collection(db, 'mail'), mail);

}