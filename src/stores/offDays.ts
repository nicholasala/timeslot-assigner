import type { Day } from '@/model/Day';
import { defineStore } from 'pinia';

export const useOffDaysStore = defineStore('offDays', {
  state: () => {
    return {
      offDays: [] as number[]
    }
  },
  actions: {
    add(day: Day) {
      this.offDays.push(day.id);
    }
  }
})