<template>
    <div class="game-wrapper">
        <TheHeader />
        <GameMenu />
        <transition name="fade" mode="out-in">
          <div :key="gameCurrentIndex">
            <router-view></router-view>
          </div>
        </transition>
        <TheFooter />
    </div>
</template>

<script>
import TheHeader from '@/components/TheHeader.vue'
import GameMenu from '@/components/GameMenu.vue'
import TheFooter from '@/components/TheFooter.vue'

import { mapGetters } from 'vuex'

export default {
  name: 'GameWrapper',
  components: {
    TheHeader,
    GameMenu,
    TheFooter
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['gameSettings', 'gameCurrent', 'gameCurrentIndex'])
  },
  created () {
    
    // Define current game by router id
    let index = 0
    
    for (let i = 0; i < this.gameSettings.games.length; i++)
      if (this.gameSettings.games[i].type === this.$route.params.id)
          index = i

    this.$store.commit('gameCurrentChange', index)
  },
  watch: {
    gameCurrentIndex: function(val) {
      if(val !== null) {
        this.$router.push({ path: this.gameCurrent.type })
      }
    }
  }
}
</script>

<style lang="scss">
.game-wrapper {
  background-color: rgba(16, 24, 30, 0.98);
  -moz-user-select: none;
  -webkit-user-select: none;
  .template-color {
    color: #34bbff;
  }
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 1s
}
.fade-enter, .fade-leave-active {
    opacity: 0
}
</style>

