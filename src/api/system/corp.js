import request from '@/utils/request'

// 分页查询部门懒加载
export function findCorpTreeData(data) {
  return request({
    url: '/htSysOffice/list',
    method: 'post',
    data
  })
}

// 加载所有部门树
export function treeData(params) {
  return request({
    url: '/htSysOffice/treeData',
    method: 'get',
    params
  })
}

export function saveOrUpdateTree(data) {
  return request({
    url: '/htSysOffice/saveOrUpdateTree',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/htSysOffice/save',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/htSysOffice/update',
    method: 'post',
    data
  })
}

export function getDetail(params) {
  return request({
    url: '/htSysOffice/detail',
    method: 'get',
    params
  })
}

export function deleteTree(params) {
  return request({
    url: '/htSysOffice/deleteTree',
    method: 'get',
    params
  })
}

