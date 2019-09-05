const gameSettings = require('../../config/server/game-settings-server')()
const Game = require('../models/Game')
const Member = require('../models/Member')
const Web3 = require('web3')
const web3 = new Web3(gameSettings.websocketProvider)

let io = null
const contracts = {}

module.exports = {
    setListeners            : setListeners,
    syncAllContracts        : syncAllContracts
}

//-------------------------------------------------------------------------------------------------//
// Set listeners for all contracts
//-------------------------------------------------------------------------------------------------//
function setListeners(_io) {
    io = _io

    gameSettings.games.forEach(_game => {
        if (!_game.isActive) return
        contracts[_game.type] = new web3.eth.Contract(_game.contractAbi, _game.contractAddress)
        setContractListeners(_game, contracts[game.type])
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
function syncAllContracts(clear = false) {

    // Clear games and members data if 'clear' === true
    if (clear) {
        console.log(`Clearing Game and Member collection data`)
        await Game.deleteMany({ type: _game.type })
        await Member.deleteMany({ game_type: _game.type })
    }
        
    gameSettings.games.forEach(_game => {
        if(!_game.isActive) return
        contracts[_game.type] = new web3.eth.Contract(_game.contractAbi, _game.contractAddress)
        syncContract(_game, contracts[_game.type], clear)
    })

}

//-------------------------------------------------------------------------------------------------//
// Synchronize contract data
//-------------------------------------------------------------------------------------------------//
async function syncContract(_game, _contract) {
    console.log(`syncContract started... (${_game.type})`)

    // Get contract last game, database games and define games array
    const lastGameContract = await _contract.methods.getGameInfo(0).call()
    const arrGames = new Array(lastGameContract).fill({ membersCounter: 0, members: [], status: 0 })
    const dbGames = await Game.find({ type: _game.type })

    // Move db games data to array games
    dbGames.forEach(dbGame => {
        arrGames[dbGame.id - 1].membersCounter = dbGame.membersCounter
        arrGames[dbGame.id - 1].status = dbGame.status
    })

    // Loop arrGames and save needed games
    for (let i = 0; i < arrGames.length; i++) {
        if (arrGame[i].status !== 2) {
            const savedGame = await saveGame(_game, _contract, i + 1)
            arrGame[i].membersCounter = savedGame.membersCounter
            arrGame[i].status = savedGame.status
        }
        arrGame[i].members = new Array(arrGame[i].membersCounter).fill({ payout: 0 })
    }

    // Get members data for current game
    const dbMembers = await Member.find({ type: _game.type })
    dbMembers.forEach(dbMember => {
        arrGame[dbMember.game_id - 1].members[dbMember.id - 1].payout = dbMember.payout
    })

    // Loop arrGames and save needed memebers
    for (let i = 0; i < arrGames.length; i++)
        for (let j = 0; j < arrGames[i].membersCounter; j++)
            if (arrGame[i].members[j].payout !== 1)
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
    
    const game = await saveGame(_game, _contract, res._gameNum)
    await saveMember(_game, _contract, res._gameNum, res._member, game)

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
    
    let isNew = false 
    if (game === null) { 
        game = new Game()
        isNew = true
    }

    // Если прокрутка игры произошла в drawing период то выставляем blocked новой игры в true
    // и запускаем таймер для изменения этого статуса после drawing
    let timeToEndDrawing = isDrawing(_game)

    if (isNew) {
        game.type               = _game.type
        game.id                 = gameInfo._gamenum
        game.winNumbers         = new Array(_game.reqNumbers).fill(0)
        game.funds              = new Array(_game.arrSize).fill(0)
        game.winners            = new Array(_game.arrSize).fill(0)

        if (timeToEndDrawing > 0) {
            setTimeout(() => {
                game.save(() => {
                    io.emit('refreshContractData', { type: _game.type, runTimer: true })    
                })
            }, timeToEndDrawing * 1000)
        }

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
        member.matchNumbers     = findMatch(memberInfo._numbers, game.winNumbers)
    }

    const matchIndex = member.matchNumbers - _game.minWinMatch
    if (game.status == 2 && member.payout == 0 && matchIndex >= 0)
        member.prize = game.funds[matchIndex] / game.winners[matchIndex]
    
    await member.save()

    return member
}

// Check drawing time or no
function isDrawing(_game) {

    const SEC_IN_DAY = 24 * 60 * 60                                     // 86 400
    const now = new Date()

    let isWeeklyGame = (_game.drawDow >= 0 && _game.drawDow <= 6) ? true : false

    let timeToDraw = (_game.drawHour * 60 + _game.drawMinute) * 60
    let timeCurrent = (now.getUTCHours() * 60 + now.getUTCMinutes()) * 60 + now.getUTCSeconds()
    if (isWeeklyGame) {
        timeToDraw += _game.drawDow * SEC_IN_DAY
        timeCurrent += now.getUTCDay() * SEC_IN_DAY
    }

    // If drawing period, return time to end drawing, Else return 0
    if(timeCurrent > (timeToDraw - _game.preDrawPeriod * 60) && timeCurrent < (timeToDraw + _game.postDrawPeriod * 60))
        return (timeToDraw + _game.postDrawPeriod * 60 - timeCurrent)
    else
        return 0
}

// Find match numbers function
function findMatch(arr1, arr2) {
    let cnt = 0
    for (let i = 0; i < arr1.length; i++)
        for (let j = 0; j < arr2.length; j++)
            if (arr1[i] === arr2[j]) { cnt++; break; }
    return cnt
}