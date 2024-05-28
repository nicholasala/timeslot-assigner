import type { Operator } from "./Operator"

export interface PlanningStatistics {
    operatorsWorkingHours: {
        operator: Operator,
        total: number
    }[];
}