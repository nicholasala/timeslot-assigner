<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import IconStar from './components/icons/IconStar.vue';

interface Operator {
  id: number,
  name: string,
  color: string,
  notAssignableSlots?: number[]
}

interface Timeslot {
  id: number,
  name: string
  timeRanges: {start: number, end: number}[]
}

interface Day {
  id: number,
  name: string
}

interface Month {
  id: number,
  name: string
}

interface AssignedTimeslot {
  operatorId: number,
  timeslotId: number
}

interface Plan {
  monthName: string,
  workDays: WorkDay[]
}

interface WorkDay {
  date: number,
  plan: AssignedTimeslot[],
  isOff: boolean,
  isStartOfRound: boolean
}

const operators: Operator[] = [
  {id: 1, name: 'Marti', color: '#aa50f4'},
  {id: 2, name: 'Alice', color: '#32bf2f', notAssignableSlots: [1]},
  {id: 3, name: 'Betti', color: '#2f3ee2'},
];

const timeslots: Timeslot[] = [
  {id: 1, name: 'mattina', timeRanges: [{start: 6, end: 14}]},
  {id: 2, name: 'giornata', timeRanges: [{start: 11, end: 15}, {start: 18, end: 20}]},
  {id: 3, name: 'sera', timeRanges: [{start: 15, end: 22}]},
];

const days: Day[] = [
  {id: 1, name: 'Lunedí'},
  {id: 2, name: 'Martedí'},
  {id: 3, name: 'Mercoledí'},
  {id: 4, name: 'Giovedí'},
  {id: 5, name: 'Venerdí'},
  {id: 6, name: 'Sabato'},
  {id: 0, name: 'Domenica'},
];

const months: Month[] = [
  {id: 0, name: 'Gennaio'},
  {id: 1, name: 'Febbraio'},
  {id: 2, name: 'Marzo'},
  {id: 3, name: 'Aprile'},
  {id: 4, name: 'Maggio'},
  {id: 5, name: 'Giugno'},
  {id: 6, name: 'Luglio'},
  {id: 7, name: 'Agosto'},
  {id: 8, name: 'Settembre'},
  {id: 9, name: 'Ottobre'},
  {id: 10, name: 'Novembre'},
  {id: 11, name: 'Dicembre'},
];

function getMonthName(month: number): string {
  return months.find(m => m.id === month)?.name || '';
}

const offDays: number[] = [2];

const today = dayjs();
const plans: Plan[] = [{ monthName: getMonthName(today.month()), workDays: [] }];
const weeksToPlan = 7;

// Empty days are days not considered in the plan, mainly because they are before the plan start
function addEmptyDaysToWeekPlan(plan: Plan, fromDay: Dayjs) {
  let emptyDaysAdded = 0;
  let yesterdayDayNumber = fromDay.subtract(1, 'd').day();

  while(yesterdayDayNumber > 0) {
    plan.workDays.push({date: -1, plan: [], isOff: false, isStartOfRound: false});
    yesterdayDayNumber--;
    emptyDaysAdded++;
  }

  return emptyDaysAdded;
}

function containsNotAssignableTimeslot(weekPlan: AssignedTimeslot[]): boolean {
  for(let i = 0; i < weekPlan.length; i++) {
    const assignedTimeslot = weekPlan[i];
    const operator = operators.find(o => o.id === assignedTimeslot.operatorId);

    if(operator?.notAssignableSlots && operator.notAssignableSlots.find(sId => sId === assignedTimeslot.timeslotId) !== undefined)
      return true;
  }

  return false;
}

// generate first week plan
function generateFirstWeekPlan() : AssignedTimeslot[]{
  const assignedTimeslots: AssignedTimeslot[] = [];

  // operators and timeslots arrays MUST coincide in the size
  timeslots.forEach((t, index) => {
    assignedTimeslots.push({operatorId: operators[index].id, timeslotId: t.id});
  });

  return assignedTimeslots;
}

// Generate the plan of a week considering the previous plan
// The operators shift will be of one each time, but considering not assignable slots wich could lead to extra shifts
function generateNextWeekPlan(previousWeekPlan: AssignedTimeslot[]): AssignedTimeslot[] {
  const assignedTimeslots: AssignedTimeslot[] = [];
  const shiftedOperators: Operator[] = [];

  previousWeekPlan.forEach(p => {
    const operator = operators.find(o => o.id === p.operatorId);

    if(operator)
      shiftedOperators.push(operator);
  });

  let extractedOperator = shiftedOperators[0];

  for(let i = 0; i < (shiftedOperators.length - 1); i++) {
    const nextExtractedOperator = shiftedOperators[i + 1];
    shiftedOperators[i + 1] = extractedOperator;
    extractedOperator = nextExtractedOperator;
  }

  shiftedOperators[0] = extractedOperator;

  // operators and timeslots arrays MUST coincide in the size
  // TODO: ensure that timeslot are entered by first to last in the day time
  timeslots.forEach((t, index) => {
    assignedTimeslots.push({operatorId: shiftedOperators[index].id, timeslotId: t.id});
  });

  // TODO: avoid possible infinite loop
  return containsNotAssignableTimeslot(assignedTimeslots) ? generateNextWeekPlan(assignedTimeslots) : assignedTimeslots;
}

function generatePlans() {
  let day = today;
  let weeksPlanned = 0;
  let weekPlan = generateFirstWeekPlan();
  let month = today.month();
  let plan = plans[0];

  while(weeksPlanned < weeksToPlan){
    let weekDaysPlanned = 0;

    if(weeksPlanned === 0)
      weekDaysPlanned += addEmptyDaysToWeekPlan(plan, day);

    while(weekDaysPlanned < 7) {
      const isStartOfRound = plan.workDays.length === 0 ? true : plan.workDays[plan.workDays.length - 1].isOff || plan.workDays[plan.workDays.length - 1].date === -1;
      const isOff = offDays.length === 0 ? false : offDays.includes(day.day());
  
      const workDay: WorkDay = {
        date: day.date(),
        plan: weekPlan,
        isOff,
        isStartOfRound,
      }

      plan.workDays.push(workDay);
      weekDaysPlanned++;
      day = day.add(1, 'd');

      if(month !== day.month()) {
        month = day.month();
        plans.push({monthName: getMonthName(month), workDays: []});
        plan = plans[plans.length - 1];
        addEmptyDaysToWeekPlan(plan, day);
      }
    }

    weekDaysPlanned = 0;
    weeksPlanned++;
    weekPlan = generateNextWeekPlan(weekPlan);
  }
}

generatePlans();

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
      <div class="flex" v-for="o in operators">
        <div class="h-4 w-4 rounded mx-2" :style="'background-color: ' + o.color"></div>
        <div>{{ o.name }}</div> 
      </div>
      <button class="btn btn-primary">Aggiungi</button>
    </div>

    <div class="p-4" style="border: 1px solid blue">
      <b>Fascie orarie</b>
      <br>
      <div v-for="t in timeslots"> <b>{{ t.id }}</b>: {{ t.name }} -> <span v-for="r in t.timeRanges"> {{ r.start }} / {{ r.end }} </span> </div>
    </div>

    <div class="p-4" style="border: 1px solid purple">
      <b>Giorni di riposo</b>
      <br>
      <div v-for="d in offDays"> {{ days.find(weekDay => weekDay.id === d)?.name }} </div>
    </div>

    <div class="p-4" style="border: 1px solid purple">
      <b>Turni non assegnabili</b>
      <br>
      <div v-for="o in operators"> 
        <div v-if="o.notAssignableSlots">
          <div v-for="sId in o.notAssignableSlots">
            {{ o.name }} -> {{ timeslots.find(t => t.id === sId)?.name }}
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

    <div class="border rounded shadow-lg pt-4" v-for="plan in plans">
        <div class="text-center text-xl font-bold">
          <span>{{ plan.monthName }}</span>
        </div>
        <br>
        <div class="flex flex-col">
          <div class="flex text-blue-600">
            <div class="p-2 w-32 h-12 text-center" v-for="day in days">
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
                      :style="'background-color: ' + operators.find(o => o.id === slot.operatorId)?.color">
                      <span v-if="day.isStartOfRound">{{ operators.find(o => o.id === slot.operatorId)?.name }}</span>
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
