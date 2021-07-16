import request from '@/utils/request'

// 分页查询接收的消息
export function findMessageList(data) {
  return request({
    url: '/htMessageReceive/page',
    method: 'post',
    data
  })
}

// 获取接收的详情
export function getMessageDetail(params) {
  return request({
    url: '/htMessageReceive/detail',
    method: 'get',
    params
  })
}

// 删除接收的消息
export function deleteMessage(data) {
  return request({
    url: '/htMessageReceive/delete',
    method: 'post',
    data
  })
}

// 保存消息信息
export function saveMessage(data) {
  return request({
    url: '/htMessageReceive/save',
    method: 'post',
    data
  })
}

// 修改消息信息
export function updateMessage(data) {
  return request({
    url: '/htMessageReceive/update',
    method: 'post',
    data
  })
}

// 获取当前登陆人未读消息数量
export function getMessageCount() {
  return request({
    url: '/htMessageReceive/getMessageCount',
    method: 'get'
  })
}

// 获取当前登录人新消息
export function getNewMessage() {
  return request({
    url: '/htMessageReceive/getNewMessage',
    method: 'get'
  })
}

// 获取当前登录人新消息
export function changeReadStatus(data) {
  return request({
    url: '/htMessageReceive/changeReadStatus',
    method: 'post',
    data
  })
}

export function senEmail() {
  return request({
    url: '/htMessageSend/sendEmail',
    method: 'get'
  })
}
