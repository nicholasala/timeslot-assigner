<script setup lang="ts">
import type { Timeslot } from '../model/Timeslot';

defineProps<{
  timeslot: Timeslot
}>()
</script>
<template>
  <div>
    <span class="font-bold mr-2">{{ timeslot.id }}</span>
    <span>{{ timeslot.name }}:</span>
    <span v-for="r in timeslot.timeRanges" class="ml-2">{{ r.start + '-' + r.end }}</span>
  </div>
</template>