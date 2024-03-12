import { Interaction } from "chart.js";

export const changeCategories = ['SELECT ONE', 'Safety', 'Quality', 'Production', 'Facilities', 'IT', 'HR', 'Finance', 'Other'];
export const changeTypes = ['SELECT ONE', 'Temporary', 'Permanent', 'Emergency'];
export const changeTopics = ['SELECT ONE', 'Technical', 'Design', 'Physical', 'Environmental', 'Procedural', 'Operational', 'Maintenance', 'Organizational']
export const changeStates = ['SELECT ONE','CREATED', 'PENDING_APPROVAL', 'UNDER_REVIEW', 'APPROVED', 'ACTIVATED', 'COMPLETED', 'ARCHIVED', 'REJECTED', 'UPDATES_REQUIRED', 'PAUSED', 'RESCHEDULED', 'CANCELLED']

export enum Role {
    ADMIN = 'Admin',
    CREATOR = 'Creator',
    REVIEWER = 'Reviewer',
    APPROVER = 'Approver',
    STAKEHOLDER = 'Stakeholder'
}

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
export interface expression {
    fieldName: string,
    operator: string,
    value: string
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
    isReviewer: boolean;
}
// A CNField stores the value for a field in a ChangeNotification at a certain version. Almost all fields are stored as an array of CNFields
// in order to support the concept of a CN being updated over time.  When a CN is updated, the version updates +1 and for any field 
// that changes, a new CNField is added to the array for that field.  The latest value for a field is always the last element in the array.
// Importantly, the last element in the array many not have a version matching the version of the CN - it is simply the version that was
// in place when that field was updated. This allows for the ability to see the history of a field over time.
// Note that when first created, the CN will be in the CREATED state with a version of 0.  From then on, the version will be incremented
// by one whenever it is moved to PENDING_APPROVAL from either CREATED or UPDATES_REQUIRED.  
export interface CNField {
    version: number;
    value: string;
}
// For a minority of fields such as groups, acknowledgments, objections, and reviewerVotes, the value is stored as an array of strings
// There is one element in the array for each group (for groups) or for each person for acknowledgments, objections, and reviewerVotes. 
// The value of each element in the array is the name (of the person or the group) and then pipe delimited data to indicate if that 
// person voted yes or no, if the person acknowledged, or what objections the person raised. Because the fields of the CN are stored
// as CNArrayField arrays, we have in effect an array of arrays.  The outer array represents the version of the CN (for example, we could
// have different vote tallies for version 1 or version 2). The inner array represents the value of the field at that version.
export interface CNArrayField {
    version: number;
    value: string[];
}

// 'MOC#', 'Status', 'Date of Creation', 'Date of Publication', 'Change Type', 'Change Topic', 
// 'Groups', 'Short Description', 'Long Description', 'Impacts', 'Required Date of Completion', 
// 'Notes', 'Attachments'];
// [safety quality production, facilities, IT, HR, finance, other]
export type ChangeNotification = {
    [key: string]: any;
    mocNumber: string
    creator:CNField[],
    approver: CNField[],
    shortReasonForChange: CNField[],
    groups: CNArrayField[],
    cnState: CNField[],
    changeTopic: CNField[],  
    dateOfCreation: CNField[],
    dateOfPublication: CNField[],
    timeOfImplementation: CNField[],
    requiredDateOfCompletion: CNField[],
    category: CNField[],
    changeType: CNField[],	
    descriptionOfChange: CNField[],
    impacts: CNField[],
    location: CNField[],	
    notes: CNField[],
    attachments: CNArrayField[], //The value is an array of IDS of the attachments
    organization: string, //Always static and can never change
    version:CNField[], //Version is incremented by 1 whenever the CN is moved to PENDING_APPROVAL from UPDATES_REQUIRED. The version of the version field is the version number and the value is the UTC time it was created.
    reviewerVotes: CNArrayField[],// Each reviewer can vote yes or no on the most recent version of the CN. When a version changes, the CN will once again enter PENDING_APPROVAL - if it is sent back out to UNDER REVIEW, then the reviewers are informed that this is a new version which requires their inspection / vote. 
    //The on<event> Notes fields are notes that are attached by the person advancing the CN to a new state. Note that for some of these 
    // events it is possible that they occur multip times (e.g. onActivated could occur after a CN is paused and then resumed).
    // In this case, the notes are stored as an array of CNField.  The last element in the array is the most recent note. But for
    // other events, it is only possible to have one note (e.g. onCompleted).  In this case, the note is stored as a single CNField.
    onCreatedNotes: CNField,// A CN can only be created once. 
    onPendingApprovalNotes: CNField[],// A CN can be moved into PENDING APPROVAL multiple times
    onUnderReviewNotes: CNArrayField[], //Each reviewer can add a note for each version of the CN.  Only one note per reviewer per version (although a reviweer can modify their note)
    onApprovedNotes: CNField, // A CN can only be approved once. 
    onActivatedNotes: CNField[],// A CN can be reactivated after being re-scheduled
    onCompletedNotes: CNField,// A CN can only be completed once. 
    onArchivedNotes: CNField,// A CN can only be archived once. 
    onRejectedNotes: CNField,// A CN can only be rejected once. 
    onUpdatesRequiredNotes: CNField[],// A CN can be placed in the UPDATES REQUIRED state multiple times
    onRescheduledNotes: CNField[],// A CN can be rescheduled multiple times
    onCancelledNotes: CNField,// A CN can only be cancelled once. 
    acknowledgements:  CNArrayField,// A CN can only be acknowledged in the version in which it was approved. Since it can only be approved on a single version, this is NOT a CNField[], however, because multiple stakeholders can acknowledge it, it uses the CNArrayField[] structure
    objections: CNArrayField[],//Each stakeholder can object with a comment for the current version of the CN.  Only one objection per stakeholder per version (although a stakeholder can modify their objection).  When an objection is raised the approver is notified. 
    // The "latest" fields are convenience fields that are used to ease the ability to select
    latestApprover: string,
    latestState: string,
    latestGroups: string[],
    latestDescriptionOfChange: string,
    latestShortReasonForChange: string,
}