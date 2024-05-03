// stores/counter.js
import { defineStore } from 'pinia';
import type { Operator } from '@/model/Operator';

export const useOperatorStore = defineStore('operator', {
  state: () => {
    return {
      operators: [] as Operator[],
      ids: 0
    }
  },
  getters: {
    operators: (state) => state.operators
  },
  actions: {
    add(operator: Omit<Operator, 'id'>) {
      this.operators.push({id: this.ids++, ...operator});
    },
  },
})