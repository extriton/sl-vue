const axios = require('axios')

const rates = {
    bitcoin: {
        icon: 'bitcoin',
        name: 'Bitcoin',
        value: 'n/a'
    },
    ethereum: {
        icon: 'ethereum',
        name: 'Ethereum',
        value: 'n/a'
    },
    litecoin: {
        icon: 'litecoin',
        name: 'Litecoin',
        value: 'n/a'
    },
    monero: {
        icon: 'monero',
        name: 'Monero',
        value: 'n/a'
    },
}

function run () {
    const intervalTime = 30 * 60 * 1000
    update()
    setInterval(() => { update() }, intervalTime)
}

async function update () {
    const currenciesUrl = 'https://api.coinmarketcap.com/v1/ticker/?limit=16'
    const currencies = await axios.get(currenciesUrl)
    if (currencies !== null) {
        rates.bitcoin.value = getRateBySymbol('BTC', currencies.data)
        rates.ethereum.value = getRateBySymbol('ETH', currencies.data)
        rates.litecoin.value = getRateBySymbol('LTC', currencies.data)
        rates.monero.value = getRateBySymbol('XMR', currencies.data)
    }
}

function getRateBySymbol(symbol, rates) {
    let rate = 0
    for (let i = 0; i < rates.length; i++) {
        if (rates[i].symbol == symbol) {
            rate = rates[i].price_usd
            break
        }
    }
    return parseInt(rate * 100) / 100
}

module.exports = {
    rates: rates,
    run: run
}