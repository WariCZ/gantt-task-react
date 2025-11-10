import { useCallback } from "react";

import addMilliseconds from "date-fns/addMilliseconds";
// import maxDate from "date-fns/max";
// import minDate from "date-fns/min";

import { checkIsDescendant } from "../../helpers/check-is-descendant";

import type {
  AdjustTaskToWorkingDatesParams,
  BarMoveAction,
  ChangeInProgress,
  DateExtremity,
  GanttDateRounding,
  MapTaskToCoordinates,
  Task,
  TaskMapByLevel,
} from "../../types/public-types";
import { roundTaskDates } from "../../helpers/round-task-dates";
import {
  addWorkingTime,
  getBusinessDaysBetween,
} from "../other/getBusinessDaysBetween";

type UseGetTaskCurrentStateParams = {
  adjustTaskToWorkingDates: (params: AdjustTaskToWorkingDatesParams) => Task;
  changeInProgress: ChangeInProgress | null;
  isAdjustToWorkingDates: boolean;
  isMoveChildsWithParent: boolean;
  isUpdateDisabledParentsOnChange: boolean;
  mapTaskToCoordinates: MapTaskToCoordinates;
  roundDate: (
    date: Date,
    action: BarMoveAction,
    dateExtremity: DateExtremity
  ) => Date;
  tasksMap: TaskMapByLevel;
  dateMoveStep: GanttDateRounding;
};

export const useGetTaskCurrentState = ({
  adjustTaskToWorkingDates,
  changeInProgress,
  isAdjustToWorkingDates,
  isMoveChildsWithParent,
  isUpdateDisabledParentsOnChange,
  mapTaskToCoordinates,
  roundDate,
  tasksMap,
  dateMoveStep,
}: UseGetTaskCurrentStateParams) => {
  const getTaskCurrentState = useCallback(
    (currentOriginalTask: Task): Task => {
      // ----------------------------------------------------------
      // The aim of getTaskCurrentState is to return the task to display in real time
      //  + currentOriginalTask is the task as it was before begining to change it
      //  + changeInProgress.changedTask is the task that corresponds to the exact move on the full task or the start/end date handlers
      //  + the task is then rounded
      //  + and then ajusted to working days if required

      // console.log(
      //   "roundDate",
      //   changeInProgress?.changedTask?.start &&
      //     roundDate(
      //       changeInProgress.changedTask.start,
      //       changeInProgress.action,
      //       "startOfTask"
      //     )
      // );
      const taskIsChanged =
        changeInProgress &&
        (changeInProgress.changedTask.start != currentOriginalTask.start ||
          changeInProgress.changedTask.end != currentOriginalTask.end);

      if (taskIsChanged) {
        // ------------------------------------------------------------------------------
        // the aim of this part is to manage the being moved task
        // It rounds the date and then adjusts it to working dates

        if (changeInProgress.originalTask === currentOriginalTask) {
          const roundedTask = roundTaskDates(
            changeInProgress.changedTask,
            roundDate,
            changeInProgress.action,
            dateMoveStep
          );
          const roundTaskIsDifferentFromOriginal =
            roundedTask.start != currentOriginalTask.start ||
            roundedTask.end != currentOriginalTask.end;
          if (isAdjustToWorkingDates && roundTaskIsDifferentFromOriginal) {
            return adjustTaskToWorkingDates({
              action: changeInProgress.action,
              changedTask: roundedTask,
              originalTask: currentOriginalTask,
              roundDate,
            });
          }

          return roundedTask;
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
          // const roundedTaskParentOriginal = roundTaskDates(
          //   changeInProgress.originalTask,
          //   roundDate,
          //   changeInProgress.action,
          //   dateMoveStep
          // );
          // const roundedTaskParentChangedTask = roundTaskDates(
          //   changeInProgress.changedTask,
          //   roundDate,
          //   changeInProgress.action,
          //   dateMoveStep
          // );

          // console.log(
          //   "Children",
          //   checkIsDescendant(
          //     changeInProgress.originalTask,
          //     currentOriginalTask,
          //     tasksMap
          //   ),
          //   // roundedTaskParentOriginal.start,
          //   roundedTaskParentChangedTask.start
          //   // roundedTaskParentOriginal.start !==
          //   //   roundedTaskParentChangedTask.start,
          //   // changeInProgress.changedTask,
          //   // changeInProgress.originalTask
          // );
          // if (
          //   changeInProgress.changedTask.start ===
          //     changeInProgress.originalTask.start &&
          //   changeInProgress.changedTask.end ===
          //     changeInProgress.originalTask.end
          // ) {
          //   // debugger;
          //   return currentOriginalTask;
          // }
          const tsDiff = getBusinessDaysBetween(
            changeInProgress.originalTask.start,
            changeInProgress.changedTask.start
          );
          if (currentOriginalTask.id === "SVB-138") {
            console.log(
              "!!!!!!!!!!!!!!!!!!!!!!!!!! movedTask start parent",
              changeInProgress.originalTask.id,
              changeInProgress.originalTask.start,
              changeInProgress.changedTask.start
            );

            console.log(
              "movedTask start",
              currentOriginalTask.id,
              currentOriginalTask.start,
              currentOriginalTask.end,
              tsDiff / 86400000
            );
          }
          // const { tsDiff } = changeInProgress;
          // console.log("tsDiff", changeInProgress.originalTask.id, tsDiff);
          const movedTask: Task = {
            ...currentOriginalTask,
            // end: addMilliseconds(currentOriginalTask.end, tsDiff),
            // start: addMilliseconds(currentOriginalTask.start, tsDiff),
            // end: addMilliseconds(currentOriginalTask.end, tsDiff),
            // start: addMilliseconds(currentOriginalTask.start, tsDiff),
            // start: addWorkingTime(currentOriginalTask.start, tsDiff),
            // end: addWorkingTime(currentOriginalTask.end, tsDiff),
            end: addMilliseconds(currentOriginalTask.end, 0),
            start: addMilliseconds(currentOriginalTask.start, 0),
          };

          // if (currentOriginalTask.id === "SVB-138")
          //   console.log(
          //     "movedTask start",
          //     currentOriginalTask.id,
          //     addMilliseconds(currentOriginalTask.start, tsDiff)
          //   );
          // const myDiff =
          //   roundedTaskParentChangedTask.start.getTime() -
          //   roundedTaskParentOriginal.start.getTime();
          // console.log("myDiff", myDiff, myDiff / 86400000);
          // const movedTask: Task = {
          //   ...currentOriginalTask,
          //   end: addMilliseconds(currentOriginalTask.end, myDiff),
          //   start: addMilliseconds(currentOriginalTask.start, myDiff),
          // };

          const roundedTask = roundTaskDates(
            movedTask,
            roundDate,
            changeInProgress.action,
            dateMoveStep
          );
          const roundTaskIsDifferentFromOriginal =
            roundedTask.start != currentOriginalTask.start ||
            roundedTask.end != currentOriginalTask.end;
          if (isAdjustToWorkingDates && roundTaskIsDifferentFromOriginal) {
            return adjustTaskToWorkingDates({
              action: changeInProgress.action,
              changedTask: roundedTask,
              originalTask: currentOriginalTask,
              roundDate,
            });
          }

          return roundedTask;
        }

        // ------------------------------------------------------------------------------
        // the aim of this part is to update parents of the being moved task
        // if (
        //   isUpdateDisabledParentsOnChange &&
        //   currentOriginalTask.isDisabled &&
        //   currentOriginalTask.id == changeInProgress.originalTask.parent &&
        //   checkIsDescendant(
        //     currentOriginalTask,
        //     changeInProgress.originalTask,
        //     tasksMap
        //   )
        // ) {
        //   // Get all the children of the current Task
        //   const childrenTasks = Array.from(
        //     tasksMap.get(currentOriginalTask.comparisonLevel || 1).values()
        //   )
        //     .filter(task => {
        //       return (
        //         task.parent == currentOriginalTask.id && task.type !== "empty"
        //       );
        //     })
        //     .map(task => task as Task);

        //   const startDates = childrenTasks.map(task => {
        //     if (task.id == changeInProgress.changedTask.id) {
        //       return getTaskCurrentState(task).start;
        //     } else {
        //       return task.start;
        //     }
        //   });
        //   const endDates = childrenTasks.map(task => {
        //     if (task.id == changeInProgress.changedTask.id) {
        //       return getTaskCurrentState(task).end;
        //     } else {
        //       return task.end;
        //     }
        //   });

        //   return {
        //     ...currentOriginalTask,
        //     start: minDate(startDates),
        //     end: maxDate(endDates),
        //   };
        // }
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
      adjustTaskToWorkingDates,
      changeInProgress,
      isAdjustToWorkingDates,
      isMoveChildsWithParent,
      isUpdateDisabledParentsOnChange,
      mapTaskToCoordinates,
      roundDate,
      tasksMap,
    ]
  );

  return getTaskCurrentState;
};
