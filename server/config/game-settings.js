const config = require('./config')

module.exports = ethNetwork => {
    if (config.ethNetwork == 'mainnet') return require('./game-settings-mainnet')
    if (config.ethNetwork == 'ropsten') return require('./game-settings-ropsten')
    return null;
}
