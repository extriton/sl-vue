<template>
    <div id="game-play" class="game-play-wrapper">
        <canvas class="game-play-background"></canvas>
        <!-- Title -->
        <h3 class="title-text">
            {{ dict.play_title1 }} <strong class="template-color">{{ dict.play_title2 }}</strong> 
            {{ dict.play_title3 }} <a :href="contractUrl" target="_blank">{{ dict.play_title4 }}</a>
        </h3>
        <!-- Description -->
        <h4 class="title-desc">{{ dict.play_title5 }}</h4>
        <!-- Timer -->
        <div class="timer-wrapper">
            <div class="timer">
                <span class="number">{{ timerStr.charAt(0) }}</span>
                <span class="number">{{ timerStr.charAt(1) }}</span>
                <span>:</span>
                <span class="number">{{ timerStr.charAt(2) }}</span>
                <span class="number">{{ timerStr.charAt(3) }}</span>
                <span>:</span>
                <span class="number">{{ timerStr.charAt(4) }}</span>
                <span class="number">{{ timerStr.charAt(5) }}</span>
                <span>:</span>
                <span class="number">{{ timerStr.charAt(6) }}</span>
                <span class="number">{{ timerStr.charAt(7) }}</span>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
import { mapGetters } from 'vuex'

export default {
    name: 'GamePlay',
    props: {},
    data () {
        return {
            timer: 7200000,
            timerInterval: null
        }
    },
    computed: {
        dict () {
            return this.$store.state.dict
        },
        contractUrl () {
            if(this.gameSettings !== null && this.gameCurrent !== null)
                return this.gameSettings.etherscanAddressUrl + this.gameCurrent.contractAddress + '#code'
            else
                return '#'
        },
        timerStr () {
            let days = '', hours = '', minutes = '', seconds = '';    
            if(this.timer <= 0) return '00000000'

            const time_left = new Date(this.timer)
            days = '0' + (time_left.getUTCDate() - 1)               // days

            hours = '' + time_left.getUTCHours()                    // hours
            if(hours.length === 1) hours = '0' + hours

            minutes = '' + time_left.getUTCMinutes()                // minutes
            if(minutes.length == 1) minutes = '0' + minutes

            seconds = '' + time_left.getUTCSeconds()                // seconds
            if(seconds.length == 1) seconds = '0' + seconds

            return (days + hours + minutes + seconds)            
        },
        ...mapGetters(['gameSettings', 'gameCurrent'])
    },
    methods: {
    },
    mounted () {
        const self = this
        this.timerInterval = setInterval(function() {
            if(self.timer > 1000) self.timer -= 1000;
            else self.timer = 0;
        }, 1000)
    }
}
</script>

<style lang="scss">
.game-play-wrapper {
    min-height: 100vh;
    padding-top: 40px;
    color: white;
    background-color: rgba(16, 24, 30, 0.98);
    background-image: url('../../public/img/bg/3.png');
    background-size: cover;
    .game-play-background {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -1;
    }
    .title-text {
        width: 70%;
        margin: 15px auto 30px auto;
        color: #FAFAFA;
        a {
            text-decoration: underline;
        }
    }
    .title-desc {
        width: 70%;
        margin: 15px auto 30px auto;
        color: #3BB9FB;
        border: 2px solid #3BB9FB;
        border-radius: 15px;
        padding: 10px 20px;
    }
    .timer-wrapper {
        width: 600px;
        margin: 20px auto;
        .timer {
            display: block;
            width: auto;
            margin: 15px auto;
            span {
                display: inline-block;
                padding: 5px 8px;
                font-family: "Roboto", sans-serif;
                font-size: 25px;
                color: #75EEFF;
                margin-right: 10px;
            }
            .number {
                background-color: #000;
                border-radius: 4px;
            }
        }
    }
}
</style>