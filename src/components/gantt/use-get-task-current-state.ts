import { useCallback } from "react";

import addMilliseconds from "date-fns/addMilliseconds";
import maxDate from "date-fns/max";
import minDate from "date-fns/min";

import { checkIsDescendant } from "../../helpers/check-is-descendant";

import type {
  ChangeInProgress,
  Task,
  TaskMapByLevel,
} from "../../types/public-types";

type UseGetTaskCurrentStateParams = {
  changeInProgress: ChangeInProgress | null;
  isMoveChildsWithParent: boolean;
  isUpdateDisabledParentsOnChange: boolean;
  tasksMap: TaskMapByLevel;
};

export const useGetTaskCurrentState = ({
  changeInProgress,
  isMoveChildsWithParent,
  isUpdateDisabledParentsOnChange,
  tasksMap,
}: UseGetTaskCurrentStateParams) => {
  const getTaskCurrentState = useCallback(
    (currentOriginalTask: Task): Task => {
      // ----------------------------------------------------------
      // The aim of getTaskCurrentState is to return the task to display in real time
      //  + currentOriginalTask is the task as it was before beginning to change it
      //  + changeInProgress.changedTask is the task that corresponds to the exact move
      //  + This function returns unrounded task for smooth visual preview during drag
      //  + Date rounding and working day adjustment is applied on drop in use-task-drag.ts

      const taskIsChanged =
        changeInProgress &&
        (changeInProgress.changedTask.start != currentOriginalTask.start ||
          changeInProgress.changedTask.end != currentOriginalTask.end);

      if (taskIsChanged) {
        // ------------------------------------------------------------------------------
        // The aim of this part is to manage the being moved task
        // Returns unrounded task for smooth drag preview

        if (changeInProgress.originalTask === currentOriginalTask) {
          // Return unrounded task for smooth visual preview during drag
          // Date rounding is applied on drop (mouseup) in use-task-drag.ts
          return changeInProgress.changedTask;
        }

        // ------------------------------------------------------------------------------
        // the aim of this part is to update child of the being moved task
        if (
          isMoveChildsWithParent &&
          changeInProgress.action === "move" &&
          checkIsDescendant(
            changeInProgress.originalTask,
            currentOriginalTask,
            tasksMap
          )
        ) {
          const { tsDiff } = changeInProgress;

          // Return unrounded moved task for smooth visual preview during drag
          // Date rounding is applied on drop (mouseup) in use-task-drag.ts
          const movedTask: Task = {
            ...currentOriginalTask,
            end: addMilliseconds(currentOriginalTask.end, tsDiff),
            start: addMilliseconds(currentOriginalTask.start, tsDiff),
          };

          return movedTask;
        }

        // ------------------------------------------------------------------------------
        // the aim of this part is to update parents of the being moved task
        if (
          isUpdateDisabledParentsOnChange &&
          currentOriginalTask.isDisabled &&
          currentOriginalTask.id == changeInProgress.originalTask.parent &&
          checkIsDescendant(
            currentOriginalTask,
            changeInProgress.originalTask,
            tasksMap
          )
        ) {
          // Get all the children of the current Task
          const childrenTasks = Array.from(
            tasksMap.get(currentOriginalTask.comparisonLevel || 1).values()
          )
            .filter(task => {
              return (
                task.parent == currentOriginalTask.id && task.type !== "empty"
              );
            })
            .map(task => task as Task);

          const startDates = childrenTasks.map(task => {
            if (task.id == changeInProgress.changedTask.id) {
              return getTaskCurrentState(task).start;
            } else {
              return task.start;
            }
          });
          const endDates = childrenTasks.map(task => {
            if (task.id == changeInProgress.changedTask.id) {
              return getTaskCurrentState(task).end;
            } else {
              return task.end;
            }
          });

          return {
            ...currentOriginalTask,
            start: minDate(startDates),
            end: maxDate(endDates),
          };
        }
      }

      const progressIsChanged =
        changeInProgress &&
        changeInProgress.originalTask === currentOriginalTask &&
        changeInProgress.changedTask.progress != currentOriginalTask.progress;
      if (progressIsChanged) {
        return {
          ...currentOriginalTask,
          progress: changeInProgress.changedTask.progress,
        };
      }
      return currentOriginalTask;
    },
    [
      changeInProgress,
      isMoveChildsWithParent,
      isUpdateDisabledParentsOnChange,
      tasksMap,
    ]
  );

  return getTaskCurrentState;
};
