import Vue from 'vue'
import Vuex from 'vuex'
import Language from '../lib/language.js'
import axios from 'axios'
import getWeb3 from '../util/getWeb3'

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
    // For current contract data
    gameCurrentDetail: null,
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
    },
    web3: state => {
      return  state.web3
    },
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
    registerWeb3Instance (state, payload) {
      // console.log('registerWeb3instance Mutation being executed', payload)
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
    loadGameSettings ({ commit }) {
      axios.get(`http://localhost:3000/api/game/settings`)
      .then(response => {
        if(response.data !== null) commit('loadGameSettings', response.data)
      })
      .catch(e => console.log(e))
    },
    registerWeb3 ({commit}) {
      getWeb3.then(result => {
        commit('registerWeb3Instance', result)
      }).catch(e => {
        console.log('Error in action registerWeb3' + e)
      })
    }
  }
})
