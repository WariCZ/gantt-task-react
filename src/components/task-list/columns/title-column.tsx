import React, { useCallback, type ReactNode } from "react";
import { ColumnProps, TaskOrEmpty } from "../../../types/public-types";
import styles from "./title-column.module.css";

type MenuRenderer = React.ComponentType<{ task: TaskOrEmpty }>;

export const TitleColumn: React.FC<
  ColumnProps & { children?: ReactNode }
> = props => {
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
      Menu,
    },
    children,
  } = props as ColumnProps & {
    data: ColumnProps["data"] & { Menu?: MenuRenderer };
    children?: React.ReactNode;
  };

  const { name } = task;

  const onClick = useCallback(() => {
    if (task.type !== "empty") onExpanderClick(task);
  }, [onExpanderClick, task]);

  const expanderSymbol = !hasChildren
    ? icons?.renderNoChildrenIcon?.(task) ?? (
        <span style={{ color: "#6b7280" }} />
      )
    : isClosed
    ? icons?.renderClosedIcon?.(task) ?? (
        <span style={{ color: "#6b7280" }}>▶</span>
      )
    : icons?.renderOpenedIcon?.(task) ?? (
        <span style={{ color: "#6b7280" }}>▼</span>
      );

  return (
    <div
      data-testid={`title-table-cell-${name}`}
      className={styles.taskListNameWrapper}
      style={{ display: "flex", alignItems: "center" }}
      title={isShowTaskNumbers ? `${indexStr} ${name}` : name}
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: depth * nestedTaskNameOffset,
          gap: 2,
        }}
      >
        <div
          className={`${styles.taskListExpander} ${
            !hasChildren ? styles.taskListEmptyExpander : ""
          }`}
          onClick={onClick}
          style={{ width: expandIconWidth }}
        >
          {expanderSymbol}
        </div>

        <div
          style={{ color: colors.barLabelColor, flex: 1, minWidth: 0 }}
          className={styles.taskName}
        >
          <div
            className="flex items-center gap-2 whitespace-pre-wrap break-all"
            style={{ pointerEvents: "auto" }}
          >
            {isShowTaskNumbers && <b>{indexStr} </b>}
            {children ? (
              <div style={{ pointerEvents: "auto" }}>{children}</div>
            ) : (
              <span onClick={e => e.stopPropagation()}>{name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
