import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import Language from '@/util/language'
import getWeb3 from '@/util/getWeb3'
import util from '@/util/util'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // For Notification
    notification: {
      counter: 0,
      type: '',
      title: '',
      text: ''
    },
    // For TheLanguage.vue component
    language: '',
    dict: Language.getDictonary(),
    // For Game Settings
    gameSettingsLoaded: false,
    gameSettings: null,
    gamesCount: 0,
    gameCurrentIndex: null,
    gameCurrent: null,
    // For current contract data
    gameCurrentDetail: {
      GameNum: 0,
      Jackpot: 0,
      Fund: 0
    },
    gameCurrentHistory: {
      HistoryCount: 0,
      History: []
    },
    // For Metamask / Mist
    web3: {
      isInjected: false,
      web3Instance: null,
      networkId: null,
      coinbase: null,
      error: null,
    }
  },
  getters: {
    notification: state => {
      return state.notification
    },
    notificationCounter: state => {
      return state.notification.counter
    },
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
    gameCurrentHistory: state => {
      return state.gameCurrentHistory
    },
    web3: state => {
      return  state.web3
    },
  },
  mutations: {
    newNotify (state, payload) {
      state.notification.type = payload.type
      state.notification.title = payload.title
      state.notification.text = payload.text
      state.notification.counter++
    },
    setLanguage (state) {
      state.language = Language.getLanguage()
      state.dict = Language.getDictonary()
    },
    // Load Game settings
    loadGameSettings (state, payload) {
      state.gameSettings = payload.settings
      // Define gamesCount
      if (state.gameSettings !== null && Array.isArray(state.gameSettings.games)) {
        state.gamesCount = state.gameSettings.games.length
      }
      
      // Define gameCurrentIndex & gameCurrent
      if(state.gamesCount > 0) {
        let index = 0
        for (let i = 0; i < state.gamesCount; i++) {
          state.gameSettings.games[i].type = util.getGameType(state.gameSettings.games[i])
          state.gameSettings.games[i].name = util.getGameName(state.gameSettings.games[i])
          if (state.gameSettings.games[i].type === payload.routerId) {
            index = i
          }
        }
        state.gameCurrentIndex = index
        state.gameCurrent = state.gameSettings.games[index]
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
    getGameHistorySuccess (state, payload) {
      state.gameCurrentHistory = payload
    },
    registerWeb3Instance (state, payload) {
      let result = payload
      let web3Copy = state.web3
      web3Copy.coinbase = result.coinbase
      web3Copy.networkId = result.networkId
      web3Copy.isInjected = result.injectedWeb3
      web3Copy.web3Instance = result.web3

      web3Copy.web3Instance().currentProvider.on('accountsChanged', (accounts) => {
        state.web3.coinbase = accounts[0]
      })
      web3Copy.web3Instance().currentProvider.on('networkChanged', (networkId) => {
        state.web3.networkId = networkId
      })

      state.web3 = web3Copy
    }
  },
  actions: {
    loadGameSettings ({ commit }, payload) {
      axios.get(`http://localhost:3000/api/game/settings`)
      .then(response => {
        if(response.data !== null) commit('loadGameSettings', { settings: response.data, routerId: payload})
      })
      .catch(e => console.log(e))
    },
    registerWeb3 ({commit}) {
      getWeb3
      .then(result => {
        commit('registerWeb3Instance', result)
      })
      .catch(() => {
        // console.log('Error in action registerWeb3' + e)
      })
    }
  }
})
