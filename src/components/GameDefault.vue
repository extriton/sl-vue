<template>
    <div class="game-default">
        <div class="not-found-text" v-show="showNotFound">Games not found</div>
        <img v-show="!gameSettingsLoaded" src="../../public/img/loading.svg" alt="Loading..." title="Loading..." />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Game',
  components: {},
  data () {
    return {
        showNotFound: false
    }
  },
  computed: {
    ...mapGetters(['gameSettingsLoaded', 'gameCurrent'])
  },
  watch: {
    gameSettingsLoaded: function(val) {
        if(val === true) {
            if(this.gameCurrent === null) {
                this.showNotFound = true
            } else {
                this.$router.push({ path: this.gameCurrent.type })
            }
        }
    }
  }
}
</script>

<style lang="scss">
.game-default {
    min-height: 100vh;
    padding-top: 40px;
    background-color: rgba(16, 24, 30, 0.98);
    background-image: url('../../public/img/bg/3.png');
    background-size: cover;
    position: relative;
    img {
        position: absolute;
        top: 40%;
        left: 50%;
        margin-top: -128px;
        margin-left: -128px;
    }
    .not-found-text {
        margin-top: 20%;
        text-align: center;
        font-size: 36px;
        font-style: italic;
        color: #FECE1A;
        text-shadow: 2px 3px 5px rgba(224, 186, 6, 0), 3px 3px 5px rgba(254, 206, 26, 0.8);
    }
}
</style>

