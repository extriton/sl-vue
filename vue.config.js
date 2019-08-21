const webpack = require('webpack')
module.exports = {
    configureWebpack: {
        plugins: [
            new webpack.IgnorePlugin(/config\/abi\//),
            new webpack.IgnorePlugin(/config\/server\//),
            /*
            new webpack.IgnorePlugin(/config-server.js$/),
            new webpack.IgnorePlugin(/config-server-mainnet.js$/),
            new webpack.IgnorePlugin(/config-server-ropsten.js$/),
            */
            new webpack.IgnorePlugin(/server\//),
            new webpack.IgnorePlugin(/tests\//),
            new webpack.IgnorePlugin(/contracts\//),
            
            /*
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/config-server.js$/,
                contextRegExp: /config$/
            }),
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/config-server-mainnet.js$/,
                contextRegExp: /config$/
            }),
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/config-server-ropsten.js$/,
                contextRegExp: /config$/
            })
            */
        ]
        /*
        module: {
            rules: [
              {
                test: /\.js$/,
                exclude: /config/
              }
            ]
        }
        */
    }
  }