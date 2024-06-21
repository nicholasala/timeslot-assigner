<script setup lang="ts">
import { generatePlan } from './utils/planGenerator';
import OperatorManager from './components/OperatorManager.vue';
import TimeslotManager from './components/TimeslotManager.vue';
import OffDaysManager from './components/OffDaysManager.vue';
import { useOperatorStore } from './stores/operator';
import { useTimeslotStore } from './stores/timeslot';
import { useOffDaysStore } from './stores/offDays';
import { useMiscellaneousStore } from './stores/miscellaneous';
import { usePlanStore } from './stores/plan';
import PlanCalendar from './components/PlanCalendar.vue';
import PlanOverview from './components/PlanOverview.vue';
import MiscellaneousManager from './components/MiscellaneousManager.vue';
import { onMounted, ref } from 'vue';

const operatorStore = useOperatorStore();
const timeslotStore = useTimeslotStore();
const offDaysStore = useOffDaysStore();
const miscellaneousStore = useMiscellaneousStore();
const planStore = usePlanStore();
const showPrintButton = ref(true);
const showVersionInfoModal = ref(null);

function startPlanGeneration() {
  // TODO andrá notificato all'utente l'errore
  if(timeslotStore.timeslots.length !== operatorStore.operators.length)
    return;

  const plan = generatePlan(operatorStore.operators, timeslotStore.timeslots, offDaysStore.offDays, miscellaneousStore.weeksToPlan);
  planStore.setPlan(plan);
  showPrintButton.value = true;
}

function printPlan() {
  showPrintButton.value = false;
  setTimeout(print, 400);
  setTimeout(() => { showPrintButton.value = true }, 2000);
}

function showShowVersionInfoModal() {
  showVersionInfoModal.value?.showModal();
}

function hideshowVersionInfoModal() {
  showVersionInfoModal.value?.close();
}

onMounted(showShowVersionInfoModal);

</script>

<template>
  <header class="h-16 text-2xl text-white text-center bg-green-600 p-3">
    {{ miscellaneousStore.activityName }}
  </header>

  <main>
    <div v-if="planStore.plan.monthPlans === undefined" class="flex flex-wrap flex-col sm:flex-row justify-center shadow">
      <TimeslotManager />
      <OperatorManager />
      <OffDaysManager />
      <MiscellaneousManager />
    </div>

    <div>
      <!-- TODO in qualche modo occorrerá indicare all'utente che il numero di turni e il numero di operatori deve essere uguale -->
      <button class="btn m-2"
        v-if="planStore.plan.monthPlans === undefined"
        :class="timeslotStore.timeslots.length > 0 && timeslotStore.timeslots.length === operatorStore.operators.length ? 'btn-primary' : 'btn-disabled'"
        @click="startPlanGeneration">
          Genera pianificazione
      </button>
      <button v-if="planStore.plan.monthPlans && showPrintButton" class="btn btn-primary m-2" @click="printPlan">Stampa</button>
    </div>

    <div v-if="planStore.plan.monthPlans">
      <PlanOverview/>
      <PlanCalendar/>
    </div>

    <dialog ref="showVersionInfoModal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box">
        <h5 class="font-bold text-xl text-green-600">Versione 0.0.1!</h5>

        <div class="py-4">
          <span class="block mb-2">
            La nuova versione é ora attiva! Le novitá sono le seguenti:
          </span>
          <ul class="list-disc mb-2">
            <li>É ora possibile cambiare l'operatore assegnato ad un turno nella pianificazione cliccando sul turno e scegliendo un operatore diverso</li>
            <li>É ora possibile modificare il nome dell'attivitá che verrá mostrato in alto nella fascia verde nella sezione "Varie impostazioni"</li>
            <li>É ora possibile scegliere il numero di settimane da pianificare nella sezione "Varie impostazioni"</li>
          </ul>
          <span class="block">
            Buon divertimento! Per qualsiasi dubbio, per consigliare un miglioramento o per segnalare un bug contatta: <a href="mailto:beren.14@proton.me">beren.14@proton.me</a>
          </span>
        </div>

        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary">Letto</button>
          </form>
        </div>
      </div>
    </dialog>
  </main>
</template>