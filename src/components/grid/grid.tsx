import React, { ReactNode, useMemo } from "react";
import { GridBody, GridBodyProps } from "./grid-body";
import { ViewMode } from "../../types/public-types";
import { differenceInDays } from "date-fns";

export type GridProps = GridBodyProps;

export const Grid: React.FC<GridProps> = props => {
  const {
    viewMode,
    isUnknownDates,
    startColumnIndex,
    endColumnIndex,
    additionalLeftSpace,
    columnWidth,
    getDate,
    checkIsHoliday,
    holidayBackgroundColor,
    minTaskDate,

    selectedDay,
    selectedDayBgColor,
    selectedDayStrokeColor,
  } = props;

  const viewModesForDetectHolidays = new Set([
    ViewMode.Day,
    ViewMode.HalfDay,
    ViewMode.QuarterDay,
    ViewMode.Hour,
  ]);

  const displayHoliday = (date: Date, minTaskDate: Date) => {
    if (isUnknownDates) {
      const daysDiff = differenceInDays(date, minTaskDate);
      const rest = daysDiff % 7;

      if (daysDiff >= 0) {
        return rest === 5 || rest === 6;
      }

      return rest === -1 || rest === -2;
    }

    return checkIsHoliday(date, "startOfTask");
  };

  const renderedHolidays = useMemo(() => {
    const res: ReactNode[] = [];
    if (viewModesForDetectHolidays.has(viewMode)) {
      for (let i = startColumnIndex; i <= endColumnIndex; ++i) {
        const date = getDate(i);

        if (displayHoliday(date, minTaskDate)) {
          res.push(
            <rect
              height="100%"
              width={columnWidth}
              x={additionalLeftSpace + i * columnWidth}
              y={0}
              fill={holidayBackgroundColor}
              key={`hol-${i}`}
              pointerEvents="none"
            />
          );
        }
      }
    }
    return res;
  }, [
    viewMode,
    additionalLeftSpace,
    checkIsHoliday,
    columnWidth,
    startColumnIndex,
    endColumnIndex,
    getDate,
    holidayBackgroundColor,
    minTaskDate,
  ]);

  const renderedSelectedDay = useMemo(() => {
    if (!selectedDay) return null;

    // нормализуем выбранную дату (без времени), чтобы не ловить проблемы с TZ
    const sd = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate()
    );

    const res: ReactNode[] = [];
    // важно идти до endColumnIndex - 1, чтобы был i+1
    for (let i = startColumnIndex; i < endColumnIndex; ++i) {
      const colStart = getDate(i);
      const colEnd = getDate(i + 1);

      // попадает ли выбранная дата внутрь интервала колонки?
      const inBucket =
        sd.getTime() >= colStart.getTime() && sd.getTime() < colEnd.getTime();
      if (!inBucket) continue;

      res.push(
        <rect
          key={`sel-${i}`}
          height="100%"
          width={columnWidth}
          x={additionalLeftSpace + i * columnWidth}
          y={0}
          fill={selectedDayBgColor}
          stroke={selectedDayStrokeColor}
          strokeWidth={1}
          pointerEvents="none"
        />
      );
    }
    return res;
  }, [
    selectedDay,
    startColumnIndex,
    endColumnIndex,
    getDate,
    columnWidth,
    additionalLeftSpace,
    selectedDayBgColor,
    selectedDayStrokeColor,
  ]);

  return (
    <g className="grid">
      {renderedHolidays}
      {renderedSelectedDay}
      <GridBody {...props} />
    </g>
  );
};
