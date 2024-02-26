export interface Group {
    id:string,
    name: string;
    description: string;
    organization: '';
}

export interface User {
    id:string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    organization: string;
    groups: string[];
    isAdmin: boolean;
    isApprover: boolean;
    isCreator: boolean;
    isStakeholder: boolean;
}
// 'MOC#', 'Status', 'Date of Creation', 'Date of Publication', 'Change Type', 'Change Topic', 
// 'Groups', 'Short Description', 'Long Description', 'Impacts', 'Required Date of Completion', 
// 'Notes', 'Attachments'];
// [safety quality production, facilities, IT, HR, finance, other]
export interface ChangeNotification {
    id: string
    creator:string,
    owner: string[], 
    approvers: string[],
    shortReasonForChange: string[],
    groupIDs: string[][],
    state: string[],
    changeTopic: string[],  
    dateOfCreation: string[],
    dateOfPublication: string[],
    timeOfImplementation: string[],
    requiredDateOfCompletion: string[],
    category: string[],
    changeType: string[],	
    descriptionOfChange: string[],
    impacts: string[],
    location: string[],	
    notes: string[],
    attachments: string[],
    onCreatedNotes: string[],
    onUnderReviewNotes: string[],
    onApprovedNotes: string[],
    onActivatedNotes: string[],
    onCompletedNotes: string[],
    onArchivedNotes: string[],
    onRejectedNotes: string[],
    onUpdatesRequiredNotes: string[],
    onResbumittedNotes: string[],
    onPausedNotes: string[],
    onRescheduledNotes: string[],
    onCancelledNotes: string[],
    acknowledgements: string[],
    objections: string[],
}