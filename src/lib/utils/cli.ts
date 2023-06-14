import { exec } from 'child_process'

export function run(command : string) {
    return exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
    })
}