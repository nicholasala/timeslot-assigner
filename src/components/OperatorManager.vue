<script setup lang="ts">
import { ref } from 'vue';
import { useOperatorStore } from '../stores/operator';

const operatorStore = useOperatorStore();
const addOperatorModal = ref(null);
const operatorName = ref(null);
const operatorColors = ['#aa50f4', '#efa823', '#2a23ef', '#32bf2f', '#ef3123'];
let operatorNameError = ref(false);
let colorCursor = 0;

// operatorStore.add({name: 'Alice', color: '#32bf2f', notAssignableSlots: [0]});

function addOperator() {
  if(operatorName.value?.value) {
    operatorStore.add({name: operatorName.value?.value, color: nextColor()});
    operatorName.value.value = '';
    operatorNameError.value = false;
    hideAddOperatorModal();
  } else {
    operatorNameError.value = true;
  }
}

function showAddOperatorModal() {
  addOperatorModal.value?.showModal();
}

function hideAddOperatorModal() {
  addOperatorModal.value?.close();
}

function nextColor(): string {
  const color = operatorColors[colorCursor];
  colorCursor++;

  if(colorCursor === operatorColors.length)
    colorCursor = 0;

  return color;
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
    <button class="btn btn-primary" @click="showAddOperatorModal">Aggiungi</button>
  </div>

  <dialog ref="addOperatorModal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Crea operatore</h3>

      <div class="py-4">
        <input ref="operatorName"
          type="text"
          placeholder="Nome operatore"
          class="input input-bordered w-full max-w-xs"
          :class="{ 'border-2 border-rose-600': operatorNameError}"/>
        <span v-if="operatorNameError" class="block text-rose-600">Questo campo é richiesto</span>
      </div>

      <div class="modal-action">
        <button class="btn" @click="addOperator">Crea</button>
      </div>
    </div>
  </dialog>
</template>
