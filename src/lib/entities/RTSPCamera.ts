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
    #process : ChildProcess | null = null
    output_uri: string
    current_session = 0

    constructor(name : string, input_uri : string, status? : 'CREATING' | 'ACTIVE' | 'STOPPED', command? : string[], current_session? : number) {
        this.name = name
        this.input_uri = input_uri
        this.status = 'CREATING'
        if (status != undefined) {
            this.status = status
        }
        if (current_session != undefined) {
            this.current_session = current_session
        }
        const slug = toKebabCase(this.name)
        const outputName = slug + '-output'
        this.output_uri = `https://storage.googleapis.com/${env.PROJECT}/${outputName}/manifest.m3u8`
    }

    generateCommand() {
        const slug = toKebabCase(this.name)
        const outputName = slug + '-output'
        return [
            'ffmpeg',
            '-fflags', 'nobuffer',
            '-rtsp_transport', 'tcp',
            `-i`, `${this.input_uri}`,
            `-hls_segment_filename`, `https://${env.PROJECT}.storage.googleapis.com/${outputName}/${this.current_session}/%03d.ts`,
            '-vcodec', 'copy',
            '-segment_list_flags', 'live',
            '-method' ,'PUT',
            '-headers', 'Cache-Control: no-cache',
            `https://${env.PROJECT}.storage.googleapis.com/${outputName}/manifest.m3u8`,
        ]
    }

    async setup() {
        this.status = 'STOPPED'
    }

    async start() {
        this.current_session += 1
        this.#process = run(this.generateCommand())
        processes[this.name] = this.#process
        this.status = 'ACTIVE'
        return this.#process
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
