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
// 'MOC#', 'Status', 'Date of Creation', 'Date of Publication', 'Change Type', 'Change Topic', 
// 'Groups', 'Short Description', 'Long Description', 'Impacts', 'Required Date of Completion', 
// 'Notes', 'Attachments'];
export interface ChangeNotification {
    mocNumber: string;
    status: string;
    dateOfCreation: Date;
    dateOfPublication: Date;
    type: string;
    timeOfImplementation: Date;
    topic:string
    categoryOfMOC: string;
    typeOfMOC: string;
    specificTopic: string;
    groupNames: string;
    shortReasonForChange: string;
    descriptionOfChange: string;
    impacts: string;
    requiredDateOfCompletion: Date;
    notes: string;
    attachments: string;

}