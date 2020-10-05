import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Axios from "axios"
import TreeTable from 'vue-table-with-tree-grid'
import mavonEditor from 'mavon-editor'


import './assets/fonts/iconfont.css'
import './plugins/element.js'
import './assets/css/global.css'
import 'mavon-editor/dist/css/index.css'

Vue.config.productionTip = false

Axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器，在请求头headers中添加token值
Axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = Axios

// 添加格式化时间的过滤器
Vue.filter('dateFormat', originTime => {
  const date = new Date(originTime * 1000)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDay() + '').padStart(2, '0')
  const h = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const s = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${mm}:${s}`
})

Vue.component('tree-table', TreeTable)

Vue.use(mavonEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
