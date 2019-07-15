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
                        <td>{{ item.id }}</td>
                        <td>
                            <span class="w-number" ng-repeat="i in item.win_numbers">{{ i }}</span>
                        </td>
                        <td>{{ item.totalFund |number:4 }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
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
    }
}
</script>

<style lang="scss">
#game-history {
    min-height: 100vh;
    padding: 20px;
    background: linear-gradient(to right, black -50%, rgb(50, 73, 85) 150%);
    text-align: left;
}
.game-history-wrapper {
    width: 800px;
    margin: 0 auto;
}
</style>