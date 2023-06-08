import { createBucket, makeBucketPublic, setupBucketCors } from "./storage"
import { PROJECT } from "$env/static/private"

const bucketName = PROJECT

export async function setup () {
    await createBucket(bucketName)
    await makeBucketPublic(bucketName)
    await setupBucketCors(bucketName)
}