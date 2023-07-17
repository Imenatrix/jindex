import http from 'http'
import os from 'os'
import { publicIpv4 } from 'public-ip'

export function isPortOpen(port : number) {
    return new Promise((resolve, reject) => {
        const server = http.createServer()
            .listen(port, () => {
                server.close()
                resolve(true)
            })
            .on('error', () => {
                resolve(false)
            })
    })
}

export function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const alias of iface ?? []) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

export async function getPublicIP() {
    return await publicIpv4()
}