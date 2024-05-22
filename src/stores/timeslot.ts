import { defineStore } from 'pinia';
import type { Timeslot } from '@/model/Timeslot';

export const useTimeslotStore = defineStore('timeslot', {
  state: () => {
    return {
      timeslots: [] as Timeslot[],
      ids: 1
    }
  },
  actions: {
    add(timeslot: Omit<Timeslot, 'id'>) {
      this.timeslots.push({id: this.ids++, ...timeslot});
    }
  },
})