import { ChangeNotification } from "./Interfaces";
import { getFirestore, query, where, collection,getDoc, addDoc, Query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const db = getFirestore();
export async function getApproversForOrg(organization: string, emailToExclude: string = ''): Promise<string[]> {
    
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


export async function GetInfoFieldDescriptions(): Promise<Record<string, string> | null> {
    const infoButtonCollection = collection(db, 'infoButtons');
    const fieldDescriptionsDoc = doc(db, 'infoButtons', 'fieldDescriptions');
    const docSnapshot = await getDoc(fieldDescriptionsDoc);
    if (docSnapshot.exists()) {
        return docSnapshot.data() as Record<string, string>;
    } else {
        // The document does not exist
        console.log('No such document!');
        return null;
    }
}

export async function acknowledgeActiveCN(activeCN : ChangeNotification, didAcknowledge: boolean, currentUserEmail: string) {

    const mocID = activeCN.mocNumber;
    const cnCollection = collection(db, 'changeNotifications');
    const qCN = query(cnCollection, where("organization", "==", activeCN.organization), where("mocNumber", "==", mocID));
    const querySnapshot = await getDocs(qCN);
    querySnapshot.forEach((doc) => {
        //let newDoc = {...doc.data().acknowledgements, currentUserEmail: didAcknowledge};
        let existingMap = doc.data().acknowledgements;
        let newMap = {...existingMap}
        newMap[currentUserEmail] = didAcknowledge;
        let newDoc = {...doc.data(), acknowledgements: newMap};
        updateDoc(doc.ref, newDoc ).then(() => {
            debugger
            console.log('Acknowledgment updated');
        }).catch((error: any) => {
            console.log('Error updating acknowledgment:', error);
        });
    });
}

export async function handleAssignToGroup (selectedUserEmail: string,currentOrg: string, selectedGroup: string,
    groupsInOrg: any[], setGroupsForSelectedUser: any) {
    console.log("Assigning user to group")
    let groupToAdd = selectedGroup
    if (groupToAdd === '') {
        groupToAdd = currentOrg + "_" + groupsInOrg[0].name;
    }
    let currentUser = selectedUserEmail;

    const usersCollection = collection(db, 'Users');
    // Query the users collection for the selected user with an organization matching currentOrg
    const qUsers = query(usersCollection, where("organization", "==", currentOrg), where("email", "==", currentUser));
    getDocs(qUsers).then((querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
            // Get the user's groups
            let groups = doc.data().groups;
            // Remove the selected group from the user's groups
            if (groups.includes( groupToAdd) == false) {
                let newGroups = [...groups, groupToAdd];
                // Update the user's groups in the database
                const userRef = doc.ref;
                await updateDoc(userRef, { groups: newGroups });
                setGroupsForSelectedUser(newGroups);
            }
        });
    });
}