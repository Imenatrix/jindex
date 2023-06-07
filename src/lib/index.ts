import { config } from "dotenv"
config()

import { createChannel, createInput, getInput, startChannel } from "./livestream"
import { setup } from "./setup"

const projectId = process.env['PROJECT'] ?? ''
const location = process.env['LOCATION'] ?? ''
const inputId = process.env['INPUT_ID'] ?? ''
const channelId = process.env['CHANNEL_ID'] ?? ''
const outputUri = 'gs://' + process.env['PROJECT'] ?? ''

;(async () => {
    // setup()
    await createInput(projectId, location, inputId)
    await createChannel(projectId, location, inputId, channelId, outputUri)
    await startChannel(projectId, location, channelId)
    const input = await getInput(projectId, location, inputId);
    console.log(input.uri)
})()