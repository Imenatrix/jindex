import { exec } from 'child_process'

const bucketName = process.env['PROJECT'] ?? 'livestream'

// TODO: Implement in javascript
export function createBucket() {
	exec(`gsutil mb gs://${bucketName}`)
}

// TODO: Implement in javascript
export function makeBucketPublic() {
    exec(`gcloud storage buckets add-iam-policy-binding gs://${bucketName} --member=allUsers --role=roles/storage.objectViewer`)
}

// TODO: Implement in javascript
export function setupBucketCors() {
    exec(`gsutil cors set cors.json gs://${bucketName}`)
}