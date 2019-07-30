const Game = require('../models/Game')
const Member = require('../models/Member')
const Web3 = require('web3')
const gameSettings = require('../config/game-settings')()
const web3 = new Web3(new Web3.providers.WebsocketProvider(gameSettings.websocketProvider))

let io = null
const contracts = {}

module.exports = {
    setListeners: setListeners,
    syncAllContracts: syncAllContracts
}

// Set listeners for all contracts
function setListeners(_io) {
    io = _io
    gameSettings.games.forEach(el => {
        if (!el.isActive) return
        contracts[el.type] = new web3.eth.Contract(el.contractAbi, el.contractAddress)
        setContractListeners(el, contracts[el.type])
    })
}

// Set listeners for contract
function setContractListeners(_settings, _contract) {

    // Process event GameChanged
    _contract.events.GameChanged({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event GameChanged started... (game_type: ${_settings.type})`)
        if (error) { console.log(error); return; }
        GameChanged(_settings, _contract, event.returnValues)
    })

    // Process event MemberChanged
    _contract.events.MemberChanged({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event MemberChanged started... (game_type: ${_settings.type})`);
        if (error) { console.log(error); return; }
        MemberChanged(_settings, _contract, event.returnValues)
    })

}

// Synchronize contracts data (called on start serve and every day interval)
function syncAllContracts() {
        
    gameSettings.games.forEach(el => {
        if(!el.isActive) return
        syncContract(el, contracts[el.type])
    })

    async function syncContract(_settings, _contract) {
        
        console.log(`syncContract started... (${_settings.type})`)
        await Game.deleteMany({ type: _settings.type })
        await Member.deleteMany({ game_type: _settings.type })
        const lastGameContract = await _contract.methods.getGameInfo(0).call()
        
        for (let i = 0; i < lastGameContract._gamenum; i++ ) {
            const game = await saveGame(_settings, _contract, i + 1)
            // Save game members
            for (let j = 1; j <= game.membersCounter; j++)
                saveMember(_settings, _contract, game.id, j, game)
        }

    }

}

//-------------------------------------------------------------------------------------------------//
// Events handler functions                                                                        //
//-------------------------------------------------------------------------------------------------//
async function GameChanged(_settings, _contract, res) {
    
    console.log(`Game ${res._gameNum} changed. (${_settings.type})`)

    // 0 - New game
    if (res._action === 0) {
        // Save new game
        await saveGame(_settings, _contract, res._gameNum)
        // Update prevous game
        const game = await saveGame(_settings, _contract, res._gameNum - 1)
        // Update members for prevous game
        await Member.deleteMany({ game_type: _settings.type, game_id: res._gameNum - 1 })
        for (let i = 1; i <= game.membersCounter; i++)
            await saveMember(_settings, _contract, game.id, i, game)
    }

    // 1 - Change status
    if (res._action === 1) {
        await saveGame(_settings, _contract, res._gameNum)
    }
    
    // 2 - Change Jackpot
    if (res._action === 2) {
        await saveGame(_settings, _contract, res._gameNum)
    }

    io.emit('refreshContractData', { type: _settings.type })    

}

async function MemberChanged(_settings, _contract, res) {

    console.log(`Member ${res._gameNum}, ${res._member} changed. (${_settings.type})`)
    
    const game = await saveGame(_settings, _contract, res._gameNum)
    await saveMember(_settings, _contract, res._gameNum, res._member, game)

    io.emit('refreshContractData', { type: _settings.type })

}

async function saveGame(_settings, _contract, id) {

    console.log(`SaveGame... id: ${id} (${_settings.type})`)

    const gameInfoPromise = _contract.methods.getGameInfo(id).call()
    const gameWinNumbersPromise = _contract.methods.getGameWinNumbers(id).call()
    const gameFundsPromise = _contract.methods.getGameFunds(id).call()
    const gameWinnersPromise = _contract.methods.getGameWinners(id).call()

    const gameInfo = await gameInfoPromise
    const gameWinNumbers = await gameWinNumbersPromise
    const gameFunds = await gameFundsPromise
    const gameWinners = await gameWinnersPromise
            
    for (let i = 0; i < gameFunds.length; i++) {
        gameFunds[i] = parseFloat(web3.utils.fromWei('' + gameFunds[i], 'ether'))
        gameWinners[i] = parseInt(gameWinners[i])
    }

    let game = await Game.findOne({ type: _settings.type, id: id })
    
    let isNew = false 
    if (game === null) { 
        game = new Game()
        isNew = true
    }

    if (isNew) {
        game.type               = _settings.type
        game.id                 = gameInfo._gamenum
        game.winNumbers         = new Array(_settings.reqNumbers).fill(0)
        game.funds              = new Array(_settings.arrSize).fill(0)
        game.winners            = new Array(_settings.arrSize).fill(0)
    }

    if (gameInfo._status > game.status) {
        game.status = gameInfo._status
    }

    if (gameInfo._membersCounter > game.membersCounter) {
        game.membersCounter = gameInfo._membersCounter
    }

    if (parseFloat(web3.utils.fromWei('' + gameInfo._totalFund, 'ether')) > game.totalFund) {
        game.totalFund = parseFloat(web3.utils.fromWei('' + gameInfo._totalFund, 'ether'))
    }

    game.funds = gameFunds

    // Drawing or closed game
    if (game.status == 1 || game.status == 2) {
        game.winNumbers         = gameWinNumbers
    }

    // Closed game
    if (game.status == 2) {
        game.winners            = gameWinners    
    }
    
    await game.save()

    return game
}

async function saveMember(_settings, _contract, game_id, id, game) {
    
    console.log(`SaveMember... game_id: ${game_id}, id: ${id} (${_settings.type})`)
    
    await Member.deleteOne({ game_type: _settings.type, game_id: game_id, id: id })
    const memberInfo = await _contract.methods.getMemberInfo(game_id, id).call()

    const member = new Member()
    
    member.game_type        = _settings.type
    member.game_id          = game_id
    member.id               = id
    member.address          = memberInfo._addr.toLowerCase()
    member.numbers          = memberInfo._numbers
    member.prize            = parseFloat(web3.utils.fromWei('' + memberInfo._prize, 'ether'))
    member.payout           = memberInfo._payout

    if (game.status > 0) {
        member.winNumbers       = game.winNumbers
        member.matchNumbers     = findMatch(memberInfo._numbers, game.winNumbers)
    }

    const matchIndex = member.matchNumbers - _settings.minWinMatch
    if (game.status == 2 && member.payout == 0 && matchIndex >= 0)
        member.prize = game.funds[matchIndex] / game.winners[matchIndex]
    
    await member.save()

    return member
}

// Check drawing time or no
function checkDrawing(_settings) {

    

}

// Find match numbers function
function findMatch(arr1, arr2) {
    let cnt = 0
    for (let i = 0; i < arr1.length; i++)
        for (let j = 0; j < arr2.length; j++)
            if (arr1[i] === arr2[j]) { cnt++; break; }
    return cnt
}