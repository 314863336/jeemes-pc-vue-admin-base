import { login, logout, singleSignOn } from '@/api/system/user'
import md5 from 'js-md5'
import { getToken, setToken, removeToken, getClientUUID, setClientUUID } from '@/utils/auth'
import uuid from '@/utils/uuid'
import { resetRouter } from '@/router'
import store from '@/store'

const getDefaultState = () => {
  return {
    token: getToken(),
    user: {},
    name: '',
    avatar: ''
  }
}

const getters = {
  // 获取当前用户信息，在vue页面中 调用方法: this.$store.getters['user/getCurUser']
  getCurUser: state => {
    if (state.user) {
      return state.user
    } else {
      return {}
    }
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    if (avatar === null) {
      avatar = 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'
    } else {
      avatar = process.env.VUE_APP_BASE_URL + avatar
    }
    state.avatar = avatar
  },
  SET_USER: (state, user) => {
    state.user = user
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    const d = {
      username: username.trim(),
      password: md5(password)
    }
    if (userInfo.captchaKey) {
      d.captchaKey = userInfo.captchaKey
    }
    if (userInfo.captcha) {
      d.captcha = userInfo.captcha
    }
    return new Promise((resolve, reject) => {
      login(d).then(data => {
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        // 如果不存在存储socketuuid
        if (!getClientUUID()) {
          setClientUUID(uuid())
        }
        resolve()
      }).catch(error => {
        console.log(error)
        reject(error)
      })
    })
  },

  singleSignOn({ commit }, query) {
    return new Promise((resolve, reject) => {
      singleSignOn(query)
        .then(response => {
          console.log('免密登录成功', response)
          commit('SET_TOKEN', response.data)
          setToken(response.msg)
          resolve({ success: true })
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        store.dispatch('permission/resetRoutes')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      store.dispatch('permission/resetRoutes')
      resolve()
    })
  },

  // 当前用户信息，包括公司和部门信息，如果是超级管理员，则公司和部门信息为空
  setUser({ commit }, user) {
    commit('SET_USER', user)
    commit('SET_NAME', user.userName)
    commit('SET_AVATAR', user.avatar)
  },

  setAvatar({ commit }, avatar) {
    commit('SET_AVATAR', avatar)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

