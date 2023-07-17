import http from 'http'

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