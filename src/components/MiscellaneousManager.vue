<script setup lang="ts">
import { useMiscellaneousStore } from '@/stores/miscellaneous';
import { ref } from 'vue';
import { MAX_PLANNABLE_WEEKS_NUMBER, DEFAULT_WEEKS_TO_PLAN_NUMBER } from '@/constants';
import { onMounted } from 'vue'

const miscellaneousStore = useMiscellaneousStore();
const editMiscellaneousModal = ref(null);
const activityName = ref(null);
const weeksToPlan = ref(null);
const activityNameError = ref(false);
const weeksNumberError = ref(false);

function saveMiscellaneous() {
  if(!activityName.value?.value)
    activityNameError.value = true;
  else
    activityNameError.value = false;

  if(!weeksToPlan.value?.value || isNaN(weeksToPlan.value?.value))
    weeksNumberError.value = true;
  else
    weeksNumberError.value = false;

  if(activityNameError.value || weeksNumberError.value)
    return;

  if(weeksToPlan.value && (+weeksToPlan.value?.value < 1 || +weeksToPlan.value?.value > MAX_PLANNABLE_WEEKS_NUMBER))
    weeksToPlan.value.value = DEFAULT_WEEKS_TO_PLAN_NUMBER;

  miscellaneousStore.editActivityName(activityName.value?.value);
  miscellaneousStore.editWeeksToPlan(+weeksToPlan.value?.value);
  activityNameError.value = false;
  weeksNumberError.value = false;
  hideEditMiscellaneousModal();
}

function showEditMiscellaneousModal() {
  editMiscellaneousModal.value?.showModal();
}

function hideEditMiscellaneousModal() {
  editMiscellaneousModal.value?.close();
}

function resetDialogData() {
  if(activityName.value)
    activityName.value.value = miscellaneousStore.activityName;

  if(weeksToPlan.value)
    weeksToPlan.value.value = miscellaneousStore.weeksToPlan;
}

onMounted(resetDialogData);
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">Varie impostazioni</h1>

    <div class="py-4">
      <span class="block">Nome attivitá: {{ miscellaneousStore.activityName }}</span>
      <span class="block">Settimane da pianificare: {{ miscellaneousStore.weeksToPlan }}</span>
    </div>
    <button class="btn btn-primary" @click="showEditMiscellaneousModal">Modifica</button>
  </div>

  <dialog ref="editMiscellaneousModal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @mouseup="resetDialogData">✕</button>
      </form>
      <h3 class="font-bold text-lg">Varie impostazioni</h3>

      <div class="py-4">
        <span class="block mb-2">Nome attivitá</span>
        <input ref="activityName"
          type="text"
          placeholder="Nome attivitá"
          class="input input-bordered w-full max-w-xs mb-2"
          :class="{ 'border-2 border-error': activityNameError}"/>
        <span v-if="activityNameError" class="block text-error mb-2">Questo campo é richiesto</span>

        <span class="block mb-2">Numero di settimane (minimo 1, massimo {{ MAX_PLANNABLE_WEEKS_NUMBER }})</span>
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
