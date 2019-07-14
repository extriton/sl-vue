<template>
    <div id="game-play" class="game-play-wrapper">
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
                <span class="number">{{ timerString.charAt(0) }}</span>
                <span class="number">{{ timerString.charAt(1) }}</span>
                <span>:</span>
                <span class="number">{{ timerString.charAt(2) }}</span>
                <span class="number">{{ timerString.charAt(3) }}</span>
                <span>:</span>
                <span class="number">{{ timerString.charAt(4) }}</span>
                <span class="number">{{ timerString.charAt(5) }}</span>
                <span>:</span>
                <span class="number">{{ timerString.charAt(6) }}</span>
                <span class="number">{{ timerString.charAt(7) }}</span>
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
                <div class="loto-pad-item" 
                     :class="{ selected:  n == 1 }" 
                     v-for="(n, index) in numbers" 
                     @click="doSelect(index)" 
                     :key="index"
                >
                    <span>{{ index + 1 }}</span>
                </div>
                <!-- Control panel -->
                <div class="control-bar">
                    <div class="m-btn btn-ctrl btn-auto" 
                         @click="doAuto()"
                    >
                        Auto
                    </div>
                    <div class="data-string">
                        <span v-show="dataString" id="data-string-text">{{ dataString }}</span>
                        <span v-show="!dataString"><i>{{ dict.play_no_numbers }}</i></span>        
                    </div>
                    <div class="m-btn btn-ctrl btn-clear" 
                         :class="{ disabled: gameCurrent !== null && leftNumbers >= gameCurrent.reqNumbers }" 
                         @click="doClear()"
                    >
                            <i class="glyphicon glyphicon-trash"></i>
                    </div>
                    <div id="copy-button" 
                         class="m-btn btn-ctrl btn-copy" 
                         data-clipboard-target="#data-string-text" 
                         :class="{ disabled: leftNumbers > 0 }"
                         @click="doCopy()">
                            <i class="fa fa-files-o" aria-hidden="true"></i>
                    </div>
                    <div class="m-btn btn-ctrl btn-play" 
                         :class="{ disabled: leftNumbers > 0 || !web3.isInjected }"
                         @click="doPlay()">
                            <p>{{ dict.play_play }}</p>
                    </div>
                </div>
            </div>
        </div>
        <!-- Additional info -->
        <div class="loto-info-bottom">
            {{ dict.play_txt1 }} 
            <strong>
                <a :href="contractUrl" target="_blank">{{ gameCurrent.contractAddress }}</a>
            </strong>
            {{ dict.play_txt2 }}<br />
            <span v-show="!web3.isInjected" style="color: #EECA57">
                {{ dict.play_txt3 }} 
                <a href="https://metamask.io/" target="_blank">{{ dict.play_txt3link }}</a>
            </span>
        </div>
        
    </div>
</template>

<script>
/* eslint-disable */
/* eslint linebreak-style: ["error", "windows"] */
import { mapGetters, mapMutations } from 'vuex'
import util from '@/util/util'
import ethNetworks from '@/util/constants/networks'

export default {
    name: 'GamePlay',
    props: {},
    data () {
        return {
            timer: null,
            timerInterval: null,
            dataString: '',
            numbers: [],
            leftNumbers: 0,
        }
    },
    computed: {
        dict () {
            return this.$store.state.dict
        },
        contractUrl () {
            return this.gameSettings.etherscanAddressUrl + this.gameCurrent.contractAddress + '#contracts'
        },
        timerString () {
            return util.timerToStr(this.timer)
        },
        GameNum () {
            return util.formatNumber(this.gameCurrentDetail.GameNum, 7, 0)
        },
        Fund () {
            return util.formatNumber(this.gameCurrentDetail.Fund, 1, 4)
        },
        Jackpot () {
            return util.formatNumber(this.gameCurrentDetail.Jackpot, 1, 4)
        },
        ...mapGetters(['gameSettings', 'gameCurrent', 'gameCurrentDetail', 'web3'])
    },
    methods: {
        init () {
            // Run Timer
            this.runTimer()
            // Init Numbers array and numbers data
            this.numbers = new Array(this.gameCurrent.padSize).fill(0)
            this.leftNumbers = this.gameCurrent.reqNumbers
        },
        runTimer () {
            this.timer = util.calcTimerStart(this.gameCurrent.drawDow, this.gameCurrent.drawHour, this.gameCurrent.drawMinute)
            this.timerInterval = setInterval(() => {
                if(this.timer > 1000) this.timer -= 1000
                else {
                    this.timer = 0
                    clearInterval(this.timerInterval)
                    this.timerInterval = null
                }
            }, 1000)
        },
        doSelect (index) {
            if(this.numbers[index] === 0 && this.leftNumbers === 0) return

            if(this.numbers[index] === 0) {
                this.numbers[index] = 1
                this.leftNumbers--
            } else {
                this.numbers[index] = 0
                this.leftNumbers++
            }

            this.dataString = util.calcDataString(this.numbers)
        },
        doAuto () {
            // Generate random numbers
            this.numbers.fill(0)
            for (let i = 0; i < this.gameCurrent.reqNumbers; i++) {
                let num = Math.floor(Math.random() * this.gameCurrent.padSize)
                if (this.numbers[num] === 1) {
                    i--
                    continue
                } else {
                    this.numbers[num] = 1
                }
            }
            this.leftNumbers = 0
            this.dataString = util.calcDataString(this.numbers)
        },
        doClear () {
            this.dataString = ''
            this.leftNumbers = this.gameCurrent.reqNumbers
            this.numbers.fill(0)
        },
        doCopy () {
            if(this.leftNumbers > 0) {
                this.newNotify({ type: 'error', title: '<b>:: Copy ::</b>', text: `You must select ${this.gameCurrent.reqNumbers} numbers` })
                return
            }
            
            this.$copyText(this.dataString)
            .then((e) => {
                this.newNotify({ type: 'success', title: '<b>:: Copy ::</b>', text: `DATA string successfull copied!` })
            })
            .catch((e) => {
                this.newNotify({ type: 'error', title: '<b>:: Copy ::</b>', text: `DATA string not copied!` })
            })
        },
        doPlay () {
            this.$store.dispatch('registerWeb3')
            // Check selected numbers
            if (this.leftNumbers > 0) {
                this.newNotify({ type: 'error', title: '<b>:: Play ::</b>', text: `You must select ${this.gameCurrent.reqNumbers} numbers` })
                return
            }

            // Check Metamask install
            if (!this.web3.isInjected) {
                this.newNotify({ type: 'error', title: '<b>:: Play ::</b>', text: `Metamask not installed! <br /> Install <a href="https://metamask.io/" target="_blank">https://metamask.io/</a>` })
                return
            }
            
            // Check Metamask lock
            this.web3.web3Instance().eth.getAccounts()
            .then((result) => {

                if (!Array.isArray(result) || result.length <= 0) {
                    this.newNotify({ type: 'error', title: '<b>:: Play ::</b>', text: `Metamask is locked!` })
                    return
                }
                
                // Check Metamask network
                if (this.gameSettings.metamaskNetId != this.web3.networkId) {
                    const netId = '' + this.gameSettings.metamaskNetId
                    this.newNotify({ type: 'error', title: '<b>:: Play ::</b>', text: `Choose ${ethNetworks[netId]} network in Metamask!` })
                    return
                }
                
                // Create transaction for confirmation
                this.createTransaction()

            })
            .catch((error) => {
                this.newNotify({ type: 'error', title: '<b>:: Play ::</b>', text: error })
                return
            })
        },
        createTransaction () {

            const transactionObj = {
                from: this.web3.coinbase,
                to: this.gameCurrent.contractAddress,
                value: window.web3.toWei("0.01", "ether"),
                gas: 400000,
                gasPrice: window.web3.toWei("6", "gwei"),
                data: this.dataString
            }

            const callback = (error, result) => {
                if (error)
                    this.newNotify({ type: 'error', title: '<b>:: Play ::</b>', text: error })
                else
                    this.newNotify({ type: 'success', title: '<b>:: Play ::</b>', text: `Transaction successfully sent!`  })
            }

            this.web3.web3Instance().eth.sendTransaction(transactionObj, callback)

        },
        ...mapMutations(['newNotify'])
    },
    mounted () {
        this.init()
    },
    beforeDestroy () {
        if(this.timerInterval !== null) clearInterval(this.timerInterval)
    },
}
</script>

<style lang="scss">
.game-play-wrapper {
    min-height: 100vh;
    padding: 40px 0 20px 0;
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
        margin: 30px auto 0 auto;
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
                transition: border-color 0.3s ease-in-out;
                transition: border-radius 0.3s ease-in-out;
                &:hover {
                    cursor: pointer;
                    color: #CC6311;
                    font-weight: bold;
                }
            }
            .loto-pad-item.selected {
                border-radius: 50px;
                border-color: #CC6311;
                border-width: 2px;
                padding: 14px 0;
                color: #CC6311;
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
    .loto-info-bottom {
        width: 800px; 
        margin: 20px auto 0 auto;
        padding: 20px;
        background-color: rgba(0, 0, 0, 0.7);
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        color: #FAFAFA;
        strong {
            color: #34bbff;
        }
    }
}
</style>