import Session from "$lib/entities/Session"
import { getFirestore, type DocumentData, type QueryDocumentSnapshot, type SnapshotOptions, collection, getDoc, doc } from "firebase/firestore"
import { Storage } from '@google-cloud/storage'
import { env } from '$env/dynamic/private'
import '$lib/firebase'
import { CameraFactory } from "./CameraFactory"
import { toKebabCase } from "$lib/utils/strings"

export class SessionFactory {
    static converter = {
        toFirestore(camera : Session): DocumentData {
            return {...camera}
        },
        async fromFirestore(
            snapshot: QueryDocumentSnapshot,
            options: SnapshotOptions
        ): Promise<Session> {
            const storage = new Storage()
            const data = snapshot.data(options)

            const db = getFirestore()
            const cameras = collection(db, 'cameras')
            const camera = (await getDoc(doc(cameras, data.camera_id).withConverter(CameraFactory.converter))).data()

            const slug = toKebabCase(camera?.name ?? '')
            const outputName = slug + '-output'

            const [files] = await storage.bucket(env.PROJECT ?? '').getFiles({prefix : outputName + '/' + data.session_id + '/'})
            const filenames = files.map(file => file.name).filter(file => file.endsWith('.ts'))
            const time = data.time.toDate()
            time.setMilliseconds(0)
            return new Session(data.session_id, time, filenames)
        }
    }
}