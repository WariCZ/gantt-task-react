import React, { useMemo } from "react";

import { ColorStyles, PartialColorStyles } from "../../../types/public-types";

import style from "./bar.module.css";

type BarDisplayProps = {
  barCornerRadius: number;
  isCritical: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  height: number;
  progressWidth: number;
  /* progress start point */
  progressX: number;
  startMoveFullTask: (clientX: number) => void;
  styles: ColorStyles;
  taskColors: PartialColorStyles;
  taskName: string;
  width: number;
  x: number;
  y: number;
};

export const BarDisplay: React.FC<BarDisplayProps> = ({
  taskName,
  taskColors,
  barCornerRadius,
  isCritical,
  isSelected,
  hasChildren,
  height,
  progressWidth,
  progressX,
  startMoveFullTask,
  styles,
  width,
  x,
  y,
}) => {
  const stylesMerged = { ...styles, ...taskColors };

  const processColor = useMemo(() => {
    if (isCritical) {
      if (hasChildren) {
        if (isSelected) {
          return stylesMerged.groupProgressSelectedCriticalColor;
        }

        return stylesMerged.groupProgressCriticalColor;
      }

      if (isSelected) {
        return stylesMerged.barProgressSelectedCriticalColor;
      }

      return stylesMerged.barProgressCriticalColor;
    }

    if (hasChildren) {
      if (isSelected) {
        return stylesMerged.groupProgressSelectedColor;
      }

      return stylesMerged.groupProgressColor;
    }

    if (isSelected) {
      return stylesMerged.barProgressSelectedColor;
    }

    return stylesMerged.barProgressColor;
  }, [isSelected, isCritical, hasChildren, styles]);

  const barColor = useMemo(() => {
    if (isCritical) {
      if (hasChildren) {
        if (isSelected) {
          return stylesMerged.groupBackgroundSelectedCriticalColor;
        }

        return stylesMerged.groupBackgroundCriticalColor;
      }

      if (isSelected) {
        return stylesMerged.barBackgroundSelectedCriticalColor;
      }

      return stylesMerged.barBackgroundCriticalColor;
    }

    if (hasChildren) {
      if (isSelected) {
        return stylesMerged.groupBackgroundSelectedColor;
      }

      return stylesMerged.groupBackgroundColor;
    }

    if (isSelected) {
      return stylesMerged.barBackgroundSelectedColor;
    }

    return stylesMerged.barBackgroundColor;
  }, [isSelected, isCritical, hasChildren, styles]);

  return (
    <g
      data-testid={`task-bar-${taskName}`}
      onMouseDown={e => {
        startMoveFullTask(e.clientX);
      }}
      onTouchStart={e => {
        const firstTouch = e.touches[0];

        if (firstTouch) {
          startMoveFullTask(firstTouch.clientX);
        }
      }}
    >
      <rect
        x={x}
        width={width}
        y={y}
        height={height}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={barColor}
        className={style.barBackground}
      />
      <rect
        x={progressX}
        width={progressWidth || 0}
        y={y}
        height={height}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={processColor}
      />
    </g>
  );
};
