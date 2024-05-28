import type { Timeslot } from './Timeslot'

export interface Operator {
    id: number,
    name: string,
    color: string,
    planningStartTimeslotId: number,
    notAssignableSlots?: number[],
}