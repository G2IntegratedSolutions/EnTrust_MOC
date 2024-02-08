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