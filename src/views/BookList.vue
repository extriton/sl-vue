<template>
  <div>
    <h2>Book List</h2>
    <table class="book-list-table">
      <thead>
        <tr>
          <th>ISBN</th>
          <th>Book Title</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books" :key="book.isbn">
          <td>{{ book.isbn }}</td>
          <td>{{ book.title }}</td>
          <td>Delete</td>
        </tr>
      </tbody>
    </table>
    <ul v-if="errors && errors.length">
      <li v-for="(error, index) in errors" :key="index">
        {{error.message}}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'BookList',
  components: {},
  data () {
    return {
      books: [],
      errors: [],
    }
  },
  created () {
    axios.defaults.headers.common['Authorization'] = localStorage.getItem('jwtToken')
  },
  mounted () {
    axios.get(`http://localhost:3000/api/book`)
    .then(response => {
      this.books = response.data
    })
    .catch(e => {
      this.errors.push(e)
      if(e.response.status === 401) {
        this.$router.push({
          name: 'Login'
        })
      }
    })
  }
}
</script>

<style scoped lang="scss">
  .book-list-table {
    width: 100%;
    th, td {
      padding: 10px;
      width: 33%;
    }
    thead {
      th {
        height: 40px;
        text-align: center;
        background-color: #CCC;
      }
    }
    tbody {
      tr {
        background-color: #FFF;
        &:nth-child(odd) {
          background-color: #AAA;
        }
      }
    }
  }

</style>

