<script setup lang="ts">
import IconStar from './components/icons/IconStar.vue';
import { useOperatorStore } from './stores/operator';
import { useTimeslotStore } from './stores/timeslot';
import { useOffDaysStore } from './stores/offDays';
import { weekDays } from './constants';
import { generatePlans } from './utils/planGenerator';
import type { Plan } from './model/Plan';

// TODO OPERATORI E TURNI DEVONO AVERE LO STESSO NUMERO
// OPERATORI
const operatorStore = useOperatorStore();
operatorStore.add({name: 'Marti', color: '#aa50f4'});
operatorStore.add({name: 'Alice', color: '#32bf2f', notAssignableSlots: [0]});
operatorStore.add({name: 'Betti', color: '#2f3ee2'});

// TURNI
const timeslotStore = useTimeslotStore();
timeslotStore.add({name: 'mattina', timeRanges: [{start: 6, end: 14}]});
timeslotStore.add({name: 'giornata', timeRanges: [{start: 11, end: 15}, {start: 18, end: 20}]});
timeslotStore.add({name: 'sera', timeRanges: [{start: 15, end: 22}]});

// GIORNI DI RIPOSO
const offDaysStore = useOffDaysStore();
const martedí = weekDays.find(wD => wD.name === 'Martedí');
if(martedí) offDaysStore.add(martedí);

const plans: Plan[] = generatePlans(operatorStore.operators, timeslotStore.timeslots, offDaysStore.offDays, 4);

</script>

<template>
  <header class="h-16 text-2xl text-white text-center bg-green-600 p-3">
    Timeslot assigner
  </header>

  <br>

  <main>
    <div class="p-4" style="border: 1px solid green">
      <b>Operatori</b>
      <br>
      <div class="flex" v-for="o in operatorStore.operators">
        <div class="h-4 w-4 rounded mx-2" :style="'background-color: ' + o.color"></div>
        <div>{{ o.name }}</div> 
      </div>
      <button class="btn btn-primary">Aggiungi</button>
    </div>

    <div class="p-4" style="border: 1px solid blue">
      <b>Fascie orarie</b>
      <br>
      <div v-for="t in timeslotStore.timeslots"> <b>{{ t.id }}</b>: {{ t.name }} -> <span v-for="r in t.timeRanges"> {{ r.start }} / {{ r.end }} </span> </div>
    </div>

    <div class="p-4" style="border: 1px solid purple">
      <b>Giorni di riposo</b>
      <br>
      <div v-for="d in offDaysStore.offDays"> {{ weekDays.find(weekDay => weekDay.id === d)?.name }} </div>
    </div>

    <div class="p-4" style="border: 1px solid purple">
      <b>Turni non assegnabili</b>
      <br>
      <div v-for="o in operatorStore.operators"> 
        <div v-if="o.notAssignableSlots">
          <div v-for="sId in o.notAssignableSlots">
            {{ o.name }} -> {{ timeslotStore.timeslots.find(t => t.id === sId)?.name }}
          </div>
        </div>
      </div>
    </div>

    <div class="p-4" style="border: 1px solid brown">
      <b>todo scelta delle fasce associate agli operatori alla partenza</b>
    </div>

    <div class="p-4" style="border: 1px solid goldenrod">
      <b>todo scelta del giorno di partenza (default oggi)</b>
    </div>

    <div class="p-4" style="border: 1px solid goldenrod">
      <b>todo scelta del numero di settimane da pianificare</b>
    </div>

    <div class="p-4" style="border: 1px solid goldenrod">
      <b>todo click su turno permette di invertirlo con un altro operatore in quella settimana</b>
    </div>

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
