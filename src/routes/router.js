import Vue from 'vue'
import Router from 'vue-router'
import GameWrapper from '@/views/GameWrapper.vue'
// import GameDefault from '@/components/GameDefault.vue'
// import GameBody from '@/components/GameBody.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'GameWrapper',
      component: GameWrapper,
    },
    {
      path: '/:id',
      name: 'GameWrapper',
      component: GameWrapper,
    },
    {
      path: '*',
      redirect: '/',
    },
  ]
})
