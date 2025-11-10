import { addDays, isBefore, isSameDay, isWeekend, startOfDay } from "date-fns";
export function getBusinessDaysBetween(startDate: Date, endDate: Date): number {
  // normalizace na začátek dne
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  // stejný den = 0
  if (isSameDay(start, end)) {
    return 0;
  }

  const isForward = isBefore(start, end);
  const from = isForward ? start : end;
  const to = isForward ? end : start;

  let businessDays = 0;
  let current = new Date(from);

  // počítáme pouze pracovní dny *před* koncem
  while (isBefore(current, to)) {
    if (!isWeekend(current)) {
      businessDays++;
    }
    current = addDays(current, 1);
  }

  const durationMs = businessDays * 86_400_000; // 1 den = 86 400 000 ms
  return isForward ? durationMs : -durationMs;
}

export function addWorkingTime(date: Date, durationMs: number): Date {
  const oneDayMs = 86_400_000;
  const isForward = durationMs >= 0;
  let remainingMs = Math.abs(durationMs);

  // Pokud start padá na víkend, posuň ho na nejbližší pracovní den
  let current = new Date(date);
  while (isWeekend(current)) {
    current = addDays(current, isForward ? 1 : -1);
  }

  // Teď přičítáme/odečítáme pracovní dny
  while (remainingMs > 0) {
    current = addDays(current, isForward ? 1 : -1);
    if (!isWeekend(current)) {
      remainingMs -= oneDayMs;
    }
  }

  // Pokud jsme přestřelili (remainingMs < 0), srovnáme
  const overshoot = remainingMs < 0 ? -remainingMs : 0;
  return new Date(current.getTime() - overshoot * (isForward ? 1 : -1));
}

export function workingDaysDiff(date1: Date, date2: Date) {
  const direction = date2 > date1 ? 1 : -1;
  let diff = 0;
  let current = new Date(date1);
  while (
    (direction > 0 && current < date2) ||
    (direction < 0 && current > date2)
  ) {
    current.setDate(current.getDate() + direction);
    if (!isWeekend(current)) {
      diff += direction;
    }
  }
  return diff;
}
