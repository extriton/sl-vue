<template>
    <div class="box-cryptocurrency">
        <h3 class="box-cryptocurrency__caption">
            Cryptocurrencies
        </h3>
        <p
            v-for="(currency, name) in currencies"
            :key="'cc' + name"
            class="box-cryptocurrency__item"
            :class="[currency.icon]"
        >
            <span class="box-cryptocurrency__item-name">{{ currency.name }}</span>
            <span class="box-cryptocurrency__item-value">$ {{ currency.value }}</span>
        </p>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
import axios from 'axios'

const currenciesUrl = 'https://api.coinmarketcap.com/v1/ticker/?limit=16'

export default {
    name: 'BoxCryptocurrency',
    data () {
        return {
            currencies: {
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
            },
            intervalId: null,
            intervalTime: 5 * 60 * 1000
        }
    },
    methods: {
        async loadData () {
            const currencies = await axios.get(currenciesUrl)
            if (currencies !== null) {
                this.currencies.bitcoin.value = getRateBySymbol('BTC', currencies.data)
                this.currencies.ethereum.value = getRateBySymbol('ETH', currencies.data)
                this.currencies.litecoin.value = getRateBySymbol('LTC', currencies.data)
                this.currencies.monero.value = getRateBySymbol('XMR', currencies.data)
            } else {
                this.currencies.bitcoin.value = 'n/a'
                this.currencies.ethereum.value = 'n/a'
                this.currencies.litecoin.value = 'n/a'
                this.currencies.monero.value = 'n/a'
            }
        }
    },
    created () {
        this.loadData()
        this.intervalId = setInterval(() => {
            this.loadData()
        }, this.intervalTime)
    },
    beforeDestroy () {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
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
</script>

<style lang="scss">
.box-cryptocurrency {
    border: 1px solid #000;
    border-top: none;
    background-color: rgba(0, 0, 0, 0.2);
    font-size: 14px;
    text-align: left;
    &__caption {
        padding: 10px;
        background: linear-gradient(to left, rgba(0,0,0,.3), rgba(0,0,0,.0) 50%, rgba(0,0,0,.3)), linear-gradient(#d77d31, #fe8417, #d77d31);
        box-shadow: inset #6e5a24 0 -1px 1px, #663c12 0 0 0 1px, #000 0 10px 15px -10px;
        color: #000;
        margin-bottom: 3px;
    }
    &__item {
        padding: 7px 10px;
        font-size: 12px;
        border-bottom: 1px solid #000;
        background-repeat: no-repeat;
        background-size: 20px 20px;
        background-position: 8px 3px;
        &.bitcoin {
            background-image: url('../../public/img/icons/icon_bitcoin.png');
        }
        &.ethereum {
            background-image: url('../../public/img/icons/icon_ethereum.png');
        }
        &.litecoin {
            background-image: url('../../public/img/icons/icon_litecoin.png');
        }
        &.monero {
            background-image: url('../../public/img/icons/icon_monero.png');
        }
    }
    &__item-name {
        display: inline-block;
        width: 60%;
        margin-left: 10%;
    }
    &__item-value {
        display: inline-block;
        width: 30%;
        text-align: right;
        color: #34bbff;
    }
}
</style>
