import type { AssignedTimeslot } from './AssignedTimeslot'

export interface WorkDay {
    date: number,
    plan: AssignedTimeslot[],
    isOff: boolean,
    isStartOfRound: boolean
}