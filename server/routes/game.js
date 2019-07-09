const express = require('express')
const router = express.Router()
const gameSetting = require('../config/game-settings.js')()

/* GET GAME SETTINGS */
router.get('/settings', function(req, res) {
    const retJson = JSON.parse(JSON.stringify(gameSetting))

    // Loop games array
    if(retJson.games !== undefined) {
    for(let i = 0; i < retJson.games.length; i++) {
      
      // Delete inactive game
      if(!retJson.games[i].isActive) {
        retJson.games.splice(i, 1)
        i--
        continue
      }
      
      // Delete hidden property
      if(retJson.games[i].contractAbi) delete retJson.games[i].contractAbi
      if(retJson.games[i].serviceAddress) delete retJson.games[i].serviceAddress
      if(retJson.games[i].servicePrivKey) delete retJson.games[i].servicePrivKey

    }
  }
  res.json(retJson)
})

/* GET GAME SETTINGS-FULL for TEST */
/*
router.get('/settings-full', function(req, res) {
  const retJson = gameSetting
  res.json(retJson)
})
*/
module.exports = router