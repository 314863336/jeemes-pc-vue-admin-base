// 动态获取路由
import request from '@/utils/request'

// 加载所有文件夹树
export function treeData(params) {
  return request({
    url: '/htFileInfo/treeData',
    method: 'get',
    params
  })
}

// 保存文件夹
export function saveFolder(data) {
  return request({
    url: '/htFileInfo/save',
    method: 'post',
    data
  })
}

// 修改文件夹
export function updateFolder(data) {
  return request({
    url: '/htFileInfo/update',
    method: 'post',
    data
  })
}

// 保存上传文件信息
export function saveFile(data) {
  return request({
    url: '/htFileInfo/batchSave',
    method: 'post',
    data
  })
}

// 加载文件列表数据
export function findFileList(data) {
  return request({
    url: '/htFileInfo/page',
    method: 'post',
    params: {
      current: data.current,
      size: data.size
    },
    data: data.params
  })
}

// 获取文件相关信息
export function findFile(data) {
  return request({
    url: '/htFileInfo/list',
    method: 'post',
    data
  })
}

// 删除文件
export function deleteFile(params) {
  return request({
    url: '/htFileInfo/delete',
    method: 'get',
    params
  })
}

// 移动文件
export function moveFile(data) {
  return request({
    url: '/htFileInfo/moveFile',
    method: 'post',
    data
  })
}

// 批量删除文件
export function deleteFiles(data) {
  return request({
    url: '/htFileInfo/batchDelete',
    method: 'post',
    data
  })
}

