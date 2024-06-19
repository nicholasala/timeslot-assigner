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

// TODO click su turno permette di invertirlo con un altro operatore in quella settimana
// TODO impostazione dei giorni di ferie per ogni operatore
// TODO scelta del giorno di partenza (default oggi)

const operatorStore = useOperatorStore();
const timeslotStore = useTimeslotStore();
const offDaysStore = useOffDaysStore();
const miscellaneousStore = useMiscellaneousStore();
const planStore = usePlanStore();

function startPlanGeneration() {
  // TODO andrá notificato all'utente l'errore
  if(timeslotStore.timeslots.length !== operatorStore.operators.length)
    return;

  const plan = generatePlan(operatorStore.operators, timeslotStore.timeslots, offDaysStore.offDays, miscellaneousStore.weeksToPlan);
  planStore.updatePlan(plan);
}

function printPlan() {
  print();
}

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
      <button v-if="planStore.plan.monthPlans" class="btn btn-primary m-2" @click="printPlan">Stampa</button>
    </div>

    <div v-if="planStore.plan.monthPlans">
      <PlanOverview/>
      <PlanCalendar/>
    </div>
  </main>
</template>