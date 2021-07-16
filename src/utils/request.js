import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import _ from 'lodash'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  // timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (getToken()) {
      // let each request carry token
      // ['Authorization'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // 正常没有错误会返回code为0，否则
    if (res.code !== 0) {
      // 身份认证失败会返回200,code为401,跳转到登录页
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    // 这里处理除了200之外的其他错误码情况
    // 登陆时校验错误都会走这里
    const msg = _.get(error, 'response.data.msg') || error.message
    const code = _.get(error, 'response.data.code')
    if (code === 401) {
      store.dispatch('user/resetToken').then(() => {
        location.reload()
      })
    } else {
      Message({
        message: msg,
        type: 'error',
        duration: 5 * 1000
      })
    }

    return Promise.reject(error)
  }
)

export default service
