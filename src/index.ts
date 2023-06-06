import { config } from "dotenv"
config()

import { createChannel, createInput, getInput, startChannel } from "./livestream"
import { setup } from "./setup"

(async () => {
    // setup()
    await createInput()
    await createChannel()
    await startChannel()
    const input = await getInput();
    console.log(input.uri)
})()