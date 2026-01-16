import React, { useMemo } from "react";

import { ColorStyles, PartialColorStyles } from "../../../types/public-types";
import { TaskBarDisplay } from "../shared/task-bar-display";

type BarDisplayProps = {
  barCornerRadius: number;
  isCritical: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  height: number;
  progressWidth: number;
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
  const stylesMerged = useMemo(
    () => ({ ...styles, ...taskColors }),
    [styles, taskColors]
  );

  const progressColor = useMemo(() => {
    if (isCritical) {
      if (hasChildren) {
        return isSelected
          ? stylesMerged.groupProgressSelectedCriticalColor
          : stylesMerged.groupProgressCriticalColor;
      }
      return isSelected
        ? stylesMerged.barProgressSelectedCriticalColor
        : stylesMerged.barProgressCriticalColor;
    }

    if (hasChildren) {
      return isSelected
        ? stylesMerged.groupProgressSelectedColor
        : stylesMerged.groupProgressColor;
    }

    return isSelected
      ? stylesMerged.barProgressSelectedColor
      : stylesMerged.barProgressColor;
  }, [isSelected, isCritical, hasChildren, stylesMerged]);

  const barColor = useMemo(() => {
    if (isCritical) {
      if (hasChildren) {
        return isSelected
          ? stylesMerged.groupBackgroundSelectedCriticalColor
          : stylesMerged.groupBackgroundCriticalColor;
      }
      return isSelected
        ? stylesMerged.barBackgroundSelectedCriticalColor
        : stylesMerged.barBackgroundCriticalColor;
    }

    if (hasChildren) {
      return isSelected
        ? stylesMerged.groupBackgroundSelectedColor
        : stylesMerged.groupBackgroundColor;
    }

    return isSelected
      ? stylesMerged.barBackgroundSelectedColor
      : stylesMerged.barBackgroundColor;
  }, [isSelected, isCritical, hasChildren, stylesMerged]);

  return (
    <TaskBarDisplay
      type="bar"
      taskName={taskName}
      barColor={barColor}
      progressColor={progressColor}
      barCornerRadius={barCornerRadius}
      x={x}
      y={y}
      width={width}
      height={height}
      progressX={progressX}
      progressWidth={progressWidth}
      startMoveFullTask={ startMoveFullTask}
    />
  );
};
