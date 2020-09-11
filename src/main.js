import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Axios from "axios";

import './assets/fonts/iconfont.css'
import './assets/css/global.css'
import './plugins/element.js'

Vue.config.productionTip = false

Axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = Axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
