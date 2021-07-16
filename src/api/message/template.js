import request from '@/utils/request'

// 分页查询消息模板
export function findTemplateList(data) {
  return request({
    url: '/htMessageTemplate/page',
    method: 'post',
    data
  })
}

// 获取模板详情
export function getTemplateDetail(params) {
  return request({
    url: '/htMessageTemplate/detail',
    method: 'get',
    params
  })
}

// 保存模板信息
export function saveTemplate(data) {
  return request({
    url: '/htMessageTemplate/save',
    method: 'post',
    data
  })
}

// 删除模板
export function deleteTemplate(params) {
  return request({
    url: '/htMessageTemplate/delete',
    method: 'get',
    params
  })
}
