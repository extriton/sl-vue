<template>
  <div id="app">
    <TheHeader/>
  </div>
</template>

<script>
/* eslint-disable */
import TheHeader from './components/TheHeader.vue'

export default {
  name: 'app',
  components: {
    TheHeader,
  },
}
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Didact+Gothic|Comfortaa:400,700&subset=latin,cyrillic");

#app {
  font-family: 'Comfortaa', sans;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-width: 768px;
}
</style>