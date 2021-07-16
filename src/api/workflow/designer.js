// 模型设计器
import request from '@/utils/request'

export function save(data) {
  return request({
    url: '/flw/model/save',
    method: 'post',
    data
  })
}

export function findProcessKeys(params) {
  return request({
    url: '/flw/designer/model/find/process/keys',
    method: 'get',
    params
  })
}

export function getDiagramSvgNoFrills(params) {
  return request({
    url: `/flw/designer/model/diagram/svg/no-frills/${params}`,
    method: 'get'
  })
}

export function getDiagramSvgFrills(params) {
  return request({
    url: `/flw/designer/model/diagram/svg/frills/${params}`,
    method: 'get'
  })
}
