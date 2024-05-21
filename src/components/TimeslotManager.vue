<script setup lang="ts">
import { ref } from 'vue';
import { useTimeslotStore } from '../stores/timeslot';

const timeslotStore = useTimeslotStore();
const addTimeslotModal = ref(null);
const timeslotName = ref(null);
const timeslotStart = ref(null);
const timeslotEnd = ref(null);
const timeslotTimeRanges = ref([] as {start: number, end: number}[]);
const timeslotNameError = ref(false);
const timeslotTimeRangesError = ref(false);
const timeslotTimeRangesNotNumberError = ref(false);

// timeslotStore.add({name: 'giornata', timeRanges: [{start: 11, end: 15}, {start: 18, end: 20}]});

function addTimeslot() {
  if(timeslotName.value?.value && timeslotTimeRanges.value.length !== 0) {
    timeslotStore.add({name: timeslotName.value?.value, timeRanges: timeslotTimeRanges.value});
    timeslotName.value.value = '';
    timeslotTimeRanges.value = [];
    timeslotNameError.value = false;
    timeslotTimeRangesError.value = false;
    timeslotTimeRangesNotNumberError.value = false;
    hideAddTimeslotModal();
  } else {
    timeslotTimeRanges.value.length === 0 ? timeslotTimeRangesError.value = true : timeslotTimeRangesError.value = false;
    !timeslotName.value?.value ? timeslotNameError.value = true : timeslotNameError.value = false;
  }
}

function showAddTimeslotModal() {
  addTimeslotModal.value?.showModal();
}

function hideAddTimeslotModal() {
  addTimeslotModal.value?.close();
}

function addTimeRange() {
  if(timeslotStart.value?.value && timeslotEnd.value?.value && !isNaN(timeslotStart.value?.value) && !isNaN(timeslotEnd.value?.value)) {
    timeslotTimeRanges.value.push({start: timeslotStart.value?.value, end: timeslotEnd.value?.value});
    timeslotStart.value.value = '';
    timeslotEnd.value.value = '';
    timeslotTimeRangesError.value = false;
    timeslotTimeRangesNotNumberError.value = false;
  } else {
    timeslotTimeRangesError.value = false;
    timeslotTimeRangesNotNumberError.value = true;
  }
}

</script>

<template>
  <div class="p-4 shadow">
    <h1 class="text-xl font-bold">Turni</h1>

    <div class="py-4">
      <span class="block" v-if="timeslotStore.timeslots.length === 0">Nessun turno presente</span>

      <div class="flex" v-for="t in timeslotStore.timeslots">
        <div>
          <span class="font-bold mr-2">{{ t.id }}</span>
          <span>{{ t.name }}:</span>
          <span v-for="r in t.timeRanges" class="ml-2">{{ r.start + '-' + r.end }}</span>
        </div>
      </div>
    </div>
    <button class="btn btn-primary" @click="showAddTimeslotModal">Aggiungi</button>
  </div>

  <dialog ref="addTimeslotModal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Crea turno</h3>

      <div class="py-4">
        <input ref="timeslotName"
          type="text"
          placeholder="Nome turno"
          class="input input-bordered w-full max-w-xs"
          :class="{ 'border-2 border-error': timeslotNameError}"/>
        <span v-if="timeslotNameError" class="block text-error">Questo campo é richiesto</span>

        <h4 class="text-lg py-2">Intervalli temporali</h4>
        <span class="block mb-2">Ogni turno é composto da uno o piú intervalli di tempo. Questi intervalli sono definiti con ora di inizio e ora di fine (formato 24h).</span>

        <div class="mb-2">
          <span v-for="r in timeslotTimeRanges" class="ml-2 font-bold">{{ r.start + '-' + r.end }}</span>
        </div>

        <div class="flex justify-between">
          <input ref="timeslotStart"
            type="number"
            placeholder="Inizio"
            min="0"
            max="24"
            class="input input-bordered w-1/3"
            :class="{ 'border-2 border-error': timeslotTimeRangesError || timeslotTimeRangesNotNumberError}"/>

          <input ref="timeslotEnd"
            type="number"
            placeholder="Fine"
            min="0"
            max="24"
            class="input input-bordered w-1/3"
            :class="{ 'border-2 border-error': timeslotTimeRangesError || timeslotTimeRangesNotNumberError}"/>

          <button class="btn btn-primary" @click="addTimeRange">Aggiungi</button>
        </div>
        <span v-if="timeslotTimeRangesError" class="block text-error">Almeno un intervallo temporale richiesto</span>
        <span v-if="timeslotTimeRangesNotNumberError" class="block text-error">Inserire un numero valido</span>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" @click="addTimeslot">Crea</button>
      </div>
    </div>
  </dialog>
</template>
