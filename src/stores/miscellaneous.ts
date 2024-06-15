import { DEFAULT_WEEKS_TO_PLAN_NUMBER } from '@/constants';
import { defineStore } from 'pinia';

export const useMiscellaneousStore = defineStore('miscellaneous', {
  state: () => {
    return {
      activityName: 'TimeslotAssigner',
      weeksToPlan: DEFAULT_WEEKS_TO_PLAN_NUMBER
    }
  },
  actions: {
    editActivityName(activityName: string) {
      this.activityName = activityName
    },
    editWeeksToPlan(weeksToPlan: number) {
      this.weeksToPlan = weeksToPlan;
    }
  }
})