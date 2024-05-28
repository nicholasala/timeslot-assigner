<script setup lang="ts">
import { ref } from 'vue';
import IconStar from './components/icons/IconStar.vue';
import { EMPTY_DAY_DATE, weekDays } from './constants';
import { calculatePlanningStatistics, generatePlans } from './utils/planGenerator';
import type { Plan } from './model/Plan';
import OperatorManager from './components/OperatorManager.vue';
import TimeslotManager from './components/TimeslotManager.vue';
import OffDaysManager from './components/OffDaysManager.vue';
import { useOperatorStore } from './stores/operator';
import { useTimeslotStore } from './stores/timeslot';
import { useOffDaysStore } from './stores/offDays';
import type { PlanningStatistics } from './model/PlannningStatistics';
import OperatorCard from './components/OperatorCard.vue';
import TimeslotCard from './components/TimeslotCard.vue';

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

    <!-- TODO spostare in un componente panoramica dedicato -->
    <div class="p-4" v-if="plans.length > 0 && planningStatistics.operatorsWorkingHours.length > 0">
      <h1 class="text-xl font-bold pb-2">Turni</h1>
      <div class="flex" v-for="t in timeslotStore.timeslots">
        <TimeslotCard :timeslot="t" />
      </div>
      <h1 class="text-xl font-bold py-2">Operatori</h1>
      <div class="flex py-1" v-for="oWH in planningStatistics.operatorsWorkingHours">
        <OperatorCard :operator="oWH.operator"></OperatorCard>
        <span class="ml-2">Ore totali: {{ oWH.total }}</span> 
      </div>
    </div>

    <!-- TODO spostare in un componente calendario dedicato -->
    <div class="border rounded shadow-lg pt-4 overflow-x-scroll" v-for="plan in plans">
        <div class="text-center text-xl font-bold">
          <span>{{ plan.monthName }}</span>
        </div>
        <br>
        <div class="flex flex-col">
          <div class="flex justify-around">
            <div class="h-12 text-center text-blue-600" v-for="day in weekDays">
              <b>{{ day.shortName }}</b>
            </div>
          </div>

          <div class="grid grid-cols-7 auto-rows-auto w-full">
            <div class="py-2 w-auto h-auto min-h-32 flex relative" v-for="day in plan.workDays">
              <div class="w-full flex flex-col" v-if="day.date !== EMPTY_DAY_DATE && !day.isOff">
                <div class="pl-1"><span>{{ day.date }}</span></div>
                <div class="flex">
                  <div v-if="day.isStartOfRound" class="px-1 text-center">
                    <div class="font-bold" v-for="slot in day.plan"> {{ slot.timeslotId }} </div>
                  </div>
                  <div class="w-full">
                    <div
                      class="relative font-bold w-full h-6 pl-1 text-white"
                      v-for="slot in day.plan">
                        <div class="absolute top-0 left-0 z-10 w-full h-full" :style="'background-color: ' + operatorStore.operators.find(o => o.id === slot.operatorId)?.color"></div>
                        <span class="absolute z-20" v-if="day.isStartOfRound">{{ operatorStore.operators.find(o => o.id === slot.operatorId)?.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="w-full flex justify-center items-center" v-if="day.isOff">
                <IconStar/>
              </div>

              <div class="h-full w-px absolute top-0 right-0 bg-gray-200 z-0"></div>
              <div class="h-px w-full absolute top-0 left-0 bg-gray-200 z-0"></div>
              <div class="h-px w-full absolute bottom-0 left-0 bg-gray-200 z-0"></div>
            </div>
          </div>
        </div>
      </div>
  </main>
</template>
