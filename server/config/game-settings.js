const config = require('./config')

module.exports = () => {
    return require(`./game-settings-${config.ethNetwork}`)
}