import Vue from 'vue'
import Vuex from 'vuex'
import Language from '../lib/language.js'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    language: '',
    dict: Language.getDictonary(),
    gameSettings: null,
  },
  getters: {
    gamesCount: state => {
      if (state.gameSettings !== null)
        return state.gameSettings.games.length
      else
        return 0
    }
  },
  mutations: {
    setLanguage (state) {
      state.language = Language.getLanguage()
      state.dict = Language.getDictonary()
    },
    loadGameSettings (state, payload) {
      state.gameSettings = payload
    }
  },
  actions: {
    loadGameSettings ({ commit }) {
      axios.get(`http://localhost:3000/api/game/settings`)
      .then(response => {
        if(response.data !== null) commit('loadGameSettings', response.data)
      })
      .catch(e => console.log(e))
    }

  }
})
