<script setup lang="ts">
import OperatorCard from './OperatorCard.vue';
import TimeslotCard from './TimeslotCard.vue';
import { useTimeslotStore } from '../stores/timeslot';
import { usePlanStore } from '@/stores/plan';

const timeslotStore = useTimeslotStore();
const planStore = usePlanStore();

</script>
<template>
  <div v-if="planStore.plan.planStatistics && planStore.plan.planStatistics.operatorsWorkingHours.length > 0" class="p-4">
    <h1 class="text-xl font-bold pb-2">Turni</h1>
    <div class="flex" v-for="t in timeslotStore.timeslots">
      <TimeslotCard :timeslot="t" />
    </div>
    <h1 class="text-xl font-bold py-2">Operatori</h1>
    <div class="flex py-1" v-for="oWH in planStore.plan.planStatistics.operatorsWorkingHours">
      <OperatorCard :operator="oWH.operator"></OperatorCard>
      <span class="ml-2">Ore totali: {{ oWH.total }}</span> 
    </div>
  </div>
</template>../model/PlannStatistics