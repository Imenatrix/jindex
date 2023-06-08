import '$lib/firebase'
import { addDoc, collection, getFirestore } from 'firebase/firestore'

export const actions = {
    create : async ({ request }) => {
        const data = await request.formData()
        const db = getFirestore()
        const cameras = collection(db, 'cameras')
        addDoc(cameras, {
            name : data.get('name')
        })
    }
}