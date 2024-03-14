import { ChangeNotification, User } from "./Interfaces";
import { getFirestore, collection, query, where, getDocs, addDoc } from '@firebase/firestore';
import { getStakeholdersForCN } from "./dataAccess";

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
            <p>Short Description: ${getLastValueInArray(cn.shortReasonForChange)}</p>
            `,
            subject: `ENTRUST Moc Manager - Change Notification Created by ${user.firstName} ${user.lastName}`,
        }
    }
    const docRef = await addDoc(collection(db, 'mail'), mail);

}
const getLastValueInArray = (arr: any[]) => {
    return arr[arr.length - 1].value;
}
const commonFields = (cn: ChangeNotification, user: any, emailNotes: string) => {
    return `
    <p>Change Type: ${getLastValueInArray(cn.changeType)}</p>
    <p>Change Topic:${getLastValueInArray(cn.changeTopic)}</p>
    <p>Change Category:${getLastValueInArray(cn.category)}</p>
    <p>Short Description: ${getLastValueInArray(cn.shortReasonForChange)}</p>
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
    <p>A Change Notification (CN) created by  ${getLastValueInArray(cn.creator)} has beein moved to an "In Review" state by   ${getLastValueInArray(cn.approver)}.
    They are seeking your peer review of the CN. Please log into ENTRUST Moc Manager and 
    search for <b>Moc Number ${cn.mocNumber}</b>.  Please reach out to ${cn.approver[0].value} directly with your
    concerns, questions, or comments.   </p>
    ${commonFields(cn, user, emailNotes)}`;
    const subject = `Request Reivew for Change Notification ${cn.mocNumber}`;
    sendEmail(recipients, subject, html);
}

export const OnApproveCN = async (cn: ChangeNotification, user: any, emailNotes: string) => {
    getStakeholdersForCN(cn).then((stakeholders) => {
        const emailString = stakeholders.join(";");
        const html = `
        <h1>Change Notification!</h1>
        <hr>
        <p>A Change Notification (CN) has been approved by ${getLastValueInArray(cn.approver)} and, as an assigned stakeholder,
         is awaiting your acknowledgment.  You are kindly requested to follow the link below and log into ENTRUST MoC Manager 
         where you can review and acknowledge your understanding of the change in question. If necessary, you can also raise 
         an official objection to the change.  You may also reach out to   ${getLastValueInArray(cn.approver)} or   ${cn.creator} with 
         any questions you may have. </p>
        ${commonFields(cn, user, emailNotes)}`;
        const subject = `Request Acknowledgment for Change Notification ${cn.mocNumber}`;
        sendEmail(emailString, subject, html); //Check to ensure two users are being returned
    })
}

export const OnSeekApprovalCN = async (cn: ChangeNotification, user: any, emailNotes: string) => {
    const html = `
    <h1>Request Approval for Change Notification</h1>
    <hr>
    <p>A Change Notification (CN) created by ${getLastValueInArray(cn.creator)} is seeking to have a Change Notification approved.  You
    have been designated as the approval officer for this CN.  Please log into ENTRUST Moc Manager and 
    search for <b>Moc Number ${cn.mocNumber}</b>.  As the approval officer, you will typically have the ability to 
    Approve, Reject, Require Updates, or place the CN "Under Review" so that its consequences can be properly studied. </p>
    ${commonFields(cn, user, emailNotes)}`;
    const subject = `Request Approval for Change Notification ${cn.mocNumber}`;
    sendEmail(getLastValueInArray(cn.approver), subject, html);
}

export const OnActivateCN = async (cn: ChangeNotification | any, user: any, emailNotes: string) => {
    getStakeholdersForCN(cn).then((stakeholders) => {
        const emailString = stakeholders.join(";");
        const html = `
    <h1>A change is now active!</h1>
    <hr>
    <p>A Change Notification (CN) has been approved by  ${getLastValueInArray(cn.approver)}  and is now active.  As a stakeholder
    for this change, you are responsible for acting in accordance with the new change effective immediately.  </p>
    ${commonFields(cn, user, emailNotes)}`;
        const subject = `A new change is now active ${cn.mocNumber}`;
        sendEmail(emailString, subject, html);
    });
}

export const OnCompleteCN = async (cn: ChangeNotification | any, user: any, emailNotes: string) => {
    getStakeholdersForCN(cn).then((stakeholders) => {
        const emailString = stakeholders.join(";");
        const html = `
    <h1>A change is now completed!</h1>
    <hr>
    <p>A Change Notification (CN) previously approved by  ${getLastValueInArray(cn.approver)} and active has now been completed.  
  </p>
    ${commonFields(cn, user, emailNotes)}`;
        const subject = `A new change (${cn.mocNumber}) is now active `;
        sendEmail(emailString, subject, html);
    });
}

export const OnArchiveCN = async (cn: ChangeNotification | any, user: any, emailNotes: string) => {
    const html = `
    <h1>Change Notification Archi ed</h1>
    <hr>
    <p>A Change Notification (CN) created by ${getLastValueInArray(cn.creator)} and approved by ${getLastValueInArray(cn.approver)} has been archived. 
    Archived CNs are available to your organization indefinitely.</p>
    ${commonFields(cn, user, emailNotes)}`;
    const subject = `Change Notification ${cn.mocNumber} Archived`;
    sendEmail(getLastValueInArray(cn.approver), subject, html);
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