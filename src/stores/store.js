import Vue from 'vue'
import Vuex from 'vuex'

import Language from '@/util/language'
// import getWeb3 from '@/util/getWeb3'
import gameSettings from '@/../config/game-settings'

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
    gameSettings: gameSettings,
    gameCurrentIndex: null,
    // For current contract data
    gameCurrentDetail: {
      GameNum: 0,
      Jackpot: 0,
      Fund: 0,
      Phase: 'ready',
      Status: 0
    }, 
    // For games history
    gameCurrentHistory: {
      HistoryCount: 0,
      History: []
    },
    // For player history
    playerCurrentHistory: {
      HistoryCount: 0,
      History: [],
      UnpaidAmount: 0
    },
    // For Metamask / Mist
    web3: {
      networkId: null,
      coinbase: null,
    }
  },
  getters: {
    notification: state => {
      return state.notification
    },
    notificationCounter: state => {
      return state.notification.counter
    },
    gameSettings: state => {
      return state.gameSettings
    },
    gameCurrentIndex: state => {
      return state.gameCurrentIndex
    },
    gamesCount: state => {
      return state.gameSettings.games.length
    },
    gameCurrent: state => {
      return state.gameSettings.games[state.gameCurrentIndex]
    },
    gameCurrentDetail: state => {
      return state.gameCurrentDetail
    },
    gameCurrentHistory: state => {
      return state.gameCurrentHistory
    },
    playerCurrentHistory: state => {
      return state.playerCurrentHistory
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
    gameCurrentChange (state, payload) {
      const index = parseInt(payload)
      state.gameCurrentIndex = index
      state.gameCurrent = state.gameSettings.games[index]
    },
    initGameDetail (state) {
      state.gameCurrentDetail.GameNum = 0
      state.gameCurrentDetail.Jackpot = 0
      state.gameCurrentDetail.Fund = 0
      state.gameCurrentDetail.Phase = 'ready'
      state.gameCurrentDetail.Status = 0
    },
    getGameDataSuccess (state, payload) {
      state.gameCurrentDetail = payload
    },
    getGameHistorySuccess (state, payload) {
      state.gameCurrentHistory = payload
    },
    getPlayerHistorySuccess (state, payload) {
      state.playerCurrentHistory = payload
    },
    /*
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

      state.web3 = payload
    },
    */
    changeWeb3Coinbase (state, payload) {
      state.web3.coinbase = payload
    },
    changeWeb3NetworkId (state, payload) {
      state.web3.networkId = payload
    }
  },
  actions: {
    registerWeb3 ({commit}) {
      
      // Check Metamask installation
      if (!window.ethereum || !window.ethereum.isMetaMask) return
      
      // Retrieve Metamask chainId
      window.ethereum.send('eth_chainId').then(handleChainChanged).catch(e => console.log(e))

      // Retrieve Metamask accounts
      window.ethereum.send('eth_accounts').then(handleAccountsChanged).catch(e => console.log(e))

      // Set Metamask events handlers
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('accountsChanged', handleAccountsChanged)

      // Metamask events handlers
      function handleChainChanged (chainId) {
        if (typeof chainId === 'object') chainId = chainId.result
        commit('changeWeb3NetworkId', chainId)
      }

      function handleAccountsChanged (accounts) {
        if (!Array.isArray(accounts)) accounts = accounts.result
        if (accounts.length === 0) {
          commit('changeWeb3Coinbase', null)
        } else {
          commit('changeWeb3Coinbase', accounts[0])
        }
      }
    }
  }
})
