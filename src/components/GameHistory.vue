<template>
    <div id="game-history">
        <div class="game-history-wrapper">
            <div class="page-caption">
                <h3>{{ dict.history_title }}</h3>
                <div class="paginator-wrapper">
                    <ThePaginator :max-page="maxPage" :on-change="onChangePage" />
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>{{ dict.history_col1 }}</th>
                        <th>{{ dict.history_col2 }}</th>
                        <th>{{ dict.history_col3 }}</th>
                    </tr>
                </thead>
                <transition name="fade" mode="out-in">
                <tbody :key="page">
                    <tr v-for="(item, index) in history" 
                        :key="index"
                        @click="onShowDetails(index)">
                        <td>{{ formatNumber(item.id, 7, 0) }}</td>
                        <td>
                            <span class="win-numbers-pad" v-show="item.winNumbers[0] === 0">
                                <i>{{ dict.statisctics_no_draw }}</i>
                            </span>
                            <div class="win-numbers-pad" v-show="item.winNumbers[0] !== 0">
                                <span class="win-number" v-for="(i, index) in item.winNumbers" :key="index">{{ i }}</span>
                                <div class="game-detail" :class="{ opened: showingIndex === index }" >
                                    <table class='small-table'>
                                        <thead>
                                            <tr>
                                                <td></td>
                                                <td>Призовой фонд</td>
                                                <td>Победителей</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Jackpot</td>
                                                <td>0.5555</td>
                                                <td>Не разыгран</td>
                                            </tr>
                                            <tr>
                                                <td>4 из 5</td>
                                                <td>0.4444</td>
                                                <td>2</td>
                                            </tr>
                                            <tr>
                                                <td>3 из 5</td>
                                                <td>0.3333</td>
                                                <td>8</td>
                                            </tr>
                                            <tr>
                                                <td>2 из 5</td>
                                                <td>0.2222</td>
                                                <td>25</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </td>
                        <td>{{ formatNumber(item.totalFund, 1, 4) }}</td>
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
import { mapGetters } from 'vuex'
import ThePaginator from '@/components/ThePaginator.vue'

export default {
    name: 'GameHistory',
    components: {
        ThePaginator
    },
    props: {},
    data () {
        return {
            page: 1,
            showingDetailIndex: null
        }
    },
    computed: {
        dict () {
            return this.$store.state.dict
        },
        history () {
            return this.gameCurrentHistory.History
        },
        maxPage () {
            return parseInt(this.gameCurrentHistory.HistoryCount / 10) + 1
        },
        showingIndex () {
            return this.showingDetailIndex
        },
        ...mapGetters(['gameCurrent', 'gameCurrentHistory'])
    },
    methods: {
        formatNumber (value, int, frac) {
            return util.formatNumber(value, int, frac)
        },
        onChangePage (page) {
            this.page = page
            this.$socket.emit('getGameHistory', { type: this.gameCurrent.type, page: this.page })
        },
        onShowDetails (index) {
            if (this.showingDetailIndex === index) this.showingDetailIndex = null
            else this.showingDetailIndex = index
        },
    },
    mounted () {
        this.$socket.emit('getGameHistory', { type: this.gameCurrent.type, page: this.page })
    },
    sockets: {
        getGameHistorySuccess (data) {
            this.page = 1
            this.showingDetailIndex = null
            this.$store.commit('getGameHistorySuccess', data)
        },
        refreshContractData (data) {
            if(data.type === this.gameCurrent.type)
                this.$socket.emit('getGameHistory', { type: this.gameCurrent.type, page: this.page })
        }
    }
}
</script>

<style lang="scss">
#game-history {
    min-height: 100vh;
    padding: 20px 20px 40px 20px;
    background: linear-gradient(to right, black -50%, rgb(17, 46, 61) 150%);
    text-align: left;
}
.game-history-wrapper {
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
    .win-numbers-pad {
        margin: 0 auto;
        .win-number {
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
         }
    }
    .game-detail {
        color: white;
        transition: height ease 0.5s;
        height: 0;
        overflow: hidden;
        &.opened {
            height: 170px;
        }
        .small-table {
            margin-top: 20px;
            width: 100%;
            color: #CACACA;
            font-size: 12px;
            tr {
                width: 100%;
                &:hover {
                    background: none;
                }
            }
            td {
                height: auto;
                padding: 5px;
                vertical-align: middle;
            }
            thead {
                tr {
                    border: none;
                }
            }
            tbody {
                tr {
                    border: none;
                    border-top: 1px solid black;
                }
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