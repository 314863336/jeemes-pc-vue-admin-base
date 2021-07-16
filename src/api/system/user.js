import request from '@/utils/request'

// 根据岗位查询用户
export function findUserByPosts(data, params) {
  return request({
    url: '/htSysUser/pageByPosts',
    method: 'post',
    data,
    params
  })
}

// 分页查询用户
export function findUserList(data) {
  return request({
    url: '/htSysUser/page',
    method: 'post',
    data
  })
}

// 获取用户详情数据
export function getUserDetail(params) {
  return request({
    url: '/htSysUser/detail',
    method: 'get',
    params
  })
}

// 保存用户数据
export function saveUser(data) {
  return request({
    url: '/htSysUser/save',
    method: 'post',
    data
  })
}

// 保存分配岗位
export function saveAssignPost(params) {
  return request({
    url: '/htSysUser/assignPost',
    method: 'get',
    params
  })
}

// 重置密码
export function resetPassword(params) {
  return request({
    url: '/htSysUser/resetPassword',
    method: 'get',
    params
  })
}

// 删除用户
export function deleteUser(params) {
  return request({
    url: '/htSysUser/delete',
    method: 'get',
    params
  })
}

// 登录
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 登出
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 重置密码
export function updatePassword(params) {
  return request({
    url: '/htSysUser/updatePassword',
    method: 'get',
    params
  })
}

export function singleSignOn(params) {
  return request({
    url: '/lanqu/singleSignOn/login',
    method: 'get',
    params
  })
}
