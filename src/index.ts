import { config } from "dotenv"
config()

import { createChannel, createInput, startChannel } from "./livestream"

(async () => {
    await createInput()
    await createChannel()
    await startChannel()
})()