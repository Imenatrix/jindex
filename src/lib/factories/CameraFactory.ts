import type { ICamera } from "$lib/entities/ICamera"
import { RTMPCamera } from "$lib/entities/RTMPCamera"
import { RTSPCamera } from '$lib/entities/RTSPCamera'

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
}