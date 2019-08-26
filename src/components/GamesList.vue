<template>
    <div class="games-list-wrapper">
      <!-- Title -->
      <h3 class="title-text">
        {{ dict.play_title1 }} <strong class="blue-color">{{ dict.play_title2 }}</strong> 
        {{ dict.play_title3 }} {{ dict.play_title4 }}
      </h3>
      <!-- Description -->
      <h4 class="title-desc">{{ dict.play_title5 }}</h4>
      <!-- Games list -->
      <router-link class="game-link"
          v-for="game in games"
          :key="game.type"
          :to="game.type">
          {{game.type}}
      </router-link>
      </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'GamesList',
  components: {
  },
  data () {
    return {}
  },
  computed: {
    dict () {
      return this.$store.state.dict
    },
    games () {
      return this.gameSettings.games
    },
    ...mapGetters(['gameSettings'])
  },
}
</script>

<style lang="scss">
.games-list-wrapper {
  padding: 20px 0;
  height: 1500px;
  .title-text {
    color: #FAFAFA;
  }
  .title-desc {
    margin-top: 15px;
    color: #3BB9FB;
    border: 2px solid #3BB9FB;
    border-radius: 15px;
    padding: 10px 20px;
  }
  .blue-color {
    color: #3BB9FB;
  }
  .game-link {
    position: relative;
    display: block;
    margin-top: 20px;
    color: #777674;
    font-weight: bold;
    text-decoration: none;
    text-shadow: rgba(255,255,255,.5) 1px 1px, rgba(100,100,100,.3) 3px 7px 3px;
    user-select: none;
    padding: 1em 2em;
    outline: none;
    border-radius: 3px / 100%;
    background-image:
      linear-gradient(45deg, rgba(255,255,255,.0) 30%, rgba(255,255,255,.8), rgba(255,255,255,.0) 70%),
      linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0) 20%, rgba(255,255,255,0) 90%, rgba(255,255,255,.3)),
      linear-gradient(to right, rgba(125,125,125,1), rgba(255,255,255,.9) 45%, rgba(125,125,125,.5)),
      linear-gradient(to right, rgba(125,125,125,1), rgba(255,255,255,.9) 45%, rgba(125,125,125,.5)),
      linear-gradient(to right, rgba(223,190,170,1), rgba(255,255,255,.9) 45%, rgba(223,190,170,.5)),
      linear-gradient(to right, rgba(223,190,170,1), rgba(255,255,255,.9) 45%, rgba(223,190,170,.5));
    background-repeat: no-repeat;
    background-size: 200% 100%, auto, 100% 2px, 100% 2px, 100% 1px, 100% 1px;
    background-position: 200% 0, 0 0, 0 0, 0 100%, 0 4px, 0 calc(100% - 4px);
    box-shadow: rgba(0,0,0,.5) 3px 10px 10px -10px;
    &:hover {
      transition: .5s linear;
      background-position: -200% 0, 0 0, 0 0, 0 100%, 0 4px, 0 calc(100% - 4px);
    }
    &:active {
      top: 1px;
    }  
  }

}
@media all and (max-width: 760px) {
  .games-list-wrapper {
    padding: 20px 0;
    .title-text {
      font-size: 0.7em;
    }
    .title-desc {
      display: none;
    }
    .game-link {
      margin-top: 10px;
    }
  }
}
</style>

