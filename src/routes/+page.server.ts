import { CameraFactory } from '$lib/factories/CameraFactory';
import '$lib/firebase'
import { error } from '@sveltejs/kit';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'


export const actions = {
    create : async ({ request }) => {
        const db = getFirestore()
        const cameras = collection(db, 'cameras')

        const data = await request.formData()
        const name = data.get('name') as string
        const protocol = data.get('protocol') as 'RTMP' | 'RTSP'
        const url = data.get('url') as string | undefined

        const camera = CameraFactory.create(protocol, name, url)
        if (camera instanceof Error) {
            console.log(camera)
            throw error(500, camera.message)
        }
        const doc = await addDoc(cameras, {...camera})
        await camera.setup()
        await camera.start()
        await updateDoc(doc, {...camera})
    },
    stop : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const db = getFirestore()

        const ref = doc(db, 'cameras', id).withConverter(CameraFactory.converter)
        await updateDoc(ref, {status : 'STOPPING'})
        const camera = await getDoc(ref).then(value => value.data())

        await camera?.stop()

        await updateDoc(ref, {...camera})
    },
    start : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const db = getFirestore()

        const ref = doc(db, 'cameras', id).withConverter(CameraFactory.converter)
        await updateDoc(ref, {status : 'ACTIVATING'})
        const camera = await getDoc(ref).then(value => value.data())

        await camera?.start()

        await updateDoc(ref, {...camera})
    },
    delete : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const db = getFirestore()

        const ref = doc(db, 'cameras', id).withConverter(CameraFactory.converter)
        await updateDoc(ref, {status : 'DELETING'})
        const camera = await getDoc(ref).then(value => value.data())

        await camera?.delete()

        deleteDoc(ref)
    }
}
