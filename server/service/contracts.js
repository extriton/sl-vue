const config = require('../config/config')
const Game = require('../models/Game')
const Member = require('../models/Member')
const Web3 = require('web3')
const gameSettings = require('../config/game-settings.js')()
const web3 = new Web3(new Web3.providers.WebsocketProvider(gameSettings.websocketProvider))



module.exports = {
    setListeners:  setListeners
}

// Set contracts events
function setListeners(io) {

    console.log('contracts.setListeners started...')

    gameSettings.games.forEach(el => {
        console.log('Type - ' + el.type)
    })


}