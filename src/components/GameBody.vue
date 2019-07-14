<template>
    <div class="game-body">
      <div v-if="gameCurrentIndex !== null">
        <GamePlay />
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
import GameRules from '@/components/GameRules.vue'

import { mapGetters } from 'vuex'

export default {
  name: 'GameBody',
  components: {
    GameDefault,
    GamePlay,
    GameRules,
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
  },
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
.center-line {
  width: 800px;
  margin: 0 auto;
  height: 2px;
  background-color: #EFCB46;
}
.page-caption {
  color: #9B3200;
  h3 {
    text-align: center;
    :before {
      content: "";
      position: absolute;
      top: calc(50% - 5px);
      left: 0;
      right: 0;
      height: 6px;
      border-top: 2px solid #9B3200;
      border-bottom: 2px solid #9B3200;
      z-index: -1;    
    }
  }
  span {
    background: white;
    padding: 0 20px;
  }
}

</style>