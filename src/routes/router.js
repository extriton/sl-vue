import Vue from 'vue'
import Router from 'vue-router'
// import BookList from '@/views/BookList.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/w5x36'
    },
    {
      path: '/:id',
      component: Games
    },
    
    /*
    {
      path: '/',
      name: 'BookList',
      component: BookList
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue')
    }
    */
  ]
})
