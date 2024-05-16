<script setup lang="ts">
import IconStar from './components/icons/IconStar.vue';
import { useTimeslotStore } from './stores/timeslot';
import { useOffDaysStore } from './stores/offDays';
import { weekDays } from './constants';
import { generatePlans } from './utils/planGenerator';
import type { Plan } from './model/Plan';
import OperatorManager from './components/OperatorManager.vue';

// TODO scelta delle fasce associate agli operatori alla partenza
// TODO OPERATORI E TURNI DEVONO AVERE LO STESSO NUMERO
// TODO click su turno permette di invertirlo con un altro operatore in quella settimana
// TODO scelta del numero di settimane da pianificare
// TODO scelta del giorno di partenza (default oggi)


// TURNI
const timeslotStore = useTimeslotStore();
timeslotStore.add({name: 'mattina', timeRanges: [{start: 6, end: 14}]});
timeslotStore.add({name: 'giornata', timeRanges: [{start: 11, end: 15}, {start: 18, end: 20}]});
timeslotStore.add({name: 'sera', timeRanges: [{start: 15, end: 22}]});

// GIORNI DI RIPOSO
const offDaysStore = useOffDaysStore();
const martedí = weekDays.find(wD => wD.name === 'Martedí');
if(martedí) offDaysStore.add(martedí);

// const plans: Plan[] = generatePlans(operatorStore.operators, timeslotStore.timeslots, offDaysStore.offDays, 4);
const plans: Plan[] = [];

</script>

<template>
  <header class="h-16 text-2xl text-white text-center bg-green-600 p-3">
    Timeslot assigner
  </header>

  <main>
    <OperatorManager/>

    <div class="border rounded shadow-lg pt-4" v-for="plan in plans">
        <div class="text-center text-xl font-bold">
          <span>{{ plan.monthName }}</span>
        </div>
        <br>
        <div class="flex flex-col">
          <div class="flex text-blue-600">
            <div class="p-2 w-32 h-12 text-center" v-for="day in weekDays">
              <b>{{ day.name }}</b>
            </div>
          </div>

          <div class="grid grid-cols-7 auto-rows-auto w-fit">
            <div class="py-2 w-32 h-auto min-h-32 border border-gray-200 flex" v-for="day in plan.workDays">
              <div class="w-full flex flex-col" v-if="day.date > 0 && !day.isOff">
                <div class="pl-2"><span>{{ day.date }}</span></div>
                <div class="flex">
                  <div v-if="day.isStartOfRound" class="px-2 text-center">
                    <div class="font-bold" v-for="slot in day.plan"> {{ slot.timeslotId }} </div>
                  </div>
                  <div class="w-full">

                    <!-- TODO refactor in un componente che accetta l'id dell'operatore e lo legge dallo store -->
                    <div
                      class="font-bold w-full h-6 pl-2 text-white"
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
