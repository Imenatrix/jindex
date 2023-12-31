import { env } from "$env/dynamic/private";
import { run } from "$lib/utils/cli";
import { toKebabCase } from "$lib/utils/strings";
import type { ICamera } from "./ICamera";
import type { ChildProcess } from 'child_process'
import processes from "../repositories/Processes";
import { getLocalIP, getPublicIP, isPortOpen } from "$lib/utils/network";
import { NODE_ENV } from "$env/static/private";
import allocatedPorts from "$lib/repositories/AllocatedPorts";

export class RTMPCamera implements ICamera {

    name : string
    input_uri : string
    protocol : 'RTMP' | 'RTSP' = 'RTMP'
    status : 'CREATING' | 'ACTIVE' | 'STOPPED' | 'STOPPING' | 'ACTIVATING' | 'DELETING'
    #process : ChildProcess | null = null
    output_uri: string
    current_session = 0

    constructor(name : string, input_uri : string, status? : 'CREATING' | 'ACTIVE' | 'STOPPED', command? : string[], current_session? : number) {
        this.name = name
        if (input_uri) {
            this.input_uri = input_uri
        }
        else {
            this.input_uri = 'N/A'
        }
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

    generateCommand(input_uri : string) {
        const slug = toKebabCase(this.name)
        const outputName = slug + '-output'
        return [
            'ffmpeg',
            '-fflags', 'nobuffer',
            '-listen', '1',
            `-i`, input_uri,
            `-hls_segment_filename`, `https://${env.PROJECT}.storage.googleapis.com/${outputName}/${this.current_session}-%03d.ts`,
            '-hls_flags', 'append_list+split_by_time',
            '-hls_list_size', '0',
            '-hls_time', '2',
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

        let port
        if (this.name in allocatedPorts) {
            port = allocatedPorts[this.name]
        }
        else {
            for (port = 1935; port <= 2035; port++) {
                const isOpen = await isPortOpen(port)
                if (isOpen && !Object.values(allocatedPorts).includes(port)) {
                    break
                }
            }
            allocatedPorts[this.name] = port
        }

        const localIP = getLocalIP()
        const publicIP = await getPublicIP()

        const inputIP = {
            'development' : localIP,
            'production' : publicIP
        }

        this.input_uri = 'rtmp://' + inputIP[NODE_ENV as 'development' | 'production'] + ':' + port
        this.current_session += 1
        this.#process = run(this.generateCommand('rtmp://' + localIP + ':' + port))
        processes[this.name] = this.#process
        this.status = 'ACTIVE'
        return this.#process
    }

    async stop() {
        if (this.#process != null) {
            delete allocatedPorts[this.name]
            const result = this.#process.kill()
            console.log('RESULT: ' + result)
            this.input_uri = 'N/A'
            this.status = 'STOPPED'
        }
        else {
            delete allocatedPorts[this.name]
            const result = processes[this.name]?.kill()
            console.log('RESULT: ' + result)
            this.input_uri = 'N/A'
            this.status = 'STOPPED'
        }
    }

    async delete() {
        await this.stop()
    }
}
