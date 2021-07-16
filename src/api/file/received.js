// 动态获取路由
import request from '@/utils/request'

// 加载所有分享给我的文件列表
export function toMeList(data) {
  return request({
    url: '/htFileReceived/toMeList',
    method: 'post',
    data
  })
}

// 获取下级数据
export function pageByParentId(data, params) {
  return request({
    url: '/htFileReceived/pageByParentId',
    method: 'post',
    data,
    params
  })
}

// 删除分享给我的文件
export function deleteReceived(params) {
  return request({
    url: '/htFileReceived/deleteReceived',
    method: 'get',
    params
  })
}
