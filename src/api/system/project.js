import request from '@/utils/request'

// 分页查询项目
export function findPage(data) {
  const { current, size } = data
  return request({
    url: '/htProjectInfo/page',
    method: 'post',
    params: { current, size },
    data: data.params
  })
}

// 保存项目
export function saveProject(data) {
  return request({
    url: '/htProjectInfo/save',
    method: 'post',
    data
  })
}

// 修改项目
export function updateProject(data) {
  return request({
    url: '/htProjectInfo/update',
    method: 'post',
    data
  })
}

// 获取详情
export function getDetail(params) {
  return request({
    url: '/htProjectInfo/detail',
    method: 'get',
    params
  })
}

// 删除项目
export function deleteProject(params) {
  return request({
    url: '/htProjectInfo/delete',
    method: 'get',
    params
  })
}

export function deleteLists(data) {
  return request({
    url: '/htProjectInfo/batchDelete',
    method: 'post',
    data
  })
}

// 加载所有部门树
export function treeData(params) {
  return request({
    url: '/htSysOffice/treeData',
    method: 'get',
    params
  })
}

// 获取所有项目
export function projectInfoList(params) {
  return request({
    url: '/htProjectInfo/list',
    method: 'post',
    params
  })
}
