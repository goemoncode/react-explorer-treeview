import { TreeViewNodeProps } from '../../src';
import { TreeViewNode } from '../../src/TreeViewNode';
import { useDrag, useDrop } from 'react-dnd';
import { useRef } from 'react';

export interface DnDTreeNodeProps<T> extends TreeViewNodeProps<T> {
  onNodeMove: (source: T, target: T) => void;
}

export function DnDTreeNode<T>({ onNodeMove, node, ...props }: DnDTreeNodeProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: 'DnDTreeNode',
    item: node,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [{ isOver }, drop] = useDrop({
    accept: 'DnDTreeNode',
    drop(source: T) {
      onNodeMove(source, node);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  return (
    <TreeViewNode
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? '#ffffff33' : undefined,
      }}
      node={node}
      {...props}
    />
  );
}
