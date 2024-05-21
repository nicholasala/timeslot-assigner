<script setup lang="ts">
import { ref } from 'vue';
import IconStar from './components/icons/IconStar.vue';
import { weekDays } from './constants';
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
  // TODO OPERATORI E TURNI DEVONO AVERE LO STESSO NUMERO
  plans.value = generatePlans(operatorStore.operators, timeslotStore.timeslots, offDaysStore.offDays, 4);
}

</script>

<template>
  <header class="h-16 text-2xl text-white text-center bg-green-600 p-3">
    Timeslot assigner
  </header>

  <main>
    <TimeslotManager />
    <OperatorManager />
    <OffDaysManager />

    <button class="btn btn-primary my-2" @click="startPlansGeneration">Genera pianificazione</button>

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
              <div class="w-full flex flex-col" v-if="day.date > 0 && !day.isOff">
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
