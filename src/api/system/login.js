import request from '@/utils/request'

// 验证ip是否白名单
export function checkIp(params) {
  return request({
    url: '/checkIp',
    method: 'get',
    params
  })
}

// 获取验证码
export function getCaptcha(params) {
  return request({
    url: '/captcha',
    method: 'get',
    params
  })
}
