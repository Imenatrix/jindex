import type { ICamera } from "./ICamera"
import { createChannel, createInput, deleteChannel, deleteInput, getInput, startChannel, stopChannel } from "$lib/livestream"
import { toKebabCase } from "$lib/utils/strings"
import { env } from "$env/dynamic/private"

export class RTMPCamera implements ICamera {

    name : string
    protocol : 'RTMP' | 'RTSP' = 'RTMP'
    status : 'CREATING' | 'ACTIVE' | 'STOPPED' | 'STOPPING' | 'ACTIVATING' | 'DELETING'
    input_uri : string | null = null
    output_uri : string
    current_session : number = 0

    constructor(name : string, input_uri? : string, status? : 'CREATING' | 'ACTIVE' | 'STOPPED', current_session? : number) {
        this.name = name
        this.input_uri = input_uri === undefined ? null : input_uri
        if (status != undefined) {
            this.status = status
        }
        else {
            this.status = 'CREATING'
        }
        if (current_session != undefined) {
            this.current_session = current_session
        }
        const slug = toKebabCase(this.name)
        const outputName = slug + '-output'
        this.output_uri = `https://storage.googleapis.com/${env.PROJECT}/${outputName}/manifest.m3u8`
    }

    async setup() {
        const slug = toKebabCase(this.name)
        const inputId = slug + '-input'
        const channelId = slug + '-channel'
        const outputName = slug + '-output'
        const outputUrl = 'gs://' + env.PROJECT + '/' + outputName

        await createInput(env.PROJECT, env.LOCATION, inputId)
        await createChannel(env.PROJECT, env.LOCATION, inputId, channelId, outputUrl)
        //await startChannel(env.PROJECT, env.LOCATION, channelId)
        const input = await getInput(env.PROJECT, env.LOCATION, inputId)
        if (input.uri != undefined) {
            this.input_uri = input.uri
        }
        this.status = 'STOPPED'
    }

    async start() {
        const slug = toKebabCase(this.name)
        const channelId = slug + '-channel'
        await startChannel(env.PROJECT, env.LOCATION, channelId)
        this.current_session += 1
        this.status = 'ACTIVE'
    }

    async stop() {
        if (this.status == 'ACTIVE') {
            const slug = toKebabCase(this.name)
            const channelId = slug + '-channel'
            await stopChannel(env.PROJECT, env.LOCATION, channelId)
            this.status = 'STOPPED'
        }
    }

    async delete() {
        const slug = toKebabCase(this.name)
        const inputId = slug + '-input'
        const channelId = slug + '-channel'
        this.stop()
        await deleteChannel(env.PROJECT, env.LOCATION, channelId)
        await deleteInput(env.PROJECT, env.LOCATION, inputId)
    }
}
