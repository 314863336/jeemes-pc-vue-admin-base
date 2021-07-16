// 动态获取路由
import request from '@/utils/request'

// 加载所有我的分享的文件列表
export function fromMeList(data) {
  return request({
    url: '/htFileShared/fromMeList',
    method: 'post',
    data
  })
}

// 保存我的分享
export function shareFile(data) {
  return request({
    url: '/htFileShared/shareFile',
    method: 'post',
    data
  })
}

// 获取下级数据
export function pageByParentId(data, params) {
  return request({
    url: '/htFileShared/pageByParentId',
    method: 'post',
    data,
    params
  })
}

// 取消分享
export function deleteShared(params) {
  return request({
    url: '/htFileShared/deleteShared',
    method: 'get',
    params
  })
}

