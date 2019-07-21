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
    console.log('contracts.setListeners started...')
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
        
    console.log('syncAllContracts started ...')

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

    const game = await saveGame(_settings, _contract, res._gameNum)
    console.log(`game.id: ${res.id}`)
    console.log(`game.status: ${res.status}`)
    console.log(`game.membersCounter: ${res.membersCounter}`)
    if (res.status == 2)
        for (let i = 1; i <= res.membersCounter; i++)
            await saveMember(_settings, _contract, res.gameNum, i, game)

    io.emit('refreshContractData', { type: _settings.type })    

}

async function MemberChanged(_settings, _contract, res) {

    console.log(`Member ${res._gameNum}, ${res._member} changed. (${_settings.type})`)
    
    let game = await Game.findOne({ type: _settings.type, id: res._gameNum })
    if (game === null) game = await saveGame(_settings, _contract, res._gameNum)
    
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
    if (game === null) game = new Game()

    game.type               = _settings.type
    game.id                 = gameInfo._gamenum
    game.membersCounter     = gameInfo._membersCounter
    game.totalFund          = parseFloat(web3.utils.fromWei('' + gameInfo._totalFund, 'ether'))
    game.status             = gameInfo._status
    game.winNumbers         = gameWinNumbers
    game.funds              = gameFunds
    game.winners            = gameWinners
    await game.save()

    return game
}

async function saveMember(_settings, _contract, game_id, id, game) {
    
    console.log(`SaveMember... game_id: ${game_id}, id: ${id} (${_settings.type})`)

    const memberInfo = await _contract.methods.getMemberInfo(game_id, id).call()

    let member = await Member.findOne({ type: _settings.type, game_id: game_id, id: id })
    if (member === null) member = new Member()
    
    member.game_type        = _settings.type
    member.game_id          = game_id
    member.id               = id
    member.address          = memberInfo._addr.toLowerCase()
    member.numbers          = memberInfo._numbers
    member.winNumbers       = game.winNumbers
    member.matchNumbers     = findMatch(memberInfo._numbers, game.winNumbers)
    member.prize            = parseFloat(web3.utils.fromWei('' + memberInfo._prize, 'ether'))
    member.payout           = memberInfo._payout

    const matchIndex = member.matchNumbers - _settings.minWinMatch
    if (game.status == 2 && member.payout == 0 && matchIndex >= 0)
        member.prize = game.funds[matchIndex] / game.winners[matchIndex]
    
    await member.save()

    return member
}

// Find match numbers function
function findMatch(arr1, arr2) {
    let cnt = 0
    for (let i = 0; i < arr1.length; i++)
        for (let j = 0; j < arr2.length; j++)
            if (arr1[i] === arr2[j]) { cnt++; break; }
    return cnt
}