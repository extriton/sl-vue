const express = require('express')
const router = express.Router()
const gameSetting = require('../config/game-settings.js')('front')

/* GET GAME SETTINGS (for frontend) */
router.get('/settings', function(req, res) {
  res.json(gameSetting)
})

module.exports = router