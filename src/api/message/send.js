import request from '@/utils/request'

// 分页查询已发送消息
export function findMessageList(data) {
  return request({
    url: '/htMessageSend/page',
    method: 'post',
    data
  })
}

// 获取已发送消息详情
export function getMessageDetail(params) {
  return request({
    url: '/htMessageSend/detail',
    method: 'get',
    params
  })
}

// 删除已发送消息
export function deleteMessage(params) {
  return request({
    url: '/htMessageSend/delete',
    method: 'get',
    params
  })
}
