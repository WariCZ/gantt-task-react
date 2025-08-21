import React, { useCallback } from "react";

import { ColumnProps, Icons, TaskOrEmpty } from "../../../types/public-types";

import styles from "./title-column.module.css";

const getExpanderSymbol = (
  task: TaskOrEmpty,
  hasChildren: boolean,
  isClosed: boolean,
  icons: Partial<Icons> | undefined
) => {
  if (!hasChildren) {
    return icons?.renderNoChildrenIcon ? (
      icons.renderNoChildrenIcon(task)
    ) : (
      <span style={{ color: "#6b7280" }}></span>
    );
  }

  if (isClosed) {
    return icons?.renderClosedIcon ? (
      icons.renderClosedIcon(task)
    ) : (
      <span style={{ color: "#6b7280" }}>▶</span>
    );
  }

  return icons?.renderOpenedIcon ? (
    icons.renderOpenedIcon(task)
  ) : (
    <span style={{ color: "#6b7280" }}>▼</span>
  );
};
type MenuRenderer = React.ComponentType<{ task: TaskOrEmpty }>;

export const TitleColumn: React.FC<ColumnProps> = props => {
  const {
    data: {
      colors,
      distances: { expandIconWidth, nestedTaskNameOffset },
      icons,
      isShowTaskNumbers,
      hasChildren,
      isClosed,
      depth,
      indexStr,
      task,
      onExpanderClick,
      // onBurgerClick,
      Menu,
    },
  } = props as ColumnProps & {
    data: ColumnProps["data"] & { Menu?: MenuRenderer };
  };
  const { name } = task;

  const expanderSymbol = getExpanderSymbol(task, hasChildren, isClosed, icons);

  const title = isShowTaskNumbers ? `${indexStr} ${name}` : name;

  const onClick = useCallback(() => {
    if (task.type !== "empty") {
      onExpanderClick(task);
    }
  }, [onExpanderClick, task]);

  // const onBurger = useCallback(
  //   (e: React.MouseEvent) => {
  //     e.stopPropagation();
  //     if (task.type !== "empty") {
  //       onBurgerClick?.(task);
  //     }
  //   },
  //   [onBurgerClick, task]
  // );

  return (
    <div
      data-testid={`title-table-cell-${name}`}
      className={styles.taskListNameWrapper}
      style={{
        display: "flex",
        alignItems: "center",
      }}
      title={title}
    >
      {Menu ? (
        <div
          onClick={e => e.stopPropagation()}
          className={styles.taskListBurger ?? ""}
          aria-label="Open task menu"
        >
          <Menu task={task} />
        </div>
      ) : null}
      {/* <button
        type="button"
        onClick={onBurger}
        className={styles.taskListBurger ?? ""}
        aria-label="Open task menu"
      >
        ☰
      </button> */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: depth * nestedTaskNameOffset,
        }}
      >
        <div
          className={`${styles.taskListExpander} ${
            !hasChildren ? styles.taskListEmptyExpander : ""
          }`}
          onClick={onClick}
          style={{
            width: expandIconWidth,
          }}
        >
          {expanderSymbol}
        </div>

        <div
          style={{ color: colors.barLabelColor }}
          className={styles.taskName}
        >
          {isShowTaskNumbers && <b>{indexStr} </b>}
          {name}
        </div>
      </div>
    </div>
  );
};
