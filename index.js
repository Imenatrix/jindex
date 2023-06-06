import { createInput, createChannel, startChannel } from './livestream.js'

await createInput()
await createChannel()
await startChannel()