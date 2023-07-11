import type { ICamera } from "$lib/entities/ICamera"
import { RTMPCamera } from "$lib/entities/RTMPCamera"
import { RTSPCamera } from '$lib/entities/RTSPCamera'
import type { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore"

export class CameraFactory {
    static create(method : 'RTSP' | 'RTMP', name : string, url : string | undefined) : ICamera | Error {
        if (method == 'RTSP' && url == undefined) {
            return new Error('RTPS cameras need a input URL')
        }
        if (method == 'RTSP') {
            return new RTSPCamera(name, url ?? '')
        }
        else {
            return new RTMPCamera(name)
        }
        
    }

    static converter = {
        toFirestore(camera : ICamera): DocumentData {
            return {...camera};
        },
        fromFirestore(
            snapshot: QueryDocumentSnapshot,
            options: SnapshotOptions
        ): ICamera {
            const data = snapshot.data(options);
            if (data.protocol == 'RTSP') {
                return new RTSPCamera(data.name, data.input_uri, data.status, data.command, data.current_session)
            }
            else {
                return new RTMPCamera(data.name, data.input_uri, data.status, data.current_session)
            }
        }
    }
}