import { CameraFactory } from '$lib/factories/CameraFactory.js';
import '$lib/firebase'
import { deleteDoc, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'

export const actions = {
    stop : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const db = getFirestore()

        const ref = doc(db, 'cameras', id).withConverter(CameraFactory.converter)
        const camera = await getDoc(ref).then(value => value.data())

        await camera?.stop()

        updateDoc(ref, {...camera})
    },
    activate : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const db = getFirestore()

        const ref = doc(db, 'cameras', id).withConverter(CameraFactory.converter)
        const camera = await getDoc(ref).then(value => value.data())

        await camera?.start()

        updateDoc(ref, {...camera})
    },
    delete : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const db = getFirestore()

        const ref = doc(db, 'cameras', id).withConverter(CameraFactory.converter)
        const camera = await getDoc(ref).then(value => value.data())

        await camera?.delete()

        deleteDoc(ref)
    }
}