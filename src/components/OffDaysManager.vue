<script setup lang="ts">
import { ref } from 'vue';
import { useOffDaysStore } from '../stores/offDays';
import { weekDays } from '../constants';

const offDaysStore = useOffDaysStore();
const addOffDayModal = ref(null);
const offDaySelect = ref(null);
const offDayError = ref(false);

function addOffDay() {
  if(offDaySelect.value?.value === '8') {
    offDayError.value = true;
    return;
  }

  if(offDaySelect.value?.value) {
    offDaysStore.add(+offDaySelect.value.value)
    offDaySelect.value.value = '8';
    offDayError.value = false;
    hideAddOffDayModal();
  }
}

function showAddOffDayModal() {
  addOffDayModal.value?.showModal();
}

function hideAddOffDayModal() {
  addOffDayModal.value?.close();
}

</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">Giorni di chiusura</h1>

    <div class="py-4">
      <span class="block" v-if="offDaysStore.offDays.length === 0">Nessun giorno di chiusura presente</span>

      <div class="flex mb-1" v-for="o in offDaysStore.offDays">
        {{ weekDays.find(wD => wD.id === o)?.name }}
      </div>
    </div>
    <button class="btn btn-primary" @click="showAddOffDayModal">Aggiungi</button>
  </div>

  <dialog ref="addOffDayModal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Crea giorno di chiusura</h3>

      <div class="py-4">
        <span class="block mb-2">I giorni di chiusura sono fondamentali per il riposo degli operatori e per la loro qualitá di vita.</span>

        <select
          ref="offDaySelect"
          class="select select-bordered w-full max-w-xs"
          :class="{ 'border-2 border-error': offDayError}">
          <option disabled selected value="8">Scegli giorno di chiusura</option>
          <option v-for="d in weekDays" :value="d.id">{{ d.name }}</option>
        </select>
        <span v-if="offDayError" class="block text-error">Questo campo é richiesto</span>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" @click="addOffDay">Crea</button>
      </div>
    </div>
  </dialog>
</template>
