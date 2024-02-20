import React, {
  forwardRef,
  RefAttributes,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDebounce } from 'react-use';
import { cssClassnames, TreeViewHandle, TreeViewProps } from './types';
import { FocusContainerProvider } from './hooks/useFocusContainer';
import { useViewportRows } from './hooks/useViewportRows';
import { useRows } from './hooks/useRows';
import { defaultNodeRenderer, defaultToggleRenderer } from './TreeViewNode';
import clsx from 'clsx';

function TreeView<T, K extends React.Key>(
  {
    nodes,
    rowHeight,
    indentWidth,
    selectedNode: propSelectedNode,
    expandedNodes: propExpandedNodes,
    keyGetter,
    childrenGetter,
    labelRenderer,
    toggleRenderer = defaultToggleRenderer,
    nodeRenderer = defaultNodeRenderer,
    onSelectedNodeChange,
    onExpandedNodesChange,
    onNodeDoubleClick,
    onNodeContextMenu,
    className,
    style,
    onKeyDown,
    ...props
  }: TreeViewProps<T, K>,
  refHandle: React.Ref<TreeViewHandle<T>>
) {
  const [selectedNode, setSelectedNode] = useState(propSelectedNode);
  useLayoutEffect(() => setSelectedNode(propSelectedNode), [propSelectedNode]);
  useDebounce(() => onSelectedNodeChange?.(selectedNode), 50, [selectedNode]);
  const [expandedNodes, setExpandedNodes] = useState(propExpandedNodes ?? []);
  useLayoutEffect(() => setExpandedNodes(propExpandedNodes ?? []), [propExpandedNodes]);
  useDebounce(() => onExpandedNodesChange?.(expandedNodes), 50, [expandedNodes]);
  const isExpanded = useMemo(() => {
    const set = new Set(expandedNodes);
    return (key: K) => set.has(key);
  }, [expandedNodes]);
  const setExpanded = useCallback((key: K, expand: boolean) => {
    setExpandedNodes((state) => {
      const set = new Set(state);
      if (expand) {
        set.add(key);
      } else {
        set.delete(key);
      }
      return Array.from(set);
    });
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const [rows, findIndex] = useRows(nodes, keyGetter, childrenGetter, isExpanded);
  const [refs1, refs2, viewportRows, rowsPerPage] = useViewportRows(
    ref,
    refContainer,
    rows.length,
    selectedNode !== undefined ? findIndex(selectedNode) : -1
  );

  useImperativeHandle(
    refHandle,
    () => ({
      element: ref.current,
      scrollToNode: (node: T) => {
        setSelectedNode(keyGetter(node));
      },
    }),
    [keyGetter]
  );

  const handleNodeFocus = useCallback((node: T) => setSelectedNode(keyGetter(node)), [keyGetter]);

  const handleNodeClick = useCallback(
    (node: T) => {
      const key = keyGetter(node);
      const index = findIndex(key);
      setExpanded(key, !rows[index].isExpanded);
    },
    [findIndex, keyGetter, rows, setExpanded]
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    function clamp(i: number) {
      return Math.min(Math.max(i, 0), rows.length - 1);
    }
    onKeyDown?.(event);
    if (event.isDefaultPrevented() || event.altKey || rows.length == 0) return;
    if (selectedNode === undefined) return;
    const index = findIndex(selectedNode);
    if (index < 0) return;
    const { key } = event;
    if (key === 'ArrowUp') {
      event.preventDefault();
      setSelectedNode(rows[clamp(index - 1)].key);
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      setSelectedNode(rows[clamp(index + 1)].key);
    } else if (key === 'ArrowLeft') {
      event.preventDefault();
      const { isExpanded, parent } = rows[index];
      if (isExpanded) {
        setExpanded(selectedNode, false);
      } else if (parent) {
        setSelectedNode(rows[clamp(findIndex(parent.key))].key);
      }
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      const { hasChild, isExpanded } = rows[index];
      if (hasChild) {
        if (isExpanded) {
          setSelectedNode(rows[clamp(index + 1)].key);
        } else {
          setExpanded(selectedNode, true);
        }
      }
    } else if (key === 'Home') {
      event.preventDefault();
      setSelectedNode(rows[0].key);
    } else if (key === 'End') {
      event.preventDefault();
      setSelectedNode(rows[rows.length - 1].key);
    } else if (key === 'PageUp') {
      event.preventDefault();
      clamp(index - (rowsPerPage - 1));
      setSelectedNode(rows[clamp(index - (rowsPerPage - 1))].key);
    } else if (key === 'PageDown') {
      event.preventDefault();
      setSelectedNode(rows[clamp(index + (rowsPerPage - 1))].key);
    }
  }

  function getCssVar(value: string | number | undefined) {
    return value ? (typeof value === 'string' ? value : `${value}px`) : undefined;
  }
  const layoutCssVars: Record<string, string | number | undefined> = {
    '--retv-row-height': getCssVar(rowHeight),
    '--retv-row-count': rows.length || 1,
    '--retv-indent-width': getCssVar(indentWidth),
  };

  return (
    <div
      ref={refs1}
      role="tree"
      className={clsx(cssClassnames.treeView, className)}
      style={{ ...layoutCssVars, ...style }}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div ref={refs2} className={cssClassnames.treeViewBody}>
        <FocusContainerProvider value={refContainer.current}>
          {viewportRows
            .map((i) => ({ rowIndex: i, row: rows[i] }))
            .map(({ rowIndex, row: { key, node, level, hasChild, isExpanded } }) =>
              nodeRenderer(key, {
                node,
                index: rowIndex,
                level,
                hasChild,
                isExpanded,
                isSelected: selectedNode !== undefined ? key === selectedNode : rowIndex == 0,
                labelRenderer,
                toggleRenderer,
                onNodeClick: handleNodeClick,
                onNodeFocus: handleNodeFocus,
                onNodeDoubleClick,
                onNodeContextMenu,
                'aria-setsize': rows.length,
              })
            )}
        </FocusContainerProvider>
      </div>
    </div>
  );
}

export default forwardRef(TreeView) as <T, K extends React.Key>(
  props: TreeViewProps<T, K> & RefAttributes<TreeViewHandle<T>>
) => JSX.Element;
