import type { WorkDay } from './WorkDay';

export interface Plan {
    monthName: string,
    workDays: WorkDay[]
}