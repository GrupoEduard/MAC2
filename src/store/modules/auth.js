import axios from 'axios'
import Cookies from 'js-cookie'
import * as types from '../mutation-types'
import {get} from 'lodash'
var ipc = require('electron').ipcRenderer
import Path from "path";
import fs from "fs-extra";
import {log} from "electron-log";
const app = require('electron').remote.app



// state
export const state = {
  user: null,
  token: Cookies.get('token'),
  cliente: Cookies.get('Cliente'),
}

// getters
export const getters = {
  userFoto: state => get(state,'user.photo_url','https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'),
  userNombre: state => get(state,'user.nombre','Usuario'),
  user: state => state.user,
  token: state => state.token,
  cliente: state => state.cliente,
  check: state => state.user !== null
}

// mutations
export const mutations = {
  [types.SAVE_TOKEN] (state, { token, remember }) {
    state.token = token
    Cookies.set('token', token, { expires: remember ? 365 : null })
    Cookies.set('Cliente','eyJpdiI6IjJmNEN0d1hOdU9BZ3pSTWMxcWVrbEE9PSIsInZhbHVlIjoiYXd2VXVQQ0VrMHdweG9lV2Z1NW4zQT09IiwibWFjIjoiZDRlZjU3NGExZGEyN2Y2MDIyYTQxMzc2MjE2YWJiNTk2NTRhZjRjZjJhYTY4YWI3MDZlMjZkYmYzNWQ2NTQ3NCJ9')
  },

  [types.FETCH_USER_SUCCESS] (state, { user }) {
    state.user = user
  },

  [types.FETCH_USER_FAILURE] (state) {
    state.token = null
    Cookies.remove('token')
    Cookies.remove('Cliente')
  },

  [types.LOGOUT] (state) {
    state.user = null
    state.token = null
    Cookies.remove('token')
    Cookies.remove('Cliente')
  },

  [types.UPDATE_USER] (state, { user }) {
    state.user = user
  }
}

// actions
export const actions = {
  saveToken ({ commit, dispatch }, payload) {
    commit(types.SAVE_TOKEN, payload)
  },

  async fetchUser ({ commit }) {
    try {
      const { data } = await axios.get('user')
      ipc.send('open-sync')

      commit(types.FETCH_USER_SUCCESS, { user: data })
    } catch (e) {
      commit(types.FETCH_USER_FAILURE)
    }
  },

  updateUser ({ commit }, payload) {
    commit(types.UPDATE_USER, payload)
  },

  async login({ commit, dispatch },{ form, remember }) {
    try {
      const {data} = await form.post('login')
      commit(types.SAVE_TOKEN, {
        token: data.token,
        remember: remember
      })
      await dispatch('fetchUser')
    }catch(e){
      console.log(e)
    }

  },

  async logout ({ commit }) {
    try {
      await axios.post('logout')
      // await idbCon.dropDb()
      // let folder = Path.parse(app.getAppPath())
      // let tempPath = Path.join(folder.dir, 'UnidadesAdmin')
      // fs.removeSync(tempPath)
      // ipc.send('close-sync')
    } catch (e) {
      console.log(e)
    }

    commit(types.LOGOUT)
  },

  async fetchOauthUrl (ctx, { provider }) {
    const { data } = await axios.post(`/api/oauth/${provider}`)
    return data.url
  }
}
