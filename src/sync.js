import Vue from 'vue'
import App from './App.vue'
import router from './router'
import main from './main'

Vue.config.productionTip = false

const sync = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

sync.$main = main
