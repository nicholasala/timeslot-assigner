import { defineStore } from 'pinia';
import type { Timeslot } from '@/model/Timeslot';

// Timeslot store
// * timeslots: list of timeslots
// * ids: counter of new id for new timeslot. Must start with 1 because in select tag 0 is already used as value by the default placeholder option
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