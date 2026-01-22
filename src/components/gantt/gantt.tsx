import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BarMoveAction,
  ChangeAction,
  CheckTaskIdExistsAtLevel,
  ColorStyles,
  ContextMenuOptionType,
  DateExtremity,
  DateFormats,
  DateSetup,
  Dependency,
  Distances,
  FixPosition,
  GanttDateRoundingTimeUnit,
  GanttProps,
  OnDateChange,
  OnDateChangeSuggestionType,
  OnRelationChange,
  Task,
  TaskOrEmpty,
  ViewMode,
} from "../../types/public-types";
import { GridProps } from "../grid/grid";
import { ganttDateRange } from "../../helpers/date-helper";
import { CalendarProps } from "../calendar/calendar";
import { TaskGanttContentProps } from "./task-gantt-content";
import { TaskListHeaderDefault } from "../task-list/task-list-header";
import { TaskListTableDefault } from "../task-list/task-list-table";
import { StandardTooltipContent, Tooltip } from "../other/tooltip";
import { TaskList, TaskListProps } from "../task-list/task-list";
import { TaskGantt } from "./task-gantt";
import { sortTasks } from "../../helpers/sort-tasks";
import { getChildsAndRoots } from "../../helpers/get-childs-and-roots";
import { getTaskCoordinates as getTaskCoordinatesDefault } from "../../helpers/get-task-coordinates";
import { getTasksMap } from "../../helpers/get-tasks-map";
import { getMapTaskToGlobalIndex } from "../../helpers/get-map-task-to-global-index";
import { getMapTaskToRowIndex } from "../../helpers/get-map-task-to-row-index";
import { getChildOutOfParentWarnings } from "../../helpers/get-child-out-of-parent-warnings";
import { getDependencyMapAndWarnings } from "../../helpers/get-dependency-map-and-warnings";
import {
  countTaskCoordinates as defaultCountTaskCoordinates,
  getMapTaskToCoordinates,
} from "../../helpers/get-map-task-to-coordinates";
import { getCriticalPath } from "../../helpers/get-critical-path";
import { getMapTaskToNestedIndex } from "../../helpers/get-map-task-to-nested-index";
import { collectVisibleTasks } from "../../helpers/collect-visible-tasks";
import { getTaskToHasDependencyWarningMap } from "../../helpers/get-task-to-has-dependency-warning-map";
import { getAllParents } from "../../helpers/get-all-parents";
import { constrainTaskToChildren } from "../../helpers/constrain-task-to-children";

import { getChangeTaskMetadata } from "../../helpers/get-change-task-metadata";
import { useCreateRelation } from "./use-create-relation";
import { useTaskDrag } from "./use-task-drag";
import { useTaskTooltip } from "../../helpers/use-task-tooltip";

import { useOptimizedList } from "../../helpers/use-optimized-list";
import { useVerticalScrollbars } from "./use-vertical-scrollbars";
import { useHorizontalScrollbars } from "./use-horizontal-scrollbars";

import { getDateByOffset } from "../../helpers/get-date-by-offset";
import { getDatesDiff } from "../../helpers/get-dates-diff";
import { useGetTaskCurrentState } from "./use-get-task-current-state";
import { useSelection } from "./use-selection";
import { defaultCheckIsHoliday } from "./default-check-is-holiday";
import { defaultRoundDate } from "./default-round-date";

import { useContextMenu } from "./use-context-menu";
import { ContextMenu } from "../context-menu";
import { useHandleAction } from "./use-handle-action";
import { defaultGetCopiedTaskId } from "./default-get-copied-task-id";

import { copyTasks } from "../../helpers/copy-tasks";
import { copyOption } from "../../context-menu-options/copy";
import { cutOption } from "../../context-menu-options/cut";
import { pasteOption } from "../../context-menu-options/paste";
import { deleteOption } from "../../context-menu-options/delete";
import { useHolidays } from "./use-holidays";

import styles from "./gantt.module.css";
import { getDateFromX, getXCoordinateFromDate } from "../../helpers/bar-helper";
// import { createWorkingCalendar } from "../../helpers/workingCalendar";

export const defaultColors: ColorStyles = {
  arrowColor: "grey",
  arrowCriticalColor: "#ff0000",
  arrowWarningColor: "#ffbc00",
  barLabelColor: "#000",
  barLabelWhenOutsideColor: "#555",
  barProgressColor: "#59a985",
  barProgressCriticalColor: "#ff1919",
  barProgressSelectedColor: "#28a329",
  barProgressSelectedCriticalColor: "#ff0000",
  barBackgroundColor: "#becbda",
  barBackgroundCriticalColor: "#ff6363",
  barBackgroundSelectedColor: "#9eb1c7",
  barBackgroundSelectedCriticalColor: "#ff8e8e",
  groupProgressColor: "#59a985",
  groupProgressCriticalColor: "#2dbb2e",
  groupProgressSelectedColor: "#28a329",
  groupProgressSelectedCriticalColor: "#28a329",
  groupBackgroundColor: "#becbda",
  groupBackgroundCriticalColor: "#006bc1",
  groupBackgroundSelectedColor: "#9eb1c7",
  groupBackgroundSelectedCriticalColor: "#407fbf",
  projectProgressColor: "#59a985",
  projectProgressCriticalColor: "#7db59a",
  projectProgressSelectedColor: "#28a329",
  projectProgressSelectedCriticalColor: "#59a985",
  projectBackgroundColor: "#fac465",
  projectBackgroundCriticalColor: "#fac465",
  projectBackgroundSelectedColor: "#f7bb53",
  projectBackgroundSelectedCriticalColor: "#f7bb53",
  milestoneBackgroundColor: "#4a6482",
  milestoneBackgroundCriticalColor: "#ff8e8e",
  milestoneBackgroundSelectedColor: "#2f3f51",
  milestoneBackgroundSelectedCriticalColor: "#ff0000",
  evenTaskBackgroundColor: "#f5f5f5",
  oddTaskBackgroundColor: "#fff",
  holidayBackgroundColor: "rgba(233, 233, 233, 0.3)",
  selectedTaskBackgroundColor: "rgba(252, 248, 127, 0.5)",
  taskDragColor: "#7474ff",
  todayColor: "rgba(252, 248, 227, 0.5)",
  contextMenuBoxShadow: "rgb(0 0 0 / 25%) 1px 1px 5px 1px",
  contextMenuBgColor: "#fff",
  contextMenuTextColor: "inherit",
  selectedDayBgColor: "rgba(200, 162, 200, 0.3)",
  selectedDayStrokeColor: "#c8a2c8",
};

const defaultDateFormats: DateFormats = {
  dateColumnFormat: "E, d MMMM yyyy",
  dayBottomHeaderFormat: "E d",
  dayTopHeaderFormat: "E, d",
  hourBottomHeaderFormat: "HH:mm",
  monthBottomHeaderFormat: "LLL",
  monthTopHeaderFormat: "LLLL",
};

export const defaultDistances: Distances = {
  actionColumnWidth: 40,
  arrowIndent: 20,
  barCornerRadius: 3,
  barFill: 60,
  columnWidth: 60,
  contextMenuIconWidth: 20,
  contextMenuOptionHeight: 25,
  contextMenuSidePadding: 10,
  dateCellWidth: 220,
  dependenciesCellWidth: 120,
  dependencyFixHeight: 20,
  dependencyFixIndent: 50,
  dependencyFixWidth: 20,
  expandIconWidth: 20,
  handleWidth: 8,
  headerHeight: 50,
  minimumRowDisplayed: 4,
  nestedTaskNameOffset: 20,
  relationCircleOffset: 10,
  relationCircleRadius: 5,
  rowHeight: 50,
  taskWarningOffset: 35,
  titleCellWidth: 220,
};

const MINIMUM_DISPLAYED_TIME_UNIT = 30;

export const Gantt: React.FC<GanttProps> = ({
  TaskListHeader = TaskListHeaderDefault,
  TaskListTable = TaskListTableDefault,
  TooltipContent = StandardTooltipContent,
  ContextualPalette,
  TaskDependencyContextualPalette,
  authorizedRelations = [
    "startToStart",
    "startToEnd",
    "endToStart",
    "endToEnd",
  ],
  canMoveTasks = true,
  canResizeColumns = true,
  checkIsHoliday: checkIsHolidayProp = defaultCheckIsHoliday,
  selectedDay,
  colors = defaultColors,
  columns: columnsProp = undefined,
  comparisonLevels = 1,
  contextMenuOptions: contextMenuOptionsProp = undefined,
  dateFormats: dateFormatsProp = undefined,
  dateLocale = "enDateLocale" as any,
  distances: distancesProp = undefined,
  enableTableListContextMenu = false,
  fixEndPosition: fixEndPositionProp = undefined,
  fixStartPosition: fixStartPositionProp = undefined,
  fontFamily = "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
  fontSize = "14px",
  getCopiedTaskId = defaultGetCopiedTaskId,
  icons = undefined,
  isDeleteDependencyOnDoubleClick = true,
  isMoveChildsWithParent = true,
  isUpdateDisabledParentsOnChange = true,
  isShowChildOutOfParentWarnings = false,
  isShowCriticalPath = false,
  isShowDependencyWarnings = false,
  isShowTaskNumbers = true,
  isUnknownDates = false,
  isAdjustToWorkingDates = true,
  onAddTask = undefined,
  onAddTaskClick = undefined,
  onArrowDoubleClick: onArrowDoubleClickProp = undefined,
  onChangeExpandState = undefined,
  onChangeTasks = undefined,
  onClick = undefined,
  onDateChange: onDateChangeProp = undefined,
  onDelete = undefined,
  onDoubleClick = undefined,
  onEditTask = undefined,
  onEditTaskClick = undefined,
  onFixDependencyPosition: onFixDependencyPositionProp = undefined,
  onMoveTaskBefore = undefined,
  onMoveTaskAfter = undefined,
  onMoveTaskInside = undefined,
  onProgressChange: onProgressChangeProp = undefined,
  onRelationChange: onRelationChangeProp = undefined,
  onResizeColumn = undefined,
  onWheel,
  preStepsCount = 1,
  renderBottomHeader = undefined,
  renderTopHeader = undefined,
  roundDate: roundDateProp = defaultRoundDate,
  dateMoveStep = { value: 1, timeUnit: GanttDateRoundingTimeUnit.DAY },
  rtl = false,
  tasks,
  timeStep = 300000,
  viewDate,
  viewMode = ViewMode.Day,
  cascadeDependencies = true,
  readOnly = false,
  allowedTypesForFitMove = ["project", "task"],
  style,
  initDate,
  fitProgressToParent,
  fitStartEndToParent = true,
  dropRules,
}) => {
  const ganttSVGRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const targetScrollIndexRef = useRef<number | null>(null);
  const [virtualRightCols, setVirtualRightCols] = useState(0);
  const [startOffsetCols, setStartOffsetCols] = useState(0);
  const [virtualLeftCols, setVirtualLeftCols] = useState(0);

  const { contextMenu, handleCloseContextMenu, handleOpenContextMenu } =
    useContextMenu(wrapperRef);

  const distances = useMemo<Distances>(
    () => ({
      ...defaultDistances,
      ...distancesProp,
    }),
    [distancesProp]
  );

  const [
    ganttTaskContentRef,
    taskListContentRef,
    setScrollYProgrammatically,
    onScrollVertically,
  ] = useVerticalScrollbars();

  const [sortedTasks, setSortedTasks] = useState<TaskOrEmpty[]>(() =>
    [...tasks].sort(sortTasks)
  );

  useEffect(() => {
    const merged = (tasks as Task[]).map(t => {
      const match = (sortedTasks as Task[]).find(st => st.id === t.id);
      const hasChildren = tasks.some(st => st.parent === t.id);
      return {
        ...t,
        hideChildren: match ? match.hideChildren : t.hideChildren,
        hasChildren: hasChildren,
        // isDisabled: t.isDisabled === false ? hasChildren : t.isDisabled,
      };
    });

    (tasks as Task[]).map(task => {
      const prev: Task = (sortedTasks as Task[])!.find(t => t.id === task.id);
      if (prev && prev.updatedTime !== task.updatedTime) {
        if (
          prev.start &&
          task.start &&
          prev.start.getTime() !== task.start.getTime() &&
          prev.end &&
          task.end &&
          prev.end.getTime() !== task.end.getTime()
        ) {
          onDateChange("move", task, prev);
        }

        if (
          prev.start &&
          task.start &&
          prev.start.getTime() !== task.start.getTime()
        ) {
          onDateChange("start", task, prev);
        } else if (
          prev.end &&
          task.end &&
          prev.end.getTime() !== task.end.getTime()
        ) {
          onDateChange("end", task, prev);
        }

        if (
          prev.progress !== undefined &&
          task.progress !== undefined &&
          prev.progress !== task.progress
        ) {
          onProgressChange(task);
        }
      } else {
        return false;
      }
    });

    console.log("merged", merged);
    setSortedTasks([...merged].sort(sortTasks));
  }, [tasks]);

  const [childTasksMap, rootTasksMap] = useMemo(
    () => getChildsAndRoots(sortedTasks, null),
    [sortedTasks]
  );

  const [visibleTasks, visibleTasksMirror] = useMemo(
    () => collectVisibleTasks(childTasksMap, rootTasksMap),
    [childTasksMap, rootTasksMap]
  );

  const [startDate, minTaskDate, baseDatesLength] = useMemo(
    () => ganttDateRange(visibleTasks, viewMode, preStepsCount, selectedDay),
    [visibleTasks, viewMode, preStepsCount]
  );

  const effectiveStartDate = useMemo(
    () => getDateByOffset(startDate, -startOffsetCols, viewMode),
    [startDate, startOffsetCols, viewMode]
  );

  const today = new Date();
  const idx = getDatesDiff(today, effectiveStartDate, viewMode);
  const initialScrollX =
    idx >= 0 ? Math.max((idx - preStepsCount) * distances.columnWidth, 0) : 0;

  const [
    ganttTaskRootRef,
    scrollX,
    setScrollXProgrammatically,
    onVerticalScrollbarScrollX,
    scrollToLeftStep,
    scrollToRightStep,
    scrollXminus,
  ] = useHorizontalScrollbars(initialScrollX);

  const roundDate = useCallback(
    (date: Date, action: BarMoveAction, dateExtremity: DateExtremity) =>
      roundDateProp(date, viewMode, dateExtremity, action),
    [roundDateProp, viewMode]
  );

  // const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(
  //   undefined
  // );

  const tasksMap = useMemo(() => getTasksMap(tasks), [tasks]);

  const checkTaskIdExists = useCallback<CheckTaskIdExistsAtLevel>(
    (newId, comparisonLevel = 1) => {
      const tasksAtLevelMap = tasksMap.get(comparisonLevel);

      if (!tasksAtLevelMap) {
        return false;
      }

      return tasksAtLevelMap.has(newId);
    },
    [tasksMap]
  );

  const makeCopies = useCallback(
    (tasksForCopy: readonly TaskOrEmpty[]) =>
      copyTasks(tasksForCopy, getCopiedTaskId, checkTaskIdExists),
    [checkTaskIdExists, getCopiedTaskId]
  );

  const mapTaskToGlobalIndex = useMemo(
    () => getMapTaskToGlobalIndex(tasks),
    [tasks]
  );

  const getTaskGlobalIndexByRef = useCallback(
    (task: Task) => {
      const { id, comparisonLevel = 1 } = task;

      const indexesByLevel = mapTaskToGlobalIndex.get(comparisonLevel);

      if (!indexesByLevel) {
        return -1;
      }

      const res = indexesByLevel.get(id);

      if (typeof res === "number") {
        return res;
      }

      return -1;
    },
    [mapTaskToGlobalIndex]
  );

  const mapTaskToNestedIndex = useMemo(
    () => getMapTaskToNestedIndex(childTasksMap, rootTasksMap),
    [childTasksMap, rootTasksMap]
  );

  const childOutOfParentWarnings = useMemo(() => {
    if (!isShowChildOutOfParentWarnings) {
      return null;
    }

    return getChildOutOfParentWarnings(tasks, childTasksMap);
  }, [tasks, childTasksMap, isShowChildOutOfParentWarnings]);

  const fullRowHeight = useMemo(
    () => distances.rowHeight * comparisonLevels,
    [distances, comparisonLevels]
  );

  const renderedRowIndexes = useOptimizedList(
    ganttTaskContentRef,
    "scrollTop",
    distances.rowHeight
  );

  const colorStyles = useMemo<ColorStyles>(
    () => ({
      ...defaultColors,
      ...colors,
    }),
    [colors]
  );

  const taskHeight = useMemo(
    () => (distances.rowHeight * distances.barFill) / 100,
    [distances]
  );

  const taskYOffset = useMemo(
    () => (distances.rowHeight - taskHeight) / 2,
    [distances, taskHeight]
  );

  const taskHalfHeight = useMemo(
    () => Math.round(taskHeight / 2),
    [taskHeight]
  );

  const maxLevelLength = useMemo(() => {
    let maxLength = 0;
    const countByLevel: Record<string, number> = {};

    visibleTasks.forEach(({ comparisonLevel = 1 }) => {
      if (!countByLevel[comparisonLevel]) {
        countByLevel[comparisonLevel] = 0;
      }

      ++countByLevel[comparisonLevel];

      if (
        comparisonLevel <= comparisonLevels &&
        maxLength < countByLevel[comparisonLevel]
      ) {
        maxLength = countByLevel[comparisonLevel];
      }
    });

    return maxLength;
  }, [visibleTasks, comparisonLevels]);

  const ganttFullHeight = useMemo(
    () => maxLevelLength * fullRowHeight,
    [maxLevelLength, fullRowHeight]
  );

  const [taskToRowIndexMap, rowIndexToTaskMap, mapGlobalRowIndexToTask] =
    useMemo(
      () => getMapTaskToRowIndex(visibleTasks, comparisonLevels),
      [visibleTasks, comparisonLevels]
    );

  const {
    checkHasCopyTasks,
    checkHasCutTasks,
    copyIdsMirror,
    copySelectedTasks,
    copyTask,
    cutIdsMirror,
    cutSelectedTasks,
    cutTask,
    resetSelectedTasks,
    selectTaskOnMouseDown,
    selectedIdsMirror,
  } = useSelection(taskToRowIndexMap, rowIndexToTaskMap, checkTaskIdExists);

  const datesLength = baseDatesLength + virtualRightCols + virtualLeftCols;

  const getDate = useCallback(
    (index: number) => getDateByOffset(effectiveStartDate, index, viewMode),
    [effectiveStartDate, viewMode]
  );

  const dateFormats = useMemo<DateFormats>(
    () => ({
      ...defaultDateFormats,
      ...dateFormatsProp,
    }),
    [dateFormatsProp]
  );

  const dateSetup = useMemo<DateSetup>(
    () => ({
      dateFormats,
      dateLocale,
      isUnknownDates,
      preStepsCount,
      viewMode,
    }),
    [dateFormats, dateLocale, isUnknownDates, preStepsCount, viewMode]
  );

  const { checkIsHoliday, adjustTaskToWorkingDates } = useHolidays({
    checkIsHolidayProp: (date, minTaskDate, dateSetup, dateExtremity) => {
      if (checkIsHolidayProp?.(date, minTaskDate, dateSetup, dateExtremity)) {
        return true;
      }

      // if (selectedDay) {
      //   const d1 = date.toISOString().slice(0, 10);
      //   const d2 = selectedDay.toISOString().slice(0, 10);
      //   return d1 === d2;
      // }

      return false;
    },
    dateSetup,
    isAdjustToWorkingDates,
    minTaskDate,
    roundDate,
    dateMoveStep,
  });

  const svgWidth = useMemo(
    () =>
      Math.max(MINIMUM_DISPLAYED_TIME_UNIT, datesLength) *
      distances.columnWidth,
    [datesLength, distances]
  );

  const renderedColumnIndexes = useOptimizedList(
    ganttTaskRootRef,
    "scrollLeft",
    distances.columnWidth
  );

  const svgClientWidth = renderedColumnIndexes && renderedColumnIndexes[4];

  useEffect(() => {
    if (!selectedDay) return;

    const dateX = getXCoordinateFromDate(
      selectedDay,
      effectiveStartDate,
      viewMode,
      distances.columnWidth
    );
    // Center the selected day in the viewport
    const viewportWidth = ganttTaskRootRef.current?.clientWidth ?? 0;
    const centeredX = Math.max(0, dateX - viewportWidth / 2 + distances.columnWidth / 2);
    setScrollXProgrammatically(centeredX);
  }, [selectedDay, effectiveStartDate, viewMode, distances.columnWidth, setScrollXProgrammatically]);

  useEffect(() => {
    // Skip if selectedDay is set - its useEffect handles scroll positioning
    if (!startDate || selectedDay) return;

    const dateX = getXCoordinateFromDate(
      startDate,
      effectiveStartDate,
      viewMode,
      distances.columnWidth
    );
    setScrollXProgrammatically(dateX - 100);
  }, [startDate?.getTime(), selectedDay]);

  useEffect(() => {
    if (!svgClientWidth) return;

    const thresholdPx = 6 * distances.columnWidth;
    if (scrollX < thresholdPx) {
      const CHUNK_BY_MODE: Record<ViewMode, number> = {
        [ViewMode.Hour]: 24 * 7,
        [ViewMode.QuarterDay]: 4 * 30,
        [ViewMode.HalfDay]: 2 * 30,
        [ViewMode.Day]: 90,
        [ViewMode.TwoDays]: 90,
        [ViewMode.Week]: 52,
        [ViewMode.Month]: 24,
        [ViewMode.QuarterYear]: 12,
        [ViewMode.Year]: 10,
      };
      let chunk = CHUNK_BY_MODE[viewMode] || 52;

      if (scrollX === 0 && scrollXminus < 0) {
        chunk =
          Math.ceil(-scrollXminus / (chunk * distances.columnWidth)) * chunk;
        setVirtualLeftCols(v => v + chunk);
        setStartOffsetCols(v => v + chunk);

        // console.log("setScrollXProgrammatically", scrollX, scrollXminus);
        setScrollXProgrammatically(
          scrollXminus + chunk * distances.columnWidth
        );
      } else {
        setVirtualLeftCols(v => v + chunk);
        setStartOffsetCols(v => v + chunk);

        // console.log("setScrollXProgrammatically", scrollX, scrollXminus);
        setScrollXProgrammatically(scrollX + chunk * distances.columnWidth);
      }
    }
  }, [scrollX, scrollXminus, svgClientWidth, distances.columnWidth, viewMode]);

  useEffect(() => {
    if (!svgClientWidth) return;

    const thresholdPx =
      svgWidth -
      (ganttTaskRootRef.current?.clientWidth ?? 0) -
      6 * distances.columnWidth;

    if (scrollX > thresholdPx) {
      const CHUNK_BY_MODE: Record<ViewMode, number> = {
        [ViewMode.Hour]: 24 * 7,
        [ViewMode.QuarterDay]: 4 * 30,
        [ViewMode.HalfDay]: 2 * 30,
        [ViewMode.Day]: 90,
        [ViewMode.TwoDays]: 90,
        [ViewMode.Week]: 52,
        [ViewMode.Month]: 24,
        [ViewMode.QuarterYear]: 12,
        [ViewMode.Year]: 10,
      };
      const chunk = CHUNK_BY_MODE[viewMode] || 52;

      setVirtualRightCols(v => v + chunk);
    }
  }, [scrollX, svgClientWidth, svgWidth, distances.columnWidth, viewMode]);

  const [scrollDate, setScrollDate] = useState(undefined);

  useEffect(() => {
    if (!scrollX) return;
    const dateX = getDateFromX(scrollX, 0, effectiveStartDate, xStep, timeStep);
    setScrollDate(dateX);
  }, [scrollX]);

  useEffect(() => {
    if (!scrollDate) return;
    const initialScrollX2 = getXCoordinateFromDate(
      scrollDate,
      effectiveStartDate,
      viewMode,
      distances.columnWidth
    );
    setScrollXProgrammatically(initialScrollX2 - 100);
  }, [
    // viewDate,
    // startDate,
    viewMode,
    // baseDatesLength,
    // virtualRightCols,
    // distances.columnWidth,
    // setScrollXProgrammatically,
    // effectiveStartDate,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resetSelectedTasks();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetSelectedTasks]);

  useEffect(() => {
    if (targetScrollIndexRef.current == null) return;

    const idx = targetScrollIndexRef.current;
    const currentTotal = baseDatesLength + virtualRightCols;

    if (idx < currentTotal) {
      setScrollXProgrammatically(distances.columnWidth * idx);
      targetScrollIndexRef.current = null;
    }
  }, [
    baseDatesLength,
    virtualRightCols,
    distances.columnWidth,
    setScrollXProgrammatically,
  ]);

  const countTaskCoordinates = useCallback(
    (task: Task) =>
      defaultCountTaskCoordinates(
        task,
        taskToRowIndexMap,
        effectiveStartDate,
        viewMode,
        rtl,
        fullRowHeight,
        taskHeight,
        taskYOffset,
        distances,
        svgWidth
      ),
    [
      taskToRowIndexMap,
      effectiveStartDate,
      viewMode,
      rtl,
      fullRowHeight,
      taskHeight,
      taskYOffset,
      distances,
      svgWidth,
    ]
  );

  const mapTaskToCoordinates = useMemo(
    () =>
      getMapTaskToCoordinates(
        tasks,
        visibleTasksMirror,
        taskToRowIndexMap,
        effectiveStartDate, // was: startDate
        viewMode,
        rtl,
        fullRowHeight,
        taskHeight,
        taskYOffset,
        distances,
        svgWidth
      ),
    [
      distances,
      fullRowHeight,
      taskToRowIndexMap,
      rtl,
      effectiveStartDate, // was: startDate
      svgWidth,
      taskHeight,
      tasks,
      taskYOffset,
      viewMode,
      visibleTasksMirror,
    ]
  );

  const scrollToTask = useCallback(
    (task: Task) => {
      const { x1 } = getTaskCoordinatesDefault(task, mapTaskToCoordinates);

      setScrollXProgrammatically(x1 - 100);
    },
    [mapTaskToCoordinates, setScrollXProgrammatically]
  );

  const [dependencyMap, dependentMap, dependencyMarginsMap] = useMemo(
    () =>
      getDependencyMapAndWarnings(
        tasks,
        visibleTasksMirror,
        tasksMap,
        mapTaskToCoordinates,
        fullRowHeight,
        isShowDependencyWarnings,
        isShowCriticalPath
      ),
    [
      tasks,
      visibleTasksMirror,
      tasksMap,
      mapTaskToCoordinates,
      fullRowHeight,
      isShowDependencyWarnings,
      isShowCriticalPath,
    ]
  );

  const criticalPaths = useMemo(() => {
    if (isShowCriticalPath) {
      return getCriticalPath(
        rootTasksMap,
        childTasksMap,
        tasksMap,
        dependencyMarginsMap,
        dependencyMap
      );
    }

    return null;
  }, [
    isShowCriticalPath,
    rootTasksMap,
    childTasksMap,
    tasksMap,
    dependencyMarginsMap,
    dependencyMap,
  ]);

  const taskToHasDependencyWarningMap = useMemo(() => {
    if (!isShowDependencyWarnings) {
      return null;
    }

    return getTaskToHasDependencyWarningMap(dependencyMarginsMap);
  }, [dependencyMarginsMap, isShowDependencyWarnings]);

  useEffect(() => {
    if (rtl) {
      setScrollXProgrammatically(datesLength * distances.columnWidth);
    }
  }, [datesLength, distances, rtl, setScrollXProgrammatically, scrollX]);

  // useEffect(() => {
  //   if (
  //     (viewDate && !currentViewDate) ||
  //     (viewDate && currentViewDate?.valueOf() !== viewDate.valueOf())
  //   ) {
  //     const index = getDatesDiff(viewDate, effectiveStartDate, viewMode);

  //     if (index < 0) {
  //       return;
  //     }
  //     setCurrentViewDate(viewDate);
  //     setScrollXProgrammatically(distances.columnWidth * index);
  //   }
  // }, [
  //   currentViewDate,
  //   distances,
  //   effectiveStartDate,
  //   setCurrentViewDate,
  //   setScrollXProgrammatically,
  //   startDate,
  //   viewDate,
  //   viewMode,
  // ]);

  // scroll events
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (onWheel) {
        onWheel(event);
      }

      // do nothing special to let the default navigator behavior that will scroll
    };

    const wrapperNode = wrapperRef.current;

    // subscribe if scrol necessary
    if (wrapperNode) {
      wrapperNode.addEventListener("wheel", handleWheel, {
        passive: false,
      });
    }

    return () => {
      if (wrapperNode) {
        wrapperNode.removeEventListener("wheel", handleWheel);
      }
    };
  }, [wrapperRef, onWheel]);

  /**
   * Handles arrow keys events and transform it to new scroll
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT") {
      return;
    }
    const { columnWidth, rowHeight } = distances;
    event.preventDefault();
    let newScrollY = ganttTaskContentRef.current.scrollTop;
    let newScrollX = scrollX;
    let isX = true;
    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        newScrollY += rowHeight;
        isX = false;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        newScrollY -= rowHeight;
        isX = false;
        break;
      case "Left":
      case "ArrowLeft":
        newScrollX -= columnWidth;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
        newScrollX += columnWidth;
        break;
    }
    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }
      setScrollXProgrammatically(newScrollX);
    } else {
      setScrollYProgrammatically(newScrollY);
    }
  };

  const handleExpanderClick = useCallback(
    (clickedTask: Task) => {
      // delegate the behavior
      if (onChangeExpandState) {
        onChangeExpandState({
          ...clickedTask,
          hideChildren: !clickedTask.hideChildren,
        });
      } else {
        //otherwise change the internal state
        setSortedTasks(prev => {
          return prev.map(task => {
            if (clickedTask.id === task.id) {
              return { ...task, hideChildren: !clickedTask.hideChildren };
            }
            return task;
          });
        });
      }
    },
    [onChangeExpandState]
  );

  const onCollapseAll = () => {
    setSortedTasks(prev => prev.map(task => ({ ...task, hideChildren: true })));
  };

  const onExpandFirstLevel = () => {
    setSortedTasks(prev =>
      prev.map(task => {
        // If a task is a top-level task, show its children
        if (!task.parent) {
          return { ...task, hideChildren: false };
        }
        // For non-top-level tasks, collapse them by default
        return { ...task, hideChildren: true };
      })
    );
  };

  const onExpandAll = () => {
    setSortedTasks(prev =>
      prev.map(task => ({ ...task, hideChildren: false }))
    );
  };

  const getMetadata = useCallback(
    (changeAction: ChangeAction) =>
      getChangeTaskMetadata({
        adjustTaskToWorkingDates,
        changeAction,
        childTasksMap: childTasksMap,
        dependentMap,
        mapTaskToGlobalIndex,
        isUpdateDisabledParentsOnChange,
        isMoveChildsWithParent,
        tasksMap: tasksMap,
      }),
    [
      adjustTaskToWorkingDates,
      childTasksMap,
      dependentMap,
      isMoveChildsWithParent,
      isUpdateDisabledParentsOnChange,
      mapTaskToGlobalIndex,
      tasksMap,
    ]
  );

  /**
   * Result is not readonly for optimization
   */
  const prepareSuggestions = useCallback(
    (suggestions: readonly OnDateChangeSuggestionType[]): TaskOrEmpty[] => {
      const prevTasks = [...tasks];

      const nextTasks = prevTasks;

      suggestions.forEach(([start, end, task, index]) => {
        nextTasks[index] = {
          ...task,
          start,
          end,
        };
      });

      return nextTasks;
    },
    [tasks]
  );

  const handleEditTask = useCallback(
    (task: TaskOrEmpty) => {
      if (!onEditTaskClick && (!onEditTask || !onChangeTasks)) {
        return;
      }

      const { id, comparisonLevel = 1 } = task;

      const indexesOnLevel = mapTaskToGlobalIndex.get(comparisonLevel);

      if (!indexesOnLevel) {
        throw new Error(`Indexes are not found for level ${comparisonLevel}`);
      }

      const taskIndex = indexesOnLevel.get(id);

      if (typeof taskIndex !== "number") {
        throw new Error(`Index is not found for task ${id}`);
      }

      if (onEditTaskClick) {
        onEditTaskClick(task, taskIndex, (changedTask: TaskOrEmpty) =>
          getMetadata({
            type: "change",
            task: changedTask,
          })
        );
      } else if (onEditTask && onChangeTasks) {
        onEditTask(task).then(nextTask => {
          if (!nextTask) {
            return;
          }

          const [, , , suggestions] = getMetadata({
            type: "change",
            task: nextTask,
          });

          const withSuggestions = prepareSuggestions(suggestions);

          withSuggestions[taskIndex] = nextTask;

          onChangeTasks(withSuggestions, {
            type: "edit_task",
          });
        });
      }
    },
    [
      onChangeTasks,
      onEditTask,
      onEditTaskClick,
      getMetadata,
      mapTaskToGlobalIndex,
      prepareSuggestions,
    ]
  );

  const handleAddChilds = useCallback(
    (parent: Task, descendants: readonly TaskOrEmpty[]) => {
      if (!onChangeTasks) {
        return;
      }

      const addedIdsMap = new Map<number, Set<string>>();

      descendants.forEach(descendant => {
        const { id: descendantId, comparisonLevel = 1 } = descendant;

        const addedIdsAtLevelSet =
          addedIdsMap.get(comparisonLevel) || new Set<string>();

        addedIdsAtLevelSet.add(descendantId);

        addedIdsMap.set(comparisonLevel, addedIdsAtLevelSet);
      });

      const [addedChildsByLevelMap, addedRootsByLevelMap] = getChildsAndRoots(
        descendants,
        descendant => {
          const { comparisonLevel = 1, parent } = descendant;

          if (!parent) {
            return true;
          }

          const addedIdsAtLevelSet = addedIdsMap.get(comparisonLevel);

          if (!addedIdsAtLevelSet) {
            throw new Error(`Ids are not found at level ${comparisonLevel}`);
          }

          return !addedIdsAtLevelSet.has(parent);
        }
      );

      const [, [{ index: taskIndex }], , suggestions] = getMetadata({
        type: "add-childs",
        parent,
        addedIdsMap,
        addedChildsByLevelMap,
        addedRootsByLevelMap,
        descendants,
      });

      const withSuggestions = prepareSuggestions(suggestions);

      descendants.forEach((descendant, index) => {
        const { parent: parentId, comparisonLevel = 1 } = descendant;

        const addedIdsAtLevelSet = addedIdsMap.get(comparisonLevel);

        if (!addedIdsAtLevelSet) {
          throw new Error(`Ids are not found at level ${comparisonLevel}`);
        }

        const nextTask =
          !parentId || !addedIdsAtLevelSet.has(parentId)
            ? {
                ...descendant,
                parent: parent.id,
              }
            : descendant;

        withSuggestions.splice(taskIndex + 1 + index, 0, nextTask);
      });

      onChangeTasks(withSuggestions, {
        type: "add_tasks",
      });
    },
    [onChangeTasks, getMetadata, prepareSuggestions]
  );

  const handleAddTask = useCallback(
    (parent?: Task) => {
      // if parent not passed OR not in the current list - this is adding a root
      const isRootAdd =
        !parent ||
        !tasks.some(
          t =>
            t.id === parent.id &&
            (t.comparisonLevel ?? 1) === (parent.comparisonLevel ?? 1)
        );

      if (onAddTaskClick) {
        onAddTaskClick(parent as any, (newTask: TaskOrEmpty) => {
          if (isRootAdd) {
            // root insertion: just append to the end
            if (onChangeTasks && newTask && newTask.type !== "empty") {
              const next = [...tasks, newTask as Task];
              onChangeTasks(next, { type: "add_root" });
            }
            // nothing further to calculate
            return;
          }

          return getMetadata({
            type: "add-childs",
            parent: parent!,
            descendants: [newTask],
            addedIdsMap: new Map([
              [newTask.comparisonLevel || 1, new Set([newTask.id])],
            ]),
            addedChildsByLevelMap: new Map([
              [newTask.comparisonLevel || 1, new Map()],
            ]),
            addedRootsByLevelMap: new Map([
              [newTask.comparisonLevel || 1, [newTask]],
            ]),
          });
        });
        return;
      }

      if (onAddTask && onChangeTasks) {
        onAddTask(parent as any).then(nextTask => {
          if (!nextTask) return;

          if (isRootAdd) {
            onChangeTasks([...tasks, nextTask], { type: "add_root" });
          } else {
            handleAddChilds(parent!, [nextTask]);
          }
        });
      }
    },
    [
      tasks,
      onAddTaskClick,
      onAddTask,
      onChangeTasks,
      getMetadata,
      handleAddChilds,
    ]
  );

  const xStep = useMemo(() => {
    const secondDate = getDateByOffset(effectiveStartDate, 1, viewMode);
    const dateDelta =
      secondDate.getTime() -
      effectiveStartDate.getTime() -
      secondDate.getTimezoneOffset() * 60 * 1000 +
      effectiveStartDate.getTimezoneOffset() * 60 * 1000;

    return (timeStep * distances.columnWidth) / dateDelta;
  }, [distances, effectiveStartDate, timeStep, viewMode]);

  const collectCascadeSet = useCallback(
    (root: Task, action: BarMoveAction): Task[] => {
      const byId = new Map<string, Task>();
      tasks.forEach(t => {
        if (t.type !== "empty") byId.set(t.id, t as Task);
      });

      const dependents = new Map<string, string[]>();

      tasks.forEach(t => {
        if (t.type === "empty") return;
        const deps = (t.dependencies ?? []) as Dependency[];
        deps.forEach(({ sourceId }) => {
          const arr = dependents.get(sourceId) ?? [];
          arr.push(t.id);
          dependents.set(sourceId, arr);
        });
      });

      const res: Task[] = [];
      const visited = new Set<string>();

      // For resize operations (start/end), we need to track the root task's ID
      const isResizeAction = action === "start" || action === "end";
      const rootTaskId = root.id;

      const add = (t: Task, skipChildren: boolean = false) => {
        if (!t || visited.has(t.id)) return;
        visited.add(t.id);
        res.push(t);

        const level = t.comparisonLevel ?? 1;
        const byLevel = childTasksMap.get(level);
        const children = (byLevel?.get(t.id) ?? []).filter(
          (c): c is Task => c.type !== "empty"
        );

        // Skip children of the ROOT task when resizing, but include children
        // of dependent tasks that get cascaded
        const shouldSkipChildren =
          skipChildren || (isResizeAction && t.id === rootTaskId);

        if (!shouldSkipChildren) {
          children.forEach(child => add(child, false));
        }

        const nextIds = dependents.get(t.id) ?? [];
        nextIds.forEach(id => {
          const n = byId.get(id);
          if (n) add(n, false);
        });
      };

      // Start with the root task, marking that we should skip its children if resizing
      add(root, isResizeAction);
      return res;
    },
    [tasks, childTasksMap]
  );

  // Expand parents ONLY when child exceeds their boundaries.
  const expandParentsToFitChildren = (items: Task[]): Task[] => {
    const byId = new Map(items.map(t => [t.id, t]));

    // map parentId -> children
    const childrenMap = new Map<string, string[]>();
    for (const t of items) {
      if (t.parent) {
        const arr = childrenMap.get(t.parent) ?? [];
        arr.push(t.id);
        childrenMap.set(t.parent, arr);
      }
    }

    // Calculate min/max bounds from all descendants (recursive)
    const boundsCache = new Map<string, { min: number; max: number }>();

    const computeChildBounds = (
      id: string
    ): { min: number; max: number } | null => {
      if (boundsCache.has(id)) return boundsCache.get(id)!;

      const subs = childrenMap.get(id);

      // Leaf node - return its own bounds
      if (!subs || subs.length === 0) {
        const t = byId.get(id);
        if (!t) return null;
        const range = { min: t.start.getTime(), max: t.end.getTime() };
        boundsCache.set(id, range);
        return range;
      }

      // We need to include the task's own dates because if this task was
      // resized beyond its children, we still want to capture that extension
      const t = byId.get(id);
      if (!t) return null;

      // Start with task's own bounds
      let min = t.start.getTime();
      let max = t.end.getTime();

      // Extend with children's bounds
      for (const cid of subs) {
        const cb = computeChildBounds(cid);
        if (cb) {
          if (cb.min < min) min = cb.min;
          if (cb.max > max) max = cb.max;
        }
      }

      const result = { min, max };
      boundsCache.set(id, result);
      return result;
    };

    // Compute bounds for all tasks
    for (const t of items) {
      computeChildBounds(t.id);
    }

    // Only EXPAND parents, never shrink
    return items.map(t => {
      // Only process allowed types that have children
      if (!allowedTypesForFitMove.includes(t.type as any)) return t;
      if (!childrenMap.has(t.id)) return t;

      const childBounds = boundsCache.get(t.id);
      if (!childBounds) return t;

      const parentStart = t.start.getTime();
      const parentEnd = t.end.getTime();

      // Only expand if child exceeds parent boundaries
      const needsExpandStart = childBounds.min < parentStart;
      const needsExpandEnd = childBounds.max > parentEnd;

      if (!needsExpandStart && !needsExpandEnd) return t;

      return {
        ...t,
        start: needsExpandStart ? new Date(childBounds.min) : t.start,
        end: needsExpandEnd ? new Date(childBounds.max) : t.end,
      };
    });
  };

  const onDateChange = useCallback(
    (action: BarMoveAction, changedTask: Task, originalTask: Task) => {
      let adjustedTask = adjustTaskToWorkingDates({
        action,
        changedTask,
        originalTask,
        roundDate,
      });

      // When resizing a parent, constrain it to fit children bounds
      if (fitStartEndToParent && (action === "start" || action === "end")) {
        adjustedTask = constrainTaskToChildren(
          adjustedTask,
          action,
          childTasksMap,
          rtl,
          allowedTypesForFitMove
        );
      }

      // if (action !== "move" || !cascadeDependencies) {
      if (!cascadeDependencies) {
        const changeAction: ChangeAction =
          action === "move"
            ? {
                type: "change_start_and_end",
                task: adjustedTask,
                changedTask,
                originalTask,
              }
            : { type: "change", task: adjustedTask };

        const [dependentTasks, taskIndexes, parents, suggestions] =
          getMetadata(changeAction);
        const taskIndex = taskIndexes[0].index;

        onDateChangeProp?.(
          adjustedTask,
          dependentTasks,
          taskIndex,
          parents,
          suggestions
        );

        if (onChangeTasks) {
          let withSuggestions = prepareSuggestions(suggestions);
          withSuggestions[taskIndex] = adjustedTask;

          // Auto-expand parents when child exceeds their boundaries
          if (fitStartEndToParent) {
            const parents = getAllParents(
              withSuggestions as Task[],
              adjustedTask.id
            );
            // Explicitly include adjustedTask to ensure updated dates are used
            const parentItems = expandParentsToFitChildren([
              ...parents,
              adjustedTask,
            ] as Task[]);

            withSuggestions = withSuggestions.map(item => {
              const updated = parentItems.find(p => p.id === item.id);
              return updated ? updated : item;
            }) as TaskOrEmpty[];
          }

          onChangeTasks(withSuggestions, { type: "date_change" });
        }
        return;
      }

      const delta = adjustedTask.start.getTime() - originalTask.start.getTime();
      // Pass the action to collectCascadeSet so it knows whether to include children
      const cascadeSet = collectCascadeSet(originalTask, action);

      const draft = [...tasks];
      const movedIdxs = new Set<number>();
      const idxOf = (t: Task) => getTaskGlobalIndexByRef(t);

      cascadeSet.forEach(t => {
        const idx = idxOf(t);
        if (idx >= 0) {
          draft[idx] = {
            ...t,
            start: new Date(t.start.getTime() + delta),
            end: new Date(t.end.getTime() + delta),
          };
          movedIdxs.add(idx);
        }
      });

      const byIndex = new Map<number, OnDateChangeSuggestionType>();
      const merge = (arr: readonly OnDateChangeSuggestionType[]) => {
        arr.forEach(s => byIndex.set(s[3], s));
      };

      const currentFromDraft = (t: Task): Task => {
        const idx = idxOf(t);
        return idx >= 0 ? (draft[idx] as Task) : t;
      };

      cascadeSet.forEach(t => {
        const curr = currentFromDraft(t);
        const [, , , sugg] = getMetadata({ type: "change", task: curr });
        merge(sugg);
      });

      if (onChangeTasks) {
        const merged = Array.from(byIndex.values());
        let next = prepareSuggestions(merged);

        movedIdxs.forEach(idx => {
          if (!byIndex.has(idx)) {
            const t = next[idx] as Task;
            next[idx] = {
              ...t,
              start: new Date(t.start.getTime() + delta),
              end: new Date(t.end.getTime() + delta),
            };
          }
        });

        const movedIdx = idxOf(originalTask);
        if (movedIdx >= 0) next[movedIdx] = adjustedTask;

        if (fitStartEndToParent) {
          const parents = getAllParents(next as Task[], adjustedTask.id);

          const parentItems = expandParentsToFitChildren([
            ...parents,
            adjustedTask,
          ] as Task[]);

          next = next.map(item => {
            const updated = parentItems.find(p => p.id === item.id);
            return updated ? updated : item;
          });
        }

        onChangeTasks(next, { type: "date_change_cascade" });
      }
    },
    [
      adjustTaskToWorkingDates,
      allowedTypesForFitMove,
      cascadeDependencies,
      childTasksMap,
      collectCascadeSet,
      fitStartEndToParent,
      getMetadata,
      onChangeTasks,
      onDateChangeProp,
      prepareSuggestions,
      roundDate,
      rtl,
      tasks,
      getTaskGlobalIndexByRef,
    ]
  );

  type FitProgressOptions = {
    /** Pokud je true, výpočet progressu zohlední délku trvání (end - start) */
    weighted?: boolean;
  };

  const fitParentsProgressToChildren = (
    items: Task[],
    options: FitProgressOptions = {}
  ): Task[] => {
    const { weighted = false } = options;

    // map id -> task
    const byId = new Map(items.map(t => [t.id, t]));

    // map parentId -> children
    const children = new Map<string, string[]>();
    for (const t of items) {
      if (t.parent) {
        const arr = children.get(t.parent) ?? [];
        arr.push(t.id);
        children.set(t.parent, arr);
      }
    }

    // cache výsledků, aby se každý uzel počítal jen jednou
    const progressCache = new Map<string, number>();

    // 🔁 rekurzivní výpočet progressu
    const computeProgress = (id: string): number | null => {
      const subs = children.get(id);

      // leaf → vrátíme jeho vlastní progress
      if (!subs || subs.length === 0) {
        const t = byId.get(id);
        if (!t) return null;
        const p = typeof t.progress === "number" ? t.progress : 0;
        progressCache.set(id, p);
        return p;
      }

      let total = 0;
      let weightSum = 0;

      for (const cid of subs) {
        const child = byId.get(cid);
        if (!child) continue;

        const childProgress = progressCache.get(cid) ?? computeProgress(cid);
        if (typeof childProgress !== "number") continue;

        // Váha = délka trvání (pokud je zapnuto vážení)
        const weight = weighted
          ? Math.max(1, child.end.getTime() - child.start.getTime() || 1)
          : 1;

        total += childProgress * weight;
        weightSum += weight;
      }

      if (weightSum === 0) return null;

      const avg = total / weightSum;
      progressCache.set(id, avg);
      return avg;
    };

    // najdeme všechny rooty (bez parenta)
    const roots = items.filter(t => !t.parent);
    for (const root of roots) {
      computeProgress(root.id);
    }

    // vytvoříme nové items s aktualizovaným progress
    const newItems = items.map(t => {
      const cached = progressCache.get(t.id);
      if (typeof cached === "number" && cached !== t.progress) {
        return { ...t, progress: cached };
      }
      return t;
    });

    return newItems;
  };

  const onProgressChange = useCallback(
    (task: Task) => {
      const [dependentTasks, taskIndexes] = getMetadata({
        type: "change",
        task,
      });

      const taskIndex = taskIndexes[0].index;

      // if (!fitProgressToParent && onProgressChangeProp && !onChangeTasks) {
      if (onProgressChangeProp && (!onChangeTasks || !fitProgressToParent)) {
        onProgressChangeProp(task, dependentTasks, taskIndex);
        return;
      }

      let parentItems: Task[] = [];
      if (fitProgressToParent) {
        if (task.parent) {
          let parents = getAllParents(tasks as Task[], task.id);
          parents = parents.map(item => (item.id === task.id ? task : item));
          parentItems = fitParentsProgressToChildren(parents);
        }
      }

      let nextTasks = [...tasks];
      if (onChangeTasks) {
        if (fitProgressToParent) {
          nextTasks = nextTasks.map(item => {
            const updated = parentItems.find(p => p.id === item.id);
            return updated ? updated : item;
          });
        } else {
          nextTasks[taskIndex] = task;
        }
        // nextTasks[taskIndex] = task;
        onChangeTasks(nextTasks, {
          type: "progress_change",
        });
      }
    },
    [getMetadata, onChangeTasks, onProgressChangeProp, childTasksMap]
  );

  const [changeInProgress, handleTaskDragStart] = useTaskDrag({
    allowedTypesForFitMove,
    childTasksMap,
    dependentMap,
    ganttSVGRef,
    mapTaskToCoordinates,
    mapTaskToGlobalIndex,
    onDateChange,
    onProgressChange,
    rtl,
    roundDate,
    dateMoveStep,
    scrollToLeftStep,
    scrollToRightStep,
    scrollX,
    setScrollXProgrammatically,
    svgClientWidth,
    svgWidth,
    tasksMap,
    timeStep,
    xStep,
  });

  const {
    tooltipTask,
    tooltipX,
    tooltipY,
    tooltipStrategy,
    setFloatingRef,
    getFloatingProps,
    onChangeTooltipTask,
  } = useTaskTooltip(changeInProgress);

  const handleDeleteTasks = useCallback(
    (tasksForDelete: readonly TaskOrEmpty[]) => {
      if (!onDelete && !onChangeTasks) {
        return;
      }

      onChangeTooltipTask(null, null);

      const deletedIdsMap = new Map<number, Set<string>>();

      tasksForDelete.forEach(task => {
        const { id: taskId, comparisonLevel = 1 } = task;

        const deletedIdsAtLevel =
          deletedIdsMap.get(comparisonLevel) || new Set<string>();
        deletedIdsAtLevel.add(taskId);

        deletedIdsMap.set(comparisonLevel, deletedIdsAtLevel);
      });

      const [dependentTasks, taskIndexes, parents, suggestions] = getMetadata({
        type: "delete",
        tasks: tasksForDelete,
        deletedIdsMap,
      });

      if (onDelete) {
        onDelete(
          tasksForDelete,
          dependentTasks,
          taskIndexes,
          parents,
          suggestions
        );
      }

      if (onChangeTasks) {
        let withSuggestions = prepareSuggestions(suggestions);

        suggestions.forEach(([start, end, task, index]) => {
          withSuggestions[index] = {
            ...task,
            start,
            end,
          };
        });

        const deletedIndexesSet = new Set(
          taskIndexes.map(({ index }) => index)
        );

        withSuggestions = withSuggestions.filter(
          (_, index) => !deletedIndexesSet.has(index)
        );

        onChangeTasks(withSuggestions, {
          type: "delete_task",
          payload: {
            tasks: tasksForDelete,
            taskIndexes: [...deletedIndexesSet],
          },
        });
      }
    },
    [
      getMetadata,
      onChangeTasks,
      onDelete,
      prepareSuggestions,
      onChangeTooltipTask,
    ]
  );

  const handleMoveTaskAfter = useCallback(
    (target: TaskOrEmpty, taskForMove: TaskOrEmpty) => {
      if (!onMoveTaskAfter && !onChangeTasks) {
        return;
      }

      onChangeTooltipTask(null, null);

      const [dependentTasks, taskIndexes, parents, suggestions] = getMetadata({
        type: "move-after",
        target,
        taskForMove,
      });

      const taskIndex = taskIndexes[0].index;

      const { id, comparisonLevel = 1 } = taskForMove;

      const indexesOnLevel = mapTaskToGlobalIndex.get(comparisonLevel);

      if (!indexesOnLevel) {
        throw new Error(`Indexes are not found for level ${comparisonLevel}`);
      }

      const taskForMoveIndex = indexesOnLevel.get(id);

      if (typeof taskForMoveIndex !== "number") {
        throw new Error(`Index is not found for task ${id}`);
      }

      if (onMoveTaskAfter) {
        onMoveTaskAfter(
          target,
          taskForMove,
          dependentTasks,
          taskIndex,
          taskForMoveIndex,
          parents,
          suggestions
        );
      }

      if (onChangeTasks) {
        const withSuggestions = prepareSuggestions(suggestions);

        const isMovedTaskBefore = taskForMoveIndex < taskIndex;

        withSuggestions.splice(taskForMoveIndex, 1);
        withSuggestions.splice(
          isMovedTaskBefore ? taskIndex : taskIndex + 1,
          0,
          {
            ...taskForMove,
            parent: target.parent,
          }
        );

        onChangeTasks(withSuggestions, {
          type: "move_task_after",
        });
      }
    },
    [
      getMetadata,
      onChangeTasks,
      onMoveTaskAfter,
      mapTaskToGlobalIndex,
      prepareSuggestions,
      onChangeTooltipTask,
    ]
  );

  const handleMoveTaskBefore = useCallback(
    (target: TaskOrEmpty, taskForMove: TaskOrEmpty) => {
      if (!onMoveTaskBefore && !onChangeTasks) {
        return;
      }

      onChangeTooltipTask(null, null);

      const [dependentTasks, taskIndexes, parents, suggestions] = getMetadata({
        type: "move-before",
        target,
        taskForMove,
      });

      const taskIndex = taskIndexes[0].index;

      const { id, comparisonLevel = 1 } = taskForMove;

      const indexesOnLevel = mapTaskToGlobalIndex.get(comparisonLevel);

      if (!indexesOnLevel) {
        throw new Error(`Indexes are not found for level ${comparisonLevel}`);
      }

      const taskForMoveIndex = indexesOnLevel.get(id);

      if (typeof taskForMoveIndex !== "number") {
        throw new Error(`Index is not found for task ${id}`);
      }

      if (onMoveTaskBefore) {
        onMoveTaskBefore(
          target,
          taskForMove,
          dependentTasks,
          taskIndex,
          taskForMoveIndex,
          parents,
          suggestions
        );
      }

      if (onChangeTasks) {
        const withSuggestions = prepareSuggestions(suggestions);

        const isMovedTaskBefore = taskForMoveIndex < taskIndex;

        withSuggestions.splice(taskForMoveIndex, 1);
        withSuggestions.splice(
          isMovedTaskBefore ? taskIndex - 1 : taskIndex,
          0,
          {
            ...taskForMove,
            parent: target.parent,
          }
        );

        onChangeTasks(withSuggestions, {
          type: "move_task_before",
        });
      }
    },
    [
      getMetadata,
      onChangeTasks,
      onMoveTaskBefore,
      mapTaskToGlobalIndex,
      prepareSuggestions,
      onChangeTooltipTask,
    ]
  );

  const handleMoveTasksInside = useCallback(
    (parent: Task, childs: readonly TaskOrEmpty[]) => {
      if (!onMoveTaskInside && !onChangeTasks) {
        return;
      }

      console.log("handleMoveTasksInside");
      onChangeTooltipTask(null, null);

      const { comparisonLevel = 1 } = parent;

      const indexesAtLevel = mapTaskToGlobalIndex.get(comparisonLevel);

      if (!indexesAtLevel) {
        throw new Error(`Indexes are not found at level ${comparisonLevel}`);
      }

      const childIndexes: number[] = [];
      const movedIdsMap = new Map<number, Set<string>>();

      childs.forEach(child => {
        const { id: childId, comparisonLevel: childComparisonLevel = 1 } =
          child;

        const movedIdsAtLevelSet =
          movedIdsMap.get(childComparisonLevel) || new Set<string>();
        movedIdsAtLevelSet.add(childId);
        movedIdsMap.set(childComparisonLevel, movedIdsAtLevelSet);

        if (comparisonLevel !== childComparisonLevel) {
          return;
        }

        const childIndex = indexesAtLevel.get(childId);

        if (typeof childIndex !== "number") {
          return;
        }

        childIndexes.push(childIndex);
      });

      const [dependentTasks, parentIndexes, parents, suggestions] = getMetadata(
        {
          type: "move-inside",
          parent,
          childs,
          movedIdsMap,
        }
      );

      const parentIndex = parentIndexes[0].index;

      if (onMoveTaskInside) {
        onMoveTaskInside(
          parent,
          childs,
          dependentTasks,
          parentIndex,
          childIndexes,
          parents,
          suggestions
        );
      }

      if (onChangeTasks) {
        let withSuggestions = prepareSuggestions(suggestions);

        const parentDisplacement = childIndexes.filter(
          childIndex => childIndex < parentIndex
        ).length;
        const childIndexesSet = new Set(childIndexes);

        withSuggestions = withSuggestions.filter(
          (_, index) => !childIndexesSet.has(index)
        );

        const startNewChildIndex = parentIndex - parentDisplacement + 1;

        childs.forEach((child, indexInChildsArray) => {
          withSuggestions.splice(startNewChildIndex + indexInChildsArray, 0, {
            ...child,
            parent: parent.id,
          });
        });

        onChangeTasks(withSuggestions, {
          type: "move_task_inside",
        });
      }
    },
    [
      getMetadata,
      onChangeTasks,
      onMoveTaskInside,
      mapTaskToGlobalIndex,
      prepareSuggestions,
      onChangeTooltipTask,
    ]
  );

  const fixStartPosition = useCallback<FixPosition>(
    (task, date, index) => {
      if (fixStartPositionProp) {
        fixStartPositionProp(task, date, index);
      }

      if (onChangeTasks) {
        const nextTasks = [...tasks];
        nextTasks[index] = {
          ...task,
          start: date,
        };

        onChangeTasks(nextTasks, {
          type: "fix_start_position",
        });
      }
    },
    [fixStartPositionProp, onChangeTasks, tasks]
  );

  const fixEndPosition = useCallback<FixPosition>(
    (task, date, index) => {
      if (fixEndPositionProp) {
        fixEndPositionProp(task, date, index);
      }

      if (onChangeTasks) {
        const nextTasks = [...tasks];
        nextTasks[index] = {
          ...task,
          end: date,
        };

        onChangeTasks(nextTasks, {
          type: "fix_end_position",
        });
      }
    },
    [fixEndPositionProp, onChangeTasks, tasks]
  );

  const onFixDependencyPosition = useCallback<OnDateChange>(
    (task, dependentTasks, taskIndex, parents, suggestions) => {
      if (onFixDependencyPositionProp) {
        onFixDependencyPositionProp(
          task,
          dependentTasks,
          taskIndex,
          parents,
          suggestions
        );
      }

      if (onChangeTasks) {
        const nextTasks = [...tasks];
        nextTasks[taskIndex] = task;

        onChangeTasks(nextTasks, {
          type: "fix_dependency_position",
        });
      }
    },
    [onFixDependencyPositionProp, onChangeTasks, tasks]
  );

  const handleFixDependency = useCallback(
    (task: Task, delta: number) => {
      const { start, end } = task;

      const newStart = new Date(start.getTime() + delta);
      const newEnd = new Date(end.getTime() + delta);

      const newChangedTask = {
        ...task,
        start: newStart,
        end: newEnd,
      };

      const [dependentTasks, taskIndexes, parents, suggestions] = getMetadata({
        type: "change",
        task: newChangedTask,
      });

      const taskIndex = taskIndexes[0].index;

      onFixDependencyPosition(
        newChangedTask,
        dependentTasks,
        taskIndex,
        parents,
        suggestions
      );
    },
    [getMetadata, onFixDependencyPosition]
  );

  const onRelationChange = useCallback<OnRelationChange>(
    (from, to, isOneDescendant) => {
      if (onRelationChangeProp) {
        onRelationChangeProp(from, to, isOneDescendant);
      }

      if (onChangeTasks) {
        if (isOneDescendant) {
          return;
        }

        const nextTasks = [...tasks];

        const [taskFrom, targetFrom, fromIndex] = from;
        const [taskTo, targetTo, toIndex] = to;

        const newDependency: Dependency = {
          sourceId: taskFrom.id,
          sourceTarget: targetFrom,
          ownTarget: targetTo,
        };

        nextTasks[toIndex] = {
          ...taskTo,
          dependencies: taskTo.dependencies
            ? [
                ...taskTo.dependencies.filter(
                  ({ sourceId }) => sourceId !== taskFrom.id
                ),
                newDependency,
              ]
            : [newDependency],
        };

        nextTasks[fromIndex] = {
          ...taskFrom,
          dependencies: taskFrom.dependencies
            ? taskFrom.dependencies.filter(
                ({ sourceId }) => sourceId !== taskTo.id
              )
            : undefined,
        };

        onChangeTasks(nextTasks, {
          type: "relation_change",
        });
      }
    },
    [onRelationChangeProp, onChangeTasks, tasks]
  );

  const onArrowDoubleClick = useCallback(
    (taskFrom: Task, taskTo: Task) => {
      if (!onArrowDoubleClickProp && !onChangeTasks) {
        return;
      }

      const { comparisonLevel = 1 } = taskFrom;

      const indexesOnLevel = mapTaskToGlobalIndex.get(comparisonLevel);

      if (!indexesOnLevel) {
        throw new Error(`Indexes are not found for level ${comparisonLevel}`);
      }

      const taskFromIndex = indexesOnLevel.get(taskFrom.id);

      if (typeof taskFromIndex !== "number") {
        throw new Error(`Index is not found for task ${taskFrom.id}`);
      }

      const taskToIndex = indexesOnLevel.get(taskTo.id);

      if (typeof taskToIndex !== "number") {
        throw new Error(`Index is not found for task ${taskTo.id}`);
      }

      if (onArrowDoubleClickProp) {
        onArrowDoubleClickProp(taskFrom, taskFromIndex, taskTo, taskToIndex);
      }

      if (onChangeTasks && isDeleteDependencyOnDoubleClick) {
        const nextTasks = [...tasks];
        nextTasks[taskToIndex] = {
          ...taskTo,
          dependencies: taskTo.dependencies
            ? taskTo.dependencies.filter(
                ({ sourceId }) => sourceId !== taskFrom.id
              )
            : undefined,
        };

        onChangeTasks(nextTasks, {
          type: "delete_relation",
          payload: {
            taskFrom,
            taskFromIndex,
            taskTo,
            taskToIndex,
          },
        });
      }
    },
    [
      isDeleteDependencyOnDoubleClick,
      mapTaskToGlobalIndex,
      onArrowDoubleClickProp,
      onChangeTasks,
      tasks,
    ]
  );

  const handleAction = useHandleAction({
    checkTaskIdExists,
    childTasksMap,
    copyIdsMirror,
    copySelectedTasks,
    copyTask,
    cutIdsMirror,
    cutSelectedTasks,
    cutTask,
    handleAddChilds,
    handleDeleteTasks,
    handleMoveTasksInside,
    makeCopies,
    resetSelectedTasks,
    selectedIdsMirror,
    tasksMap,
  });

  const [ganttRelationEvent, handleBarRelationStart] = useCreateRelation({
    distances,
    ganttSVGRef,
    mapTaskToCoordinates,
    mapTaskToGlobalIndex,
    onRelationChange,
    rtl,
    taskHalfHeight,
    tasksMap,
    visibleTasks,
  });

  // Compute the task coordinates used to display the task
  const getTaskCurrentState = useGetTaskCurrentState({
    changeInProgress,
    isMoveChildsWithParent,
    isUpdateDisabledParentsOnChange,
    tasksMap,
  });

  const getTaskCoordinates = useCallback(
    (task: Task) => countTaskCoordinates(getTaskCurrentState(task)),
    [countTaskCoordinates, getTaskCurrentState]
  );
  // const getTaskCoordinates = (task: Task) => countTaskCoordinates(task);

  const contextMenuOptions = useMemo<ContextMenuOptionType[]>(() => {
    if (contextMenuOptionsProp) {
      return contextMenuOptionsProp;
    }

    return [cutOption, copyOption, pasteOption, deleteOption];
  }, [contextMenuOptionsProp]);

  /**
   * Prevent crash after task delete
   */
  const tooltipTaskFromMap = useMemo(() => {
    if (!tooltipTask) {
      return null;
    }

    const { id, comparisonLevel = 1 } = tooltipTask;

    if (changeInProgress) {
      const { changedTask } = changeInProgress;

      if (
        changedTask.id === id &&
        (changedTask.comparisonLevel || 1) === comparisonLevel
      ) {
        return changedTask;
      }
    }

    const tasksMapOnLevel = tasksMap.get(comparisonLevel);

    if (!tasksMapOnLevel) {
      return null;
    }

    const resTask = tasksMapOnLevel.get(id);

    if (!resTask || resTask.type === "empty") {
      return null;
    }

    return resTask;
  }, [tooltipTask, tasksMap, changeInProgress]);

  const additionalLeftSpace = changeInProgress?.additionalLeftSpace || 0;
  const additionalRightSpace = changeInProgress?.additionalRightSpace || 0;

  const additionalStartColumns = useMemo(
    () => Math.ceil(additionalLeftSpace / distances.columnWidth),
    [additionalLeftSpace, distances]
  );

  const [defaultStartColumnIndex, defaultEndColumnIndex] =
    renderedColumnIndexes || [0, -1];

  const startColumnIndex = defaultStartColumnIndex - additionalStartColumns;
  const endColumnIndex = defaultEndColumnIndex - additionalStartColumns + 1;

  const fullSvgWidth = useMemo(
    () => svgWidth + additionalLeftSpace + additionalRightSpace,
    [additionalLeftSpace, additionalRightSpace, svgWidth]
  );

  const viewportHeight = ganttTaskContentRef.current?.clientHeight ?? 0;

  const gridHeight = Math.max(ganttFullHeight, viewportHeight);

  const gridProps: GridProps = {
    additionalLeftSpace,
    ganttFullHeight,
    columnWidth: distances.columnWidth,
    isUnknownDates,
    rtl,
    startDate: effectiveStartDate,
    gridHeight,
    todayColor: colorStyles.todayColor,
    holidayBackgroundColor: colorStyles.holidayBackgroundColor,
    viewMode,
    startColumnIndex,
    endColumnIndex,
    checkIsHoliday,
    getDate,
    minTaskDate,
    selectedDay,
    selectedDayBgColor: colorStyles.selectedDayBgColor,
    selectedDayStrokeColor: colorStyles.selectedDayStrokeColor,
  };

  const calendarProps: CalendarProps = useMemo<CalendarProps>(
    () => ({
      additionalLeftSpace,
      dateSetup,
      distances,
      endColumnIndex,
      fontFamily,
      fontSize,
      fullSvgWidth,
      getDate,
      isUnknownDates,
      renderBottomHeader,
      renderTopHeader,
      rtl,
      startColumnIndex,
      colors,
    }),
    [
      additionalLeftSpace,
      dateSetup,
      distances,
      endColumnIndex,
      fontFamily,
      fontSize,
      fullSvgWidth,
      getDate,
      isUnknownDates,
      renderBottomHeader,
      renderTopHeader,
      rtl,
      startColumnIndex,
      colors,
    ]
  );

  const onClickTask = (task: TaskOrEmpty) => {
    if (onClick) {
      onClick(task);
    }
  };

  const barProps: TaskGanttContentProps = useMemo(
    () => ({
      authorizedRelations,
      additionalLeftSpace,
      additionalRightSpace,
      changeInProgress,
      childOutOfParentWarnings,
      childTasksMap,
      colorStyles,
      comparisonLevels,
      criticalPaths,
      dependencyMap,
      dependentMap,
      distances,
      fixEndPosition,
      fixStartPosition,
      fontFamily,
      fontSize,
      fullRowHeight,
      ganttFullHeight,
      ganttRelationEvent,
      gridHeight,
      getTaskCoordinates,
      getTaskGlobalIndexByRef,
      handleBarRelationStart,
      handleDeleteTasks,
      handleFixDependency,
      handleTaskDragStart,
      isShowDependencyWarnings,
      mapGlobalRowIndexToTask,
      onArrowDoubleClick,
      onClick: onClickTask,
      onDoubleClick,
      onFixDependencyPosition,
      onProgressChange,
      onRelationChange,
      renderedRowIndexes,
      rtl,
      selectTaskOnMouseDown,
      selectedIdsMirror,
      setTooltipTask: onChangeTooltipTask,
      taskHalfHeight,
      taskHeight,
      taskToHasDependencyWarningMap,
      taskToRowIndexMap,
      taskYOffset,
      timeStep,
      visibleTasksMirror,
      ContextualPalette,
      TaskDependencyContextualPalette,
    }),
    [
      additionalLeftSpace,
      additionalRightSpace,
      changeInProgress,
      checkIsHoliday,
      childOutOfParentWarnings,
      childTasksMap,
      colorStyles,
      comparisonLevels,
      criticalPaths,
      dependencyMap,
      dependentMap,
      distances,
      endColumnIndex,
      fixEndPosition,
      fixStartPosition,
      fontFamily,
      fontSize,
      fullRowHeight,
      ganttFullHeight,
      ganttRelationEvent,
      gridHeight,
      getDate,
      getTaskCoordinates,
      getTaskGlobalIndexByRef,
      handleBarRelationStart,
      handleDeleteTasks,
      handleTaskDragStart,
      isShowDependencyWarnings,
      mapGlobalRowIndexToTask,
      mapTaskToCoordinates,
      onArrowDoubleClick,
      onChangeTooltipTask,
      onClick,
      onDoubleClick,
      onFixDependencyPosition,
      onProgressChange,
      onRelationChange,
      renderedRowIndexes,
      rtl,
      selectTaskOnMouseDown,
      selectedIdsMirror,
      startColumnIndex,
      taskHalfHeight,
      taskHeight,
      taskToHasDependencyWarningMap,
      taskToRowIndexMap,
      taskYOffset,
      timeStep,
      visibleTasks,
      visibleTasksMirror,
    ]
  );

  const tableProps: TaskListProps = {
    TaskListHeader,
    TaskListTable,
    canMoveTasks,
    canResizeColumns,
    childTasksMap,
    colors: colorStyles,
    columnsProp,
    cutIdsMirror,
    dateSetup,
    dependencyMap,
    distances,
    fontFamily,
    fontSize,
    fullRowHeight,
    ganttFullHeight,
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
    onClick: onClickTask,
    onExpanderClick: handleExpanderClick,
    selectTaskOnMouseDown,
    selectedIdsMirror,
    scrollToTask,
    taskListContentRef,
    taskListRef,
    tasks: visibleTasks,
    onResizeColumn,
    onScrollTableListContentVertically: onScrollVertically,
    onCollapseAll,
    onExpandFirstLevel,
    onExpandAll,
    readOnly,
    dropRules,
  };

  const displayTable = !columnsProp || columnsProp.length > 0;

  // console.log("select task", selectedIdsMirror);
  return (
    <div
      className={styles.wrapper}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={wrapperRef}
      data-testid={`gantt-main`}
      onMouseDownCapture={e => {
        if ((e.target as HTMLElement).tagName === "BUTTON") {
          return;
        }
        resetSelectedTasks();
      }}
      style={{
        gridTemplateColumns: `${displayTable ? "max-content" : ""} auto`,
        background: colors.evenTaskBackgroundColor,
        color: colors.barLabelColor,
        ...style,
      }}
    >
      {displayTable && (
        <TaskList {...tableProps} handleAddTask={handleAddTask} />
      )}
      <TaskGantt
        barProps={barProps}
        calendarProps={calendarProps}
        distances={distances}
        fullRowHeight={fullRowHeight}
        fullSvgWidth={fullSvgWidth}
        ganttFullHeight={ganttFullHeight}
        ganttSVGRef={ganttSVGRef}
        gridProps={gridProps}
        ganttTaskContentRef={ganttTaskContentRef}
        onVerticalScrollbarScrollX={onVerticalScrollbarScrollX}
        ganttTaskRootRef={ganttTaskRootRef}
        onScrollGanttContentVertically={onScrollVertically}
        colors={colors}
        gridHeight={gridHeight}
      />

      {tooltipTaskFromMap && (
        <Tooltip
          tooltipX={tooltipX}
          tooltipY={tooltipY}
          tooltipStrategy={tooltipStrategy}
          setFloatingRef={setFloatingRef}
          getFloatingProps={getFloatingProps}
          fontFamily={fontFamily}
          fontSize={fontSize}
          task={tooltipTaskFromMap}
          TooltipContent={TooltipContent}
        />
      )}

      {enableTableListContextMenu && (
        <ContextMenu
          checkHasCopyTasks={checkHasCopyTasks}
          checkHasCutTasks={checkHasCutTasks}
          colors={colorStyles}
          contextMenu={contextMenu}
          distances={distances}
          handleAction={handleAction}
          handleCloseContextMenu={handleCloseContextMenu}
          options={contextMenuOptions}
        />
      )}
    </div>
  );
};
