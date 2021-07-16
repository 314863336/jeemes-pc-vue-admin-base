import { Loading } from 'element-ui'

// 打开loading层
export function loading() {
  return Loading.service({
    lock: true,
    text: 'Loading',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

// 关闭loading层
export function closeLoading(loadingObj) {
  return loadingObj.close()
}
