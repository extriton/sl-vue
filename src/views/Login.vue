<template>
  <div>
    <!-- Errors -->
    <div v-if="errors && errors.length">
      <div v-for="(error, index) of errors" :key="index">
          <p class="error">{{error.message}}</p>
      </div>
    </div>
    <!-- Form -->
    <form class="login-form">
      <input id="username" type="text" placeholder="Enter Name" 
        v-model.trim="login.username"
      />
      <input id="password" type="password" placeholder="Enter Password" 
        v-model.trim="login.password"
      />
      <button type="button" @click.stop="Login()">Login</button>
      <button type="button" @click.stop="Register()">Register</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  components: {},
  data () {
    return {
      login: {},
      errors: []
    }
  },
  methods: {
    Login () {
      axios.post(`http://localhost:3000/api/auth/login/`, this.login)
      .then(response => {
        console.log(`Response received: ${response.data}`)
        localStorage.setItem('jwtToken', response.data.token)
        this.$store.commit('setJwtToken', localStorage.getItem('jwtToken'))
        this.$router.push({
          name: 'BookList'
        })
      })
      .catch(e => {
        console.log(e)
        this.errors.push(e)
      })
    },
    Register () {
      this.$router.push({
        name: 'Register'
      })
    }
  }
}
</script>

<style scope lang="scss">
  .error {
    font-size: 12px;
    font-style: italic;
    color: red;
  }
  .login-form {
    width: 50%;
    margin-left: 25%;
    padding: 20px;
    border: 1px solid #333;
    input {
      width: 80%;
      height: 30px;
      margin-bottom: 20px;
      display: block;
      padding: 5px 10px;
    }
    button {
      margin-right: 20px;
    }
  }
</style>

