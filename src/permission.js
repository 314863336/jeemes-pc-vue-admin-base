import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { getMessageCount } from '@/api/message/receive'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

let uac = true

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in

  const hasToken = getToken()
  if (to.path === '/401' || to.path === '/404') {
    next()
    NProgress.done()
  } else if (to.path === '/dashboard' && to.query.userId && to.query.singleToken && uac) {
    const result = await store.dispatch('user/singleSignOn', to.query)
    if (result.success === true) {
      uac = false
      next({ path: '/dashboard', replace: true })
    } else {
      next({ path: '/401' })
    }
    NProgress.done()
  } else if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/dashboard' })
      NProgress.done()
    } else {
      await getMessageCount().then(res => {
        console.log(res)
        res ? store.state.message.count = res.data : store.state.message.count = 0
      })

      const addRoutes = store.getters.addRoutes
      if (addRoutes.length > 0) {
        next()
      } else {
        try {
          // 初始化字典
          await store.dispatch('dictionary/init')

          // 初始化路由
          await store.dispatch('permission/init')

          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          // next(`/login?redirect=${to.path}`)
          next(`/login`)

          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      // next(`/login?redirect=${to.path}`)
      next(`/login`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
