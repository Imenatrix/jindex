export interface ICamera {
    name : string,
    protocol : 'RTMP' | 'RTSP'
    status : 'CREATING' | 'ACTIVE' | 'STOPPED',
    input_uri : string | null,
    output_uri : string,
    start : () => Promise<void>,
    stop : () => Promise<void>,
    delete : () => Promise<void>,
    setup : () => Promise<void>
}