import { createBucket, makeBucketPublic, setupBucketCors } from "./storage"
import { env } from "$env/dynamic/private"

const bucketName = env.PROJECT

export async function setup () {
    await createBucket(bucketName)
    await makeBucketPublic(bucketName)
    await setupBucketCors(bucketName)
}
