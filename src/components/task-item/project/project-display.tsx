import React, { useMemo } from "react";

import { ColorStyles, PartialColorStyles } from "../../../types/public-types";
import { TaskBarDisplay } from "../shared/task-bar-display";
import styles from "./project.module.css";

type ProjectDisplayProps = {
  barCornerRadius: number;
  isCritical: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  taskHeight: number;
  taskYOffset: number;
  progressWidth: number;
  progressX: number;
  startMoveFullTask: (clientX: number) => void;
  taskName: string;
  colorStyles: ColorStyles;
  taskColors: PartialColorStyles;
  width: number;
  x1: number;
  x2: number;
};

export const ProjectDisplay: React.FC<ProjectDisplayProps> = ({
  barCornerRadius,
  taskName,
  taskHeight,
  isSelected,
  isCritical,
  colorStyles,
  progressWidth,
  progressX,
  taskYOffset,
  width,
  x1,
  startMoveFullTask,
  taskColors,
}) => {
  const stylesMerged = useMemo(
    () => ({ ...colorStyles, ...taskColors }),
    [colorStyles, taskColors]
  );

  const barColor = useMemo(() => {
    if (isCritical) {
      return isSelected
        ? stylesMerged.projectBackgroundSelectedCriticalColor
        : stylesMerged.projectBackgroundCriticalColor;
    }
    return isSelected
      ? stylesMerged.projectBackgroundSelectedColor
      : stylesMerged.projectBackgroundColor;
  }, [isSelected, isCritical, stylesMerged]);

  const progressColor = useMemo(() => {
    if (isCritical) {
      return isSelected
        ? stylesMerged.projectProgressSelectedCriticalColor
        : stylesMerged.projectProgressCriticalColor;
    }
    return isSelected
      ? stylesMerged.projectProgressSelectedColor
      : stylesMerged.projectProgressColor;
  }, [isSelected, isCritical, stylesMerged]);

  return (
    <TaskBarDisplay
      type="project"
      taskName={taskName}
      barColor={barColor}
      progressColor={progressColor}
      barCornerRadius={barCornerRadius}
      x={x1}
      y={taskYOffset}
      width={width}
      height={taskHeight}
      progressX={progressX}
      progressWidth={progressWidth}
      startMoveFullTask={startMoveFullTask}
      tabIndex={0}
      className={styles.projectWrapper}
    />
  );
};
