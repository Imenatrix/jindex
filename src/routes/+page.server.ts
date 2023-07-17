import { CameraFactory } from '$lib/factories/CameraFactory';
import '$lib/firebase'
import { error } from '@sveltejs/kit';
import { DocumentReference, addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'
import type { ChildProcess } from 'child_process'
import type { ICamera } from '$lib/entities/ICamera.js';
import allocatedPorts from '$lib/repositories/AllocatedPorts.js';
import { RTMPCamera } from '$lib/entities/RTMPCamera.js';


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
        const ref = await addDoc(cameras, {...camera})
        await camera.setup()
        const process = await camera.start()
        checkForTransmissionStart(process, ref, camera.current_session)
        if (camera instanceof RTMPCamera) {
            checkForEnd(process, ref, camera)
        }
        await updateDoc(ref, {...camera})
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

        const process = await camera?.start()
        if (process) {
            checkForTransmissionStart(process, ref, camera?.current_session ?? 0)
            if (camera instanceof RTMPCamera) {
                checkForEnd(process, ref, camera)
            }
        }

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

function checkForTransmissionStart(process : ChildProcess, doc : DocumentReference, id : number) {
    let started = false
    process.stderr?.on('data', (data) => {
        const timestamp = new Date()
        const line : string = data.toString()
        console.log(line)
        if (line.startsWith('frame')) {
            const params = line.split('=').map(e => e.split(' ')).flat().filter(e => e != '')
            const frame = parseInt(params[1])
            if (frame != 0 && !started) {
                started = true
                const db = getFirestore()
                const sessions = collection(db, 'sessions')
                // TODO: Make the id
                addDoc(sessions, {
                    session_id : id,
                    camera_id : doc.id,
                    time : timestamp
                })
            }
        }
    })
}

function checkForEnd(process : ChildProcess, ref : DocumentReference, camera : ICamera) {
    process.on('exit', async () => {
        if (camera.name in allocatedPorts) {
            console.log('restart')

            const process = await camera.start()
            checkForTransmissionStart(process, ref, camera?.current_session ?? 0)
            if (camera instanceof RTMPCamera) {
                checkForEnd(process, ref, camera)
            }

            await updateDoc(ref, {...camera})
        }
    })
}
