import request from '@/utils/request'

// 获取license信息
export function getLicenseContent(params) {
  return request({
    url: '/license/getLicenseContent',
    method: 'get',
    params
  })
}

// 生成license
export function generateLicense(data) {
  return request({
    url: '/license/generator',
    method: 'post',
    data
  })
}

