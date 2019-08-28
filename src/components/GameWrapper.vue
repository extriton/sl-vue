<template>
  <div class="game-wrapper">
    <TheHeader />
    <div class="game-wrapper-content">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
    <TheFooter />
  </div>
</template>

<script>
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'

export default {
  name: 'GameWrapper',
  components: {
    TheHeader,
    TheFooter
  },
  data () {
    return {}
  },
  beforeCreate () {
    // Register web3 metamask / mist
    this.$store.dispatch('registerWeb3')
  },
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
    padding-bottom: calc(58px + 1em);
  }
}
@media all and (max-width: 760px) {
  .game-wrapper {
    .game-wrapper-content {
      min-height: calc(100vh - 90px - 34px);
      padding-bottom: calc(34px + 1em);
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