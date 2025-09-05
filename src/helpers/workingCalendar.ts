import {
  BarMoveAction,
  DateExtremity,
  Dependency,
  Task,
} from "../types/public-types";

const DAY = 24 * 60 * 60 * 1000;

export type CheckIsHoliday = (d: Date, ext: DateExtremity) => boolean;
export type RoundDate = (
  date: Date,
  action: BarMoveAction,
  ext: DateExtremity
) => Date;

type DepType =
  | "startOfTask-startOfTask" // SS
  | "endOfTask-startOfTask" // FS
  | "endOfTask-endOfTask" // FF
  | "startOfTask-endOfTask"; // SF

const getDepType = (d: Dependency): DepType =>
  `${d.sourceTarget}-${d.ownTarget}` as DepType;

export function createWorkingCalendar(
  checkIsHoliday: CheckIsHoliday,
  roundDate: RoundDate
) {
  const isHolidayStart = (d: Date) => checkIsHoliday(d, "startOfTask");
  const isHolidayEnd = (d: Date) => checkIsHoliday(d, "endOfTask");

  const sameOrNextWorkStart = (d: Date) => {
    let t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    while (isHolidayStart(t)) t = new Date(t.getTime() + DAY);
    return roundDate(t, "move", "startOfTask");
  };

  // строго следующий рабочий день ПОСЛЕ d
  const nextWorkStart = (d: Date) => {
    let t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    while (isHolidayStart(t)) t = new Date(t.getTime() + DAY);
    return roundDate(t, "move", "startOfTask");
  };

  const sameOrPrevWorkEnd = (d: Date) => {
    let t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    while (isHolidayEnd(t)) t = new Date(t.getTime() - DAY);
    return roundDate(t, "move", "endOfTask");
  };

  // Инклюзивно: считаем рабочие дни s..e
  const workDaysBetween = (s: Date, e: Date) => {
    let d = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const end = new Date(e.getFullYear(), e.getMonth(), e.getDate());
    let n = 0;
    while (d <= end) {
      if (!isHolidayStart(d)) n++;
      d = new Date(d.getTime() + DAY);
    }
    return Math.max(1, n);
  };

  // Получить end по старту и кол-ву рабочих дней (инклюзивно)
  const endByDuration = (start: Date, wd: number) => {
    let t = sameOrNextWorkStart(start);
    let left = Math.max(1, wd) - 1;
    while (left > 0) {
      t = new Date(t.getTime() + DAY);
      if (!isHolidayEnd(t)) left--;
    }
    return roundDate(t, "move", "endOfTask");
  };

  // Получить start по концу и кол-ву рабочих дней (инклюзивно)
  const startByDuration = (end: Date, wd: number) => {
    let t = sameOrPrevWorkEnd(end);
    let left = Math.max(1, wd) - 1;
    while (left > 0) {
      t = new Date(t.getTime() - DAY);
      if (!isHolidayStart(t)) left--;
    }
    return roundDate(t, "move", "startOfTask");
  };

  // Применить зависимость, сохранив длительность (в рабочих днях)
  function enforceOne(
    src: Task,
    to: Task,
    dep: Dependency,
    desiredWorkDays?: number
  ): Task {
    const wd = Math.max(
      1,
      desiredWorkDays ?? workDaysBetween(to.start, to.end)
    );

    switch (getDepType(dep)) {
      case "endOfTask-startOfTask": {
        // FS
        const newStart = nextWorkStart(src.end);
        const newEnd = endByDuration(newStart, wd);
        if (
          newStart.getTime() === to.start.getTime() &&
          newEnd.getTime() === to.end.getTime()
        )
          return to;
        return { ...to, start: newStart, end: newEnd };
      }
      case "startOfTask-startOfTask": {
        // SS
        const anchor = sameOrNextWorkStart(src.start);
        const newEnd = endByDuration(anchor, wd);
        if (
          anchor.getTime() === to.start.getTime() &&
          newEnd.getTime() === to.end.getTime()
        )
          return to;
        return { ...to, start: anchor, end: newEnd };
      }
      case "endOfTask-endOfTask": {
        // FF
        const anchor = sameOrPrevWorkEnd(src.end);
        const newStart = startByDuration(anchor, wd);
        if (
          newStart.getTime() === to.start.getTime() &&
          anchor.getTime() === to.end.getTime()
        )
          return to;
        return { ...to, start: newStart, end: anchor };
      }
      case "startOfTask-endOfTask": {
        // SF
        const anchor = sameOrPrevWorkEnd(src.start);
        const newStart = startByDuration(anchor, wd);
        if (
          newStart.getTime() === to.start.getTime() &&
          anchor.getTime() === to.end.getTime()
        )
          return to;
        return { ...to, start: newStart, end: anchor };
      }
    }
  }

  return {
    sameOrNextWorkStart,
    nextWorkStart,
    sameOrPrevWorkEnd,
    workDaysBetween,
    endByDuration,
    startByDuration,
    enforceOne,
  };
}
