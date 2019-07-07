import Vue from 'vue'
import App from './App.vue'
import router from './routes/router'
import store from './stores/store'

import './registerServiceWorker'

import VueCookies from 'vue-cookies'
import VueSocketIO from 'vue-socket.io'

Vue.use(VueCookies)

Vue.use(new VueSocketIO({ debug: true, connection: 'http://localhost:3000' }))

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
