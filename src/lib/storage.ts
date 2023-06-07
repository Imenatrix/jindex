import { exec } from 'child_process'

const bucketName = process.env['PROJECT'] ?? 'livestream'

// TODO: Implement in javascript
export function createBucket() {
    return new Promise<void>((resolve, reject) => {
        exec(`gsutil mb gs://${bucketName}`, (error, stdout, sterr) => {
            resolve()
        })
    })
}

// TODO: Implement in javascript
export function makeBucketPublic() {
    return new Promise<void>((resolve, reject) => {
        exec(`gcloud storage buckets add-iam-policy-binding gs://${bucketName} --member=allUsers --role=roles/storage.objectViewer`, (error, stdout, sterr) => {
            resolve()
        })
    })
}

// TODO: Implement in javascript
export function setupBucketCors() {
    return new Promise<void>((resolve, reject) => {
        exec(`gsutil cors set cors.json gs://${bucketName}`, (error, stdout, sterr) => {
            resolve()
        })
    })
}