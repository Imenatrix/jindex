import { createBucket, makeBucketPublic, setupBucketCors } from "./storage"

const bucketName = process.env['PROJECT'] ?? 'livestream'

export async function setup () {
    await createBucket(bucketName)
    await makeBucketPublic(bucketName)
    await setupBucketCors(bucketName)
}