import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import '$lib/firebase'
import { collection, getFirestore, getDocs, where, query } from 'firebase/firestore'
import Downloader from '$lib/services/Downloader'
import { SessionFactory } from '$lib/factories/SessionFactory.js'
import { Storage } from '@google-cloud/storage'
import { env } from '$env/dynamic/private'
import { Readable } from 'stream'

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

        const sessions = await Promise.all((await getDocs(query(collection(db, 'sessions'), where('camera_id', '==', id)))).docs.map(doc => SessionFactory.converter.fromFirestore(doc, {})))
        const downloader = new Downloader(SEGMENT_LENGTH, sessions)
        const filenames = downloader.getSegmentsBetween(t0, t1)
        const out = await makeVideo(filenames)
        return new Response(out, {
            status : 200,
            headers : {
                'Content-Type': 'video/mp4',
                'Content-Disposition': 'attachment; filename=video.mp4',
            },
        })
    }
}

async function makeVideo(files : string[]) : Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
        const storage = new Storage()
        const videos = await Promise.all(files.map(async (file) => {
            const [video] = await storage.bucket(env.PROJECT ?? '').file(file).download()
            return video
        }))
        const video = Buffer.concat(videos)
        const buffers : Buffer[] = []
        const command = ffmpeg()
            .input(Readable.from(video))
            .audioCodec('aac')
            .videoCodec('libx264')
            .format('mpegts')
            .on('end', () => console.log('Finished'))
            .pipe()
        let out : Buffer
        command.on('data', (chunk : Buffer) => {
            buffers.push(chunk)
        })
        command.on('end', () => {
            out = Buffer.concat(buffers)
            resolve(out)
        })
    })
}