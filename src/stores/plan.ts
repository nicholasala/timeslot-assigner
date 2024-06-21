import { defineStore } from 'pinia';
import type { Plan } from '@/model/Plan';
import type { PlanStatistics } from '@/model/PlanStatistics';

export const usePlanStore = defineStore('plan', {
  state: () => {
    return {
      plan: {} as Plan
    }
  },
  actions: {
    setPlan(plan: Plan) {
      this.plan = plan;
    },
    setPlanStatistics(planStatistics: PlanStatistics) {
      this.plan.planStatistics = planStatistics;
    }
  },
})