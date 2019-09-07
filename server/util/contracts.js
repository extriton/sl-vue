const gameSettings = require('../../config/server/game-settings-server')
const util = require('./util')
const Game = require('../models/Game')
const Member = require('../models/Member')
const Web3 = require('web3')
const web3 = new Web3(gameSettings.websocketProvider)

const drawAllContracts = require('./drawing').drawAllContracts

let io = null

module.exports = {
    init                    : init,
    setListeners            : setListeners,
    syncAllContracts        : syncAllContracts,
    drawAllContracts        : drawAllContracts
}

//-------------------------------------------------------------------------------------------------//
// Init contracts data
//-------------------------------------------------------------------------------------------------//
async function init() {

    // Define contracts connections and init contract phases
    for (let i = 0; i < gameSettings.games.length; i++) {
        const game = gameSettings.games[i]
        game.contract = new web3.eth.Contract(game.contractAbi, game.contractAddress)
        game.currentNum = util.getCurrentGameNum(game, game.contract)
        game.phase = 'ready'
        game.txCounter = 0
    }

}

//-------------------------------------------------------------------------------------------------//
// Set listeners for all contracts
//-------------------------------------------------------------------------------------------------//
function setListeners(_io) {
    
    // Check contracts.init() call
    if (gameSettings.games[0].contract === undefined) {
        console.log(`setListeners...  Error: contracts.init() not called!`)
        return
    }
    
    io = _io

    gameSettings.games.forEach(_game => {
        setContractListeners(_game, _game.contract)
    })

    // Set listeners for contract
    function setContractListeners(_game, _contract) {

        // Process event GameChanged
        _contract.events.GameChanged({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
            console.log(`Event GameChanged started... (game_type: ${_game.type})`)
            if (error) { console.log(error); return }
            GameChanged(_game, _contract, event.returnValues)
        })

        // Process event MemberChanged
        _contract.events.MemberChanged({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
            console.log(`Event MemberChanged started... (game_type: ${_game.type})`);
            if (error) { console.log(error); return; }
            MemberChanged(_game, _contract, event.returnValues)
        })

    }

}

//-------------------------------------------------------------------------------------------------//
// Synchronize all contracts data (called on start serve and throw interval)
//-------------------------------------------------------------------------------------------------//
async function syncAllContracts(clear = false) {

    // Check contracts.init() call
    if (gameSettings.games[0].contract === undefined) {
        console.log(`syncAllContracts...  Error: contracts.init() not called!`)
        return
    }

    // Clear games and members data if 'clear' === true
    if (clear) {
        console.log(`Clearing Game and Member collection data`)
        await Game.deleteMany()
        await Member.deleteMany()
    }
        
    gameSettings.games.forEach(_game => {
        syncContract(_game, _game.contract)
    })

}

//-------------------------------------------------------------------------------------------------//
// Synchronize contract data
//-------------------------------------------------------------------------------------------------//
async function syncContract(_game, _contract) {
    console.log(`syncContract started... (${_game.type})`)

    // Get contract last game, database games and define games array
    const lastGameContract = await _contract.methods.getGameInfo(0).call()
    const arrGames = new Array(parseInt(lastGameContract._gamenum))
    const dbGames = await Game.find({ type: _game.type })

    // Init arrGames
    for (let i = 0; i < arrGames.length; i++)
        arrGames[i] = { membersCounter: 0, members: [], status: 0 }

    // Move db games data to array games
    for (let i = 0; i < dbGames.length; i++) {
        arrGames[dbGames[i].id - 1].membersCounter = dbGames[i].membersCounter
        arrGames[dbGames[i].id - 1].status = dbGames[i].status
    }

    // Loop arrGames and save needed games
    for (let i = 0; i < arrGames.length; i++) {
        if (arrGames[i].status !== 2) {
            const savedGame = await saveGame(_game, _contract, i + 1)
            arrGames[i].membersCounter = savedGame.membersCounter
            arrGames[i].status = savedGame.status
        }
        arrGames[i].members = new Array(arrGames[i].membersCounter)
        for (let j = 0; j < arrGames[i].members.length; j++)
            arrGames[i].members[j] = 0
    }

    // Get members data for current game
    const dbMembers = await Member.find({ game_type: _game.type })
    for (let i = 0; i < dbMembers.length; i++)
        arrGames[dbMembers[i].game_id - 1].members[dbMembers[i].id - 1] = dbMembers[i].payout

    // Loop arrGames and save needed memebers
    for (let i = 0; i < arrGames.length; i++)
        for (let j = 0; j < arrGames[i].membersCounter; j++)
            if (arrGames[i].members[j] !== 1)
                saveMember(_game, _contract, i + 1, j + 1)

}

//-------------------------------------------------------------------------------------------------//
// Events handler functions                                                                        //
//-------------------------------------------------------------------------------------------------//
async function GameChanged(_game, _contract, res) {
    console.log(`Game ${res._gameNum} changed. (${_game.type})`)

    // 0 - New game
    if (res._action === 0) {
        syncContract(_game, _contract)
    }

    // 1 - Change status or 2 - Change Jackpot
    if (res._action === 1 || res._action === 2) {
        await saveGame(_game, _contract, res._gameNum)
    }
    
    const runTimer = (res._action === 0) ? true : false
    io.emit('refreshContractData',  { type: _game.type, runTimer: runTimer })

}

async function MemberChanged(_game, _contract, res) {
    console.log(`Member ${res._gameNum}, ${res._member} changed. (${_game.type})`)
    
    await saveMember(_game, _contract, res._gameNum, res._member)

    io.emit('refreshContractData', { type: _game.type })

}

async function saveGame(_game, _contract, id) {

    console.log(`SaveGame... id: ${id} (${_game.type})`)

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

    let game = await Game.findOne({ type: _game.type, id: id })
    if (game === null) { 
        game = new Game()
        game.type               = _game.type
        game.id                 = gameInfo._gamenum
        game.winNumbers         = new Array(_game.reqNumbers).fill(0)
        game.funds              = new Array(_game.arrSize).fill(0)
        game.winners            = new Array(_game.arrSize).fill(0)
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

async function saveMember(_game, _contract, game_id, id) {
    
    console.log(`SaveMember... game_id: ${game_id}, id: ${id} (${_game.type})`)
    
    await Member.deleteOne({ game_type: _game.type, game_id: game_id, id: id })
    const memberInfoPromise = _contract.methods.getMemberInfo(game_id, id).call()
    const gamePromise = Game.findOne({ type: _game.type, id: game_id })

    const memberInfo = await memberInfoPromise
    const game = await gamePromise

    const member = new Member()
    
    member.game_type        = _game.type
    member.game_id          = game_id
    member.id               = id
    member.address          = memberInfo._addr.toLowerCase()
    member.numbers          = memberInfo._numbers
    member.prize            = parseFloat(web3.utils.fromWei('' + memberInfo._prize, 'ether'))
    member.payout           = memberInfo._payout

    if (game.status > 0) {
        member.winNumbers       = game.winNumbers
        member.matchNumbers     = util.findMatch(memberInfo._numbers, game.winNumbers)
    }

    const matchIndex = member.matchNumbers - _game.minWinMatch
    if (game.status === 2 && member.payout === 0 && matchIndex >= 0) {
        member.prize = game.funds[matchIndex] / game.winners[matchIndex]
    }

    if (game.status === 2 && member.payout === 0 && member.prize === 0) {
        member.payout = 1
    }
    
    await member.save()

    return member
}
