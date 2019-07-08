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
        <!-- Game Info -->
        <div class="loto-info">
            <!-- Game Number -->
            <div class="column">
                <div class="icon">
                    <img src="../../public/img/icons/icon_number.png"  alt="Game number" title="Game number" width="50" height="50" />
                </div>
                <span>
                    {{ dict.play_game_num }} <br />
                    <strong class="text">{{ GameNum }}</strong>
                </span>
            </div>
            <!-- Game Number -->
            <div class="column">
                <div class="icon">
                    <img src="../../public/img/icons/icon_prize.png"  alt="Prize fund" title="Prize fund" width="50" height="50" />
                </div>
                <span>
                    {{ dict.play_prize_fund }} <br />
                    <strong class="text">{{ Fund }}</strong>
                </span>
            </div>
            <!-- Game Number -->
            <div class="column">
                <div class="icon">
                    <img src="../../public/img/icons/icon_jackpot.png"  alt="Jackpot" title="Jackpot" width="50" height="50" />
                </div>
                <span>
                    {{ dict.play_jackpot }} <br />
                    <strong class="text">{{ Jackpot }}</strong>
                </span>
            </div>
        </div>
        
        <!--
        <pre style="text-align: left;">{{ gameCurrentDetail }}</pre>
        -->
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
                return this.gameSettings.etherscanAddressUrl + this.gameCurrent.contractAddress + '#contracts'
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
        GameNum () {
            if(this.gameCurrentDetail === null) return null
            else return this.formatNumber(this.gameCurrentDetail.GameNum, 7, 0)
        },
        Fund () {
            if(this.gameCurrentDetail === null) return null
            else return this.formatNumber(this.gameCurrentDetail.Fund, 1, 4)
        },
        Jackpot () {
            if(this.gameCurrentDetail === null) return null
            else return this.formatNumber(this.gameCurrentDetail.Jackpot, 1, 4)
        },
        ...mapGetters(['gameSettings', 'gameCurrentIndex', 'gameCurrent', 'gameCurrentDetail'])
    },
    methods: {
        formatNumber (value, int, frac) {

            if(!value) return '-------'
            
            const zeroString = '000000000'
            let _value = '' + value
            let _int = '' + parseInt(value)
            let _frac = '' + (value - parseInt(value))
            _frac = _frac.substr(2)

            // Integer part
            if(int > _int.length) _int = zeroString.substr(0, int - _int.length) + _int
            
            // Fractional part
            if(frac === 0) return _int
            if(frac === _frac.length) return _int + '.' + _frac

            if(frac > _frac.length) 
                _frac += zeroString.substr(0, frac - _frac.length)
            else
                _frac = _frac.substr(0, frac)

            return _int + '.' + _frac

        }
    },
    watch: {
        gameCurrentIndex: function(val) { // Перенести в mounted таймер и взять настройки из settings
            if(val !== null) {
                this.timerInterval = setInterval(() => {
                    if(this.timer > 1000) this.timer -= 1000
                    else this.timer = 0
                }, 1000)
            }
        }
    },
    mounted () {
        console.log('Mount component' + this.gameCurrent.type)
    },
    beforeDestroy () {
        //console.log('Detroy component' + this.gameCurrent.type)
        if(this.timerInterval !== null) clearInterval(this.timerInterval)
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
    .loto-info {
        width: 600px; 
        margin: 20px auto;
        padding: 20px;
        background-color: rgba(0, 0, 0, 0.7);
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        color: #FAFAFA;
        .column {
            display: inline-block;
            width: 30%;
            &:first-child {
                margin-right: 5%;
            }
            &:last-child {
                margin-left: 5%;
            }
            .text {
                color: #34bbff;
            }
        }
    }
}
</style>