import React from "react";
import type { ChangeInProgress } from "../../types/public-types";

export type DragGuideLinesProps = {
  changeInProgress: ChangeInProgress | null;
  fullHeight: number;
  additionalLeftSpace?: number;
};

// DragGuideLines component renders vertical dotted guide lines during drag and resize operations on task bars.
export const DragGuideLines = ({
  changeInProgress,
  fullHeight,
  additionalLeftSpace = 0,
}: DragGuideLinesProps) => {
  if (!changeInProgress) {
    return null;
  }

  const { action, coordinates } = changeInProgress;

  if (action === "progress") {
    return null;
  }

  const lineStyle: React.CSSProperties = {
    pointerEvents: "none",
  };

  // calculate x positions including the additional left space offset
  const x1 = coordinates.x1 + additionalLeftSpace;
  const x2 = coordinates.x2 + additionalLeftSpace;

  const renderLine = (x: number, key: string) => (
    <line
      key={key}
      x1={x}
      y1={0}
      x2={x}
      y2={fullHeight}
      stroke="#9ca3af"
      strokeWidth={1}
      strokeDasharray="4 4"
      style={lineStyle}
    />
  );

  return (
    <g className="drag-guide-lines" style={{ pointerEvents: "none" }}>
      {/* Show start line for "move" and "start" actions */}
      {(action === "move" || action === "start") &&
        renderLine(x1, "guide-line-start")}

      {/* Show end line for "move" and "end" actions */}
      {(action === "move" || action === "end") &&
        renderLine(x2, "guide-line-end")}
    </g>
  );
};
