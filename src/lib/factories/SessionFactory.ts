import Session from "$lib/entities/Session"
import type { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore"
import fs from 'fs'

export class SessionFactory {
    static converter = {
        toFirestore(camera : Session): DocumentData {
            return {...camera}
        },
        fromFirestore(
            snapshot: QueryDocumentSnapshot,
            options: SnapshotOptions
        ): Session {
            const data = snapshot.data(options)
            // TODO: Implement using GCloud
            const filenames = fs.readdirSync('output').filter(filename => filename.endsWith('.ts'))
            const time = data.time.toDate()
            time.setMilliseconds(0)
            return new Session(snapshot.id, time, filenames)
        }
    }
}