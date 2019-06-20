<template>
    <div class="game-menu">
        {{ gamesCount }}
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'GameMenu',
  components: {},
  data () {
    return {
    }
  },
  methods: {

  },
  computed: {
      ...mapGetters(['gamesCount'])
  },
  mounted () {
    this.$store.dispatch('loadGameSettings')
  }
}
</script>

<style scope lang="scss">
</style>