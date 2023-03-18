export const cssClassnames = {
  treeView: 'retv',
  treeViewBody: 'retv__body',
  treeViewNode: 'retv__node',
  treeViewNodeIndent: 'retv__node-indent',
  treeViewNodeToggle: 'retv__node-toggle',
  treeViewNodeLabel: 'retv__node-label',
  treeViewNodeSelected: 'retv__node--selected',
};

export interface TreeViewHandle<T> {
  element: HTMLDivElement | null;
  scrollToNode: (node: T) => void;
}

export interface ChildrenResult<T> {
  hasChild: number;
  children: T[] | undefined;
}

export type TreeViewProps<T, K extends React.Key> = {
  nodes: T[];
  rowHeight?: number | string;
  indentWidth?: number | string;
  selectedNode?: K | undefined;
  expandedNodes?: K[] | undefined;
  keyGetter: (node: T) => K;
  childrenGetter: (node: T, isExpanded: boolean) => T[] | boolean | undefined;
  labelRenderer: (node: T) => React.ReactNode;
  toggleRenderer?: (state: ToggleState) => React.ReactNode;
  nodeRenderer?: (key: React.Key, props: TreeViewNodeProps<T>) => React.ReactNode;
  onSelectedNodeChange?: (key: K | undefined) => void;
  onExpandedNodesChange?: (nodes: K[] | undefined) => void;
  onNodeDoubleClick?: (node: T) => void;
  onNodeContextMenu?: (node: T) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export type TreeViewNodeProps<T> = {
  node: T;
  index: number;
  level: number;
  hasChild: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  labelRenderer: (node: T) => React.ReactNode;
  toggleRenderer: (state: ToggleState) => React.ReactNode;
  onNodeClick?: (node: T) => void;
  onNodeFocus?: (node: T) => void;
  onNodeDoubleClick?: (node: T) => void;
  onNodeContextMenu?: (node: T) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export enum ToggleState {
  hidden,
  expanded,
  collapsed,
}
