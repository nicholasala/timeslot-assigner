import type { WorkDay } from './WorkDay';

export interface MonthPlan {
    monthName: string,
    workDays: WorkDay[]
}