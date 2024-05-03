export interface Timeslot {
    id: number,
    name: string
    timeRanges: {start: number, end: number}[]
}