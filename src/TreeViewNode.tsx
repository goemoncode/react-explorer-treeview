import { forwardRef, memo, RefAttributes, useLayoutEffect, useRef } from 'react';
import { cssClassnames, ToggleState, TreeViewNodeProps } from './types';
import { useFocusContainer } from './hooks/useFocusContainer';
import { useMergeRefs } from './hooks/useMergeRefs';
import { Chevron } from './Chevron';
import clsx from 'clsx';

function Node<T>(
  {
    node,
    index,
    level,
    hasChild,
    isExpanded,
    isSelected,
    toggleRenderer,
    labelRenderer,
    onNodeClick,
    onNodeFocus,
    onNodeDoubleClick,
    onNodeContextMenu,
    className,
    style,
    ...props
  }: TreeViewNodeProps<T>,
  ref?: React.Ref<HTMLDivElement>
) {
  const internalRef = useRef<HTMLDivElement>(null);
  const refs = useMergeRefs(internalRef, ref);
  const containerElement = useFocusContainer();

  useLayoutEffect(() => {
    const { current } = internalRef;
    if (current) {
      if (isSelected) {
        current.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        if (containerElement && containerElement.contains(document.activeElement)) {
          current.focus({ preventScroll: true });
        }
      }
    }
  }, [containerElement, isSelected]);

  return (
    <div
      ref={refs}
      role="treeitem"
      aria-level={level}
      aria-posinset={index + 1}
      aria-expanded={isExpanded}
      aria-selected={isSelected ? 'true' : undefined}
      className={clsx(cssClassnames.treeViewNode, className, {
        [cssClassnames.treeViewNodeSelected]: isSelected,
      })}
      style={{ gridRowStart: index + 1, ...style }}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => onNodeClick?.(node)}
      onFocus={() => onNodeFocus?.(node)}
      onDoubleClick={() => onNodeDoubleClick?.(node)}
      onContextMenu={() => onNodeContextMenu?.(node)}
      {...props}
    >
      <div className={cssClassnames.treeViewNodeIndent}>
        {new Array(level - 1).fill({}).map((_, i) => (
          <span key={i}></span>
        ))}
      </div>
      <div
        className={clsx(cssClassnames.treeViewNodeToggle, {
          expanded: hasChild && isExpanded,
          collapsed: hasChild && !isExpanded,
        })}
      >
        {toggleRenderer(
          hasChild
            ? isExpanded
              ? ToggleState.expanded
              : ToggleState.collapsed
            : ToggleState.hidden
        )}
      </div>
      <div className={cssClassnames.treeViewNodeLabel}>{labelRenderer(node)}</div>
    </div>
  );
}

export const TreeViewNode = memo(forwardRef(Node)) as <T>(
  props: TreeViewNodeProps<T> & RefAttributes<HTMLDivElement>
) => JSX.Element;

export function defaultNodeRenderer<R>(key: React.Key, props: TreeViewNodeProps<R>) {
  return <TreeViewNode key={key} {...props} />;
}

export function defaultToggleRenderer(state: ToggleState) {
  return state !== ToggleState.hidden ? (
    <Chevron dir={state === ToggleState.expanded ? 'down' : 'right'} width="18" />
  ) : null;
}
