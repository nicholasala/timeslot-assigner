import type { Day } from './model/Day';
import type { Month } from './model/Month';

export const weekDays: Day[] = [
    {id: 1, name: 'Lunedí', shortName: 'Lun'},
    {id: 2, name: 'Martedí', shortName: 'Mar'},
    {id: 3, name: 'Mercoledí', shortName: 'Mer'},
    {id: 4, name: 'Giovedí', shortName: 'Gio'},
    {id: 5, name: 'Venerdí', shortName: 'Ven'},
    {id: 6, name: 'Sabato', shortName: 'Sab'},
    {id: 0, name: 'Domenica', shortName: 'Dom'},
];

export const months: Month[] = [
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
    {id: 11, name: 'Dicembre'}
];

export const EMPTY_DAY_DATE = -1;