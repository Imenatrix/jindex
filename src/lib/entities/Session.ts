export default class Session {
    id : string
    time : Date
    segments : string[]

    constructor(id : string, time : Date, segments : string[]) {
        this.id = id
        this.time = time
        this.segments = segments
    }
}