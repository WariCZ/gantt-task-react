import React, { memo, useMemo } from "react";
import { getDatesDiff } from "../../helpers/get-dates-diff";

import type { DateExtremity, ViewMode } from "../../types/public-types";

export type GridBodyProps = {
  additionalLeftSpace: number;
  gridHeight: number;
  columnWidth: number;
  ganttFullHeight: number;
  isUnknownDates: boolean;
  startDate: Date;
  todayColor: string;
  holidayBackgroundColor: string;
  rtl: boolean;
  viewMode: ViewMode;
  startColumnIndex: number;
  endColumnIndex: number;
  checkIsHoliday: (date: Date, dateExtremity: DateExtremity) => boolean;
  getDate: (index: number) => Date;
  minTaskDate: Date;
  selectedDay?: Date;
  selectedDayBgColor: string;
  selectedDayStrokeColor: string;
};

const GridBodyInner: React.FC<GridBodyProps> = ({
  additionalLeftSpace,
  columnWidth,
  isUnknownDates,
  todayColor,
  rtl,
  startDate,
  viewMode,
  gridHeight,
}) => {
  const today = useMemo(() => {
    if (isUnknownDates) return null;

    const todayIndex = getDatesDiff(new Date(), startDate, viewMode);
    const tickX = todayIndex * columnWidth;
    const centerX = rtl ? tickX + columnWidth / 2 : tickX + columnWidth / 2;

    const lineWidth = columnWidth;
    // const circleRadius = 6;

    return (
      <>
        <rect
          x={additionalLeftSpace + centerX - lineWidth / 2}
          y={0}
          width={lineWidth}
          height={gridHeight}
          fill={todayColor}
          pointerEvents="none"
        />
        {/* <circle
          cx={additionalLeftSpace + centerX}
          cy={0}
          r={circleRadius}
          fill={todayColor}
          stroke="white"
          strokeWidth={2}
          pointerEvents="none"
        /> */}
      </>
    );
  }, [
    additionalLeftSpace,
    columnWidth,
    gridHeight,
    isUnknownDates,
    rtl,
    startDate,
    todayColor,
    viewMode,
  ]);

  return (
    <g className="gridBody">
      <g className="today">{today}</g>
    </g>
  );
};

export const GridBody = memo(GridBodyInner);
