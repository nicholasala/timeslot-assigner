import dayjs, { Dayjs } from 'dayjs';
import type { MonthPlan } from '@/model/MonthPlan';
import type { AssignedTimeslot } from '@/model/AssignedTimeslot';
import type { Operator } from '@/model/Operator';
import { EMPTY_DAY_DATE, months } from '@/constants';
import type { Timeslot } from '@/model/Timeslot';
import type { PlanStatistics } from '@/model/PlanStatistics';
import type { Plan } from '@/model/Plan';

export function generatePlan(operators: Operator[], unsortedTimeslots: Timeslot[], offDays: number[], weeksToPlan = 4): Plan {
    const today = dayjs();
    const monthPlans: MonthPlan[] = [{ monthName: getMonthName(today.month()), workDays: [] }];
    const startOfRoundDay = offDays.length !== 0 ? ((offDays[offDays.length - 1] + 1) % 7) : 1;
    let daysPlanned = 0;
    let day = dayjs();
    const timeslots = sortTimeslots(unsortedTimeslots);
    let weekPlan = generateFirstWeekPlan(operators, timeslots);
    let month = day.month();
    let monthPlan = monthPlans[0];
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

        if(day.day() === startOfRoundDay && (!monthPlan.workDays.every(d => d.isOff || d.date === EMPTY_DAY_DATE) || monthPlans.length !== 1))
            weekPlan = generateNextWeekPlan(weekPlan, operators, timeslots);

        if(month !== day.month()) {
            month = day.month();
            monthPlans.push({monthName: getMonthName(month), workDays: []});
            monthPlan = monthPlans[monthPlans.length - 1];
            addEmptyDaysToMonthPlan(monthPlan, day);
        }
    }

    return {
        monthPlans,
        planStatistics: calculatePlanStatistics(operators, timeslots, monthPlans)
    };
}

function getMonthName(month: number): string {
    return months.find(m => m.id === month)?.name || '';
}

function sortTimeslots(timeslots: Timeslot[]): Timeslot[] {
    const unsortedTimeslots = [...timeslots];
    const sortedTimeslots = [];

    while(unsortedTimeslots.length > 0) {
        let timeslot = unsortedTimeslots[0];
        let index = 0;

        for(let i = 1; i < unsortedTimeslots.length; i++) {
            if(getMinimumStart(unsortedTimeslots[i]) < getMinimumStart(timeslot)) {
                timeslot = unsortedTimeslots[i];
                index = i;
            }
        }

        sortedTimeslots.push(timeslot);
        unsortedTimeslots.splice(index, 1);
    }

    return sortedTimeslots;
}

function getMinimumStart(timeslot: Timeslot): number {
    return timeslot.timeRanges.reduce((minStart, tR) => tR.start < minStart ? tR.start : minStart, 1000);
}

// Empty days are days not considered in the plan, mainly because they are before the plan start
function addEmptyDaysToMonthPlan(plan: MonthPlan, fromDay: Dayjs) {
    let emptyDaysAdded = 0;
    let yesterdayDayNumber = fromDay.subtract(1, 'd').day();

    while(yesterdayDayNumber > 0) {
        plan.workDays.push({date: EMPTY_DAY_DATE, plan: [], isOff: false, isStartOfRound: false});
        yesterdayDayNumber--;
        emptyDaysAdded++;
    }

    return emptyDaysAdded;
}

function generateFirstWeekPlan(operators: Operator[], timeslots: Timeslot[]) : AssignedTimeslot[]{
    const assignedTimeslots: AssignedTimeslot[] = [];

    timeslots.forEach(t => {
        const operator = operators.find(o => o.planningStartTimeslotId === t.id);

        if(operator)
            assignedTimeslots.push({ operatorId: operator.id, timeslotId: t.id });
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

function containsNotAssignableTimeslot(weekPlan: AssignedTimeslot[], operators: Operator[]): boolean {
    for(let i = 0; i < weekPlan.length; i++) {
        const assignedTimeslot = weekPlan[i];
        const operator = operators.find(o => o.id === assignedTimeslot.operatorId);

        if(operator?.notAssignableTimeslot === assignedTimeslot.timeslotId)
            return true;
    }

    return false;
}

function calculatePlanStatistics(operators: Operator[], timeslots: Timeslot[], monthPlans: MonthPlan[]): PlanStatistics  {
    const statistics: PlanStatistics = {
        operatorsWorkingHours: []
    };

    operators.forEach(o => statistics.operatorsWorkingHours.push({operator: o, total: 0}));

    monthPlans.forEach(monthPlan => {
        monthPlan.workDays.forEach(workDay => {
            if(!workDay.isOff && workDay.date !== EMPTY_DAY_DATE) {
                workDay.plan.forEach(workDayPlan => {
                    const timeslot = timeslots.find(t => t.id === workDayPlan.timeslotId);
    
                    if(timeslot) {
                        const hoursTotal = timeslot.timeRanges.reduce((tot, tR) => tot + (tR.end - tR.start), 0);
                        const operatorWorkingHours = statistics.operatorsWorkingHours.find(oWH => oWH.operator.id === workDayPlan.operatorId);
    
                        if(operatorWorkingHours)
                            operatorWorkingHours.total += hoursTotal;
                    }
                });
            }
        });
    });

    return statistics;
}