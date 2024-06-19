import type { Operator } from './Operator'

export interface PlanStatistics {
    operatorsWorkingHours: {
        operator: Operator,
        total: number
    }[];
}