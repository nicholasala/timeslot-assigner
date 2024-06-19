<script setup lang="ts">
import { usePlanStore } from '@/stores/plan';
import IconStar from '../components/icons/IconStar.vue';
import { EMPTY_DAY_DATE, weekDays } from '../constants';
import { useOperatorStore } from '../stores/operator';

const operatorStore = useOperatorStore();
const planStore = usePlanStore();

</script>
<template>
  <div class="border rounded shadow-lg pt-4 overflow-x-scroll" v-for="monthPlan in planStore.plan.monthPlans">
    <div class="text-center text-xl font-bold">
      <span>{{ monthPlan.monthName }}</span>
    </div>
    <br>
    <div class="flex flex-col">
      <div class="flex justify-around">
        <div class="h-12 text-center text-blue-600" v-for="day in weekDays">
          <b>{{ day.shortName }}</b>
        </div>
      </div>

      <div class="grid grid-cols-7 auto-rows-auto w-full">
        <div class="py-2 w-auto h-auto min-h-32 flex relative" v-for="day in monthPlan.workDays">
          <div class="w-full flex flex-col" v-if="day.date !== EMPTY_DAY_DATE && !day.isOff">
            <div class="pl-1"><span>{{ day.date }}</span></div>
            <div class="flex">
              <div v-if="day.isStartOfRound" class="px-1 text-center">
                <div class="font-bold" v-for="slot in day.plan"> {{ slot.timeslotId }} </div>
              </div>
              <div class="w-full">
                <div
                  class="relative font-bold w-full h-6 pl-1 text-white cursor-pointer"
                  v-for="slot in day.plan"
                  @click="() => {}">
                    <div
                      class="absolute top-0 left-0 z-10 w-full h-full":style="'background-color: ' + operatorStore.operators.find(o => o.id === slot.operatorId)?.color"></div>
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
</template>../model/MonthPlan