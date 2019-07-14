<template>
    <div id="game-rules">
    <div class="game-rules-wrapper">
        <div class="page-caption"><h3><span>{{ dict.menu_rules }}</span></h3></div>
        <div class="rules-row">
            <span class="rules-dotter">
                <img src="../../public/img/icons/icon_clock.png"  alt="" title="" width="50" height="50" />
            </span>
            {{ dict.rules_play_time1 }}: <span class="blue">{{ dict.rules_play_time2 }}.</span><br />{{ dict.rules_play_time3 }}
        </div>
        <div class="rules-row">
            <span class="rules-dotter">
                <img src="../../public/img/icons/icon_cost.png"  alt="" title="" width="50" height="50" />
            </span>
            {{ dict.rules_ticket_cost }}: <span class="blue">0.01 ETH</span><br />
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
            {{ dict.rules_address }}: <a :href="contractUrl" target="_blank">{{ gameCurrent.contractAddress }}</a>
        </div>
        <div class="rules-row">
            <span class="rules-dotter">
                <img src="../../public/img/icons/icon_wallet.png"  alt="" title="" width="50" height="50" />
            </span>
            {{ dict.rules_wallets }}: <span><a href="https://www.myetherwallet.com/" target="_blank">MyEtherWallet</a>, <br /><a href="https://metamask.io/" target="_blank">MetaMask</a></span>
            {{ dict.rules_wallets1 }}<br />{{ dict.rules_wallets2 }} <br /> <i class="glyphicon glyphicon-warning-sign" style="color: #EFCC44;"></i>&nbsp;&nbsp;&nbsp;{{ dict.rules_wallets3 }}
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
                <i class="glyphicon glyphicon-minus"></i>&nbsp;&nbsp; 15% - {{ dict.rules_jackpot_inc }}<br />
                <i class="glyphicon glyphicon-minus"></i>&nbsp;&nbsp; 35% - {{ dict.rules_match }} 4 из 5<br />
                <i class="glyphicon glyphicon-minus"></i>&nbsp;&nbsp; 30% - {{ dict.rules_match }} 3 из 5<br />
                <i class="glyphicon glyphicon-minus"></i>&nbsp;&nbsp; 20% - {{ dict.rules_match }} 2 из 5
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
        ...mapGetters(['gameSettings', 'gameCurrent'])
    },
    methods: {
    },
    mounted () {
    }
}
</script>

<style lang="scss">
#game-rules {
    background-color: #1B1B1D;
    background: linear-gradient(to right, black -50%, #10191E 150%);
    min-height: 100vh;
    color: #FAFAFA;
}
.game-rules-wrapper {
    width: 800px;
    margin: 0 auto;
    min-height: 100vh;
    padding: 20px;
    text-align: left;
    .rules-row {
        width: 100%;
        min-height: 100px;
        font-size: 16px;
        color: #222;
        position: relative;
        margin-bottom: 20px;
        padding: 10px 30px 10px 80px;
        background: linear-gradient(to right, #10191E 0%, #CCC, #10191E);
        border-bottom: 1px solid grey;
        .rules-dotter {
            position: absolute;
            width: 50px;
            height: 50px;
            border-radius: 5px;
            left: 10px;
            top: 10px;
        }
        a {
            color: #9B3200;
        }
        .blue {
            color: #9B3200;
        }
        .column {
            padding-left: 10%;
            padding-top: 10px;
        }
    }
}
</style>