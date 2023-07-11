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