import React from "react";
import type { ReactNode } from "react";

import styles from "./calendar.module.css";
import { ColorStyles } from "../../types/public-types";

type TopPartOfCalendarProps = {
  value: ReactNode | null;
  x1Line: number;
  y1Line: number;
  y2Line: number;
  xText: number;
  yText: number;
  colors: Partial<ColorStyles>;
  moovingXText?: number;
};

export const TopPartOfCalendar: React.FC<TopPartOfCalendarProps> = ({
  value,
  x1Line,
  y1Line,
  y2Line,
  xText,
  yText,
  colors,
  moovingXText,
}) => {
  return (
    <g className="calendarTop">
      <line
        x1={x1Line}
        y1={y1Line}
        x2={x1Line}
        y2={y2Line}
        className={styles.calendarTopTick}
      />

      {value !== null && (
        <text
          y={yText}
          // x={xText}
          x={moovingXText || xText}
          className={styles.calendarTopText}
          style={{ fill: colors.barLabelColor }}
        >
          {value}
        </text>
      )}
    </g>
  );
};
