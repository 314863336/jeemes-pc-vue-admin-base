import request from '@/utils/request'

// 懒加载查询树状菜单
export function findMenuTreeDataLazy(data) {
  return request({
    url: '/htSysMenu/list',
    method: 'post',
    data
  })
}

// 获取菜单详情数据
export function getMenuDetail(params) {
  return request({
    url: '/htSysMenu/detail',
    method: 'get',
    params
  })
}

// 选择父级菜单树数据
export function findMenuPTreeData(params) {
  return request({
    url: '/htSysMenu/pTreeData',
    method: 'get',
    params
  })
}

// 保存菜单数据
export function saveMenu(data) {
  return request({
    url: '/htSysMenu/save',
    method: 'post',
    data
  })
}

// 删除菜单
export function deleteMenu(params) {
  return request({
    url: '/htSysMenu/delete',
    method: 'get',
    params
  })
}

// 保存菜单排序
export function saveTreeSortData(data) {
  return request({
    url: '/htSysMenu/saveTreeSortData',
    method: 'post',
    data
  })
}

// 获取菜单树数据
export function findMenuTreeData(data) {
  return request({
    url: '/htSysMenu/treeData',
    method: 'post',
    data
  })
}

// 获取当前用户拥有的菜单
export function getUserMenuTreeData(params) {
  return request({
    url: '/htSysMenu/getUserMenuTreeData',
    method: 'get',
    params
  })
}
