<script setup lang="ts">
import type { Operator } from '../model/Operator';

defineProps<{
  operator: Operator
}>()
</script>
<template>
    <div class="h-6 w-6 rounded mr-2" :style="'background-color: ' + operator.color"></div>
    <span>{{ operator.name }}</span>
</template>