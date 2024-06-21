import { defineStore } from 'pinia';
import type { Operator } from '@/model/Operator';

// Operator store
// * operators: list of operators
// * ids: counter of new id for new operator. Must start with 1 because in select tag 0 is already used as value by the default placeholder option
export const useOperatorStore = defineStore('operator', {
  state: () => {
    return {
      operators: [] as Operator[],
      ids: 1
    }
  },
  actions: {
    add(operator: Omit<Operator, 'id'>) {
      this.operators.push({id: this.ids++, ...operator});
    }
  },
})