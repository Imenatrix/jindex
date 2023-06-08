import { LOCATION, PROJECT } from '$env/static/private'
import '$lib/firebase'
import { createChannel, createInput, getInput, startChannel } from '$lib/livestream.js'
import { addDoc, collection, getFirestore, updateDoc } from 'firebase/firestore'

export const actions = {
    create : async ({ request }) => {
        const data = await request.formData()
        const db = getFirestore()
        const cameras = collection(db, 'cameras')

        const name = data.get('name')
        const inputId = (name as string) + '-input'
        const channelId = (name as string) + '-channel'
        const outputUrl = 'gs://' + PROJECT + '/' + (name as string) + '_output'

        const doc = await addDoc(cameras, {
            name : name,
            status : 'CREATING'
        })
        await createInput(PROJECT, LOCATION, inputId)
        await createChannel(PROJECT, LOCATION, inputId, channelId, outputUrl)
        await startChannel(PROJECT, LOCATION, channelId)
        const input = await getInput(PROJECT, LOCATION, inputId)

        updateDoc(doc, {
            status : 'DONE',
            uri : input.uri
        })
    }
}