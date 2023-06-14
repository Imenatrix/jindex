import { exec } from 'child_process'

export function coiso(input : string, output : string) {
    exec(compose([
        'ffmpeg',
        '-fflags nobuffer',
        '-rtsp_transport tcp',
        `-i "${input}"`,
        `-hls_segment_filename "https://lateral-land-389613.storage.googleapis.com/${output}/%03d.ts"`,
        '-vcodec copy',
        '-segment_list_flags live',
        '-method PUT',
        '-headers "Cache-Control: no-cache"',
        `"https://lateral-land-389613.storage.googleapis.com/${output}/manifest.m3u8"`,
    ]), (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
    })
}

function compose(args : string[]) {
    return args.join(' ')
}