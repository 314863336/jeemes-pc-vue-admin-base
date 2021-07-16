// 流程管理
import request from '@/utils/request'

export function getDeployPage(data, params) {
  return request({
    url: '/flw/manage/deploy/page',
    method: 'post',
    data,
    params
  })
}

export function deleteDeploy(data) {
  return request({
    url: '/flw/manage/deploy/delete',
    method: 'delete',
    data
  })
}

export function suspendProcess(data) {
  return request({
    url: `/flw/manage/deploy/suspend/${data}`,
    method: 'put'
  })
}

export function activateProcess(data) {
  return request({
    url: `/flw/manage/deploy/activate/${data}`,
    method: 'put'
  })
}

export function startProcess(data, params, type) {
  return request({
    url: `/${type}/start`,
    method: 'post',
    data,
    params
  })
}

export function getButtons(params) {
  return request({
    url: '/flw/manage/common/task/buttons',
    method: 'get',
    params
  })
}

export function executeTask(data, params) {
  return request({
    url: '/flw/manage/common/task/execute',
    method: 'post',
    data,
    params
  })
}

export function getComments(params) {
  return request({
    url: '/flw/manage/common/task/comments',
    method: 'get',
    params
  })
}

export function getBeforeNodes(params) {
  return request({
    url: '/flw/manage/common/task/before-nodes',
    method: 'get',
    params
  })
}

export function goBack(data, params) {
  return request({
    url: '/flw/manage/common/task/go-back',
    method: 'put',
    data,
    params
  })
}

export function getCurrentTask(params) {
  return request({
    url: '/flw/manage/common/task/current-task',
    method: 'get',
    params
  })
}

export function transferTask(params) {
  return request({
    url: '/flw/manage/common/task/transfer',
    method: 'put',
    params
  })
}

export function terminationProcess(params) {
  return request({
    url: '/flw/manage/common/process/termination',
    method: 'put',
    params
  })
}

export function claimTask(data, params) {
  return request({
    url: '/flw/manage/common/task/claim',
    method: 'put',
    data,
    params
  })
}

export function claimBatchTask(data, params) {
  return request({
    url: '/flw/manage/common/task/claim/batch',
    method: 'put',
    data,
    params
  })
}

export function findIsSameNode(data) {
  return request({
    url: '/flw/manage/common/check/is-same-node',
    method: 'post',
    data
  })
}

// examples

export function getTemplatePage(data, params) {
  return request({
    url: '/htFlwTemplate/page',
    method: 'post',
    data,
    params
  })
}

export function saveTemplate(data) {
  return request({
    url: '/htFlwTemplate/save',
    method: 'post',
    data
  })
}

export function updateTemplate(data) {
  return request({
    url: '/htFlwTemplate/update',
    method: 'post',
    data
  })
}

export function deleteTemplate(params) {
  return request({
    url: '/htFlwTemplate/delete',
    method: 'get',
    params
  })
}
