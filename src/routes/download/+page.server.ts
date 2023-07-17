import '$lib/firebase'
import { collection, getFirestore, getDocs } from 'firebase/firestore'

export async function load() {
    const db = getFirestore()
    const cameras = collection(db, 'cameras')
    const data = (await getDocs(cameras)).docs.map(doc => ({
        id : doc.id,
        name : doc.data().name,
    }))
    return {
        cameras : data
    }
}
