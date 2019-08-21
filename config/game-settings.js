const config = require('./config')
const gameSettings = require(`./game-settings-${config.ethNetwork}`)

module.exports = () => {
    
    const retSettings = JSON.parse(JSON.stringify(gameSettings))

    if (retSettings.games !== undefined && Array.isArray(retSettings.games))
        for (let i = 0; i < retSettings.games.length; i++)
            if (!retSettings.games[i].isActive) {
                retSettings.games.splice(i, 1)
                i--
            } else {
                addGameType(retSettings.games[i])
                addGameName(retSettings.games[i])
            }

    return retSettings
}

function addGameType (game) {
    let freq = (game.drawDow >= 0 && game.drawDow <= 6) ? 'w' : 'd'
    game.type = freq + game.reqNumbers + 'x' + game.padSize
}

function addGameName (game) {
    let freq = (game.drawDow >= 0 && game.drawDow <= 6) ? 'Weekly ' : 'Daily '
    game.name = freq + game.reqNumbers + '/' + game.padSize
}