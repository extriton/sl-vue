<template>
    <div id="game-rules">
        <div class="game-rules-wrapper">
            <div class="page-caption"><h3>{{ dict.menu_rules }}</h3></div>
            <div class="rules-row">
                <span class="rules-dotter">
                    <img src="../../public/img/icons/icon_clock.png"  alt="" title="" width="50" height="50" />
                </span>
                {{ dict.rules_play_time1 }}: <span class="blue">{{ drawTime }}.</span><br />
                {{ dict.rules_play_time3 }}
            </div>
            <div class="rules-row">
                <span class="rules-dotter">
                    <img src="../../public/img/icons/icon_cost.png"  alt="" title="" width="50" height="50" />
                </span>
                {{ dict.rules_ticket_cost }}: <span class="blue">{{ gameCurrent.ticketPrice }} ETH</span><br />
                {{ dict.rules_ticket_cost1 }}<br />
                <i class="glyphicon glyphicon-warning-sign blue"></i>&nbsp;&nbsp;&nbsp;
                {{ dict.rules_ticket_cost2 }} <span class="blue">0 ETH</span><br />
                {{ dict.rules_ticket_cost3 }} <span class="blue">200 000 - 700 000</span><br />
                {{ dict.rules_ticket_cost4 }}
            </div>
            <div class="rules-row">
                <span class="rules-dotter">
                    <img src="../../public/img/icons/icon_address.png"  alt="" title="" width="50" height="50" />
                </span>
                {{ dict.rules_address }}: <a :href="contractUrl" target="_blank" rel="noreferrer">{{ gameCurrent.contractAddress }}</a>
            </div>
            <div class="rules-row">
                <span class="rules-dotter">
                    <img src="../../public/img/icons/icon_wallet.png"  alt="" title="" width="50" height="50" />
                </span>
                {{ dict.rules_wallets }}: <span><a href="https://www.myetherwallet.com/" target="_blank" rel="noreferrer">MyEtherWallet</a>, <a href="https://metamask.io/" target="_blank" rel="noreferrer">MetaMask</a></span>
                {{ dict.rules_wallets1 }}<br />{{ dict.rules_wallets2 }} <br /> <i class="glyphicon glyphicon-warning-sign blue"></i>&nbsp;&nbsp;&nbsp;{{ dict.rules_wallets3 }}
            </div>
            <div class="rules-row">
                <span class="rules-dotter">
                    <img src="../../public/img/icons/icon_gas.png"  alt="" title="" width="50" height="50" />
                </span>
                {{ dict.rules_gas_limit }}: <span class="blue">350 000</span><br />
                {{ dict.rules_gas_price }}: <span class="blue">1 Gwei</span>
            </div>
            <div class="rules-row">
                <span class="rules-dotter">
                    <img src="../../public/img/icons/icon_fund1.png"  alt="" title="" width="50" height="50" />
                </span>
                {{ dict.rules_distr_funds }}: 
                <div class="column blue">
                    <i class="glyphicon glyphicon-minus"></i>&nbsp;&nbsp; 85% - {{ dict.rules_prize_fund }}<br />
                    <i class="glyphicon glyphicon-minus"></i>&nbsp;&nbsp; 15% - {{ dict.rules_service }}
                </div>
            </div>
            <div class="rules-row">
                <span class="rules-dotter">
                    <img src="../../public/img/icons/icon_fund2.png"  alt="" title="" width="50" height="50" />
                </span>
                {{ dict.rules_prize_pool_distr }}: 
                <div class="column blue">
                    <span v-for="(item, index) in distribFunds" :key="index">
                        <i class="glyphicon glyphicon-minus"></i>&nbsp;&nbsp; {{ item }}<br />
                    </span>
                </div>
                <div style="min-height: 20px;"></div>
                <i class="glyphicon glyphicon-minus"></i> {{ dict.rules_prize_txt1 }}<br />
                <i class="glyphicon glyphicon-minus"></i> {{ dict.rules_prize_txt2 }}
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
import { mapGetters } from 'vuex'

export default {
    name: 'GameRules',
    props: {},
    data () {
        return {
        }
    },
    computed: {
        dict () {
            return this.$store.state.dict
        },
        contractUrl () {
            return this.gameSettings.etherscanAddressUrl + this.gameCurrent.contractAddress + '#contracts'
        },
        drawTime () {
            const dows = { '1': 'monday', '2': 'tuesday', '3': 'wednesday', '4': 'thursday', '5': 'friday', '6': 'saturday', '0': 'sunday' }
            let res = ''
            if (this.gameCurrent.drawDow >= 0 && this.gameCurrent.drawDow <= 6) 
                res = this.dict[dows[this.gameCurrent.drawDow]] + ' '
            else
                res = this.dict.everyday + ' '
            
            res += this.dict.from + ' '
            res += (this.gameCurrent.drawHour - 1) + '-00 '
            res += this.dict.to + ' '
            res += (this.gameCurrent.drawHour + 2) + '-00 GMT'

            return res
        },
        distribFunds () {
            const res = []
            for (let key in this.gameCurrent.distribFund) {
                let str = ''
                if (+key === this.gameCurrent.reqNumbers)
                    str += this.gameCurrent.distribFund[key] + '% - ' + this.dict.rules_jackpot_inc
                else
                    str += this.gameCurrent.distribFund[key] + '% - ' + this.dict.rules_match + ' ' + key + ' ' + this.dict.of + ' ' + this.gameCurrent.reqNumbers
                res.push(str)
            }
            res.reverse()
            return res
        },
        ...mapGetters(['gameSettings', 'gameCurrent'])
    }
}
</script>

<style lang="scss">
#game-rules {
    min-height: 100vh;
    padding: 20px 20px 60px 20px;
    /* background: linear-gradient(to right, black -50%, rgb(50, 73, 85) 150%); */
    background: linear-gradient(to right, black -50%, rgb(23, 60, 78) 150%);
    text-align: left;
}
.game-rules-wrapper {
    width: 800px;
    margin: 0 auto;
    .rules-row {
        width: 100%;
        min-height: 100px;
        font-size: 16px;
        color: #ACACAC;
        position: relative;
        margin-bottom: 10px;
        padding: 10px 30px 10px 80px;
        /* background: linear-gradient(to right, rgb(23, 32, 37) 0%, rgb(72, 93, 107), #10191E); */
        background: rgba(0, 0, 0, 0.4);
        border-bottom: 1px solid #10191E;
        .rules-dotter {
            position: absolute;
            width: 50px;
            height: 50px;
            border-radius: 5px;
            left: 10px;
            top: 10px;
        }
        a, .blue {
            color: #CC6610;
        }
        .column {
            padding-left: 10%;
            padding-top: 10px;
        }
    }
}
</style>