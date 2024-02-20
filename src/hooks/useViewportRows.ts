import { RefObject, useLayoutEffect, useMemo, useState } from 'react';
import { useMeasure, usePrevious, useScroll } from 'react-use';
import { useMergeRefs } from './useMergeRefs';

export function range(from: number, to: number) {
  return Array.from({ length: Math.abs(from - to) + 1 }, (v, k) => Math.min(from, to) + k);
}

export function useViewportRows<R, E1 extends HTMLElement, E2 extends HTMLElement>(
  ref1: RefObject<E1>, // ref of TreeView
  ref2: RefObject<E2>, // ref of TreeViewBody
  totalRows: number,
  focusedRowIndex: number
): [
  refs1: ReturnType<typeof useMergeRefs<E1>>,
  refs2: ReturnType<typeof useMergeRefs<E2>>,
  viewportRows: number[],
  rowsPerPage: number,
] {
  const [rowHeight, setRowHeight] = useState(0);
  const { y: scrollTop } = useScroll(ref1);
  const [measureRef1, { height: viewportHeight }] = useMeasure<E1>();
  const [measureRef2, { height: scrollHeight }] = useMeasure<E2>();
  const refs1 = useMergeRefs(ref1, measureRef1);
  const refs2 = useMergeRefs(ref2, measureRef2, (instance: E2 | null) => {
    if (instance !== null && rowHeight === 0) {
      // console.log(instance.scrollHeight);
      setRowHeight(instance.scrollHeight / (totalRows || 1));
    }
  });
  const prevFocusedRowIndex = usePrevious(focusedRowIndex) ?? -1;

  useLayoutEffect(() => {
    if (
      totalRows > 0 &&
      scrollHeight > rowHeight &&
      Math.abs(rowHeight - scrollHeight / totalRows) < 0.01
    ) {
      setRowHeight(scrollHeight / totalRows);
    }
  }, [rowHeight, scrollHeight, totalRows]);

  const [viewportRows, rowsPerPage] = useMemo(() => {
    if (rowHeight === 0 || totalRows === 0) return [[], 0];
    function clamp(index: number) {
      return Math.max(0, Math.min(index, totalRows - 1));
    }
    const rowsPerPage = Math.floor(viewportHeight / rowHeight);
    const viewportTopIndex = Math.floor(scrollTop / rowHeight);
    const overscanThreshold = 4;
    const overscanTopIndex = clamp(viewportTopIndex - overscanThreshold);
    const overscanBottomIndex = clamp(viewportTopIndex + rowsPerPage + overscanThreshold);
    const viewportRows = Array.from(
      new Set(
        range(overscanTopIndex, overscanBottomIndex).concat([
          clamp(prevFocusedRowIndex),
          clamp(focusedRowIndex),
        ])
      ).values()
    ).sort();
    return [viewportRows, rowsPerPage];
  }, [focusedRowIndex, prevFocusedRowIndex, totalRows, rowHeight, scrollTop, viewportHeight]);

  return [refs1, refs2, viewportRows, rowsPerPage];
}
