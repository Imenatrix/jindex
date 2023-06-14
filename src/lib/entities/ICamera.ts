export interface ICamera {
    name : string,
    status : 'CREATING' | 'ACTIVE' | 'STOPPED',
    input_uri : string | null,
    output_uri : string,
    start : () => Promise<void>,
    setup : () => Promise<void>
}