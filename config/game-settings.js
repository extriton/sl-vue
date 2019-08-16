const config = require('./config')
const gameSettings = require(`./game-settings-${config.ethNetwork}`)

module.exports = () => {
    
    if (gameSettings.games !== undefined && Array.isArray(gameSettings.games))
        for (let i = 0; i < gameSettings.games.length; i++)
            if (!gameSettings.games[i].isActive) {
                gameSettings.games.splice(i, 1)
                i--
            }
    
    return gameSettings
}