import Vue from 'vue'
import Router from 'vue-router'

import GamesList from '@/components/GamesList.vue'
import GameItem from '@/components/GameItem.vue'
import GamePlay from '@/components/GamePlay.vue'
import GameHistory from '@/components/GameHistory.vue'
import PlayerHistory from '@/components/PlayerHistory.vue'
import GameRules from '@/components/GameRules.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: GamesList
    },
    {
      path: '/:gameType',
      component: GameItem,
      props: true,
      children: [
        {
          path: 'play',
          component: GamePlay
        },
        {
          path: 'game-history',
          component: GameHistory
        },
        {
          path: 'player-history',
          component: PlayerHistory
        },
        {
          path: 'rules',
          component: GameRules
        },
        {
          path: '',
          redirect: 'play'
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
