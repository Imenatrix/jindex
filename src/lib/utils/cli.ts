import { spawn } from 'child_process'

export function run(command : string[]) {
    const cmd = command[0]
    const args = command.slice(1)
    return spawn(cmd, args)
}
