module.exports = env => {
    if (env == 'development') return require('./game-settings-dev')
    if (env == 'production') return require('./game-settings-prod')
    return null;
}
