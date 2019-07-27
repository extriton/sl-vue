import Vue from 'vue'
import App from './App.vue'
import router from './routes/router'
import store from './stores/store'
import config from '../server/config/config'

import './registerServiceWorker'

import VueCookies from 'vue-cookies'
import VueSocketIO from 'vue-socket.io'
import VueClipboard from 'vue-clipboard2'
import Notifications from 'vue-notification'
import VueScrollTo from 'vue-scrollto'

Vue.use(VueCookies)
Vue.use(VueClipboard)
Vue.use(Notifications)
Vue.use(VueScrollTo, { container: 'body', offset: -105, duration: 1500, easing: 'ease-in' })

Vue.use(new VueSocketIO({ debug: true, connection: `${config.domain}`, options: { path: '/ws/socket.io' } }))

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
