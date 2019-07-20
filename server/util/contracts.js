const Game = require('../models/Game')
const Member = require('../models/Member')
const Web3 = require('web3')
const gameSettings = require('../config/game-settings')()
const web3 = new Web3(new Web3.providers.WebsocketProvider(gameSettings.websocketProvider))

let io = null
const contracts = {}

module.exports = {
    setListeners: setListeners,
    syncData: syncData
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
function setContractListeners(_game, _contract) {

    // Process event GameChanged
    _contract.events.GameChanged({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event GameChanged started... (game_type: ${_game.type})`)
        if (error) { console.log(error); return; }
        GameChanged(event.returnValues, _game, _contract)
    })

    // Process event MemberChanged
    _contract.events.MemberChanged({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event MemberChanged started... (game_type: ${_game.type})`);
        if (error) { console.log(error); return; }
        MemberChanged(event.returnValues, _game, _contract)
    })

}

//-------------------------------------------------------------------------------------------------//
// Events handler functions                                                                        //
//-------------------------------------------------------------------------------------------------//
async function GameChanged(res, _game, _contract) {
    
    console.log(`Game ${res._gameNum} changed. (${_game.type})`)

    const game = gameSaveOrUpdate(_game, _contract, res._gameNum, res._membersCounter, res._totalFund, res._status)
    
    // If status == 2 caculate matchNumbers and prize for members
    if (game.status == 2)
        for (let i = 1; i <= game.membersCounter; i++)
            memberSaveOrUpdate(_game, _contract, game.id, i)
    
    io.emit('refreshContractData', { type: _game.type })    

}

async function MemberChanged(res, _game, _contract) {

    console.log(`Member ${res._gameNum}, ${res._member} changed. (${_game.type})`)
    
    memberSaveOrUpdate(_game, _contract, res._gameNum, res._member)
    io.emit('refreshContractData', { type: _game.type })
}

// Synchronize contracts data (called on start serve and every day interval)
function syncData() {
        
    console.log('syncData started ...')

    gameSettings.games.forEach(el => {
        if(!el.isActive) return
        syncContractData(el, contracts[el.type])
    })

    async function syncContractData(_game, _contract) {
        
        const lastGameContractPromise = _contract.methods.getGameInfo(0).call()
        const lastGameDbPromise = Game.findOne({ type: _game.type, checked: 1 }).sort({ id: -1 })

        const lastGameContract = await lastGameContractPromise
        const lastGameDb = await lastGameDbPromise

        let gameContract = null
        let _from = 1
        let _to = lastGameContract._gamenum

        if (lastGameDb !== null) _from = lastGameDb.id + 1

        for (let i = _from; i <= _to; i++) {
            gameContract = await _contract.methods.getGameInfo(i).call()
            gameSaveOrUpdate(_game, _contract, i, gameContract._membersCounter, gameContract._totalFund, gameContract._status)
            for (let j = 1; j <= gameContract._membersCounter; j++)
                memberSaveOrUpdate(_game, _contract, i, j)
        }
        
    }

}

async function gameSaveOrUpdate(_game, _contract, _gameNum, _membersCounter, _totalFund, _status) {
    console.log(`gameSaveOrUpdate: ${_gameNum}. (${_game.type})`)
    let game = await Game.findOne({ type: _game.type, id: _gameNum })
    
    if (game === null) {
        game = new Game({
            type                : _game.type,
            id                  : _gameNum,
            membersCounter      : _membersCounter,
            totalFund           : web3.utils.fromWei('' + _totalFund, 'ether'),
            status              : _status
        })
    } else {
        game.membersCounter = _membersCounter
        game.totalFund = web3.utils.fromWei('' + _totalFund, 'ether')
        game.status = _status
    }

    const gameFundsPromise = _contract.methods.getGameFunds(game.id).call()
    const gameWinNumbersPromise = _contract.methods.getGameWinNumbers(game.id).call()
    const gameWinnersPromise = _contract.methods.getGameWinners(game.id).call()

    game.funds = await gameFundsPromise
    game.winNumbers = await gameWinNumbersPromise
    game.winners = await gameWinnersPromise

    // Convert funds and winners
    for (let i = 0; i < game.funds.length; i++) {
        game.funds[i] = web3.utils.fromWei('' + game.funds[i], 'ether')
        game.winners[i] = parseInt(game.winners[i])
    }

    if (game.status == 2) game.checked = 1

    await game.save()
    return game
}

async function memberSaveOrUpdate(_game, _contract, _gameNum, _member) {

    console.log(`memberSaveOrUpdate: ${_gameNum}, ${_member}. (${_game.type})`)
    
    const gamePromise = Game.findOne({ type: _game.type, id: _gameNum })
    const memberPromise = Member.findOne({ game_type: _game.type, game_id: _gameNum, id: _member })
    const contractMemberPromise = _contract.methods.getMemberInfo(_gameNum, _member).call()

    const game = await gamePromise
    let member = await memberPromise
    const contractMember = await contractMemberPromise

    if (member === null) {
        member = new Member({
            game_type           : _game.type,
            game_id             : _gameNum,
            id                  : _member,
            prize               : web3.utils.fromWei('' + contractMember._prize, 'ether'),
            payout              : contractMember._payout
        })
    } else {
        member.address = contractMember._addr
        member.numbers = contractMember._numbers
        member.prize = web3.utils.fromWei('' + contractMember._prize, 'ether')
        member.payout = contractMember._payout
    }

    member.address = contractMember._addr
    member.numbers = contractMember._numbers

    if (game !== null && game.status == 1) {
        member.winNumbers = await _contract.methods.getGameWinNumbers(game.id).call()
        member.matchNumbers = findMatch(member.numbers, member.winNumbers)
    }

    if (game !== null && game.status == 2) {
        
        if (member.matchNumbers > _game.minWinMatch) {
            const gameFundsPromise = _contract.methods.getGameFunds(game.id).call()
            const gameWinnersPromise = _contract.methods.getGameWinners(game.id).call()

            const gameFunds = await gameFundsPromise
            const gameWinners = await gameWinnersPromise

            member.prize = gameFunds[member.matchNumbers - _game.minWinMatch] /
                           gameWinners[member.matchNumbers - _game.minWinMatch]
        } else {
            member.payout = 1
        }

    }

    if (member.payout == 1) member.checked = 1

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