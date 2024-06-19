import { defineStore } from 'pinia';
import type { Plan } from '@/model/Plan';

export const usePlanStore = defineStore('plan', {
  state: () => {
    return {
      plan: {} as Plan
    }
  },
  actions: {
    updatePlan(plan: Plan) {
      this.plan = plan;
    }
  },
})