import { useMemo } from 'react';

export type Row<T, K extends React.Key> = {
  key: K;
  node: T;
  level: number;
  hasChild: boolean;
  isExpanded: boolean;
  parent?: Row<T, K>;
};

export function useRows<T, K extends React.Key>(
  nodes: T[],
  keyGetter: (node: T) => K,
  childrenGetter: (node: T, isExpanded: boolean) => T[] | boolean | undefined,
  isExpanded: (key: K) => boolean
): [rows: Row<T, K>[], findIndex: (key: K) => number] {
  const rows = useMemo(() => {
    function* flatten(nodes: T[], parent?: Row<T, K>): Generator<Row<T, K>> {
      for (const node of nodes) {
        const key = keyGetter(node);
        const expanded = isExpanded(key);
        const children = childrenGetter(node, expanded);
        const hasChild = Array.isArray(children) ? children.length > 0 : Boolean(children);
        const row: Row<T, K> = {
          key,
          node,
          level: (parent?.level ?? 0) + 1,
          hasChild,
          isExpanded: hasChild && expanded,
          parent,
        };
        yield row;
        if (hasChild && expanded && Array.isArray(children)) {
          for (const descendant of flatten(children, row)) {
            yield descendant;
          }
        }
      }
    }
    return Array.from(flatten(nodes));
  }, [childrenGetter, isExpanded, keyGetter, nodes]);

  const findIndex = useMemo(() => {
    const map = new Map(rows.map((row, i) => [row.key, i]));
    return (key: K) => map.get(key) ?? -1;
  }, [rows]);

  return [rows, findIndex];
}
