import { useCallback, useRef, useState } from "react";
import type { RefObject, SyntheticEvent } from "react";

import { SCROLL_STEP } from "../../constants";

export const useHorizontalScrollbars = (
  initialScrollX: number = 0
): [
  RefObject<HTMLDivElement>,
  number,
  (nextScrollX: number) => void,
  (event: SyntheticEvent<HTMLDivElement>) => void,
  () => void,
  () => void,
  number
] => {
  const [scrollX, setScrollX] = useState(initialScrollX);
  const [scrollXminus, setScrollXminus] = useState(initialScrollX);

  const ganttTaskRootRef = useRef<HTMLDivElement>(
    initialScrollX > 0 ? null : null
  );
  const isLockedRef = useRef(false);

  // useEffect(() => {
  //   if (ganttTaskRootRef.current && initialScrollX > 0) {
  //     console.log("useEffect", initialScrollX, scrollX);
  //     // ganttTaskRootRef.current.scrollLeft = initialScrollX;
  //   }
  // }, [initialScrollX]);

  const setScrollXProgrammatically = useCallback((nextScrollX: number) => {
    const scrollEl = ganttTaskRootRef.current;
    if (!scrollEl) return;

    isLockedRef.current = true;

    scrollEl.scrollLeft = nextScrollX;
    // if (nextScrollX < 0) {
    setScrollXminus(nextScrollX);
    // }
    setScrollX(scrollEl.scrollLeft);

    setTimeout(() => {
      isLockedRef.current = false;
    }, 300);
  }, []);

  const onVerticalScrollbarScrollX = useCallback(
    (event: SyntheticEvent<HTMLDivElement>) => {
      if (isLockedRef.current) return;

      const nextScrollX = event.currentTarget.scrollLeft;
      if (ganttTaskRootRef.current) {
        ganttTaskRootRef.current.scrollLeft = nextScrollX;
      }
      setScrollX(nextScrollX);
    },
    []
  );

  const scrollToLeftStep = useCallback(() => {
    setScrollXProgrammatically(scrollX - SCROLL_STEP);
  }, [setScrollXProgrammatically, scrollX]);

  const scrollToRightStep = useCallback(() => {
    setScrollXProgrammatically(scrollX + SCROLL_STEP);
  }, [setScrollXProgrammatically, scrollX]);

  return [
    ganttTaskRootRef,
    scrollX,
    setScrollXProgrammatically,
    onVerticalScrollbarScrollX,
    scrollToLeftStep,
    scrollToRightStep,
    scrollXminus,
  ];
};
