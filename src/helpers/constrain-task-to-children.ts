import type {
  Task,
  BarMoveAction,
  ChildByLevelMap,
  AllowedTypes,
} from "../types/public-types";
import { getChildBoundaries } from "./get-child-boundaries";

/**
 * Constrains a parent task's dates during resize to ensure it cannot be
 * smaller than its children's boundaries.
 *
 * @param task - The task being resized
 * @param action - The drag action type (only "start" and "end" are handled)
 * @param childTasksMap - Map of parent IDs to their child tasks
 * @param rtl - Whether RTL mode is active (swaps start/end handle behavior)
 * @param allowedTypesForFitMove - Task types that support auto-fitting
 * @returns The task with dates constrained to fit children, or unchanged if no constraint needed
 */
export const constrainTaskToChildren = (
  task: Task,
  action: BarMoveAction,
  childTasksMap: ChildByLevelMap,
  rtl: boolean,
  allowedTypesForFitMove: readonly AllowedTypes[]
): Task => {
  // Only apply for resize operations (start/end), not move or progress
  if (action !== "start" && action !== "end") {
    return task;
  }

  // Only constrain allowed types
  if (!allowedTypesForFitMove.includes(task.type as "project" | "task")) {
    return task;
  }

  const childBounds = getChildBoundaries(task, childTasksMap);
  if (!childBounds) {
    return task;
  }

  const { minStart, maxEnd } = childBounds;
  let newStart = task.start;
  let newEnd = task.end;

  if (rtl) {
    // RTL: "start" handle controls end, "end" handle controls start
    if (action === "start" && task.end.getTime() < maxEnd.getTime()) {
      newEnd = maxEnd;
    }
    if (action === "end" && task.start.getTime() > minStart.getTime()) {
      newStart = minStart;
    }
  } else {
    // LTR: normal behavior
    if (action === "start" && task.start.getTime() > minStart.getTime()) {
      newStart = minStart;
    }
    if (action === "end" && task.end.getTime() < maxEnd.getTime()) {
      newEnd = maxEnd;
    }
  }

  if (newStart === task.start && newEnd === task.end) {
    return task;
  }

  return { ...task, start: newStart, end: newEnd };
};
