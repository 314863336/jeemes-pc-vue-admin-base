import request from '@/utils/request'

// 查询省数据
export function getProvinceList(data) {
  return request({
    url: '/htProvince/list',
    method: 'post',
    data
  })
}

// 查询市数据
export function getCityList(data) {
  return request({
    url: '/htCity/list',
    method: 'post',
    data
  })
}

// 查询区县数据
export function getAreaList(data) {
  return request({
    url: '/htArea/list',
    method: 'post',
    data
  })
}
