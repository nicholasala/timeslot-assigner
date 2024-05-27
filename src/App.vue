<script setup lang="ts">
import { ref } from 'vue';
import IconStar from './components/icons/IconStar.vue';
import { EMPTY_DAY_DATE, weekDays } from './constants';
import { generatePlans } from './utils/planGenerator';
import type { Plan } from './model/Plan';
import OperatorManager from './components/OperatorManager.vue';
import TimeslotManager from './components/TimeslotManager.vue';
import OffDaysManager from './components/OffDaysManager.vue';
import { useOperatorStore } from './stores/operator';
import { useTimeslotStore } from './stores/timeslot';
import { useOffDaysStore } from './stores/offDays';

// TODO CALCOLO DEL NUMERO DI ORE FATTE DA OGNI OPERATORE
// TODO scelta delle fasce associate agli operatori alla partenza
// TODO click su turno permette di invertirlo con un altro operatore in quella settimana
// TODO scelta del numero di settimane da pianificare
// TODO scelta del giorno di partenza (default oggi)

const operatorStore = useOperatorStore();
const timeslotStore = useTimeslotStore();
const offDaysStore = useOffDaysStore();
const plans = ref([] as Plan[]);

function startPlansGeneration() {
  // TODO andrá notificato all'utente l'errore
  if(timeslotStore.timeslots.length !== operatorStore.operators.length)
    return;

  plans.value = generatePlans(operatorStore.operators, timeslotStore.timeslots, offDaysStore.offDays, 4);
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
    <div class="flex flex-wrap flex-col sm:flex-row justify-center shadow">
      <TimeslotManager />
      <OperatorManager />
      <OffDaysManager />
    </div>

    <div>
      <!-- TODO in qualche modo occorrerá indicare all'utente che il numero di turni e il numero di operatori deve essere uguale -->
      <button class="btn m-2"
        :class="timeslotStore.timeslots.length > 0 && timeslotStore.timeslots.length === operatorStore.operators.length ? 'btn-primary' : 'btn-disabled'"
        @click="startPlansGeneration">
          Genera pianificazione
      </button>
      <button v-if="plans.length > 0" class="btn btn-primary m-2" @click="printPlanning">Stampa</button>
    </div>

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

          <div class="grid grid-cols-7 auto-rows-auto w-fit">
            <div class="py-2 w-auto h-auto min-h-32 border border-gray-200 flex" v-for="day in plan.workDays">
              <div class="w-full flex flex-col" v-if="day.date !== EMPTY_DAY_DATE && !day.isOff">
                <div class="pl-1"><span>{{ day.date }}</span></div>
                <div class="flex">
                  <div v-if="day.isStartOfRound" class="pl-1 text-center">
                    <div class="font-bold" v-for="slot in day.plan"> {{ slot.timeslotId }} </div>
                  </div>
                  <div class="w-full">

                    <!-- TODO refactor in un componente che accetta l'id dell'operatore e lo legge dallo store -->
                    <div
                      class="font-bold w-full h-6 pl-1 text-white"
                      v-for="slot in day.plan"
                      :style="'background-color: ' + operatorStore.operators.find(o => o.id === slot.operatorId)?.color">
                        <span v-if="day.isStartOfRound">{{ operatorStore.operators.find(o => o.id === slot.operatorId)?.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="w-full flex justify-center items-center" v-if="day.isOff">
                <IconStar/>
              </div>
            </div>
          </div>
        </div>
      </div>
  </main>
</template>
