import Vue from 'vue'
import Vuex from 'vuex'
import Language from '../lib/language.js'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // For TheLanguage.vue component
    language: '',
    dict: Language.getDictonary(),
    // For Game Settings
    gameSettingsLoaded: false,
    gameSettings: null,
    gamesCount: 0,
    gameCurrentIndex: null,
    gameCurrent: null,
    // For contracts data
    gameCurrentDetail: null
  },
  getters: {
    gameSettingsLoaded: state => {
      return state.gameSettingsLoaded
    },
    gameSettings: state => {
      return state.gameSettings
    },
    gamesCount: state => {
      return state.gamesCount
    },
    gameCurrentIndex: state => {
      return state.gameCurrentIndex
    },
    gameCurrent: state => {
      return state.gameCurrent
    },
    gameCurrentDetail: state => {
      return state.gameCurrentDetail
    },
    slideDirection: state => {
      return  state.slideDirection
    }
  },
  mutations: {
    setLanguage (state) {
      state.language = Language.getLanguage()
      state.dict = Language.getDictonary()
    },
    // Load Game settings
    loadGameSettings (state, payload) {
      state.gameSettings = payload
      // Define gamesCount
      if (state.gameSettings !== null && Array.isArray(state.gameSettings.games)) {
        state.gamesCount = state.gameSettings.games.length
      }
      // Define gameCurrentIndex & gameCurrent
      if(state.gamesCount > 0) {
        state.gameCurrentIndex = 0
        state.gameCurrent = state.gameSettings.games[0]
      }
      state.gameSettingsLoaded = true
    },
    gameCurrentChange (state, payload) {
      const index = parseInt(payload)
      state.gameCurrentIndex = index
      state.gameCurrent = state.gameSettings.games[index]
    },
    getGameDataSuccess (state, payload) {
      state.gameCurrentDetail = payload
    },
  },
  actions: {
    loadGameSettings ({ commit }) {
      axios.get(`http://localhost:3000/api/game/settings`)
      .then(response => {
        if(response.data !== null) commit('loadGameSettings', response.data)
      })
      .catch(e => console.log(e))
    },
  }
})
