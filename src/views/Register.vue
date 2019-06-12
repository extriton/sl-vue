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
        v-model.trim="register.username"
      />
      <input id="password" type="password" placeholder="Enter Password" 
        v-model.trim="register.password"
      />
      <button type="button" @click="Register()">Register</button>
      <button type="button" @click="$router.go(-1)">Cancel</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Register',
  components: {},
  data () {
    return {
      register: {},
      errors: []
    }
  },
  methods: {
    Register () {
      axios.post(`http://localhost:3000/api/auth/register/`, this.register)
      .then(response => {
        alert(response.data.msg)
        this.$router.push({
          name: 'Login'
        })
      })
      .catch(e => {
        console.log(e)
        this.errors.push(e)
      })
    },
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

