import dayjs, { Dayjs } from 'dayjs';
import type { Plan } from '@/model/Plan';
import type { AssignedTimeslot } from '@/model/AssignedTimeslot';
import type { Operator } from '@/model/Operator';
import { EMPTY_DAY_DATE, months } from '@/constants';
import type { Timeslot } from '@/model/Timeslot';

export function generatePlans(operators: Operator[], timeslots: Timeslot[], offDays: number[], weeksToPlan = 4): Plan[] {
    const today = dayjs();
    const plans: Plan[] = [{ monthName: getMonthName(today.month()), workDays: [] }];
    const startOfRoundDay = offDays.length !== 0 ? ((offDays[offDays.length - 1] + 1) % 7) : 1;
    let daysPlanned = 0;
    let day = dayjs();
    let weekPlan = generateFirstWeekPlan(operators, timeslots);
    let month = day.month();
    let monthPlan = plans[0];
    addEmptyDaysToMonthPlan(monthPlan, day);

    while(daysPlanned < (weeksToPlan * 7)) {
        monthPlan.workDays.push({
            date: day.date(),
            plan: weekPlan,
            isOff: offDays.includes(day.day()),
            isStartOfRound: day.day() === startOfRoundDay || daysPlanned === 0,
        });

        day = day.add(1, 'd');
        daysPlanned++;

        if(day.day() === startOfRoundDay && (!monthPlan.workDays.every(d => d.isOff || d.date === EMPTY_DAY_DATE) || plans.length !== 1))
            weekPlan = generateNextWeekPlan(weekPlan, operators, timeslots);

        if(month !== day.month()) {
            month = day.month();
            plans.push({monthName: getMonthName(month), workDays: []});
            monthPlan = plans[plans.length - 1];
            addEmptyDaysToMonthPlan(monthPlan, day);
        }
    }

    return plans;
}

function getMonthName(month: number): string {
    return months.find(m => m.id === month)?.name || '';
}

// Empty days are days not considered in the plan, mainly because they are before the plan start
function addEmptyDaysToMonthPlan(plan: Plan, fromDay: Dayjs) {
    let emptyDaysAdded = 0;
    let yesterdayDayNumber = fromDay.subtract(1, 'd').day();

    while(yesterdayDayNumber > 0) {
        plan.workDays.push({date: EMPTY_DAY_DATE, plan: [], isOff: false, isStartOfRound: false});
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

    return containsNotAssignableTimeslot(assignedTimeslots, operators) ?
        generateNextWeekPlan(assignedTimeslots, operators, timeslots) : assignedTimeslots;
}

// Generate the plan of a week considering the previous plan
// The operators shift will be of one each time, but not assignable slots could lead to extra shifts
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
    timeslots.forEach((t, index) => {
        assignedTimeslots.push({operatorId: shiftedOperators[index].id, timeslotId: t.id});
    });

    // TODO: avoid possible infinite loop
    return containsNotAssignableTimeslot(assignedTimeslots, operators) ?
        generateNextWeekPlan(assignedTimeslots, operators, timeslots) : assignedTimeslots;
}
