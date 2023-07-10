import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import '$lib/firebase'
import { collection, getFirestore, getDocs, where, query } from 'firebase/firestore'
import Downloader from '$lib/services/Downloader'
import { SessionFactory } from '$lib/factories/SessionFactory.js'

const SEGMENT_LENGTH = 2

export async function load() {
    const db = getFirestore()
    const cameras = collection(db, 'cameras')
    const data = (await getDocs(cameras)).docs.map(doc => ({
        id : doc.id,
        name : doc.data().name,
    }))
    return {
        cameras : data
    }
}

export const actions = {
    default : async ({ request }) => {
        const data = await request.formData()
        const id = data.get('id') as string
        const t0 = new Date(data.get('t0') as string)
        const t1 = new Date(data.get('t1') as string)

        const db = getFirestore()

        const sessions = (await getDocs(query(collection(db, 'sessions'), where('camera_id', '==', id)).withConverter(SessionFactory.converter))).docs.map(doc => doc.data())
        const downloader = new Downloader(SEGMENT_LENGTH, sessions)
        const filenames = downloader.getSegmentsBetween(t0, t1)
        makeVideo(filenames)
    }
}

function makeVideo(files : string[]) {
    const videos = files.map(file => fs.readFileSync('output/' + file))
    const video = Buffer.concat(videos)
    fs.writeFileSync('video.ts', video)
    ffmpeg().input('video.ts').output('video.mp4').on('end', () => console.log('Finished')).run()
}