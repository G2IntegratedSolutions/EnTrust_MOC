import { ChangeNotification } from "./Interfaces";
import { getFirestore, query, where, collection, addDoc, Query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export async function getApproversForOrg(organization: string, emailToExclude: string = ''): Promise<string[]> {
    
    const db = getFirestore();
    const usersCollection = collection(db, 'Users');
    const qApprovers = query(usersCollection, where("organization", "==", organization), where("isApprover", "==", true));
    const orgApprovers: string[] = []
    const userSnap = await getDocs(qApprovers).then(async (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().email !== emailToExclude) {
                orgApprovers.push(doc.data().email);
            }
        });
    });
    return orgApprovers
}