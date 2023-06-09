
import { v1 } from '@google-cloud/livestream'
const { LivestreamServiceClient } = v1
const livestreamServiceClient = new LivestreamServiceClient()
 
export async function createInput(projectId : string, location : string, inputId : string) {
    const request : any = {
        parent: livestreamServiceClient.locationPath(projectId, location),
        inputId: inputId,
        input: {
            type: 'RTMP_PUSH',
        },
    }

    const [operation] = await livestreamServiceClient.createInput(request)
    const response = await operation.promise()
    const [input] = response
    console.log(`Input: ${input.name}`)
}

export async function createChannel(projectId : string, location : string, inputId : string, channelId : string, outputUri : string) {
    const request : any = {
      parent: livestreamServiceClient.locationPath(projectId, location),
      channelId: channelId,
      channel: {
        inputAttachments: [
          {
            key: 'my-input',
            input: livestreamServiceClient.inputPath(
              projectId,
              location,
              inputId
            ),
          },
        ],
        output: {
          uri: outputUri,
        },
        elementaryStreams: [
          {
            key: 'es_video',
            videoStream: {
              h264: {
                profile: 'high',
                heightPixels: 720,
                widthPixels: 1280,
                bitrateBps: 3000000,
                frameRate: 30,
              },
            },
          },
          {
            key: 'es_audio',
            audioStream: {
              codec: 'aac',
              channelCount: 2,
              bitrateBps: 160000,
            },
          },
        ],
        muxStreams: [
          {
            key: 'mux_video',
            elementaryStreams: ['es_video'],
            segmentSettings: {
              seconds: 2,
            },
          },
          {
            key: 'mux_audio',
            elementaryStreams: ['es_audio'],
            segmentSettings: {
              seconds: 2,
            },
          },
        ],
        manifests: [
          {
            fileName: 'manifest.m3u8',
            type: 'HLS',
            muxStreams: ['mux_video', 'mux_audio'],
            maxSegmentCount: 5,
          },
        ],
      },
    }

    const [operation] = await livestreamServiceClient.createChannel(request)
    const response = await operation.promise()
    const [channel] = response
    console.log(`Channel: ${channel.name}`)
}

export async function startChannel(projectId : string, location : string, channelId : string) {
    const request = {
      name: livestreamServiceClient.channelPath(projectId, location, channelId),
    }
    const [operation] = await livestreamServiceClient.startChannel(request)
    await operation.promise()
    console.log('Started channel')
}

export async function getInput(projectId : string, location : string, inputId : string) {
  const request = {
    name: livestreamServiceClient.inputPath(projectId, location, inputId),
  }
  const [input] = await livestreamServiceClient.getInput(request)
  return input
}

export async function stopChannel(projectId : string, location : string, channelId : string) {
  const request = {
    name: livestreamServiceClient.channelPath(projectId, location, channelId),
  };
  const [operation] = await livestreamServiceClient.stopChannel(request);
  await operation.promise();
  console.log('Stopped channel');
}