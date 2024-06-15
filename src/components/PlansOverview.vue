<script setup lang="ts">
import OperatorCard from './OperatorCard.vue';
import TimeslotCard from './TimeslotCard.vue';
import type { PlanningStatistics } from '../model/PlannningStatistics';
import { useTimeslotStore } from '../stores/timeslot';

const timeslotStore = useTimeslotStore();

defineProps<{
  planningStatistics: PlanningStatistics
}>()
</script>
<template>
  <div v-if="planningStatistics.operatorsWorkingHours.length > 0" class="p-4">
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
</template>