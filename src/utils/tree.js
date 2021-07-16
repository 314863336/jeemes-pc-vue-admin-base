const children_key = 'children'
const id_key = 'id'

// 平铺树结构数据，每个节点包括子数据
export function mapReduceTreeData(treeData) {
  const treeNodes = []
  for (let i = 0; i < treeData.length; i++) {
    const element = treeData[i]
    findAllChildren(treeNodes, element)
  }
  return treeNodes
}

// 根据平铺树结构数据和id，判断该节点是否存在子节点
export function isHaveChildren(id, treeNodes) {
  for (let i = 0; i < treeNodes.length; i++) {
    const element = treeNodes[i]
    if (id === element[id_key] && element.isHaveChildren === true) {
      return true
    }
  }
  return false
}

// 根据平铺树结构数据和id，获取该节点所有子节点id
export function findChildrenById(id, treeNodes) {
  const idElement = []
  for (let i = 0; i < treeNodes.length; i++) {
    const element = treeNodes[i]
    if (id === element[id_key]) {
      return [element]
    }
  }
  return idElement
}

// 合并树
export function mergeTreeData(from, to, parentId_key) {
  for (let i = 0; i < to.length; i++) {
    const element = to[i]
    mergeTreeDataCircle(from, element, parentId_key)
  }
}

function mergeTreeDataCircle(from, element, parentId_key) {
  for (let i = 0; i < from.length; i++) {
    const ele = from[i]
    if (ele[parentId_key] === element[id_key]) {
      if (!element[children_key]) {
        element[children_key] = []
      }
      element[children_key].push(ele)
    }
  }

  const children = element[children_key]
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const element = children[i]
      mergeTreeDataCircle(from, element, parentId_key)
    }
  }
}

function findAllChildren(treeNodes, element) {
  const copy = Object.assign({}, element)
  copy.isHaveChildren = !!(element[children_key] && element[children_key].length > 0)
  treeNodes.push(copy)
  const children = element[children_key]
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const element = children[i]
      findAllChildren(treeNodes, element)
    }
  }
}
