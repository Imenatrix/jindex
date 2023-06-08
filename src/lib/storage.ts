import { exec } from 'child_process'

// TODO: Implement in javascript
export function createBucket(bucketName : string) {
    return new Promise<void>((resolve, reject) => {
        exec(`gsutil mb gs://${bucketName}`, (error, stdout, sterr) => {
            console.log(stdout)
            console.error(sterr)
            resolve()
        })
    })
}

// TODO: Implement in javascript
export function makeBucketPublic(bucketName : string) {
    return new Promise<void>((resolve, reject) => {
        exec(`gcloud storage buckets add-iam-policy-binding gs://${bucketName} --member=allUsers --role=roles/storage.objectViewer`, (error, stdout, sterr) => {
            console.log(stdout)
            console.error(sterr)
            resolve()
        })
    })
}

// TODO: Implement in javascript
export function setupBucketCors(bucketName : string) {
    return new Promise<void>((resolve, reject) => {
        exec(`gsutil cors set src/lib/cors.json gs://${bucketName}`, (error, stdout, sterr) => {
            console.log(stdout)
            console.error(sterr)
            resolve()
        })
    })
}