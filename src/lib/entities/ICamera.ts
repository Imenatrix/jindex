import type { ChildProcess } from 'child_process'

export interface ICamera {
    name : string,
    protocol : 'RTMP' | 'RTSP'
    status : 'CREATING' | 'ACTIVE' | 'STOPPED' | 'STOPPING' | 'ACTIVATING' | 'DELETING',
    input_uri : string | null,
    output_uri : string,
    current_session : number,
    start : () => Promise<ChildProcess>,
    stop : () => Promise<void>,
    delete : () => Promise<void>,
    setup : () => Promise<void>
}
