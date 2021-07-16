// 动态获取路由
import request from '@/utils/request'
// import { getToken } from '@/utils/auth'

export function getParam(data) {
  return request({
    url: '/param/listData',
    method: 'post',
    data
  })
}

export function getListData(data) {
  return request({
    url: '/htSysConfig/page',
    method: 'post',
    data
  })
}

export function saveData(data) {
  return request({
    url: '/htSysConfig/save',
    method: 'post',
    data
  })
}

export function updateData(data) {
  return request({
    url: '/htSysConfig/update',
    method: 'post',
    data
  })
}

export function deleteParam(params) {
  return request({
    url: '/htSysConfig/delete',
    method: 'get',
    params
  })
}

export function deleteLists(data) {
  return request({
    url: '/htSysConfig/batchDelete',
    method: 'post',
    data
  })
}
