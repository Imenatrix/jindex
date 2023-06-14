import { CameraFactory } from '$lib/factories/CameraFactory';
import '$lib/firebase'
import { error } from '@sveltejs/kit';
import { addDoc, collection, getFirestore, updateDoc } from 'firebase/firestore'


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
        updateDoc(doc, {...camera})
    }
}