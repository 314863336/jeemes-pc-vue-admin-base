// 字典接口

import request from '@/utils/request'

// 获取字典类型列表，有分页
export function getList({
  pageNo,
  pageSize,
  dictName,
  dictType,
  dictCode,
  isSys,
  status
} = {}) {
  const data = { current: pageNo, size: pageSize }
  const params = { dictName, dictType, dictCode, isSys, status }
  data.params = params
  return request({
    url: '/htSysDictType/page',
    method: 'post',
    data
  })
}

// 获取字典数据列表（从数据库获取）
export function getDetail(data) {
  return request({
    url: '/htSysDictData/list',
    method: 'post',
    data
  })
}

// 获取字典数据列表（从redis获取）
export function getDictDataRedis() {
  return request({
    url: '/htSysDictData/listRedis',
    method: 'get'
  })
}

// 新增某一个字段类型
export function putList(data) {
  return request({
    url: '/htSysDictType/save',
    method: 'post',
    data
  })
}

// 编辑某一个字段类型
export function updateList(data) {
  return request({
    url: '/htSysDictType/update',
    method: 'post',
    data
  })
}

// 删一个字段类型
export function deleteList(params) {
  return request({
    url: '/htSysDictType/delete',
    method: 'get',
    params
  })
}

// 批量删除字段类型
export function deleteLists(data) {
  return request({
    url: '/htSysDictType/batchDeleteType',
    method: 'post',
    data
  })
}

// 停用，启用
export function putEnable(query) {
  const { id, enable } = query
  debugger
  return request({
    url: enable ? '/htSysDictType/enable' : '/htSysDictType/disable',
    method: 'get',
    params: { id: id }
  })
}

// 新增字典数据
export function putDetail(data) {
  return request({
    url: '/htSysDictData/save',
    method: 'post',
    data
  })
}

// 修改字典数据
export function updateDetail(data) {
  return request({
    url: '/htSysDictData/update',
    method: 'post',
    data
  })
}

// 删一个字段数据
export function deleteDetail(params) {
  return request({
    url: '/htSysDictData/delete',
    method: 'get',
    params
  })
}

// 批量删除字段数据
export function deleteDetails(data) {
  return request({
    url: '/htSysDictData/batchDeleteData',
    method: 'post',
    data
  })
}

// 停用，启用
export function putDetailEnable(query) {
  const { id, enable } = query
  return request({
    url: enable ? '/htSysDictData/enable' : '/htSysDictData/disable',
    method: 'get',
    params: { id }
  })
}

// 刷新缓存
export function refreshDictCache() {
  return request({
    url: '/htSysDictType/refreshDictCache',
    method: 'get'
  })
}
