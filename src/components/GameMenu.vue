<template>
    <div class="game-menu">
        <div class="prev-arrow"
          v-show="gamesCount > 1"
          @click="prevGame"
        ></div>
        <div class="game-name">
          <transition :name="slideDirection" mode="out-in">
            <div :key="gameCurrentIndex">{{ currentName }}</div>
          </transition>
        </div>
        <div class="next-arrow"
          v-show="gamesCount > 1"
          @click="nextGame"
        ></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'GameMenu',
  components: {},
  data () {
    return {
      slideDirection: 'slide-right'
    }
  },
  methods: {
    prevGame () {
      let index = 0
      if(this.gameCurrentIndex == 0)
        index = this.gamesCount - 1
      else
        index = this.gameCurrentIndex - 1
      this.slideDirection = 'slide-left'
      this.$store.commit('gameCurrentChange', index)
    },
    nextGame () {
      let index = 0
      if(this.gameCurrentIndex == this.gamesCount - 1)
        index = 0
      else
        index = this.gameCurrentIndex + 1
      this.slideDirection = 'slide-right'
      this.$store.commit('gameCurrentChange', index)
    },
  },
  computed: {
      currentName () {
        if(!this.gameSettingsLoaded) return 'Loading...'
        
        if(this.gameCurrentIndex !== null)
          return this.gameCurrent.name
        else
          return 'No games'
      },
      ...mapGetters(['gamesCount', 'gameCurrent', 'gameCurrentIndex', 'gameSettingsLoaded'])
  },
  mounted () {
    this.$store.dispatch('loadGameSettings', this.$route.params.id)
  },
  watch: {
    gameCurrentIndex: function(val) {
      if(val !== null) {
        this.$router.push({ path: this.gameCurrent.type })
        this.$socket.emit('getGameData', { type: this.gameCurrent.type })
      }
    }
  },
  sockets: {
    getGameDataSuccess (data) {
      this.$store.commit('getGameDataSuccess', data)
    }
  }

}
</script>

<style scope lang="scss">
.game-menu {
  width: 300px;
  height: 58px;
  position: fixed;
  z-index: 5;
  top: 90px;
  left: 50%;
  margin-left: -150px;
  background-color: #000;
  border: 1px solid #FECE1A;
  border-radius: 48px;
  .prev-arrow {
    position: absolute;
    width: 48px;
    height: 48px;
    top: 5px;
    left: 10px;
    background: url('../../public/img/icons/goprev.png') no-repeat;
    opacity: 0.8;
    &:hover {
      cursor: pointer;
      opacity: 1.0;
    }
  }
  .next-arrow {
    position: absolute;
    width: 48px;
    height: 48px;
    top: 5px;
    right: 10px;
    background: url('../../public/img/icons/gonext.png') no-repeat;
    opacity: 0.8;
    &:hover {
      cursor: pointer;
      opacity: 1.0;
    }
  }
  .game-name {
    position: absolute;
    width: 180px;
    top: 13px;
    left: 50%;
    margin-left: -90px;
    font-size: 24px;
    font-style: italic;
    color: #FECE1A;
    text-shadow:  2px 3px 5px rgba(224,186,6, -0.5), 
                  3px 3px 5px rgba(254,206,26,.8);
    overflow: hidden;
  }
}
.slide-right-leave-active,
.slide-right-enter-active,
.slide-left-leave-active,
.slide-left-enter-active {
  transition: 1s;
}
.slide-right-enter {
  transform: translateX(-100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}
.slide-left-enter {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>