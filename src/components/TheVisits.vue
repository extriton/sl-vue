<template>
    <div v-show="visits !== 0" class="visits-box">
        <img src="../../public/img/icons/icon_people.png" class="visits-box__icon" />
        <div class="visits-box__value">
            {{ newUsers }} / {{ visits }}
        </div>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
export default {
    name: 'TheVisits',
    data () {
        return {
            newUsers: 0,
            visits: 0,
            intervalId: null,
            intervalTime: 5 * 60 * 1000
        }
    },
    created () {
        this.$socket.emit('getVisits')
        this.intervalId = setInterval(() => {
            this.$socket.emit('getVisits')
        }, this.intervalTime)
    },
    sockets: {
        getVisitsSuccess (data) {
            this.newUsers = data.newUsers
            this.visits = data.visits
        }
    },
    beforeDestroy () {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }
}
</script>

<style lang="scss">
.visits-box {
    min-width: 200px;
    padding: 10px;
    &__icon {
        display: inline-block;
        width: 50px;
        height: 40px;
        margin-right: 20px;
    }
    &__value {
        width: 150px;
        padding-top: 5px;
        color: #EEA201;
        font-size: 30px;
        font-weight: bold;
        float: right;
        text-shadow: 2px 2px 5px #EEA201;
    }
}
   
</style>