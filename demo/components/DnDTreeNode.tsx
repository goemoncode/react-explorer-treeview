import { TreeViewNodeProps } from '../../src';
import { TreeViewNode } from '../../src/TreeViewNode';
import { useDrag, useDrop } from 'react-dnd';
import { useRef } from 'react';
import clsx from 'clsx';

export interface DnDTreeNodeProps<T> extends TreeViewNodeProps<T> {
  onCanDrop?: (source: T, target: T) => boolean;
  onNodeMove: (source: T, target: T) => void;
}

export function DnDTreeNode<T>({ onCanDrop, onNodeMove, node, ...props }: DnDTreeNodeProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: 'DnDTreeNode',
    item: node,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'DnDTreeNode',
    drop(source: T) {
      onNodeMove(source, node);
    },
    canDrop(source, monitor) {
      return onCanDrop?.(source, node) ?? monitor.canDrop();
    },
    collect: (monitor) => {
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      };
    },
  });

  drag(drop(ref));

  return (
    <TreeViewNode
      ref={ref}
      className={clsx({
        isDragging,
        isDragOver: isOver && canDrop,
      })}
      node={node}
      {...props}
    />
  );
}
