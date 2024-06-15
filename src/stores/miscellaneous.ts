import { defineStore } from 'pinia';

export const useMiscellaneousStore = defineStore('miscellaneous', {
  state: () => {
    return {
      activityName: 'Bar Bisse',
      weeksToPlan: 4
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