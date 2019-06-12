<template>
  <div id="app">
    <div id="nav">
      <router-link to="/" v-show="jwtToken" class="router-link-item">Book List</router-link>
      <router-link to="/login" v-show="!jwtToken" class="router-link-item">Login</router-link>
      <router-link to="/register" v-show="!jwtToken" class="router-link-item">Register</router-link>
    </div>
    <div>
      <img alt="Vue logo" src="./assets/logo.png" />
      <h1 class="center-text">
        Welcome to Your Vue.js App
        <button type="button" v-show="jwtToken" @click="logout()">Logout</button>
      </h1>
      <hr />
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  components: {
  },
  data () {
    return {
    }
  },
  methods: {
    logout () {
      localStorage.removeItem('jwtToken')
      this.$store.commit('setJwtToken', localStorage.getItem('jwtToken'))
      this.$router.push({ name: 'Login' })
    },
  },
  computed: {
    jwtToken () {
      return this.$store.state.jwtToken
    }
  },
  created () {
    this.$store.commit('setJwtToken', localStorage.getItem('jwtToken'))
  },
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.center-text {
  text-align: center;
}
.router-link-item {
  display: inline-block;
  margin-right: 20px;
  padding: 5px 10px;
  border: 1px solid #CCC;
}
</style>