module.exports = ethNetwork => {
    if (ethNetwork == 'mainnet') return require('./game-settings-mainnet')
    if (ethNetwork == 'ropsten') return require('./game-settings-ropsten')
    return null;
}
