import { LOCATION, PROJECT } from '$env/static/private'
import '$lib/firebase'
import { createChannel, createInput, getInput, startChannel } from '$lib/livestream.js'
import { addDoc, collection, getFirestore, updateDoc } from 'firebase/firestore'


function toKebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .toLowerCase(); // Convert to lowercase
}

export const actions = {
    create : async ({ request }) => {
        const data = await request.formData()
        const db = getFirestore()
        const cameras = collection(db, 'cameras')

        const name = data.get('name') as string
        const slug = toKebabCase(name)
        const inputId = slug + '-input'
        const channelId = slug + '-channel'
        const outputName = (slug as string) + '_output'
        const outputUrl = 'gs://' + PROJECT + '/' + outputName

        const doc = await addDoc(cameras, {
            name : name,
            status : 'CREATING'
        })
        await createInput(PROJECT, LOCATION, inputId)
        await createChannel(PROJECT, LOCATION, inputId, channelId, outputUrl)
        await startChannel(PROJECT, LOCATION, channelId)
        const input = await getInput(PROJECT, LOCATION, inputId)

        updateDoc(doc, {
            status : 'ACTIVE',
            input_uri : input.uri,
            output_uri : `https://storage.googleapis.com/${PROJECT}/${outputName}/manifest.m3u8`
        })
    }
}