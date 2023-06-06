import { createBucket, makeBucketPublic, setupBucketCors } from "./storage"

export async function setup () {
    await createBucket()
    makeBucketPublic()
    setupBucketCors()
}