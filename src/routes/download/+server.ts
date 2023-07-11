import { SessionFactory } from "$lib/factories/SessionFactory"
import Downloader from "$lib/services/Downloader"
import { collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore"
import { env } from "$env/dynamic/private"
import { Readable } from 'stream'
import ffmpeg from 'fluent-ffmpeg'
import { Storage } from '@google-cloud/storage'

const SEGMENT_LENGTH = 2

export async function POST({ request }) {
    let { id, t0, t1 } = await request.json()
    t0 = new Date(t0)
    t1 = new Date(t1)


    const db = getFirestore()

    const sessions = await Promise.all((await getDocs(query(collection(db, 'sessions'), where('camera_id', '==', id), orderBy('session_id')))).docs.map(doc => SessionFactory.converter.fromFirestore(doc, {})))
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
            .on('error', (err) => console.log(err))
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