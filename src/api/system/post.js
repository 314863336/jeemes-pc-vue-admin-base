import request from '@/utils/request'

// 查询树状菜单
export function findPostList(data) {
  return request({
    url: '/htSysPost/list',
    method: 'post',
    data
  })
}

// 保存菜单排序
export function saveTreeSortData(data) {
  return request({
    url: '/htSysPost/saveTreeSortData',
    method: 'post',
    data
  })
}

// 保存岗位数据
export function savePost(data) {
  return request({
    url: '/htSysPost/save',
    method: 'post',
    data
  })
}

// 选择父级岗位树数据
export function findPostPTreeData(params) {
  return request({
    url: '/htSysPost/pTreeData',
    method: 'get',
    params
  })
}

// 获取岗位详情数据
export function getPostDetail(params) {
  return request({
    url: '/htSysPost/detail',
    method: 'get',
    params
  })
}

// 获取岗位树数据
export function findPostTreeData(data) {
  return request({
    url: '/htSysPost/treeData',
    method: 'post',
    data
  })
}

// 保存分配岗位
export function saveUserPost(data, params) {
  return request({
    url: '/htSysPost/saveUserPost',
    method: 'post',
    data,
    params
  })
}

// 删除分配岗位
export function deleteUserPost(params) {
  return request({
    url: '/htSysPost/deleteUserPost',
    method: 'get',
    params
  })
}

// 保存分配角色
export function savePostRole(data, params) {
  return request({
    url: '/htSysPost/savePostRole',
    method: 'post',
    data,
    params
  })
}

// 删除分配角色
export function deletePostRole(params) {
  return request({
    url: '/htSysPost/deletePostRole',
    method: 'get',
    params
  })
}

// 删除岗位
export function deletePost(params) {
  return request({
    url: '/htSysPost/delete',
    method: 'get',
    params
  })
}

