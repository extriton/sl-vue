<template>
    <div class="game-wrapper">
        <TheHeader />
        <transition name="fade" mode="out-in">
            <div class="game-wrapper-content">
              <router-view></router-view>
            </div>
        </transition>
        <TheFooter />
    </div>
</template>

<script>
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'

// import { mapGetters } from 'vuex'

export default {
  name: 'GameWrapper',
  components: {
    TheHeader,
    TheFooter
  },
  data () {
    return {}
  },
  /*
  computed: {
    ...mapGetters(['gameSettings', 'gameCurrent', 'gameCurrentIndex'])
  },
  */
  created () {
    
    // Define current game by router id
    /*
    let index = 0
    
    for (let i = 0; i < this.gameSettings.games.length; i++)
      if (this.gameSettings.games[i].type === this.$route.params.id)
          index = i

    this.$store.commit('gameCurrentChange', index)
    */
  },
  beforeCreate () {
    // Register web3 metamask / mist
    this.$store.dispatch('registerWeb3')
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
  padding-top: 90px;
  color: white;
  background: linear-gradient(to right, black -50%, rgb(17, 46, 61) 150%);
  .game-wrapper-content {
    width: 90%;
    max-width: 800px;
    margin: 0 auto;
    min-height: calc(100vh - 90px - 58px);
  }
}
@media all and (max-width: 760px) {
  .game-wrapper {
    .game-wrapper-content {
      min-height: calc(100vh - 90px - 38px);
    }
  }
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.8s
}
.fade-enter, .fade-leave-active {
    opacity: 0
}
</style>

