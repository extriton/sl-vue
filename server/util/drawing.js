const axios = require('axios')
const config = require('../../config/config')
const gameSettings = require('../../config/server/game-settings-server')
const util = require('./util')
const Tx = require('ethereumjs-tx').Transaction
const Web3 = require('web3')
const web3 = new Web3(gameSettings.websocketProvider)

module.exports = {
    drawAllContracts        : drawAllContracts
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// Every time period check and run contract drawing if needed
///////////////////////////////////////////////////////////////////////////////////////////////////////
function drawAllContracts() {
    
    // Check contracts.init() call
    if (gameSettings.games[0].contract === undefined) {
        console.log(`drawAllContracts... Error: contracts.init() not called!`)
        return
    }

    // Run timer and process contracts every 3 minutes
    setInterval(() => {
        // Loop contracts
        for (let i = 0; i < gameSettings.games.length; i++) {
            const game = gameSettings.games[i]
            startContractDrawing(game, game.contract)
        }
    }, 1 * 60 * 1000)

}

///////////////////////////////////////////////////////////////////////////////////////////////////////
// Init params and push transactions chain
///////////////////////////////////////////////////////////////////////////////////////////////////////
async function startContractDrawing(_game, _contract) {
    
    // Check drawing time and ready phase
    if (util.isDrawing(_game)) {
        if (_game.phase !== 'ready') return
    } else {
        if (_game.phase === 'finished') {
            _game.phase = 'ready'
            _game.currentNum = util.getCurrentGameNum(_game, _contract)
        }
        return
    }

    console.log(`${new Date()}: startContractDrawing... (${_game.type})`)

    _game.phase = 'starting'
    _game.txCounter = 0

    // Transaction params
    const serviceAddress = _game.serviceAddress
    const servicePrivKey = Buffer.from(_game.servicePrivKey, 'hex')
    const contractAddress = _game.contractAddress

    // Raw tranaction object
    const rawTransaction = {
        nonce           : '0x00',
        gasPrice        : web3.utils.toHex('6000000000'),       // Default 6 Gwei
        gasLimit        : web3.utils.toHex('3500000'),          // 3.5 millions
	    to              : contractAddress,
	    value           : '0x00',
	    data            : ''
	}

    // Store drawing game
    _game.currentNum = util.getCurrentGameNum(_game, _contract)
    console.log(`drawingGameNum: ${_game.currentNum}`)
    if (_game.currentNum === 0) {
        console.log(`${new Date()}: Error (${_game.type}): Cannot define _game.currentNum`)
        return
    }

    // Start first transaction after random pause
    const randomPause = Math.floor(Math.random() * 10) + 5;             // Рандомный старт через 5..15 мин
    setTimeout(() => { pushTransaction(_game, _contract) }, randomPause * 60 * 1000)

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // Push transaction 
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    async function pushTransaction(_game, _contract) {

        _game.txCounter++
        console.log(`${new Date()}: pushTransaction ${_game.txCounter} started... (${_game.type})`);
        
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
        // web3.eth.getTransactionCount(serviceAddress).then(nonce => {
            
            rawTransaction.data = web3.utils.toHex(_game.txCounter)
            // rawTransaction.nonce = web3.utils.toHex(nonce)

            // Creating tranaction via ethereumjs-tx
            const transaction = new Tx(rawTransaction, { chain: config.ethNetwork, hardfork: 'petersburg' })
            transaction.sign(servicePrivKey)

            // Validate transaction: if transaction incorrect then log and return
            if (!tx.validate() || bufferToHex(tx.getSenderAddress()) !== serviceAddress) {
                console.log(`Invalid transaction: #${_game.txCounter} (Game: ${_game.type}, GameNum: ${_game.currentNum})`)
                return
            }

            // Sending transacton via web3 module
            web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                .on('receipt', receipt => {
                    
                    // Compare drawingGameNum and currentGameNum
                    const currentGameNum = util.getCurrentGameNum(_game, _contract)
                    if (currentGameNum === 0) {
                        console.log(`${new Date()}: Error (${_game.type}): Cannot getting currentGameNum; Transaction: ${_game.txCounter}`)
                        return
                    }

                    if (currentGameNum == _game.currentNum) {
                        pushTransaction(_game, _contract)
                    } else {
                        _game.phase = 'finished'
                        
                    }

                })
                .on('error', error => {
                    console.log(`${new Date()}: Error (${_game.type}): ${error}`)
                })

       // })

    }

}