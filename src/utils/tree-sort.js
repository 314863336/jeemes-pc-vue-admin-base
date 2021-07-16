import { Message } from 'element-ui'

export function lessTreeSort(row, treeSortData) {
  if (row.treeSort) {
    const treeSort = parseInt(row.treeSort)
    if (treeSort <= 10) {
      Message({
        message: '不能再减少了',
        type: 'info',
        duration: 5 * 1000
      })
    } else {
      row.treeSort = treeSort - 10
      editTreeSortData(row, treeSortData)
    }
  }
}

export function addTreeSort(row, treeSortData) {
  if (row.treeSort) {
    const treeSort = parseInt(row.treeSort)
    if (treeSort >= 100000000) {
      Message({
        message: '不能再增加了',
        type: 'info',
        duration: 5 * 1000
      })
    } else {
      row.treeSort = treeSort + 10
      editTreeSortData(row, treeSortData)
    }
  }
}

function editTreeSortData(row, treeSortData) {
  const data = treeSortData.filter(o => o.id === row.id)
  if (data.length === 0) {
    treeSortData.push(row)
  }
}
