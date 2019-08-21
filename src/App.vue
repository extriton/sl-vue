<template>
  <div id="app">
    <GameWrapper />
    <notifications group="main" position="right bottom"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GameWrapper from '@/components/GameWrapper.vue'

export default {
  name: 'app',
  components: {
    GameWrapper,
  },
  computed: {
    ...mapGetters(['notification', 'notificationCounter', 'gameSettings'])
  },
  watch: {
    notificationCounter (value) {
      if (value > 0) {
        this.$notify({  group: 'main',
                        type: this.notification.type,
                        title: this.notification.title,
                        text: this.notification.text,
                        duration: 3000,
                        speed: 1000
                    })
      }
    }
  }
}
</script>

<style lang="scss">
@import url('../public/fonts/comfortaa/comfortaa.css');

#app {
  font-family: 'Comfortaa', sans;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-width: 768px;
  padding-top: 114px;
}
</style>