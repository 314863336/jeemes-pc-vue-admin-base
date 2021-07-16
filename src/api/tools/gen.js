// 动态获取路由
import request from '@/utils/request'

// 加载代码生成列表数据
export function pageList(data) {
  return request({
    url: '/htGenTable/page',
    method: 'post',
    params: {
      current: data.current,
      size: data.size
    },
    data: data.params
  })
}

// 获取数据库表
export function getTables(params) {
  return request({
    url: '/htGenTable/getTables',
    method: 'get',
    params
  })
}

// 获取表字段信息
export function getColumns(params) {
  return request({
    url: '/htGenTable/getColumns',
    method: 'get',
    params
  })
}

// 保存
export function saveGen(data) {
  return request({
    url: '/htGenTable/save',
    method: 'post',
    data
  })
}

// 修改
export function updateGen(data) {
  return request({
    url: '/htGenTable/update',
    method: 'post',
    data
  })
}

// 修改
export function deleteGen(params) {
  return request({
    url: '/htGenTable/delete',
    method: 'get',
    params
  })
}

// 批量删除
export function deleteGens(data) {
  return request({
    url: '/htGenTable/batchDeleteGen',
    method: 'post',
    data
  })
}

// 获取详情
export function getDetail(params) {
  return request({
    url: '/htGenTable/detail',
    method: 'get',
    params
  })
}

// 获取可选择的父表
export function getParentTables(params) {
  return request({
    url: '/htGenTable/getParentTables',
    method: 'get',
    params
  })
}

// 生成代码
export function genCode(params) {
  return request({
    url: '/htGenTable/genCode',
    method: 'get',
    params
  })
}
