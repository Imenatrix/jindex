import type { ICamera } from "./ICamera"
import { createChannel, createInput, deleteChannel, deleteInput, getInput, startChannel, stopChannel } from "$lib/livestream"
import { toKebabCase } from "$lib/utils/strings"
import { LOCATION, PROJECT } from "$env/static/private"

export class RTMPCamera implements ICamera {

    name : string
    protocol : 'RTMP' | 'RTSP' = 'RTMP'
    status : 'CREATING' | 'ACTIVE' | 'STOPPED' | 'STOPPING' | 'ACTIVATING' | 'DELETING'
    input_uri : string | null = null
    output_uri: string

    constructor(name : string, input_uri? : string, status? : 'CREATING' | 'ACTIVE' | 'STOPPED' ) {
        this.name = name
        this.input_uri = input_uri === undefined ? null : input_uri
        if (status != undefined) {
            this.status = status
        }
        else {
            this.status = 'CREATING'
        }
        const slug = toKebabCase(this.name)
        const outputName = slug + '-output'
        this.output_uri = `https://storage.googleapis.com/${PROJECT}/${outputName}/manifest.m3u8`
    }

    async setup() {
        const slug = toKebabCase(this.name)
        const inputId = slug + '-input'
        const channelId = slug + '-channel'
        const outputName = slug + '-output'
        const outputUrl = 'gs://' + PROJECT + '/' + outputName

        await createInput(PROJECT, LOCATION, inputId)
        await createChannel(PROJECT, LOCATION, inputId, channelId, outputUrl)
        //await startChannel(PROJECT, LOCATION, channelId)
        const input = await getInput(PROJECT, LOCATION, inputId)
        if (input.uri != undefined) {
            this.input_uri = input.uri
        }
        this.status = 'STOPPED'
    }

    async start() {
        const slug = toKebabCase(this.name)
        const channelId = slug + '-channel'
        await startChannel(PROJECT, LOCATION, channelId)
        this.status = 'ACTIVE'
    }

    async stop() {
        if (this.status == 'ACTIVE') {
            const slug = toKebabCase(this.name)
            const channelId = slug + '-channel'
            await stopChannel(PROJECT, LOCATION, channelId)
            this.status = 'STOPPED'
        }
    }

    async delete() {
        const slug = toKebabCase(this.name)
        const inputId = slug + '-input'
        const channelId = slug + '-channel'
        this.stop()
        await deleteChannel(PROJECT, LOCATION, channelId)
        await deleteInput(PROJECT, LOCATION, inputId)
    }
}
