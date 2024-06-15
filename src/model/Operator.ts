export interface Operator {
    id: number,
    name: string,
    color: string,
    planningStartTimeslotId: number,
    notAssignableTimeslot?: number
}