import type { MonthPlan } from './MonthPlan';
import type { PlanStatistics } from './PlanStatistics';

export interface Plan {
    monthPlans: MonthPlan[],
    planStatistics: PlanStatistics
}