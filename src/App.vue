<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
  components: {
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
  padding-top: 114px;
}
</style>