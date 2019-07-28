<template>
    <div id="player-history">
        <div class="player-history-wrapper">
            <div class="page-caption">
                <h3>{{ dict.statisctics_title }}</h3>
                <div class="paginator-wrapper">
                    <ThePaginator :max-page="maxPage" :on-change="onChangePage" />
                </div>
            </div>
            <div class="player-address-wrapper">
                <input class="player-address" type="text" v-model="playerAddress" maxlength="42" placeholder="0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />
                <div class="m-btn btn-update" @click="doUpdateHistory">
                    <i class="glyphicon glyphicon-refresh"></i>
                </div>
            </div>
            <div v-show="isShowUnpaidAmount" class="unpaid-amount-wrapper">
                <div class="unpaid-amount">{{ unpaidAmount }} ETH</div>
                <div class="m-btn btn-payout" @click="doPayout">
                    {{ dict.pick_up }}
                </div>
            </div>
            <!-- Data table -->
            <table>
                <thead>
                    <tr>
                        <th>{{ dict.statisctics_col1 }}</th>
                        <th>{{ dict.statisctics_col2 }}</th>
                        <th>{{ dict.statisctics_col3 }}</th>
                        <th>{{ dict.statisctics_col4 }}</th>
                        <th></th>
                    </tr>
                </thead>
                <transition name="fade" mode="out-in">
                <tbody :key="(page, changeHistory)">
                    <tr v-for="(item, index) in history" :key="index">
                        <td>{{ formatNumber(item.game_id, 7, 0) }}</td>
                        <td>{{ formatNumber(item.id, 7, 0) }}</td>
                        <td>
                            <div class="numbers-pad">
                                <span class="numbers" :class="{ matched: i.match}" v-for="(i, index) in item.numbers" :key="index">{{ i.num }}</span>
                            </div>
                        </td>
                        <td :class="{ blue: item.prize > 0 }">
                            <span v-show="item.game_id !== gameCurrentDetail.GameNum && item.prize !== 0">
                                {{ formatNumber(item.prize, 1, 5) }} ETH
                            </span>
                            <span v-show="item.game_id !== gameCurrentDetail.GameNum && item.prize === 0">
                                <i style="font-size: 10px; color: #33B5F7;">{{ dict.history_no_win }}</i>
                            </span>
                            <span v-show="item.game_id === gameCurrentDetail.GameNum">
                                <i style="font-size: 10px; color: #FBCF62;">{{ dict.statisctics_no_draw }}</i>
                            </span>
                        </td>
                        <td>
                            <span v-show="item.game_id != gameCurrentDetail.GameNum && item.prize !== 0 && item.payout === 0" style="color: red;">
                                <i class="glyphicon glyphicon-minus"></i>
                            </span>
                            <span v-show="item.game_id != gameCurrentDetail.GameNum && item.prize !== 0 && item.payout === 1" style="color: green;">
                                <i class="glyphicon glyphicon-ok"></i>
                            </span>
                        </td>
                    </tr>
                </tbody>
                </transition>
            </table>
            
        </div>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
import util from '@/util/util'
import { mapGetters, mapMutations } from 'vuex'
import ThePaginator from '@/components/ThePaginator.vue'
import axios from 'axios'

export default {
    name: 'PlayerHistory',
    components: {
        ThePaginator
    },
    props: {},
    data () {
        return {
            page: 1,
            playerAddress: '',
            changeHistory: false
        }
    },
    computed: {
        dict () {
            return this.$store.state.dict
        },
        history () {
            return this.playerCurrentHistory.History
        },
        unpaidAmount () {
            return this.playerCurrentHistory.UnpaidAmount.toFixed(5)
        },
        maxPage () {
            if (this.playerCurrentHistory.HistoryCount % 10 > 0 || this.playerCurrentHistory.HistoryCount == 0)
                return parseInt(this.playerCurrentHistory.HistoryCount / 10) + 1
            else
                return parseInt(this.playerCurrentHistory.HistoryCount / 10)
        },
        isShowUnpaidAmount () {
            return (this.playerCurrentHistory.UnpaidAmount > 0 && this.web3.isInjected) ? true : false
        },
        ...mapGetters(['gameSettings', 'gameCurrent', 'playerCurrentHistory', 'gameCurrentDetail', 'web3'])
    },
    methods: {
        formatNumber (value, int, frac) {
            return util.formatNumber(value, int, frac)
        },
        updateHistory () {
            this.$socket.emit('getPlayerHistory', { type: this.gameCurrent.type, address: this.playerAddress, page: this.page })
        },
        onChangePage (page) {
            this.page = page
            this.updateHistory()
        },
        doUpdateHistory () {
            this.page = 1
            this.updateHistory()
        },
        doPayout () {
            // Check unpaid amount
            if (this.playerCurrentHistory.UnpaidAmount <= 0) {
                this.newNotify({ type: 'error', title: '<b>:: Player history ::</b>', text: `You have no unpaid winnings` })
                return
            }

            // Check Metamask install
            if (!this.web3.isInjected) {
                this.newNotify({ type: 'error', title: '<b>:: Player history ::</b>', text: `Metamask not installed! <br /> Install <a href="https://metamask.io/" target="_blank">https://metamask.io/</a>` })
                return
            }
            
            // Check Metamask lock
            this.web3.web3Instance().eth.getAccounts()
            .then((result) => {

                if (!Array.isArray(result) || result.length <= 0) {
                    this.newNotify({ type: 'error', title: '<b>:: Player history ::</b>', text: `Metamask is locked!` })
                    return
                }
                
                // Check Metamask network
                if (this.gameSettings.metamaskNetId != this.web3.networkId) {
                    const netId = '' + this.gameSettings.metamaskNetId
                    this.newNotify({ type: 'error', title: '<b>:: Player history ::</b>', text: `Choose ${ethNetworks[netId]} network in Metamask!` })
                    return
                }
                
                // Create transaction for confirmation
                this.createTransaction()

            })
            .catch((error) => {
                this.newNotify({ type: 'error', title: '<b>:: Player history ::</b>', text: error })
                return
            })
        },
        async createTransaction () {
            let gasPriceFast = '6'
            const gasPrice = await axios.get(`https://ethgasstation.info/json/ethgasAPI.json`)
            if (gasPrice !== null) gasPriceFast = '' + (gasPrice.data.fast / 10)

            const transactionObj = {
                from: this.web3.coinbase,
                to: this.gameCurrent.contractAddress,
                value: '0',
                gas: 1500000,
                gasPrice: window.web3.toWei(gasPriceFast, 'gwei'),
                data: this.dataString
            }

            const callback = (error, result) => {
                if (error)
                    this.newNotify({ type: 'error', title: '<b>:: Player history ::</b>', text: error })
                else
                    this.newNotify({ type: 'success', title: '<b>:: Player history ::</b>', text: `Transaction successfully sent!`  })
            }

            this.web3.web3Instance().eth.sendTransaction(transactionObj, callback)

        },
        ...mapMutations(['newNotify'])
    },
    mounted () {
            this.playerAddress = this.web3.coinbase
            this.updateHistory()
    },
    sockets: {
        getPlayerHistorySuccess (data) {
            this.$store.commit('getPlayerHistorySuccess', data)
            this.changeHistory = !this.changeHistory
        },
        refreshContractData (data) {
            if(data.type === this.gameCurrent.type && this.playerAddress)
                this.updateHistory()
        }
    },
    watch: {
        'web3.coinbase': function (value) {
            this.page = 1
            this.playerAddress = value
            this.updateHistory()
        }
    }
}
</script>

<style lang="scss">
#player-history {
    min-height: 100vh;
    padding: 20px 20px 60px 20px;
    background: linear-gradient(to right, black -50%, rgb(17, 46, 61) 150%);
    text-align: left;
}
.player-history-wrapper {
    width: 800px;
    margin: 0 auto;
    color: #CC6610;
    font-size: 20px;
    .paginator-wrapper {
        position: absolute;
        width: 220px;
        right: 0;
        top: 10px;
    }
    .player-address-wrapper {
        width: 100%;
        position: relative;
        margin: 15px 0;
        font-size: 26px;
        min-height: 80px;
        .player-address {
            width: calc(100% - 100px);
            position: absolute;
            left: 0;
            padding: 15px;
            text-align: center;
            background-color: transparent;
            color: #FEC453;
            border: 2px solid #34BBFF;
            border-radius: 7px;
        }
        .btn-update {
            width: 80px;
            position: absolute;
            right: 0;
            padding: 15px;
            text-align: center;
            color: #33B5F7;
            border: 2px solid #33B5F7;
        }
    }
    .unpaid-amount-wrapper {
        position: relative;
        margin: 25px 0 5px 0;
        min-height: 47px;
        font-size: 18px;
        .unpaid-amount {
            position: absolute;
            right: 149px;
            width: 200px;
            text-align: center;
            padding: 10px;
            color: #CC6514;
            border: 1px solid #33B5F7;
        }
        .btn-payout {
            position: absolute;
            right: 0;
            width: 150px;
            text-align: center;
            padding: 10px;
            color: #33B5F7;
            border: 1px solid #33B5F7;
        }
    }
    table {
        width: 100%;
        th, td {
            padding: 10px;
            text-align: center;
            height: 56px;
            &:nth-child(1),
            &:nth-child(2) {
                width: 100px;
            }
            &:nth-child(4) {
                width: 140px;
                text-align: right;
                font-size: 15px;
            }
            &:nth-child(5) {
                width: 45px;
                text-align: right;
                font-size: 15px;
            }
        }
        thead {
            tr {
                width: 100%;
                border-top: 2px solid black;
                border-bottom: 2px solid black;
                color: #34BBFF;
                margin-bottom: 15px;
                th {
                    text-align: center;
                    padding-bottom: 10px;
                }
            }
        }
        tbody { 
            tr {
                border-bottom: 1px solid black;
                &:hover {
                    cursor: pointer;
                    background-color: rgba(0, 0 ,0 , 0.2)
                }
            }
        }
    }
    .numbers-pad {
        .numbers {
            display: inline-block;
            width: 35px;
            height: 35px;
            border-radius: 35px;
            margin-right: 25px;
            background: white;
            padding-top: 6px;
            text-align: center;
            color: black;
            text-shadow: 2px 3px 5px rgba(224, 186, 6, 0), 3px 3px 5px black;
            &.matched {
                background: linear-gradient(-45deg, #FEE864, #F5965E);
            }
         }
    }
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 1s
}
.fade-enter, .fade-leave-active {
    opacity: 0
}
</style>