<template>
    <div class="game-body">
      <div v-if="gameCurrentIndex !== null">
        <GamePlay />
        <GameHistory />
        <PlayerHistory />
        <GameRules />
      </div>
      <div v-if="gameCurrentIndex === null">
        <GameDefault />
      </div>
    </div>
</template>

<script>
import GameDefault from '@/components/GameDefault.vue'
import GamePlay from '@/components/GamePlay.vue'
import GameHistory from '@/components/GameHistory.vue'
import PlayerHistory from '@/components/PlayerHistory.vue'
import GameRules from '@/components/GameRules.vue'

import { mapGetters } from 'vuex'

export default {
  name: 'GameBody',
  components: {
    GameDefault,
    GamePlay,
    GameHistory,
    PlayerHistory,
    GameRules
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['gameCurrentIndex'])
  },
  beforeCreate () {
    // Register web3 metamask / mist
    this.$store.dispatch('registerWeb3')
  }
}
</script>

<style lang="scss">
.m-btn {
  border: 0 solid;
  box-shadow: inset 0 0 20px rgba(51, 181, 247, 0);
  outline: 1px solid;
  outline-color: rgba(51, 181, 247, 0);
  outline-offset: 0px;
  text-shadow: none;
  -webkit-transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
          transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
  outline-color: rgba(51, 181, 247, 0.5);
  outline-offset: 0px;
  -moz-user-select: none;
  -webkit-user-select: none;
}
.m-btn:hover {
  border: 1px solid;
  box-shadow: inset 0 0 20px rgba(51, 181, 247, 0.5), 0 0 20px rgba(51, 181, 247, 0.2);
  outline-offset: 15px;
  outline-color: rgba(51, 181, 247, 0);
  text-shadow: 1px 1px 2px #427388;
  cursor: pointer;
}
.m-btn.disabled {
  border: 0 solid;
  box-shadow: inset 0 0 20px rgba(51, 51, 51, 0);
  outline: 1px solid;
  outline-color: rgba(91, 91, 91, 0);
  outline-offset: 0px;
  text-shadow: none;
  -webkit-transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
          transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
  outline-color: rgba(91, 91, 91, 0.5);
  outline-offset: 0px;
  color: #333333;
}
.m-btn.disabled:hover {
  cursor: not-allowed;
}
.page-caption {
  color: #CC6610;
  position: relative;
  h3 {
    text-align: left;
    margin-top: 0;
    margin-bottom: 40px;
    font-size: 42px;
    padding: 8px 20px 7px 20px;
    border-top: 3px solid;
    border-left: 3px solid;
    padding-top: 17px;
  }
}
</style>