import { setup } from '$lib/setup.js'

export const actions = {
    setup : async () => {
        await setup()
    }
}