import { useMemo } from "react";

const formatTo24 = (date: Date): string => {
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yy = String(date.getUTCFullYear()).slice(-2);

  return `${mm}/${dd}/${yy} 00.00am UTC`;
};

const getFridaysInMonth = (year: number, month: number): Date[] => {
  const fridays: Date[] = [];
  for (let day = 1; day <= 31; day++) {
    const date = new Date(Date.UTC(year, month, day));
    if (date.getUTCMonth() !== month) break;
    if (date.getUTCDay() === 5) fridays.push(date);
  }
  return fridays;
};

const getUpcomingFriday = (now: Date): Date => {
  const day = now.getUTCDay();
  const diff = (5 - day + 7) % 7 || 7; // Always returns future Friday
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff)
  );
};

const getValidLastFriday = (now: Date): Date => {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const currentLastFriday = getFridaysInMonth(year, month).pop();
  if (currentLastFriday && currentLastFriday.getTime() >= now.getTime()) {
    return currentLastFriday;
  }

  const nextMonth = (month + 1) % 12;
  const nextYear = month === 11 ? year + 1 : year;
  const nextLastFriday = getFridaysInMonth(nextYear, nextMonth).pop();

  return nextLastFriday!;
};

export const useDates = () => {
  return useMemo(() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();

    const getFutureDay = (daysAhead: number) => {
      const date = new Date(
        Date.UTC(year, month, now.getUTCDate() + daysAhead)
      );
      return formatTo24(date);
    };

    return {
      oneDay: getFutureDay(1),
      twoDay: getFutureDay(2),
      firstFriday: formatTo24(getUpcomingFriday(now)),
      fourthFriday: formatTo24(getValidLastFriday(now)),
    };
  }, []);
};
