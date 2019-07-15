<template>
    <div id="game-history">
        <div class="game-history-wrapper">
            <div class="page-caption"><h3>{{ dict.history_title }}</h3></div>
            <table>
                <thead>
                    <tr>
                        <th>{{ dict.history_col1 }}</th>
                        <th>{{ dict.history_col2 }}</th>
                        <th>{{ dict.history_col3 }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in history" :key="index">
                        <td>{{ formatNumber(item.id, 7, 0) }}</td>
                        <td>
                            <span class="win-numbers-pad" v-show="item.winNumbers[0] !== 0">
                                <i>{{ dict.statisctics_no_draw }}</i>
                            </span>
                            <span class="win-numbers-pad" v-show="item.winNumbers[0] === 0">
                                <span class="win-number" v-for="(i, index) in item.winNumbers" :key="index">{{ i }}</span>
                            </span>
                        </td>
                        <td>{{ formatNumber(item.totalFund, 1, 4) }}</td>
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

export default {
    name: 'GameHistory',
    props: {},
    data () {
        return {
        }
    },
    computed: {
        dict () {
            return this.$store.state.dict
        },
        history () {
            return this.gameCurrentHistory.History
        },
        ...mapGetters(['gameCurrentHistory'])
    },
    methods: {
        formatNumber (value, int, frac) {
            return util.formatNumber(value, int, frac)
        },
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
    table {
        width: 100%;
    }
    table tr {
        width: 100%;
    }
    table thead tr {
        border-bottom: 2px solid #34BBFF;
        color: #34BBFF;
        margin-bottom: 15px;
    }
    table thead th {
        text-align: center;
        padding-bottom: 10px;
    }
    table td, table th {
        padding: 10px;
        text-align: center;
    }
    table tr td:nth-child(1) {
        width: 120px;
    }
    table tr td:nth-child(3) {
        width: 120px;
        text-align: right;
    }
    .win-numbers-pad {
         /* display: inline-block;
        width: auto; */
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
            color: rgb(51, 79, 238);
            color: black;
            /* text-shadow: -1px -1px white, 1px 1px gray, 2px 2px #7a7a7a, 3px 3px #757575; */
            text-shadow: 2px 3px 5px rgba(224, 186, 6, 0), 3px 3px 5px black;
         }
    }
}
</style>