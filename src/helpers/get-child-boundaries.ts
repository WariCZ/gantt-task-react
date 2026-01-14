import type { ChildByLevelMap, Task, TaskOrEmpty } from "../types/public-types";

export type ChildBoundaries = {
  minStart: Date;
  maxEnd: Date;
};

/**
 * Recursively computes the minimum start date and maximum end date
 * across all descendants of a task.
 *
 * @param task - The parent task to get child boundaries for
 * @param childTasksMap - Map of parent IDs to their children
 * @returns The min start and max end dates, or null if task has no children
 */
export const getChildBoundaries = (
  task: Task,
  childTasksMap: ChildByLevelMap
): ChildBoundaries | null => {
  const { id, comparisonLevel = 1 } = task;

  const childTasksAtLevelMap = childTasksMap.get(comparisonLevel);
  if (!childTasksAtLevelMap) {
    return null;
  }

  const directChildren = childTasksAtLevelMap.get(id);
  if (!directChildren || directChildren.length === 0) {
    return null;
  }

  let minStart = Infinity;
  let maxEnd = -Infinity;
  let hasValidChild = false;

  const processTask = (taskOrEmpty: TaskOrEmpty): void => {
    // Skip empty tasks
    if (taskOrEmpty.type === "empty") {
      return;
    }

    const childTask = taskOrEmpty as Task;
    hasValidChild = true;

    const startTime = childTask.start.getTime();
    const endTime = childTask.end.getTime();

    if (startTime < minStart) {
      minStart = startTime;
    }
    if (endTime > maxEnd) {
      maxEnd = endTime;
    }

    // Recursively process grandchildren
    const grandchildren = childTasksAtLevelMap.get(childTask.id);
    if (grandchildren) {
      grandchildren.forEach(processTask);
    }
  };

  directChildren.forEach(processTask);

  if (!hasValidChild) {
    return null;
  }

  return {
    minStart: new Date(minStart),
    maxEnd: new Date(maxEnd),
  };
};
