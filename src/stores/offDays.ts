import type { Day } from '@/model/Day';
import { defineStore } from 'pinia';

export const useOffDaysStore = defineStore('offDays', {
  state: () => {
    return {
      offDays: [] as number[]
    }
  },
  actions: {
    add(day: number) {
      if(this.offDays.find(o => o === day) === undefined)
        this.offDays.push(day);
    }
  }
})