import React, { memo, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { checkHasChildren } from "../../helpers/check-has-children";
import {
  Task,
  TaskListTableProps,
  TaskOrEmpty,
} from "../../types/public-types";
import { TaskListTableRow } from "./task-list-table-row";

import styles from "./task-list-table.module.css";

const TaskListTableDefaultInner: React.FC<TaskListTableProps> = ({
  canMoveTasks,
  childTasksMap,
  colors,
  columns,
  cutIdsMirror,
  dateSetup,
  dependencyMap,
  distances,
  fontFamily,
  fontSize,
  fullRowHeight,
  getTaskCurrentState,
  handleAddTask,
  handleDeleteTasks,
  handleEditTask,
  handleMoveTaskBefore,
  handleMoveTaskAfter,
  handleMoveTasksInside,
  handleOpenContextMenu,
  icons,
  isShowTaskNumbers,
  mapTaskToNestedIndex,
  onClick,
  onExpanderClick,
  renderedIndexes,
  scrollToTask,
  selectTaskOnMouseDown,
  selectedIdsMirror,
  tasks,
  readOnly,
  dropRules,
}) => {
  const renderedTasks = useMemo(
    /**
     * TO DO: maybe consider tasks on other levels?
     */
    () =>
      tasks.filter(task => !task.comparisonLevel || task.comparisonLevel === 1),
    [tasks]
  );

  const [draggedTask, setDraggedTask] = useState<TaskOrEmpty>(null);

  const renderedListWithOffset = useMemo(() => {
    if (!renderedIndexes) {
      return null;
    }

    const [start, end] = renderedIndexes;

    const renderedList: ReactNode[] = [];

    for (let index = start; index <= end; ++index) {
      const task = renderedTasks[index];

      if (!task) {
        break;
      }

      const { id, comparisonLevel = 1 } = task;

      const indexesOnLevel = mapTaskToNestedIndex.get(comparisonLevel);

      if (!indexesOnLevel) {
        throw new Error(`Indexes are not found for level ${comparisonLevel}`);
      }

      const taskIndex = indexesOnLevel.get(id);

      if (!taskIndex) {
        throw new Error(`Index is not found for task ${id}`);
      }

      const [depth, indexStr] = taskIndex;

      renderedList.push(
        <TaskListTableRow
          canMoveTasks={canMoveTasks}
          colors={colors}
          columns={columns}
          dateSetup={dateSetup}
          dependencyMap={dependencyMap}
          depth={depth}
          distances={distances}
          fullRowHeight={fullRowHeight}
          getTaskCurrentState={getTaskCurrentState}
          handleAddTask={handleAddTask}
          handleDeleteTasks={handleDeleteTasks}
          handleEditTask={handleEditTask}
          handleMoveTaskBefore={handleMoveTaskBefore}
          handleMoveTaskAfter={handleMoveTaskAfter}
          handleMoveTasksInside={handleMoveTasksInside}
          handleOpenContextMenu={handleOpenContextMenu}
          hasChildren={checkHasChildren(task, childTasksMap)}
          icons={icons}
          indexStr={indexStr}
          isClosed={Boolean((task as Task)?.hideChildren)}
          isCut={cutIdsMirror[id]}
          isEven={index % 2 === 1}
          isSelected={selectedIdsMirror[id]}
          isShowTaskNumbers={isShowTaskNumbers}
          onClick={onClick}
          onExpanderClick={onExpanderClick}
          scrollToTask={scrollToTask}
          selectTaskOnMouseDown={selectTaskOnMouseDown}
          task={task}
          key={id}
          tasks={tasks}
          draggedTask={draggedTask}
          setDraggedTask={setDraggedTask}
          dropRules={dropRules}
        />
      );
    }

    return (
      <>
        <div
          className="relative w-full"
          style={{
            height: fullRowHeight * start,
          }}
        />

        <div>{renderedList}</div>
        {!readOnly && (
          <div
            onClick={() => handleAddTask?.()}
            className="flex items-center justify-start 
    w-full h-[35px] 
    cursor-pointer border-t border-gray-200 
    bg-transparent pl-3 
    text-cyan-700 hover:text-cyan-800 
    hover:bg-cyan-50 transition-colors
  "
          >
            <span className="text-xl font-medium select-none">＋</span>
          </div>
        )}
      </>
    );
  }, [
    renderedIndexes,
    fullRowHeight,
    readOnly,
    renderedTasks,
    mapTaskToNestedIndex,
    canMoveTasks,
    colors,
    columns,
    dateSetup,
    dependencyMap,
    distances,
    getTaskCurrentState,
    handleAddTask,
    handleDeleteTasks,
    handleEditTask,
    handleMoveTaskBefore,
    handleMoveTaskAfter,
    handleMoveTasksInside,
    handleOpenContextMenu,
    childTasksMap,
    icons,
    cutIdsMirror,
    selectedIdsMirror,
    isShowTaskNumbers,
    onClick,
    onExpanderClick,
    scrollToTask,
    selectTaskOnMouseDown,
    tasks,
    draggedTask,
  ]);

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {renderedListWithOffset}
    </div>
  );
};

export const TaskListTableDefault = memo(TaskListTableDefaultInner);
