<script setup lang="ts">
import { useMiscellaneousStore } from '@/stores/miscellaneous';
import { ref } from 'vue';
import { MAX_PLANNABLE_WEEKS_NUMBER, DEFAULT_WEEKS_TO_PLAN_NUMBER } from '@/constants';
import { onMounted } from 'vue'

const miscellaneousStore = useMiscellaneousStore();
const editMiscellaneousModal = ref(null);
const activityName = ref(null);
const weeksToPlan = ref(null);
const weeksNumberError = ref(false);

function saveMiscellaneous() {
  if(!weeksToPlan.value?.value || isNaN(weeksToPlan.value?.value)) {
    weeksNumberError.value = true;
    return;
  }

  if(+weeksToPlan.value?.value < 1 || +weeksToPlan.value?.value > MAX_PLANNABLE_WEEKS_NUMBER)
    weeksToPlan.value.value = DEFAULT_WEEKS_TO_PLAN_NUMBER;

  miscellaneousStore.editWeeksToPlan(+weeksToPlan.value?.value);
  weeksNumberError.value = false;
  hideEditMiscellaneousModal();
}

function showEditMiscellaneousModal() {
  editMiscellaneousModal.value?.showModal();
}

function hideEditMiscellaneousModal() {
  editMiscellaneousModal.value?.close();
}

onMounted(() => {
  if(activityName.value)
    activityName.value.value = miscellaneousStore.activityName;

  if(weeksToPlan.value)
    weeksToPlan.value.value = miscellaneousStore.weeksToPlan;
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">Varie</h1>

    <div class="py-4">
      <span class="block">Nome attivitá: {{ miscellaneousStore.activityName }}</span>
      <span class="block">Settimane da pianificare: {{ miscellaneousStore.weeksToPlan }}</span>
    </div>
    <button class="btn btn-primary" @click="showEditMiscellaneousModal">Modifica</button>
  </div>

  <dialog ref="editMiscellaneousModal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Varie impostazioni</h3>

      <div class="py-4">
        <span class="block mb-2">Numero di settimane da 1 a {{ MAX_PLANNABLE_WEEKS_NUMBER }}</span>
        <input ref="weeksToPlan"
          type="number"
          placeholder="Numero di settimane da pianificare"
          class="input input-bordered w-full max-w-xs"
          :class="{ 'border-2 border-error': weeksNumberError}"/>
        <span v-if="weeksNumberError" class="block text-error">Inserire un numero valido</span>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" @click="saveMiscellaneous">Salva</button>
      </div>
    </div>
  </dialog>
</template>
