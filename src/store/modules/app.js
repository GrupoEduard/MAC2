import Cookies from 'js-cookie'
// state
// const server = 'https://mac.smartessi.com'
const server = 'https://mega.smartessi.com'
const serverSocket = 'https://sd-socket.smartessi.com'
// const server = 'https://61748f7a.ngrok.io'
// http://sd-socket.smartessi.com/
export const state = {
  appName: 'Mega Archivo',
  server: `${server}`,
  serverApi: `${server}/api/`,
  serverSocket: `${serverSocket}`,
  cliente: 'eyJpdiI6IjJmNEN0d1hOdU9BZ3pSTWMxcWVrbEE9PSIsInZhbHVlIjoiYXd2VXVQQ0VrMHdweG9lV2Z1NW4zQT09IiwibWFjIjoiZDRlZjU3NGExZGEyN2Y2MDIyYTQxMzc2MjE2YWJiNTk2NTRhZjRjZjJhYTY4YWI3MDZlMjZkYmYzNWQ2NTQ3NCJ9',
  breadcrumbs:[],
  mac:null,
  carga:0,
  velicidad_descarga:0,
  sync:false,
  fullLoading:false
}

// getters
export const getters = {
  appName: state => state.appName,
  server: state => state.server,
  serverApi: state => state.serverApi,
  serverSocket: state => state.serverSocket,
  cliente: state => state.cliente,
  mac: state => state.mac,
  sync: state => state.sync,
  carga: state => state.carga,
  velicidad_descarga: state => state.carga,
  breadcrumbs: state => state.breadcrumbs,
  fullLoading: state => state.fullLoading,
}

// mutations
export const mutations = {
  mac(state, n) {
    state.mac = n
  },
  cliente(state, n) {
    state.cliente = n
  },
  sync(state) {
    state.sync = !state.sync
  },
  fullLoading(state) {
    state.fullLoading = !state.fullLoading
  },
  carga(state, n) {
    state.carga = n
  },
  velicidad_descarga(state, n) {
    state.carga = n
  },
  breadcrumbs(state, n) {
    state.breadcrumbs = n
  }


}

// actions
export const actions = {

}
