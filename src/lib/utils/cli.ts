import { spawn } from 'child_process'

export function run(command : string[]) {
    const cmd = command[0]
    const args = command.slice(1)
    const process = spawn(cmd, args)
    process.stdout.on('data', (data) => {
      console.log(data.toString())
    })
    process.stderr.on('data', (data) => {
      console.log(data.toString())
    })
    return process

}
