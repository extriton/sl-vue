<template>
  <div class="game-wrapper">
    <TheHeader />
    <div class="game-wrapper-content">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
    <TheFooter />
    <div class="info-block">
      <div class="box-eth-gas-price-wrap">
        <BoxETHGasPrice />
      </div>
      <div class="box-cryptocurrency-wrap">
        <BoxCryptocurrency />
      </div>
    </div>
    <div class="box-chat-wrap">
      <BoxChat />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import BoxETHGasPrice from '@/components/BoxETHGasPrice.vue'
import BoxCryptocurrency from '@/components/BoxCryptocurrency.vue'
import BoxChat from '@/components/BoxChat.vue'

export default {
  name: 'GameWrapper',
  components: {
    TheHeader,
    TheFooter,
    BoxETHGasPrice,
    BoxCryptocurrency,
    BoxChat
  },
  computed: {
    ...mapGetters(['web3'])
  },
  watch: {
    'web3.coinbase': function (value) {
      if (value === null) {
        this.$store.commit('userChange', { username: '', chatBlocked: false })
        return
      }
      this.$socket.emit('getUserData', { address: value })
    }
  },
  sockets: {
    getUserDataSuccess (data) {
      this.$store.commit('userChange', data)
    }
  },
  mounted () {
    // Register web3 metamask
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
  .info-block {
    position: fixed;
    top: 100px;
    right: 10px;
    width: 280px;
    height: calc(100vh - 100px - 58px);
  }
  .box-chat-wrap {
    position: fixed;
    right: 10px;
    bottom: 58px;
    width: 280px;
  }
}
@media all and (max-width: 1400px) {
  .game-wrapper {
    .info-block {
      display: none;
    }
    
  }
}
@media all and (max-width: 760px) {
  .game-wrapper {
    .game-wrapper-content {
      min-height: calc(100vh - 90px - 34px);
      padding-bottom: calc(34px + 1em);
      /* padding-bottom: 0; */
    }
    .info-block {
      display: block;
      position: static;
      width: 90%;
      height: auto;
      margin: 0 auto;
      padding-bottom: calc(34px + 1em);
    }
    .box-chat-wrap {
      width: 95%;
      bottom: 40px;
      z-index: 2;
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
