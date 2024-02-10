export interface Group {
    id:string,
    name: string;
    description: string;
    organization: '';
}

export interface User {
    id:string;
    email: string;
    phone: string;
    organization: string;
    groups: string[];
    isAdmin: boolean;
}

interface ChangeNotice {
    mocNumber: string;
    dateOfCreation: Date;
    dateOfPublication: Date;
    timeOfImplemenation: Date;
    categoryOfMOC: string;
    typeOfMOC: string;
    specificTopic: string;
    affectedGroups: string;
    reasonForChange: string;
    reasonForChangeDescription: string;
    impacts: string;
    requiredDateOfCompletion: Date;
    openNotes: string;
    attachments: string;
}