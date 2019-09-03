const axios = require('axios')
const gameSettings = require('../../config/server/game-settings-server')()
const Game = require('../models/Game')
const Tx = require('ethereumjs-tx');
const Web3 = require('web3')
const web3 = new Web3(gameSettings.websocketProvider)

const SEC_IN_DAY = 24 * 60 * 60         // 86 400

const contracts = {}
const phases = {}                       // Фазы обработки: 'ready' готов к прокрутке, 'started' - уже прокручивается, 'finished' - прокрутка контракта (всех пулов) завершилась

module.exports = {
    drawAllContracts        : drawAllContracts
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// Every time period check and run contract drawing if needed
///////////////////////////////////////////////////////////////////////////////////////////////////////
function drawAllContracts() {
    
    // Define contracts connections and init contract phases
    gameSettings.games.forEach(game => {
        if (!game.isActive) return
        contracts[game.type] = new web3.eth.Contract(game.contractAbi, game.contractAddress)
        phases[game.type] = 'ready'
    })

    // Run timer and process contracts every 3 minutes
    setInterval(() => {
        // Loop contracts
        gameSettings.games.forEach(game => {
            // Check status
            if (!game.isActive) return
            // Check contract drawing time start and start contract drawing
            if (checkDrawingTime(game)) {
                if (phases[game.type] === 'ready') {
                    phases[game.type] = 'started'
                    startContractDrawing(game, contracts[game.type])
                }
            } else {
                if (phases[game.type] === 'finished') {
                    phases[game.type] = 'ready'
                }
            }
            
        })
    }, 3 * 60 * 1000)

}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// Init params and push transactions chain
///////////////////////////////////////////////////////////////////////////////////////////////////////
async function startContractDrawing(_game, _contract) {
    console.log(`${new Date()}: drawContract started... (${_game.type})`)

    // Transactions counter
    let txCounter = 0

    // Transaction params
    const serviceAddress = _game.serviceAddress;
    const servicePrivKey = Buffer.from(_game.servicePrivKey, 'hex')
    const contractAddress = _game.contractAddress;

    // Raw tranaction object
    const rawTransaction = {
	    "from":			serviceAddress, 
	    "gasPrice":		web3.utils.toHex('6000000000'),         // Default 6 Gwei
	    "gasLimit":		web3.utils.toHex('3500000'),            // 3.5 millions
	    "to":			contractAddress,
	    "value":		'0x0',
	    "data":			'',
	    "nonce":		''
	}

    // Store drawing game
    const drawingGameNum = getCurrentGameNum(_game, _contract)
    if (drawingGameNum === 0) {
        console.log(`${new Date()}: Error (${_game.type}): Cannot define drawingGameNum`)
        return
    }
    
    // Start first transaction after random pause
    const randomPause = Math.floor(Math.random() * 10) + 5;             // Рандомный старт через 5..15 мин
    setTimeout(() => { pushTransaction(_game, _contract) }, randomPause * 60 * 1000)

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // Push transaction 
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    async function pushTransaction(_game, _contract) {

        txCounter++
        console.log(`${new Date()}: pushTransaction ${txCounter} started... (${_game.type})`);
        
        // Define current gasPrice (fast)
        let gasPrice = null
        try {
            gasPrice = await axios.get(`https://ethgasstation.info/json/ethgasAPI.json`)
        } catch (e) {
            console.log(`${new Date()}: Error (${_game.type}): ${e}`)
        }

        if (gasPrice !== null) 
            rawTransaction.gasPrice = web3.utils.toHex('' + (gasPrice.data.fast / 10) + '000000000')

        // Get transaction count, later will used as nonce
        web3.eth.getTransactionCount(serviceAddress).then(nonce => {
            
            rawTransaction.data = web3.utils.toHex(txCounter)
            rawTransaction.nonce = web3.utils.toHex(nonce)

            // Creating tranaction via ethereumjs-tx
            const transaction = new Tx(rawTransaction)
            transaction.sign(servicePrivKey)

            // Sending transacton via web3 module
            web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('receipt', receipt => {
                    
                    // Compare drawingGameNum and currentGameNum
                    const currentGameNum = getCurrentGameNum(_game, _contract)
                    if (currentGameNum === 0) {
                        console.log(`${new Date()}: Error (${_game.type}): Cannot define currentGameNum; Transaction: ${txCounter}`)
                        return
                    }

                    if (currentGameNum == drawingGameNum) {
                        pushTransaction(_game, _contract)
                    } else {
                        phases[_game.type] = 'finished'
                    }

                })
                .on('error', error => {
                    console.log(`${new Date()}: Error (${_game.type}): ${error}`)
                })

        })

    }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// Check contract drawing time start
///////////////////////////////////////////////////////////////////////////////////////////////////////
function checkDrawingTime (_game) {

    const now = new Date()
    let timeToDraw = (_game.drawHour * 60 + _game.drawMinute) * 60
    let timeCurrent = (now.getUTCHours() * 60 + now.getUTCMinutes()) * 60 + now.getUTCSeconds()
    if (isWeeklyGame(_game.drawDow)) {
        timeToDraw += drawDow * SEC_IN_DAY
        timeCurrent += now.getUTCDay() * SEC_IN_DAY
    }

    // If blocked period and phase not 'busy' return true
    if (timeCurrent > (timeToDraw - _game.preDrawPeriod * 60) && timeCurrent < (timeToDraw + _game.postDrawPeriod * 60)) {
        return true
    } else {
        return false
    }

    function isWeeklyGame(dow) {
        return (dow >= 0 && dow <= 6) ? true : false
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// Get current contract gameNum
///////////////////////////////////////////////////////////////////////////////////////////////////////
function getCurrentGameNum (_game, _contract) {

    let currentGame = null
    try {
        currentGame = await _contract.methods.getGameInfo(0).call()    
    } catch (e) {
        console.log(`${new Date()}: Error (${_game.type}): ${e}`)
        return 0
    }
    
    if (currentGame === null) {
        console.log(`${new Date()}: Error (${_game.type}): currentGame === null`)
        return 0
    }

    return currentGame._gamenum
}