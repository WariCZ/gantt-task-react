import React from "react";

export type TaskBarDisplayProps = {
  barColor: string;
  barCornerRadius: number;
  className?: string;
  height: number;
  progressColor: string;
  progressWidth: number;
  progressX: number;
  startMoveFullTask: (clientX: number) => void;
  tabIndex?: number;
  taskName: string;
  type: "bar" | "project";
  width: number;
  x: number;
  y: number;
};

export const TaskBarDisplay: React.FC<TaskBarDisplayProps> = ({
  barColor,
  barCornerRadius,
  className,
  height,
  progressColor,
  progressWidth,
  progressX,
  startMoveFullTask,
  tabIndex,
  taskName,
  type,
  width,
  x,
  y,
}) => {
  // Fixed 75/25 ratio: 75% top layer, 25% progress visible
  const topLayerHeight = Math.round(height * 0.75);
  const x2 = x + width;

  // Triangle positions
  const triangleStartY = y + height / 2 - 1;
  const triangleEndY = y + height;

  const leftTriangle = [
    x,
    triangleStartY,
    x,
    triangleEndY,
    x + 15,
    triangleStartY,
  ].join(",");
  const rightTriangle = [
    x2,
    triangleStartY,
    x2,
    triangleEndY,
    x2 - 15,
    triangleStartY,
  ].join(",");

  return (
    <g
      data-testid={`task-${type}-${taskName}`}
      onMouseDown={e => {
        startMoveFullTask(e.clientX);
      }}
      onTouchStart={e => {
        const firstTouch = e.touches[0];
        if (firstTouch) {
          startMoveFullTask(firstTouch.clientX);
        }
      }}
      tabIndex={tabIndex}
      className={className}
    >
      {/* Background */}
      <rect
        x={x}
        width={width}
        y={y}
        height={height}
        rx={barCornerRadius}
        ry={barCornerRadius}
        fill={barColor}
      />
      {/* Progress - rendered first so top layer can cover it */}
      <rect
        x={progressX}
        width={progressWidth || 0}
        y={y}
        height={height}
        rx={barCornerRadius}
        ry={barCornerRadius}
        fill={progressColor}
      />
      {/* Top layer - covers top 75%, leaving bottom 25% progress visible */}
      <rect
        x={x}
        width={width}
        y={y}
        height={topLayerHeight}
        rx={barCornerRadius}
        ry={barCornerRadius}
        fill={barColor}
      />
      {/* Triangular cutouts at ends - cover bottom corners */}
      <polygon points={leftTriangle} fill={barColor} />
      <polygon points={rightTriangle} fill={barColor} />
    </g>
  );
};
