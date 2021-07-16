// 字典
import { getUserMenuTreeData } from '@/api/system/menu'
/* Layout */
import Layout from '@/layout'
import router, { constantRoutes, modules } from '@/router'
import _ from 'lodash'
import store from '@/store'

const defaultIcon = 'icon_work_fill'

const state = {
  permissions: [], // 当前用户拥有的所有权限
  addRoutes: [],
  routes: []
}

const getters = {
}

const mutations = {
  SET_PERMISSIONS: (state, list) => {
    state.permissions = list
  },
  SET_ADD_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  init({ commit }) {
    return new Promise((resolve, reject) => {
      getUserMenuTreeData({ menuType: '1,3' }).then(res => {
        const treeData = res.data
        store.dispatch('user/setUser', res.user)
        const permissions = []
        const routers = []
        // 菜单生成路由
        createRoutes(treeData, routers, permissions)
        // 添加404
        mergeRoutes(routers)
        // 动态添加路由
        router.addRoutes(routers)
        router.options.routes = constantRoutes.concat(routers)

        commit('SET_ADD_ROUTES', routers)
        // 存储当前用的权限字符串
        commit('SET_PERMISSIONS', permissions)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  resetRoutes({ commit }) {
    commit('SET_ADD_ROUTES', [])
    commit('SET_PERMISSIONS', [])
  }
}

function createRoutes(treeData, routers, permissions) {
  for (let i = 0; i < treeData.length; i++) {
    const element = treeData[i]
    if (element.menuType === '1') {
      const router = createRouter(routers, element, true)
      createChildren(router, element, permissions)
      routers.push(router)
    } else {
      if (element.permission)permissions.push(element.permission)
    }
  }
}

function mergeRoutes(routers) {
  // 404 page must be placed at the end !!!
  routers.push({ path: '*', redirect: '/404', hidden: true })
}

function createChildren(router, element, permissions) {
  const children = element.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const item = children[i]
      if (item.menuType === '1') {
        const r = createRouter(router, item, false)
        router.children.push(r)
        createChildren(r, item, permissions)
      } else {
        if (item.permission)permissions.push(item.permission)
      }
    }
  }
}

function createRouter(router, element, isRoot) {
  const d = {
    name: element.menuCode,
    meta: {
      title: element.menuName,
      icon: element.menuIcon ? element.menuIcon : defaultIcon
    }
  }
  if (!element.menuHref) {
    d.redirect = 'noRedirect'
  }

  if (element.children && element.children.length > 0) {
    d.children = []
    d.alwaysShow = true
  }

  if (isRoot) {
    d.component = Layout
    d.path = '/' + element.menuCode
    if (element.menuHref) {
      if (element.menuTarget === '2') {
        d.children = [
          {
            path: element.menuHref,
            meta: { title: element.menuName, icon: element.menuIcon ? element.menuIcon : defaultIcon }
          }
        ]
      } else {
        d.children = [
          {
            path: element.menuHref,
            meta: { title: element.menuName, icon: element.menuIcon ? element.menuIcon : defaultIcon },
            component: componentHander(element.menuHref),
            name: element.menuCode
          }
        ]
      }
    }
  } else {
    d.path = element.menuCode

    if (element.menuHref) {
      if (element.menuTarget === '2') {
        d.path = element.menuHref
        delete d.name
      } else {
        d.component = componentHander(element.menuHref)
      }
    }
  }
  for (const key in modules) {
    const item = modules[key]
    for (let i = 0; i < item.length; i++) {
      const t = item[i]
      if (t.meta.activeMenu.indexOf('/' + d.path) >= 0 &&
        t.meta.activeMenu.indexOf('/' + d.path) === (t.meta.activeMenu.length - d.path.length - 1)) {
        if (_.isArray(router)) {
          router.push(t)
        } else if (_.isArray(router.children)) {
          router.children.push(t)
        }
        break
      }
    }
  }
  return d
}

const componentHander = path => {
  return resolve => {
    require.ensure([], require => {
      try {
        resolve(require('@/views' + path + '.vue'))
      } catch (error) {
        resolve(require('@/views/404'))
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
