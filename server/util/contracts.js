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
        console.log(`Event GameChanged started... (game_type: ${_game.type})`)
        if (error) { console.log(error); return; }
        GameChanged(_settings, _contract, event.returnValues)
    })

    // Process event MemberChanged
    _contract.events.MemberChanged({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event MemberChanged started... (game_type: ${_game.type})`);
        if (error) { console.log(error); return; }
        MemberChanged(_settings, _contract, event.returnValues)
    })

}

//-------------------------------------------------------------------------------------------------//
// Events handler functions                                                                        //
//-------------------------------------------------------------------------------------------------//
async function GameChanged(_settings, _contract, res) {
    
    console.log(`Game ${res._gameNum} changed. (${_settings.type})`)

    gameSaveOrUpdate(_game, _contract, res._gameNum, res._membersCounter, res._totalFund, res._status, next)
    
    function next(game) {

        // If status == 2 caculate matchNumbers and prize for members and update game members
        if (game.status == 2)
            for (let i = 1; i <= game.membersCounter; i++)
                memberSaveOrUpdate(_game, _contract, game.id, i, () => {
                    io.emit('refreshContractData', { type: _game.type })            
                })

        io.emit('refreshContractData', { type: _settings.type })

    }

}

async function MemberChanged(_settings, _contract, res) {

    console.log(`Member ${res._gameNum}, ${res._member} changed. (${_settings.type})`)
    
    memberSaveOrUpdate(_game, _contract, res._gameNum, res._member, next)

    function next(game) {
        io.emit('refreshContractData', { type: _settings.type })
    }
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

    const game = new Game({
        type            : _settings.type,
        id              : gameInfo._gamenum,
        membersCounter  : gameInfo._membersCounter,
        totalFund       : parseFloat(web3.utils.fromWei('' + gameInfo._totalFund, 'ether')),
        status          : gameInfo._status,
        winNumbers      : gameWinNumbers,
        funds           : gameFunds,
        winners         : gameWinners
    })
    await game.save()

    // Save game members
    for (let i = 1; i <= game.membersCounter; i++)
        saveMember(_settings, _contract, id, i, game)

}

async function saveMember(_settings, _contract, game_id, id, game) {
    
    console.log(`SaveMember... game_id: ${game_id}, id: ${id} (${_settings.type})`)

    const memberInfo = await _contract.methods.getMemberInfo(game_id, id).call()

    const member = new Member({
        game_type       : _settings.type,
        game_id         : game_id,
        id              : id,
        address         : memberInfo._addr,
        numbers         : memberInfo._numbers,
        winNumbers      : game.winNumbers,
        matchNumbers    : findMatch(memberInfo._numbers, game.winNumbers),
        prize           : parseFloat(web3.utils.fromWei('' + memberInfo._prize, 'ether')),
        payout          : memberInfo.payout
    })

    const matchIndex = member.matchNumbers - _settings.minWinMatch
    if (game.status == 2 && member.payout == 0 && member.matchNumbers >= _settings.minWinMatch)
        member.prize = game.funds[matchIndex] / game.winners[matchIndex]

    await member.save()
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
        const lastGameContract = await _contract.methods.getGameInfo(0).call()
        
        for (let i = 0; i < lastGameContract._gamenum; i++ ) {
            saveGame(_settings, _contract, i + 1)
        }

    }

}

// Find match numbers function
function findMatch(arr1, arr2) {
    let cnt = 0
    for (let i = 0; i < arr1.length; i++)
        for (let j = 0; j < arr2.length; j++)
            if (arr1[i] === arr2[j]) { cnt++; break; }
    return cnt
}