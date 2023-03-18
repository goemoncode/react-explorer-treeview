import { useCallback, useState } from 'react';
import TreeView, { TreeViewNodeProps } from '../src/';
import { createNodes, isAncestor, TreeNode } from './props';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DnDTreeNode } from './components/DnDTreeNode';
import { ReactComponent as Github } from './assets/github.svg';
import { ActionButton } from './components/FormControl';

const keyGetter = (node: TreeNode) => node.id;

export default function App() {
  const [nodes, setNodes] = useState(createNodes.apply(null, [1]));
  const [selectedNode, setSelectedNode] = useState<string | undefined>();
  const [expandedNodes, setExpandedNodes] = useState<string[] | undefined>();

  const [childNodes] = useState<Map<string, TreeNode[]>>(new Map());
  const childrenGetter = useCallback(
    (node: TreeNode) => {
      if (childNodes.has(node.id)) return childNodes.get(node.id);
      if (node.level >= 5) return false;
      const nodes = createNodes(node.level + 1, node);
      childNodes.set(node.id, nodes);
      return nodes;
    },
    [childNodes]
  );

  const labelRenderer = useCallback(
    (node: TreeNode) => (
      <span className="wrapper">
        <span className="icon">{node.icon}</span>
        <span className="label">{node.name}</span>
      </span>
    ),
    []
  );

  const nodeRenderer = useCallback(
    (key: React.Key, props: TreeViewNodeProps<TreeNode>) => {
      function handleCanDrop(source: TreeNode, target: TreeNode) {
        if (source.id === target.id || isAncestor(source, target)) {
          return false;
        }
        return true;
      }
      function handleNodeMove(source: TreeNode, target: TreeNode) {
        if (source.parent) {
          const siblings = childNodes.get(source.parent.id);
          if (siblings) {
            childNodes.set(
              source.parent.id,
              siblings.filter((x) => x.id !== source.id)
            );
          }
        }
        const newSiblings = childNodes.get(target.id);
        if (newSiblings) {
          newSiblings.push(source);
        } else {
          childNodes.set(target.id, [source]);
        }
        source.parent = target;
        setNodes((nodes) => {
          if (source.level === 1) {
            return nodes.filter((x) => x.id !== source.id);
          } else {
            return [...nodes];
          }
        });
      }
      return (
        <DnDTreeNode key={key} onCanDrop={handleCanDrop} onNodeMove={handleNodeMove} {...props} />
      );
    },
    [childNodes]
  );

  const onExpandAll = useCallback(() => {
    function* flatten(nodes: TreeNode[]): Generator<string> {
      for (const node of nodes) {
        yield node.id;
        for (const id of flatten(childrenGetter(node) || [])) {
          yield id;
        }
      }
    }
    setExpandedNodes(Array.from(flatten(nodes)));
  }, [childrenGetter, nodes]);

  const onReset = useCallback(() => {
    setExpandedNodes([]);
  }, []);

  return (
    <div className="demo app">
      <div className="side">
        <h1>React Explorer TreeView</h1>
        <fieldset>
          <ActionButton label="全て展開" onClick={onExpandAll} />
          <ActionButton label="リセット" onClick={onReset} />
        </fieldset>
        <div className="link">
          <a
            href="https://github.com/goemoncode/react-explorer-treeview"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="github" />
          </a>
        </div>
      </div>
      <DndProvider backend={HTML5Backend}>
        <TreeView
          nodes={nodes}
          indentWidth="2em"
          keyGetter={keyGetter}
          childrenGetter={childrenGetter}
          labelRenderer={labelRenderer}
          nodeRenderer={nodeRenderer}
          selectedNode={selectedNode}
          onSelectedNodeChange={setSelectedNode}
          expandedNodes={expandedNodes}
          onExpandedNodesChange={setExpandedNodes}
        />
      </DndProvider>
    </div>
  );
}
