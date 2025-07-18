import { addDays, isAfter, isBefore, startOfDay, subMinutes } from 'date-fns';

function isDateInTodayAndTomorrow(date: Date) {
  const start = subMinutes(startOfDay(new Date()), 1);
  const end = addDays(start, 2);
  return isAfter(date, start) && isBefore(date, end);
}

export { isDateInTodayAndTomorrow };
