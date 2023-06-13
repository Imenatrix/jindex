import { LOCATION, PROJECT } from '$env/static/private';
import '$lib/firebase'
import { deleteChannel, deleteInput, startChannel, stopChannel } from '$lib/livestream';
import { deleteDoc, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'

function toKebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .toLowerCase(); // Convert to lowercase
}

export const actions = {
    stop : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const db = getFirestore()

        const ref = doc(db, 'cameras', id)
        const camera = await getDoc(ref)

        const name = camera.data()?.name as string
        const slug = toKebabCase(name)
        const channelId = slug + '-channel'
        await stopChannel(PROJECT, LOCATION, channelId)

        updateDoc(ref, {
            status : 'STOPPED'
        })
    },
    activate : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const db = getFirestore()

        const ref = doc(db, 'cameras', id)
        const camera = await getDoc(ref)

        const name = camera.data()?.name as string
        const slug = toKebabCase(name)
        const channelId = slug + '-channel'
        await startChannel(PROJECT, LOCATION, channelId)

        updateDoc(ref, {
            status : 'ACTIVE'
        })
    },
    delete : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const db = getFirestore()

        const ref = doc(db, 'cameras', id)
        const camera = await getDoc(ref)

        const name = camera.data()?.name as string
        const slug = toKebabCase(name)
        const inputId = slug + '-input'
        const channelId = slug + '-channel'
        await stopChannel(PROJECT, LOCATION, channelId)
        await deleteChannel(PROJECT, LOCATION, channelId)
        await deleteInput(PROJECT, LOCATION, inputId)

        deleteDoc(ref)
    }
}