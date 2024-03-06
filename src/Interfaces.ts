export enum CNState {
    CREATED = 'CREATED',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    ACTIVATED =  'ACTIVATED',
    COMPLETED =  'COMPLETED',
    ARCHIVED = 'ARCHIVED',
    REJECTED = 'REJECTED',
    UPDATES_REQUIRED = 'UPDATES_REQUIRED',
    PAUSED = 'PAUSED',
    RESCHEDULED = 'RESCHEDULED',
    CANCELLED = 'CANCELLED'

}

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
export type ChangeNotification = {
    [key: string]: any;
    mocNumber: string
    creator:string,
    owner: string[], 
    approver: string[],
    shortReasonForChange: string[],
    groups: string[],
    cnState: string[],
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
    organization: string,
    onCreatedNotes: string[],
    onUnderReviewNotes: string[],
    onApprovedNotes: string[],
    onActivatedNotes: string[],
    onCompletedNotes: string[],
    onArchivedNotes: string[],
    onRejectedNotes: string[],
    onUpdatesRequiredNotes: string[],
    onPausedNotes: string[],
    onRescheduledNotes: string[],
    onCancelledNotes: string[],
    acknowledgements:  Record<string, boolean>,
    objections: string[],
    latestOwner: string,
    latestApprover: string,
    latestState: string,
    latestGroups: string[],
    latestDescriptionOfChange: string,
    latestShortReasonForChange: string,
}