// 字典
import { getList, getDictDataRedis } from '@/api/system/dictionary'
import _ from 'lodash'

const state = {
  list: [], // 字典管理页面列表
  dict: [], // 所有字典，含字典数据children
  pageNo: 1,
  pageSize: 10,
  total: 0,
  loading: true
}

const getters = {
  getDict({ dict }) {
    // ByDictType
    return (type = 'dictType', val, isGetValue) => {
      const targetDict = dict[type]
      if (!targetDict) {
        console.warn(`没有找到${type}字典`)
        return
      }
      if (typeof (val) !== 'undefined' && val !== null && val !== '') {
        const target = targetDict.find(item => item.dictValue === val.toString())
        if (!target) {
          console.warn(`在${type}字典中没有找到${val}对应的值`)
          return ''
        }
        return target.dictLabel
      }
      // 防止出现不存在的字典值
      if (isGetValue) {
        return ''
      }
      return dict[type]
    }
  }
}

const mutations = {
  SET_DICT: (state, list) => {
    state.dict = list
  },
  SET_LIST: (state, list) => {
    state.list = list
  },
  SET_LOADING: (state, truthy) => {
    state.loading = truthy
  },
  SET_pageNo: (state, n) => {
    state.pageNo = n
  },
  SET_pageSize: (state, n) => {
    state.pageSize = n
  },
  SET_total: (state, n) => {
    state.total = n
  }
}

const actions = {
  init({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.list.length === 0) {
        getDictDataRedis().then(res => {
          const list = {}
          res.data.forEach(item => {
            !list[item.dictType] && (list[item.dictType] = [])
            list[item.dictType].push(item)
          })
          commit('SET_DICT', list)
          resolve()
        }).catch(error => {
          reject(error)
        })
      }
    })
  },
  getList({ commit, state }, query) {
    commit('SET_LOADING', true)
    const where = {
      pageNo: state.pageNo,
      pageSize: state.pageSize,
      ...query
    }
    getList(where)
      .then(res => {
        commit('SET_total', _.get(res, 'data.total'))
        commit('SET_LIST', _.get(res, 'data.records').map(item => {
          item.btnStopLoading = false
          item.btnDeleteLoading = false
          return item
        }))
      })
      .finally(() => {
        commit('SET_LOADING', false)
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
