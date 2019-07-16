<template>
    <div id="player-history">
        <div class="player-history-wrapper">
            <div class="page-caption">
                <h3>{{ dict.statisctics_title }}</h3>
                <div class="paginator-wrapper">
                    <ThePaginator :max-page="maxPage" :on-change="onChangePage" />
                </div>
            </div>
            <input class="i-address" type="text" v-model="playerAddress" maxlength="42" placeholder="0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />
            <div style="text-align: center; margin-bottom: 40px;">
                <div class="m-btn btn-update" @click="updateHistory">{{ dict.statistics_update }}</div>
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
                <tbody>
                    <tr v-for="(item, index) in history" :key="index">
                        <td>{{ formatNumber(item.game_id, 7, 0) }}</td>
                        <td>{{ formatNumber(item.ticket, 7, 0) }}</td>
                        <td>
                            <div class="numbers-pad">
                                <span class="numbers" :class="{ matched: i.match}" v-for="(i, index) in item.numbers" :key="index">{{ i.num }}</span>
                            </div>
                        </td>
                        <td :class="{ blue: item.prize > 0 }">
                            <span v-show="item.game_id !== gameCurrentDetail.GameNum">{{ formatNumber(item.prize, 1, 5) }} ETH</span>
                            <span v-show="item.game_id === gameCurrentDetail.GameNum"><i style="font-size: 10px; color: yellow;">{{ dict.statisctics_no_draw }}</i></span>
                        </td>
                        <td>
                            <span v-show="item.game_id != gameCurrentDetail.GameNum && item.payout === 0" style="color: red;"><i class="glyphicon glyphicon-minus"></i></span>
                            <span v-show="item.game_id != gameCurrentDetail.GameNum && item.payout === 1" style="color: green;"><i class="glyphicon glyphicon-ok"></i></span>
                        </td>
                    </tr>
                </tbody>
            </table>
            
        </div>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
import util from '@/util/util'
import { mapGetters } from 'vuex'
import ThePaginator from '@/components/ThePaginator.vue'

export default {
    name: 'PlayerHistory',
    components: {
        ThePaginator
    },
    props: {},
    data () {
        return {
            page: 1,
            playerAddress: ''
        }
    },
    computed: {
        dict () {
            return this.$store.state.dict
        },
        history () {
            return this.playerCurrentHistory.History
        },
        maxPage () {
            return parseInt(this.playerCurrentHistory.HistoryCount / 10) + 1
        },
        ...mapGetters(['gameCurrent', 'playerCurrentHistory', 'gameCurrentDetail', 'web3'])
    },
    methods: {
        formatNumber (value, int, frac) {
            return util.formatNumber(value, int, frac)
        },
        onChangePage (page) {
            this.page = page
            this.updateHistory()
        },
        updateHistory () {
            this.$socket.emit('getPlayerHistory', { type: this.gameCurrent.type, address: this.playerAddress, page: this.page })
        }
    },
    mounted () {
        if (this.web3.coinbase) {
            this.playerAddress = this.web3.coinbase
            this.$socket.emit('getPlayerHistory', { type: this.gameCurrent.type, address: this.playerAddress, page: this.page })
        }
    },
    sockets: {
        getPlayerHistorySuccess (data) {
            this.$store.commit('getPlayerHistorySuccess', data)
        },
        refreshContractData (data) {
            if(data.type === this.gameCurrent.type && this.playerAddress)
                this.$socket.emit('getPlayerHistory', { type: this.gameCurrent.type, address: this.playerAddress, page: this.page })
        }
    }
}
</script>

<style lang="scss">
#player-history {
    min-height: 100vh;
    padding: 20px 20px 40px 20px;
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
    .i-address {
        width: 100%;
        margin: 20px 0 25px 0;
        border: 2px solid #34BBFF;
        border-radius: 7px;
        font-size: 20px;
        padding: 20px;
        text-align: center;
        background-color: transparent;
        color: #FEC453;
        .btn-update {
            color: #33B5F7;
            border: 1px solid #33B5F7;
            padding: 5px 10px;
            width: 200px;
            height: 52px;
            padding-top: 15px;
            margin: 0 auto;
        }
    }
    table {
        width: 100%;
    }
    table tr {
        width: 100%;
    }
    table thead tr {
        border-top: 2px solid black;
        border-bottom: 2px solid black;
        color: #34BBFF;
        margin-bottom: 15px;
    }
    table tbody tr {
        &:hover {
            cursor: pointer;
            background-color: rgba(0, 0 ,0 , 0.2)
        }
    }
    table thead th {
        text-align: center;
        padding-bottom: 10px;
    }
    table td, table th {
        padding: 10px;
        text-align: center;
        height: 61px;
    }
    table tr td:nth-child(1) {
        width: 120px;
        vertical-align: top;
        padding-top: 17px;
    }
    table tr td:nth-child(3) {
        width: 120px;
        text-align: right;
        vertical-align: top;
        padding-top: 17px;
    }
    table tbody tr {
        border-bottom: 1px solid black;
    }
    .numbers-pad {
        margin: 0 auto;
        .number {
            display: inline-block;
            width: 40px;
            height: 40px;
            border-radius: 40px;
            margin-right: 30px;
            background: linear-gradient(-45deg, #FEE864, #F5965E);
            padding-top: 8px;
            text-align: center;
            color: black;
            text-shadow: 2px 3px 5px rgba(224, 186, 6, 0), 3px 3px 5px black;
            &.matched {
                color: red;
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