import { env } from "$env/dynamic/private";
import { run } from "$lib/utils/cli";
import { toKebabCase } from "$lib/utils/strings";
import type { ICamera } from "./ICamera";
import type { ChildProcess } from 'child_process'
import processes from "../repositories/Processes";

export class RTSPCamera implements ICamera {

    name : string
    input_uri : string
    protocol : 'RTMP' | 'RTSP' = 'RTSP'
    status : 'CREATING' | 'ACTIVE' | 'STOPPED' | 'STOPPING' | 'ACTIVATING' | 'DELETING'
    command : string[] | null = null
    #process : ChildProcess | null = null
    output_uri: string

    constructor(name : string, input_uri : string, status? : 'CREATING' | 'ACTIVE' | 'STOPPED', command? : string[]) {
        this.name = name
        this.input_uri = input_uri
        this.status = 'CREATING'
        if (status != undefined) {
            this.status = status
        }
        if (command != undefined) {
            this.command = command
        }
        const slug = toKebabCase(this.name)
        const outputName = slug + '-output'
        this.output_uri = `https://storage.googleapis.com/${env.PROJECT}/${outputName}/manifest.m3u8`
    }

    async setup() {
        const slug = toKebabCase(this.name)
        const outputName = slug + '-output'
        this.command = [
            'ffmpeg',
            '-fflags', 'nobuffer',
            '-rtsp_transport', 'tcp',
            `-i`, `${'rtsp://flowih:surfview123@tombopalanque.ddns.net:2011/cam/realmonitor?channel=1&subtype=0'}`,
            `-hls_segment_filename`, `https://${env.PROJECT}.storage.googleapis.com/${outputName}/%03d.ts`,
            '-vcodec', 'copy',
            '-segment_list_flags', 'live',
            '-method' ,'PUT',
            '-headers', 'Cache-Control: no-cache',
            `https://${env.PROJECT}.storage.googleapis.com/${outputName}/manifest.m3u8`,
        ]
        this.status = 'STOPPED'
    }

    async start() {
        if (this.command != undefined) {
            this.#process = run(this.command)
            processes[this.name] = this.#process
            this.status = 'ACTIVE'
        }
    }

    async stop() {
        if (this.#process != null) {
            const result = this.#process.kill()
            console.log('RESULT: ' + result)
            this.status = 'STOPPED'
        }
        else {
            const result = processes[this.name]?.kill()
            console.log('RESULT: ' + result)
            this.status = 'STOPPED'
        }
    }

    async delete() {
        await this.stop()
    }
}
