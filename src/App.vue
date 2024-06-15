<script setup lang="ts">
import { ref } from 'vue';
import { calculatePlanningStatistics, generatePlans } from './utils/planGenerator';
import type { Plan } from './model/Plan';
import OperatorManager from './components/OperatorManager.vue';
import TimeslotManager from './components/TimeslotManager.vue';
import OffDaysManager from './components/OffDaysManager.vue';
import { useOperatorStore } from './stores/operator';
import { useTimeslotStore } from './stores/timeslot';
import { useOffDaysStore } from './stores/offDays';
import type { PlanningStatistics } from './model/PlannningStatistics';
import PlansCalendar from './components/PlansCalendar.vue';
import PlansOverview from './components/PlansOverview.vue';

// TODO click su turno permette di invertirlo con un altro operatore in quella settimana
// TODO impostazione dei giorni di ferie per ogni operatore
// TODO scelta del numero di settimane da pianificare
// TODO scelta del giorno di partenza (default oggi)

const operatorStore = useOperatorStore();
const timeslotStore = useTimeslotStore();
const offDaysStore = useOffDaysStore();
const plans = ref([] as Plan[]);
const planningStatistics = ref({operatorsWorkingHours: []} as PlanningStatistics);

function startPlansGeneration() {
  // TODO andrá notificato all'utente l'errore
  if(timeslotStore.timeslots.length !== operatorStore.operators.length)
    return;

  plans.value = generatePlans(operatorStore.operators, timeslotStore.timeslots, offDaysStore.offDays, 4);
  planningStatistics.value = calculatePlanningStatistics(operatorStore.operators, timeslotStore.timeslots, plans.value);
}

function printPlanning() {
  print();
}

</script>

<template>
  <header class="h-16 text-2xl text-white text-center bg-green-600 p-3">
    Timeslot assigner
  </header>

  <main>
    <div v-if="plans.length === 0" class="flex flex-wrap flex-col sm:flex-row justify-center shadow">
      <TimeslotManager />
      <OperatorManager />
      <OffDaysManager />
    </div>

    <div>
      <!-- TODO in qualche modo occorrerá indicare all'utente che il numero di turni e il numero di operatori deve essere uguale -->
      <button class="btn m-2"
        v-if="plans.length === 0"
        :class="timeslotStore.timeslots.length > 0 && timeslotStore.timeslots.length === operatorStore.operators.length ? 'btn-primary' : 'btn-disabled'"
        @click="startPlansGeneration">
          Genera pianificazione
      </button>
      <button v-if="plans.length > 0" class="btn btn-primary m-2" @click="printPlanning">Stampa</button>
    </div>

    <PlansOverview :planning-statistics="planningStatistics"/>
    <PlansCalendar :plans="plans"/>
  </main>
</template>
