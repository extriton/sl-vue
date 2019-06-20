import Vue from 'vue'
import Vuex from 'vuex'
import Language from '../lib/language.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    language: '',
    dict: Language.getDictonary(),
  },
  mutations: {
    setLanguage (state) {
      state.language = Language.getLanguage()
      state.dict = Language.getDictonary()
    }
  },
  actions: {

  }
})
