import Vue from 'vue'
import store from '@/store'
import VueSocketio from 'vue-socket.io'
import socketio from 'socket.io-client'

let url = store.getters['app/serverSocket']
url += `?cliente=${store.getters['app/cliente']}`
url += `&token=${store.getters['auth/token']}`
url += `&baseURL=${store.getters['app/serverApi']}`

Vue.use(new VueSocketio({
    debug: true,
    connection: socketio(url),
    vuex:{
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    }
}))