<template>
    <div class="free-page">
        <h3 class="page-caption">
            {{ dict.menu_free_eth }}
        </h3>
        <div class="top-banner">
            <iframe data-aa="1322011" src="//ad.a-ads.com/1322011?size=728x90" scrolling="no" style="width:728px; height:90px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>
        </div>
        <div class="top-banner-small">
            <iframe data-aa="1322011" src="//ad.a-ads.com/1322011?size=234x60" scrolling="no" style="width:234px; height:60px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>
        </div>
        <!-- Luccky numbers table -->
        <table class="lucky-numbers-table">
            <thead>
                <tr>
                    <th>LUCKY RANGE</th>
                    <th>PRIZE</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(item, index) in prizes"
                    :key="'p' + index"
                >
                    <td class="lucky-numbers-table__range">{{ item.range }}</td>
                    <td class="lucky-numbers-table__prize">{{ item.prize | eth }} ETH</td>
                </tr>
            </tbody>
        </table>
        <div v-if="!web3.coinbase" class="roll-body__button m-btn disabled">
            <p>Roll</p>
        </div>
        <div class="install-metamask-warning" v-if="!web3.coinbase">
            {{ dict.free_install_metamask }} 
            <a href="https://metamask.io/" target="_blank" rel="noreferrer">{{ dict.free_install_metamask1 }}</a><br />
            {{ dict.free_install_metamask2 }}
        </div>
        <div class="roll-body" v-if="web3.coinbase">
            <div
                class="roll-body__dices"
                v-show="showDices"
            >
                <FreeDiceResult
                    :game-value="resultNumber"
                    :game-counter="gameCounter"
                    :result-type="+0"
                />
            </div>
            <div
                class="roll-body__prize"
                v-show="showPrize"
            >
                {{ dict.free_you_win }} {{ resultPrize | eth }}
            </div>
            <div v-show="timeLeft <= 0 && !pressedRollButton">
                <vue-recaptcha
                    ref="recaptcha"
                    size="invisible"
                    :sitekey="reCaptchaSiteKey"
                    @verify="roll"
                    @expired="onCaptchaExpired"
                />
                <div class="roll-body__button m-btn" @click="doRoll()">
                    <p>Roll</p>
                </div>
            </div>
            <div class="roll-body__timer" v-show="timeLeft > 0">
                <span class="roll-body__timer-cell">{{ timeLeft | minutes }}</span>
                <span class="roll-body__timer-cell">{{ timeLeft | seconds }}</span>
                <br />
                <span class="roll-body__timer-cell-desc">Minutes</span>
                <span class="roll-body__timer-cell-desc">Seconds</span>
            </div>
        </div>
        <div class="bottom-banner">
            <iframe data-aa="1322054" src="//ad.a-ads.com/1322054?size=728x90" scrolling="no" style="width:728px; height:90px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>
        </div>
        <div class="bottom-banner-small">
            <iframe data-aa="1322054" src="//ad.a-ads.com/1322054?size=234x60" scrolling="no" style="width:234px; height:60px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>
        </div>
        <!--
        <div class="banners-list-left">
            <div class="banners-list-left__item">
                <iframe data-aa="1322061" src="//ad.a-ads.com/1322061?size=180x150" scrolling="no" style="width:180px; height:150px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>
            </div>
            <div class="banners-list-left__item">
                <iframe data-aa="1322066" src="//ad.a-ads.com/1322066?size=180x150" scrolling="no" style="width:180px; height:150px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>
            </div>
            <div class="banners-list-left__item">
                <iframe data-aa="1322075" src="//ad.a-ads.com/1322075?size=180x150" scrolling="no" style="width:180px; height:150px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>
            </div>
            <div class="banners-list-left__item">
                <iframe data-aa="1322078" src="//ad.a-ads.com/1322078?size=180x150" scrolling="no" style="width:180px; height:150px; border:0px; padding:0; overflow:hidden" allowtransparency="true"></iframe>
            </div>
        </div>
        -->
    </div>
</template>

<script>
import web3 from 'web3'
import VueRecaptcha from 'vue-recaptcha'
import FreeDiceResult from '@/components/FreeDiceResult.vue'

import config from '../../config/config'
import { mapGetters, mapMutations } from 'vuex'

export default {
    name: 'FreeETHPage',
    components: {
        VueRecaptcha,
        FreeDiceResult
    },
    data () {
        return {
            updateInterval: 5 * 60 * 1000,
            updateIntervalId: null,
            timeLeft: 0,
            timerIntervalId: null,
            pressedRollButton: false,
            prizes: [],
            showDices: false,
            showPrize: false,
            resultNumber: 0,
            resultPrize: 0,
            gameCounter: 0,
            reCaptchaSiteKey: config.reCaptchaSiteKey
        }
    },
    computed: {
        dict () {
            return this.$store.state.dict
        },
        showRollButton () {
            return this.timeLeft <= 0 ? true : false
        },
        ...mapGetters(['user', 'web3'])
    },
    methods: {
        getFreeETHData (userAddress) {
            this.$socket.emit('getFreeETHData', { address: userAddress })
        },
        runTimer () {
            if (this.timerIntervalId !== null) {
                clearInterval(this.timerIntervalId)
                this.timerIntervalId = null
            }
            this.timerIntervalId = setInterval(() => {
                this.timeLeft -= 1000
                if (this.timeLeft <= 0) {
                    clearInterval(this.timerIntervalId)
                    this.timerIntervalId = null
                    this.timeLeft = 0
                    location.reload()
                }
            }, 1000)
        },
        doRoll () {
            this.$refs.recaptcha.execute()
        },
        roll (recaptchaToken) {
            this.$socket.emit('rollFreeETH', { address: this.web3.coinbase, recaptchaToken: recaptchaToken })
            this.pressedRollButton = true
        },
        onCaptchaExpired () {
            this.$refs.recaptcha.reset()
        },
        ...mapMutations(['newNotify'])
    },
    watch: {
        'web3.coinbase': function (value) {
            if (value !== null) this.getFreeETHData(this.web3.coinbase)
        }
    },
    sockets: {
        getFreeETHDataSuccess (data) {
            this.prizes = data.prizes
            this.timeLeft = data.timeLeft
            // this.timeLeft = 5 * 1000
            if (this.timeLeft > 0) this.runTimer()
        },
        rollFreeETHSuccess (data) {
            this.resultNumber = data.resultNumber
            this.resultPrize = data.resultPrize
            this.showDices = true
            this.gameCounter++
            setTimeout(() => {
                this.showPrize = true
            }, 1500)
            setTimeout(() => {
                this.getFreeETHData(this.web3.coinbase)
            }, 3000)
        },
        rollFreeETHError (data) {
            this.newNotify({ type: 'error', title: '<b>:: Save ::</b>', text: data.error })
        }
    },
    filters: {
        minutes (value) {
            if (!value) return '00'
            
            let result = '' + (new Date(value)).getMinutes()
            if (result.length === 1) result = '0' + result
            return result
        },
        seconds (value) {
            if (!value) return '00'
            
            let result = '' + (new Date(value)).getSeconds()
            if (result.length === 1) result = '0' + result
            return result
        },
        eth (value) {
            if (!value) return 0
            return parseFloat(web3.utils.fromWei('' + value, 'gwei')).toFixed(9)
        }
    },
    created () {
        this.getFreeETHData(this.web3.coinbase)
        this.updateIntervalId = setInterval(() => { this.getFreeETHData(this.web3.coinbase) }, this.updateInterval)
    },
    beforeCreate () {
        if (this.updateIntervalId !== null) {
            clearInterval(this.updateIntervalId)
            this.updateIntervalId = null
        }
        if (this.timerIntervalId !== null) {
            clearInterval(this.timerIntervalId)
            this.timerIntervalId = null
        }
    }
}
</script>

<style lang="scss">
.free-page {
    user-select: text;
    -moz-user-select: text;
    -webkit-user-select: text;
    -ms-user-select: text;
    background: linear-gradient(to right, black -50%, rgb(17, 46, 61) 150%);
    max-width: 800px;
    margin: 0 auto;
    min-height: calc(100vh - 90px - 58px - 5px);
    position: relative;
    padding: 0 0 20px 0;
    .page-caption {
        padding: 10px;
        background: linear-gradient(to left, rgba(0,0,0,.3), rgba(0,0,0,.0) 50%, rgba(0,0,0,.3)), linear-gradient(#d77d31, #fe8417, #d77d31);
        box-shadow: inset #6e5a24 0 -1px 1px, #663c12 0 0 0 1px, #000 0 10px 15px -10px;
        color: #000;
        margin-bottom: 3px;
    }
    .lucky-numbers-table {
        width: 400px;
        margin: 20px auto 30px auto;
        @media all and (max-width: 760px) {
            margin: 15px auto;
            width: 100%;
            max-width: 400px;
        }
        th, td {
            width: 50%;
            padding: 10px;
            border: 1px solid #000;
            font-size: 14px;
            @media all and (max-width: 760px) {
                padding: 3px;
                font-size: 10px;
            }
        }
        th {
            background: linear-gradient(to left, rgba(0,0,0,.3), rgba(0,0,0,.0) 50%, rgba(0,0,0,.3)), linear-gradient(#d77d31, #fe8417, #d77d31);
            color: #000;
            font-size: 16px;
            @media all and (max-width: 760px) {
                font-size: 12px;
            }
        }
        &__range {
            color: #ccc;
        }
        &__prize {
            color: #34bbff;
        }
    }
    .install-metamask-warning {
        width: 90%;
        color: #EECA57;
        padding: 10px;
        border: 1px solid #EECA57;
        margin: 20px auto 0 auto;
        @media all and (max-width: 760px) {
            font-size: 12px;
        }
    }
    .roll-body {
        margin-top: 50px;
        @media all and (max-width: 760px) {
            margin-top: 30px;
        }
        &__timer {
            width: 180px;
            margin: 0 auto;
            padding: 15px;
            border: 1px solid #34bbff;
            background: rgba(0, 0, 0, .5);
            @media all and (max-width: 760px) {
                padding: 10px;
            }
        }
        &__timer-cell {
            display: inline-block;
            width: 50%;
            font-size: 24px;
            color: #EECA57;
            font-weight: bold;
            @media all and (max-width: 760px) {
                font-size: 16px;
            }
        }
        &__timer-cell-desc {
            display: inline-block;
            width: 50%;
            font-size: 12px;
            color: #34bbff;
            @media all and (max-width: 760px) {
                font-size: 10px;
            }
        }
        &__button {
            display: block;
            margin: 20px auto 0 auto;
            width: 180px;
            height: 80px;
            font-size: 24px;
            line-height: 77px;
            text-align: center;
            color: #33B5F7;
            @media all and (max-width: 760px) {
                width: 180px;
                height: 58px;
                line-height: 58px;
            }
        }
        &__dices {
            width: 288px;
            margin: 0 auto;
        }
        &__prize {
            width: 288px;
            margin: 20px auto;
            padding: 15px;
            color: #EECA57;
            border: 1px solid #EECA57;
        }
    }
    .top-banner {
        margin: 0 auto;
        @media all and (max-width: 760px) {
            display: none;
        }
    }
    .top-banner-small {
        margin: 0 auto;
        display: none;
        @media all and (max-width: 760px) {
            display: block;
        }
    }
    .bottom-banner {
        margin: 40px auto 0 auto;
        @media all and (max-width: 760px) {
            display: none;
        }
    }
    .bottom-banner-small {
        margin: 40px auto 0 auto;
        display: none;
        @media all and (max-width: 760px) {
            display: block;
        }
    }
    .banners-list-left {
        position: fixed;
        top: 100px;
        left: 10px;
        width: 180px;
        height: calc(100vh - 100px - 58px);
        @media all and (max-width: 1200px) {
            position: static;
            width: 100%;
            height: auto;
        }
        &__item {
            display: inline-block;
        }
    }
}
/* Buttons styles */
.m-btn {
  border: 0 solid;
  box-shadow: inset 0 0 20px rgba(51, 181, 247, 0);
  outline: 1px solid;
  outline-color: rgba(51, 181, 247, 0);
  outline-offset: 0px;
  text-shadow: none;
  -webkit-transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
          transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
  outline-color: rgba(51, 181, 247, 0.5);
  outline-offset: 0px;
}
.m-btn:hover {
  box-shadow: inset 0 0 20px rgba(51, 181, 247, 0.5), 0 0 20px rgba(51, 181, 247, 0.2);
  outline-offset: 15px;
  outline-color: rgba(51, 181, 247, 0);
  text-shadow: 1px 1px 2px #427388;
  cursor: pointer;
}
.m-btn.disabled {
  border: 0 solid;
  box-shadow: inset 0 0 20px rgba(51, 51, 51, 0);
  outline: 1px solid;
  outline-color: rgba(91, 91, 91, 0);
  outline-offset: 0px;
  text-shadow: none;
  -webkit-transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
          transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
  outline-color: rgba(91, 91, 91, 0.5);
  outline-offset: 0px;
  color: #333333;
}
.m-btn.disabled:hover {
  cursor: not-allowed;
}
</style>
