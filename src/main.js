import Vue from 'vue'
import App from './App.vue'
import router from './routes/router'
import store from './stores/store'

import './registerServiceWorker'

import VueCookies from 'vue-cookies'
import VueSocketIO from 'vue-socket.io'

Vue.use(VueCookies)

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:3000',
  vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
  },
  // options: { path: '/ws' } 
}))

Vue.config.productionTip = false

new Vue({
  sockets: {
    connect: function() {
        console.log('Socket connected!')
    },
    customEmit: function(data) {
        console.log('customEmit received!')
        this.$socket.emit('toServer:send', data)
    }
  },
  router,
  store,
  render: h => h(App)
}).$mount('#app')
