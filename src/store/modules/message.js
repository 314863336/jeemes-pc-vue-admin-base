const state = {
  count: 0,
  newMessage: 0, // 0 无 1 有
  readedData: null // 已读消息
}

const mutations = {
  SET_COUNT: (state, count) => {
    state.count = count
  },
  SET_NEW_MESSAGE: (state, flag) => {
    state.newMessage = flag
  },
  SET_READED_DATA: (state, data) => {
    state.readedData = data
  }
}

const actions = {
  setCount({ commit }, count) {
    commit('SET_COUNT', count)
  },
  setNewMessage({ commit }, flag) {
    commit('SET_NEW_MESSAGE', flag)
  },
  setReadedData({ commit }, data) {
    commit('SET_READED_DATA', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
