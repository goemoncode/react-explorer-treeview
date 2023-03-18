export interface TreeNode {
  id: string;
  icon: string;
  name: string;
  level: number;
  parent?: TreeNode;
}

export function createNodes(level: number, parent?: TreeNode) {
  const faker = window.faker;
  const nodes: TreeNode[] = [];
  for (let i = 0; i < 5; i++) {
    const id = parent ? [parent.id, i].join('-') : String(i);
    nodes.push({
      id,
      icon: faker.internet.emoji(),
      name: faker.lorem.word(),
      level,
      parent,
    });
  }
  return nodes;
}

export function isAncestor(node1: TreeNode, node2: TreeNode) {
  while (node2.parent) {
    if (node2.parent.id == node1.id) {
      return true;
    }
    node2 = node2.parent;
  }
  return false;
}
