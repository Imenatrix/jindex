import { config } from "dotenv"
config()

import { createChannel, createInput, startChannel } from "./livestream"
import { setup } from "./setup"

(async () => {
    // setup()
    await createInput()
    await createChannel()
    await startChannel()
})()