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
Vue.use(VueScrollTo)

Vue.use(new VueSocketIO({ debug: true, connection: `${config.host}:${config.port}` }))

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
