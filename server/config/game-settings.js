const config = require('./config')

module.exports = (type) => {
    
    if (config.ethNetwork === 'mainnet') {
        if (type === 'all') return require('./game-settings-mainnet').getAllData()
        if (type === 'front') return require('./game-settings-mainnet').getFrontData()
    }
    
    if (config.ethNetwork === 'ropsten') {
        if (type === 'all') return require('./game-settings-ropsten').getAllData()
        if (type === 'front') return require('./game-settings-ropsten').getFrontData()
    }
    
    return null;
}
