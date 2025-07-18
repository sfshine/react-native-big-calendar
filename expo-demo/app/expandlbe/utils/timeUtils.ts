import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns';

export const getDaysInMonth = (date: Date) => {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
};

export const getWeekDays = () => {
  const weekDays = [];
  const start = startOfWeek(new Date());
  for (let i = 0; i < 7; i++) {
    weekDays.push(format(addDays(start, i), 'E'));
  }
  return weekDays;
};

export {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  format,
  isSameMonth,
  isToday,
};
