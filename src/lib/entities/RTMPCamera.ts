import type { ICamera } from "./ICamera"
import { createChannel, createInput, getInput, startChannel } from "$lib/livestream"
import { toKebabCase } from "$lib/utils/strings"
import { LOCATION, PROJECT } from "$env/static/private"

export class RTMPCamera implements ICamera {

    name : string
    protocol : 'RTMP' | 'RTSP' = 'RTMP'
    status : 'CREATING' | 'ACTIVE' | 'STOPPED'
    input_uri : string | null = null
    output_uri: string

    constructor(name : string) {
        this.name = name
        this.status = 'CREATING'
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
        await startChannel(PROJECT, LOCATION, channelId)
        const input = await getInput(PROJECT, LOCATION, inputId)
        if (input.uri != undefined) {
            this.input_uri = input.uri
        }
        this.status = 'ACTIVE'
    }

    async start() {
        const slug = toKebabCase(this.name)
        const channelId = slug + '-channel'
        await startChannel(PROJECT, LOCATION, channelId)
        this.status = 'ACTIVE'
        return
    }
}