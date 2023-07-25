import type Session from "$lib/entities/Session"

export default class Downloader {
    segment_length : number
    sessions : Session[]

    constructor(segment_length : number, sessions : Session[]) {
        this.segment_length = segment_length,
        this.sessions = sessions
    }

    getSessionSlice(t0 : Date, t1 : Date) : [number, number] {
        let start : number
        let end : number
        const start_times = this.sessions.map(session => session.time)
        const end_times = this.sessions.map(session => {
            const session_length = session.segments.length * this.segment_length
            const end = new Date(session.time.getTime())
            end.setSeconds(end.getSeconds() + session_length)
            return end
        })
        for (start = 0; end_times[start] < t0; start++) { /* empty */ }
        for (end = 0; start_times[end] < t1; end++) { /* empty */ }
        end--
        start = Math.max(0, start)
        start = Math.min(this.sessions.length - 1, start)
        end = Math.max(0, end)
        end = Math.min(this.sessions.length - 1, end)
        return [start, end]
    }

    getSegmentSliceFromSession(session_index : number, t : Date) : number {
        const session = this.sessions[session_index]
        const delta = (t.getTime() - session.time.getTime()) / 1000
        let index = delta / this.segment_length
        index = Math.floor(index)
        index = Math.max(0, index)
        index = Math.min(session.segments.length, index)
        return index
    }

    getSegmentsBetween(t0 : Date, t1 : Date) {
        const [start, end] = this.getSessionSlice(t0, t1)
        const index = this.getSegmentSliceFromSession(start, t0)
        const jindex = this.getSegmentSliceFromSession(end, t1)
        const filenames = []
        for (let i = start; i <= end; i++) {
            const session = this.sessions[i]
            for (let j = i == start ? index : 0; j < (i == end ? jindex : session.segments.length); j++) {
                const segment = session.segments[j]
                filenames.push(segment)
            }
        }
        return filenames
    }
}
