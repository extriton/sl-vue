const express = require('express')
const router = express.Router()
const gameSetting = require('../config/game-settings.js')('development')



/* GET GAME SETTINGS */
router.get('/settings', function(req, res) {
  const retJson = JSON.parse(JSON.stringify(gameSetting))
  // Delete hidden property
  for(let i = 0; i < retJson.games.length; i++) {
    if(retJson.games[i].contractAbi) delete retJson.games[i].contractAbi
    if(retJson.games[i].serviceAddress) delete retJson.games[i].serviceAddress
    if(retJson.games[i].servicePrivKey) delete retJson.games[i].servicePrivKey
  }
  res.json(retJson)
})

/* GET GAME SETTINGS */
router.get('/settings-full', function(req, res) {
  const retJson = gameSetting
  res.json(retJson)
})

module.exports = router