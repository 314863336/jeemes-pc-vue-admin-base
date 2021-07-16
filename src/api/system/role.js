import request from '@/utils/request'

// 分页查询角色
export function findRoleList(data) {
  return request({
    url: '/htSysRole/page',
    method: 'post',
    data
  })
}

// 获取角色详情数据
export function getRoleDetail(params) {
  return request({
    url: '/htSysRole/detail',
    method: 'get',
    params
  })
}

// 保存角色数据
export function saveRole(data) {
  return request({
    url: '/htSysRole/save',
    method: 'post',
    data
  })
}

// 保存分配菜单
export function saveAssignMenu(params) {
  return request({
    url: '/htSysRole/assignMenu',
    method: 'get',
    params
  })
}

// 保存分配岗位
export function saveAssignPost(params) {
  return request({
    url: '/htSysRole/assignPost',
    method: 'get',
    params
  })
}

// 保存数据权限
export function saveAssignDataScope(data, params) {
  return request({
    url: '/htSysRole/assignDataScope',
    method: 'post',
    data,
    params
  })
}

// 删除角色
export function deleteRole(params) {
  return request({
    url: '/htSysRole/delete',
    method: 'get',
    params
  })
}

