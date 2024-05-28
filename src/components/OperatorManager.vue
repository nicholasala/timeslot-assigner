<script setup lang="ts">
import { ref } from 'vue';
import { useOperatorStore } from '../stores/operator';
import { useTimeslotStore } from '../stores/timeslot';
import type { Timeslot } from '@/model/Timeslot';
import type { Operator } from '@/model/Operator';
import OperatorCard from './OperatorCard.vue';

const operatorStore = useOperatorStore();
const timeslotStore = useTimeslotStore();
const addOperatorModal = ref(null);
const operatorName = ref(null);
const notAssignableTimeslots = ref([] as Timeslot[]);
const planningStartTimeslotSelect = ref(null);
const notAssignableTimeslotsSelect = ref(null);
const operatorColors = ['#aa50f4', '#efa823', '#2a23ef', '#32bf2f', '#ef3123'];
const operatorNameError = ref(false);
let colorCursor = 0;

function addOperator() {
  if(operatorName.value?.value) {
    const operator: Omit<Operator, 'id'> = {
      name: operatorName.value?.value,
      color: nextColor(),
      planningStartTimeslotId: +planningStartTimeslotSelect.value?.value
    };

    if(notAssignableTimeslots.value.length !== 0)
      operator.notAssignableSlots = notAssignableTimeslots.value.map(t => t.id);

    operatorStore.add(operator);
    operatorName.value.value = '';
    notAssignableTimeslots.value = [];
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

function addNotAssignableTimeslot(timeslot: Timeslot) {
  if(notAssignableTimeslots.value.find(t => t.id === timeslot.id) === undefined)
    notAssignableTimeslots.value.push(timeslot);

  if(notAssignableTimeslotsSelect.value)
    notAssignableTimeslotsSelect.value.value = 0;
}

function getAssignablePlanningStartTimeslots(): Timeslot[] {
  return timeslotStore.timeslots.filter(t => operatorStore.operators.find(o => o.planningStartTimeslotId === t.id) === undefined);
}

</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">Operatori</h1>

    <div class="py-4">
      <span class="block" v-if="operatorStore.operators.length === 0">Nessun operatore presente</span>

      <div class="flex mb-1" v-for="o in operatorStore.operators">
        <OperatorCard :operator="o"></OperatorCard>
        <span class="ml-2">(Inizia con: {{ timeslotStore.timeslots.find(t => t.id === o.planningStartTimeslotId)?.name }})</span>
        <span class="ml-2" v-if="o.notAssignableSlots && o.notAssignableSlots?.length !== 0">(No:
          <span v-for="tId in o.notAssignableSlots" class="ml-2">{{ timeslotStore.timeslots.find(t => t.id === tId)?.name }}</span>
        )</span>
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
          :class="{ 'border-2 border-error': operatorNameError}"/>
        <span v-if="operatorNameError" class="block text-error">Questo campo é richiesto</span>

        <h4 class="text-lg py-2">Turno iniziale</h4>
        <span class="block mb-2">L'operatore inizierá la pianificazione con il turno: </span>

        <select ref="planningStartTimeslotSelect" class="select select-bordered w-full max-w-xs">
          <template v-for="t in timeslotStore.timeslots">
            <option v-if="operatorStore.operators.find(o => o.planningStartTimeslotId === t.id) === undefined"
              :value="t.id">{{ t.name }}</option>
          </template>
        </select>

        <h4 class="text-lg py-2">Turni non assegnabili</h4>
        <span class="block mb-2">Ogni operatore puó avere uno o piú turni non assegnabili.</span>

        <div class="mb-2">
          <span v-for="t in notAssignableTimeslots" class="ml-2 font-bold">{{ t.name }}</span>
        </div>

        <select ref="notAssignableTimeslotsSelect" class="select select-bordered w-full max-w-xs">
          <option disabled selected value="0">Scegli turno non assegnabile</option>
          <option v-for="t in timeslotStore.timeslots" @click="() => addNotAssignableTimeslot(t)">{{ t.name }}</option>
        </select>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" @click="addOperator">Crea</button>
      </div>
    </div>
  </dialog>
</template>
