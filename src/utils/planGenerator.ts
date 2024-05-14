import dayjs, { Dayjs } from 'dayjs';
import type { Plan } from '@/model/Plan';
import type { AssignedTimeslot } from '@/model/AssignedTimeslot';
import type { Operator } from '@/model/Operator';
import type { WorkDay } from '@/model/WorkDay';
import { months } from '@/constants';
import type { Timeslot } from '@/model/Timeslot';

function getMonthName(month: number): string {
    return months.find(m => m.id === month)?.name || '';
}

// TODO un piano dovrebbe partire non ogni settimana ma dopo ogni giorno/i di riposo
// TODO: capire se trasformarla in una funzione pura che non usa gli store (cosí da rimuoverli da questo script)
export function generatePlans(operators: Operator[], timeslots: Timeslot[], offDays: number[], weeksToPlan = 4): Plan[] {
    const today = dayjs();
    const plans: Plan[] = [{ monthName: getMonthName(today.month()), workDays: [] }];

    let day = dayjs();
    let weeksPlanned = 0;
    let weekPlan = generateFirstWeekPlan(operators, timeslots);
    let month = day.month();
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
        weekPlan = generateNextWeekPlan(weekPlan, operators, timeslots);
    }

    return plans;
}

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

function containsNotAssignableTimeslot(weekPlan: AssignedTimeslot[], operators: Operator[]): boolean {
    for(let i = 0; i < weekPlan.length; i++) {
        const assignedTimeslot = weekPlan[i];
        const operator = operators.find(o => o.id === assignedTimeslot.operatorId);

        if(operator?.notAssignableSlots && operator.notAssignableSlots.find(sId => sId === assignedTimeslot.timeslotId) !== undefined)
            return true;
    }

    return false;
}

function generateFirstWeekPlan(operators: Operator[], timeslots: Timeslot[]) : AssignedTimeslot[]{
    const assignedTimeslots: AssignedTimeslot[] = [];

    // operators and timeslots arrays MUST coincide in the size
    timeslots.forEach((t, index) => {
        assignedTimeslots.push({operatorId: operators[index].id, timeslotId: t.id});
    });

    return assignedTimeslots;
}

// Generate the plan of a week considering the previous plan
// The operators shift will be of one each time, but considering not assignable slots wich could lead to extra shifts
function generateNextWeekPlan(previousWeekPlan: AssignedTimeslot[], operators: Operator[], timeslots: Timeslot[]): AssignedTimeslot[] {
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
    return containsNotAssignableTimeslot(assignedTimeslots, operators) ?
        generateNextWeekPlan(assignedTimeslots, operators, timeslots) : assignedTimeslots;
}
