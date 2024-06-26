<script setup lang="ts">
import { usePlanStore } from '@/stores/plan';
import IconStar from '../components/icons/IconStar.vue';
import { EMPTY_DAY_DATE, weekDays } from '../constants';
import { useOperatorStore } from '../stores/operator';
import { ref } from 'vue';
import type { AssignedTimeslot } from '@/model/AssignedTimeslot';
import type { WorkDay } from '@/model/WorkDay';
import { useTimeslotStore } from '@/stores/timeslot';
import { calculatePlanStatistics } from '@/utils/planGenerator';
import type { Operator } from '@/model/Operator';

const operatorStore = useOperatorStore();
const timeslotStore = useTimeslotStore();
const planStore = usePlanStore();
const operatorSelect = ref(null);
const editAssignedTimeslot = ref({} as AssignedTimeslot);
const editTimeslotModal = ref(null);
const assignedTimeslotName = ref('');
const assignedTimeslotDate = ref('');
const assignableOperators = ref([] as Operator[]);

function startAssignedTimeslotEditing(assignedTimeslot: AssignedTimeslot, workDay: WorkDay, monthName: string) {
  const timeslot = timeslotStore.timeslots.find(t => t.id === assignedTimeslot.timeslotId);
  const filteredOperators = operatorStore.operators.filter(o => o.id !== assignedTimeslot.operatorId);

  if(timeslot) {
    assignedTimeslotName.value = timeslot.name;
    assignedTimeslotDate.value = `${workDay.date} ${monthName}`;
    assignableOperators.value = filteredOperators;
    editAssignedTimeslot.value = assignedTimeslot;
    showEditTimeslotModal();
  }
}

function editTimeslotAssignment() {
  if(operatorSelect.value && +operatorSelect.value?.value > 0) {
    editAssignedTimeslot.value.operatorId = +operatorSelect.value?.value;
    planStore.setPlanStatistics(calculatePlanStatistics(operatorStore.operators, timeslotStore.timeslots, planStore.plan.monthPlans));
  }

  hideEditTimeslotModal();
  cleanDialogData();
}

function showEditTimeslotModal() {
  editTimeslotModal.value?.showModal();
}

function hideEditTimeslotModal() {
  editTimeslotModal.value?.close();
}

function cleanDialogData() {
  if(operatorSelect.value) operatorSelect.value.value = '0';
  editAssignedTimeslot.value = {} as AssignedTimeslot;
  assignedTimeslotName.value = '';
  assignedTimeslotDate.value = '';
}

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
                  @click="() => startAssignedTimeslotEditing(slot, day, monthPlan.monthName)">
                    <div
                      class="absolute top-0 left-0 z-10 w-full h-full hover:border-4 hover:border-cyan-300"
                      :style="'background-color: ' + operatorStore.operators.find(o => o.id === slot.operatorId)?.color"></div>
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

  <dialog ref="editTimeslotModal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">Cambia operatore</h3>

      <div class="py-4">
        <span class="block mb-2">
          Assegna il turno <span class="font-bold">{{ assignedTimeslotName }}</span> del giorno <span class="font-bold">{{ assignedTimeslotDate }}</span> all'operatore:
        </span>
        <select ref="operatorSelect" class="select select-bordered w-full max-w-xs">
          <option disabled selected value="0">Scegli operatore</option>
          <option v-for="o in assignableOperators" :value="o.id">{{ o.name }}</option>
        </select>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" @click="editTimeslotAssignment">Modifica</button>
      </div>
    </div>
  </dialog>
</template>