import Vue from 'vue'
import Router from 'vue-router'

import GameBody from '@/components/GameBody.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/:id',
      name: 'GameBody',
      component: GameBody,
    },
    {
      path: '*',
      redirect: 'GameBody',
    },
  ]
})
