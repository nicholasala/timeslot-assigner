<script setup lang="ts">
import { useOperatorStore } from '../stores/operator';

const operatorStore = useOperatorStore();

// operatorStore.add({name: 'Marti', color: '#aa50f4'});
// operatorStore.add({name: 'Alice', color: '#32bf2f', notAssignableSlots: [0]});
// operatorStore.add({name: 'Betti', color: '#2f3ee2'});

function addOperator() {
  operatorStore.add({name: 'Marti', color: '#aa50f4'});
}

</script>

<template>
  <div class="p-4 shadow">
    <h1 class="text-xl font-bold">Operatori</h1>

    <div class="py-4">
      <span class="block" v-if="operatorStore.operators.length === 0">Nessun operatore presente</span>

      <div class="flex" v-for="o in operatorStore.operators">
        <div class="h-4 w-4 rounded mx-2" :style="'background-color: ' + o.color"></div>
      <div>{{ o.name }}</div> 
    </div>
    </div>
    <button class="btn btn-primary" v-on:click="addOperator">Aggiungi</button>
  </div>
</template>
