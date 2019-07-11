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
        <!-- Loto numeric pad wrapper -->
        <div class="loto-pad-wrapper">
            <!-- Loto info -->
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
            <!-- Drawing message -->
            <div class="drawing" :class="{ active: timer === 0 }">
                <span class="drawing-text">Drawing...</span>
            </div>
            <!-- Loto pad -->
            <div class="loto-pad">
                <div class="count-block">
                    <span v-show="leftNumbers > 0">{{ dict.play_select }} <strong class="left-numbers-color">{{ leftNumbers }}</strong> {{ dict.play_numbers }}</span>
                    <span v-show="leftNumbers === 0">{{ dict.play_ready }}</span>
                </div>
                <!-- Loto pad items -->
                <div class="loto-pad-item" :class="{ selected:  n == 1 }" v-for="(n, index) in numbers" @click="selectNumber(index)" :key="index">
                    <span>{{ index + 1 }}</span>
                </div>
                <!-- Control panel -->
                <div class="control-bar">
                    <div class="m-btn btn-ctrl btn-auto" @click="selectAuto()">Auto</div>
                    <div class="data-string">
                        <span v-show="dataString" id="data-string-text">{{ dataString }}</span>
                        <span v-show="!dataString"><i>{{ dict.play_no_numbers }}</i></span>        
                    </div>
                    <div class="m-btn btn-ctrl btn-clear" 
                         :class="{ disabled: gameCurrent !== null && leftNumbers >= gameCurrent.reqNumbers }" 
                         @click="clearNumbers()">
                            <i class="glyphicon glyphicon-trash"></i>
                    </div>
                    <div id="copy-button" 
                         class="m-btn btn-ctrl btn-copy" 
                         data-clipboard-target="#data-string-text" 
                         :class="{ disabled: leftNumbers > 0 }">
                            <i class="fa fa-files-o" aria-hidden="true"></i>
                    </div>
                    <div class="m-btn btn-ctrl btn-play" 
                         :class="{ disabled: leftNumbers > 0 || !web3.isInjected }"
                         @click="playWithMetamask()">
                            <p>{{ dict.play_play }}</p>
                    </div>
                </div>
            </div>
            

        </div>
        <div class='metamask-info' style="text-align: left;">
            <p>Metamask: {{ web3.isInjected }}</p>
            <p>Network: {{ web3.networkId }}</p>
            <p>Account: {{ web3.coinbase }}</p>
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
            timer: null,
            timerInterval: null,
            dataString: '',
            numbers: [],
            reqNumbers: 0,
            leftNumbers: 0,
            metamaskInstalled: false,
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
        ...mapGetters(['gameSettings', 'gameCurrentIndex', 'gameCurrent', 'gameCurrentDetail', 'gameSettingsLoaded', 'web3'])
    },
    methods: {
        formatNumber (value, int, frac) {
            if(!value) return ''
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
        },
        calcTimerStart (drawDow, drawHour, drawMinute) {
            
            const MS_IN_DAY = 1 * 24 * 60 * 60 * 1000                           // 86 400 000
            const blockedPeriod = 2 * 60 * 1000                            // 1 hour
            const now = new Date()

            let timeToDraw = (drawHour * 60 + drawMinute) * 60 * 1000
            let timeCurrent = (now.getUTCHours() * 60 + now.getUTCMinutes()) * 60 * 1000 + now.getUTCSeconds() * 1000
            if(drawDow >= 1 && drawDow <= 7) {                                  // For weekly game
                timeToDraw += drawDow * MS_IN_DAY
                timeCurrent += now.getUTCDay() * MS_IN_DAY
            }

            // If blocked period, set timer to 0
            if(timeCurrent > (timeToDraw - blockedPeriod) && timeCurrent < (timeToDraw - 2 * blockedPeriod)) return 0

            // Else, return timer value
            if(timeToDraw > timeCurrent) return (timeToDraw - timeCurrent - blockedPeriod)
            if(drawDow >= 1 && drawDow <= 7)                                    // Weekly game
                return (timeToDraw + 7 * MS_IN_DAY - timeCurrent - blockedPeriod)    
            else                                                                // Daily game
                return (timeToDraw + MS_IN_DAY - timeCurrent - blockedPeriod)
            
        },
        runTimer () {
            this.timer = this.calcTimerStart(this.gameCurrent.drawDow, this.gameCurrent.drawHour, this.gameCurrent.drawMinute)
            this.timerInterval = setInterval(() => {
                if(this.timer > 1000) this.timer -= 1000
                else {
                    this.timer = 0
                    clearInterval(this.timerInterval)
                    this.timerInterval = null
                }
            }, 1000)
        },
        selectNumber (index) {
            if(this.numbers[index] === 0 && this.leftNumbers === 0) return

            if(this.numbers[index] === 0) {
                this.numbers[index] = 1
                this.leftNumbers--
            } else {
                this.numbers[index] = 0
                this.leftNumbers++
            }
        
            this.dataString = this.generateDataString()

        },
        generateDataString () {
            let dataString = ''
            let hex = ''
        
            for(let i = 0; i < this.gameCurrent.padSize; i++) {
                if(this.numbers[i] === 1) {
                    hex = Number(i + 1).toString(16)
                    hex = hex.toUpperCase()
                    if(hex.length === 1) hex = '0' + hex
                    dataString += hex
                }
            }
        
            return dataString
        },
        selectAuto () {
            // Init params
            let num = 0
            let selectedNumbers = []
            this.leftNumbers = 0
            for(let i = 0; i < this.gameCurrent.padSize; i++) this.numbers[i] = 0;
        
            // Generate random numbers
            for(let i = 0; i < this.gameCurrent.reqNumbers; i++) {
                num = Math.floor(Math.random() * this.gameCurrent.padSize)
                if(num >= this.gameCurrent.padSize || selectedNumbers.indexOf(num) !== -1) {
                    i--
                    continue
                }
                selectedNumbers.push(num)
            }
        
            for(var i = 0; i < selectedNumbers.length; i++)
                this.numbers[selectedNumbers[i]] = 1

            this.dataString = this.generateDataString()
        },
        clearNumbers () {
            this.dataString = ''
            this.leftNumbers = this.gameCurrent.reqNumbers
            for(let i = 0; i < this.numbers.length; i++) this.numbers[i] = 0
        },
        playWithMetamask () {
            if(!this.web3.isInjected) {
                console.log('Metamask not installed')
                return
            }
            console.log(this.web3.web3Instance().eth.getAccounts().then(console.log))

            /*
            // Check Metamask installed
            if(!web3m.getDefaultAccount()) {
                Notification.error({ message: 'Oшибка подключения к Metamask', delay: 2000 })
                return
            }
        
            // Send transaction for confirmation
            web3m.sendTransaction(vm.data_string)
            */
        }
    },
    watch: {
        gameCurrent (value) {                        // For path /:id in browser
            if(value !== null) {
                // Run Timer
                this.runTimer()
                // Init Numbers array and numbers data
                this.numbers = new Array(this.gameCurrent.padSize)
                for(let i = 0; i < this.numbers.length; i++) this.numbers[i] = 0        
                
                this.reqNumbers = this.gameCurrent.reqNumbers
                this.leftNumbers = this.reqNumbers
            }
        }
    },
    mounted () {
        if(this.gameCurrent !== null) {
            // Run Timer
            this.runTimer()
            // Init Numbers array and numbers data
            this.numbers = new Array(this.gameCurrent.padSize)
            for(let i = 0; i < this.numbers.length; i++) this.numbers[i] = 0

            this.reqNumbers = this.gameCurrent.reqNumbers
            this.leftNumbers = this.reqNumbers
        }
    },
    beforeDestroy () {
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
    .loto-pad-wrapper {
        width: 800px;
        margin: 30px auto 20px auto;
        position: relative;
        margin: 40px auto 20px auto;
        .loto-info {
            width: 170px; 
            float: left;
            background-color: rgba(0, 0, 0, 0.7);
            box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            color: #FAFAFA;
            .column {
                width: 100%;
                padding: 20px 10px;
                &:nth-child(1),
                &:nth-child(2) {
                    border-bottom: 1px solid #10191E;
                }
                .text {
                    color: #34bbff;
                }
            }
        }
        .drawing {
            width: 600px;
            height: 0;
            position: absolute;
            top: -35px;
            right: 0;
            background-color: rgba(0, 0, 0, 0.8);
            border-radius: 5px;
            z-index: 100;
            transition: height 1s ease-out 0.3s;
            overflow: hidden;
            .drawing-text {
                display: inline-block; 
                margin: 140px auto;
                text-shadow: 1px 1px 5px #34BBFF, 0 0 1em #34BBFF;
                font-size: 72px;
                color: #EFCB46;
                -moz-user-select: none;
                -webkit-user-select: none;
            }
        }
        .drawing.active {
            height: calc(100% + 35px);
        }
        .loto-pad {
            position: relative;
            display: inline-block;
            width: 600px;
            margin-left: 30px;
            min-height: 392px;
            padding: 10px;
            border: 1px solid #191B1C;
            border-radius: 10px 0 10px 10px;
            background-color: rgba(0, 0, 0, 0.7);
            box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
            padding-bottom: 120px;
            .count-block {
                width: 205px;
                padding: 5px 15px;
                color: #FAFAFA; 
                text-align: center; 
                position: absolute;
                right: 0;
                top: -31px;
                background-color: rgba(0, 0, 0, 0.7);
                border-radius: 15px 0 0 0;
                -moz-user-select: none;
                -webkit-user-select: none;
                .left-numbers-color {
                    color: #34bbff;
                }
            }
            .loto-pad-item {
                display: inline-block;
                padding: 15px 0;
                width: 50px;
                height: 50px;
                border-radius: 10px;
                text-align: center;
                margin: 5px;
                border: 1px solid #D5D6D6;
                color: #D5D6D6;
                -moz-user-select: none;
                -webkit-user-select: none;
                &:hover {
                    cursor: pointer;
                    background-color: #191B1C;
                    color: #FAFAFA;
                    font-weight: bold;
                    color: #57B3FF;
                    border-color: #57B3FF;
                }
            }
            .loto-pad-item.selected {
                color: #57B3FF;
                border-color: #57B3FF;
                border-width: 5px;
                padding: 11px 0;
            }
            .control-bar {
                position: absolute;
                height: 100px;
                bottom: 10px;
                left: 35px;
                border-top: 1px solid #33B5F7;
                width: 530px;
                .data-string {
                    position: absolute;
                    width: 180px;
                    height: 72px;
                    top: 15px;
                    left: 80px;
                    color: #FFF;
                    padding-top: 27px;
                    font-size: 12px;
                    border: 0 solid;
                    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0);
                    outline: 1px solid;
                    outline-color: rgba(255, 255, 255, 0);
                    outline-offset: 0px;
                    text-shadow: none;
                    -webkit-transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
                    transition: all 1250ms cubic-bezier(0.19, 1, 0.22, 1);
                    outline-color: rgba(255, 255, 255, 0.5);
                    outline-offset: 0px;
                }
                .btn-ctrl {
                    position: absolute;
                    top: 15px;
                    color: #33B5F7;
                    padding: 5px 10px;
                    width: 72px;
                    height: 72px;
                    padding-top: 25px;
                }
                .btn-ctrl.disabled {
                    color: #313232;
                }
                .btn-auto {
                    left: 0;
                }
                .btn-copy {
                    left: 268px;
                }
                .btn-clear {
                    left: 348px;
                }
                .btn-play {
                    left: 428px;
                    width: 102px;
                    padding-top: 15px;
                }
            }
        }
        
    }
}
</style>