const config = require('../config/config')
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
        contracts[el.type] = new web3.eth.Contract(el.contractAbi, el.contractAddress)
        if (!el.isActive) return
        setContractListeners(el.type, contracts[el.type])
    })
}

// Set listeners for contract
function setContractListeners(type, contract) {

    // Process event GameChanged
    contract.events.GameChanged({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event GameChanged started... (game_type: ${type})`)
        if (error) { console.log(error); return; }
        GameChanged(event.returnValues, type, contract)
    })

    // Process event MemberChanged
    contract.events.MemberChanged({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event MemberChanged started... (game_type: ${type})`);
        if (error) { console.log(error); return; }
        MemberChanged(event.returnValues, type, contract)
    })

}

//-------------------------------------------------------------------------------------------------//
// Events handler functions                                                                        //
//-------------------------------------------------------------------------------------------------//
async function GameChanged(res, type, contract) {
        
    let game = await Game.findOne({ type: type, id: res._gameNum })
    
    console.log('game:')
    console.log(game)
    if (game === null) {
        game = new Game({
            type                : type,
            id                  : res._gameNum,
            membersCounter      : res._membersCounter,
            totalFund           : web3.utils.fromWei('' + res._totalFund, 'ether'),
            fundJackpot         : web3.utils.fromWei('' + res._fundJackpot, 'ether'),
            fund4               : web3.utils.fromWei('' + res._fund4, 'ether'),
            fund3               : web3.utils.fromWei('' + res._fund3, 'ether'),
            fund2               : web3.utils.fromWei('' + res._fund2, 'ether'),
            status              : res._status
        })
    } else {
        game.membersCounter = res._membersCounter
        game.totalFund = web3.utils.fromWei('' + res._totalFund, 'ether')
        game.fundJackpot = web3.utils.fromWei('' + res._fundJackpot, 'ether')
        game.fund4 = web3.utils.fromWei('' + res._fund4, 'ether')
        game.fund3 = web3.utils.fromWei('' + res._fund3, 'ether')
        game.fund2 = web3.utils.fromWei('' + res._fund2, 'ether')
        game.status = res._status
    }

    // If status == 1 ("Draw") or status == 2 ("Closed") get win numbers
    if (game.status === 1 || game.status === 2) {
        const gameWinNumbers = await contract.methods.getGameWinNumbers(game.id).call()
        game.winNumers = [gameWinNumbers._n1, gameWinNumbers._n2, gameWinNumbers._n3, 
                          gameWinNumbers._n4, gameWinNumbers._n5, ]
    }
    
    // If status == 2 ("Closed") get detail info
    if (game.status == 2) {
        const gameDetail = await contract.methods.getGameDetail(game.id).call()
        game.countWinJackpot = res._countWinJackpot
        game.countWin4 = res._countWin4
        game.countWin3 = res._countWin3
        game.countWin2 = res._countWin2
    }

    game.save()

    // Определяем для какого количества совпавших номеров есть призывое фонды
    const distribFund = {}
    for (let i = 0; i < gameSettings.games.length; i++)
        if (gameSettings.games[i].type == type) {
            distribFund = gameSettings.games[i].distribFund
            break
        }

    // If status == 2 caculate matchNumbers and prize for members
    if (game.status == 2) {

        const members = await Member.find({ game_type: type, game_id: game.id })
        members.forEach((member) => {

            member.winNumbers = game.winNumbers
            member.matchNumbers = findMatch(member.numbers, member.winNumbers)
            // RRR
            for (key in distribFund) {
                if (key == member.matchNumbers)
            }


        })


    }



    
    io.emit('refreshContractData', { type: type })
}

async function MemberChanged(res, type, contract) {
    
    const memberPromise = Member.findOne({ game_type: type, game_id: res._gameNum, ticket: res._ticket })
    const contractMemberPromise = contract.methods.getMemberInfo(res._gameNum, res._ticket).call()

    let member = await memberPromise
    const contractMember = await contractMemberPromise

    console.log('member:')
    console.log(member)
    if (member === null) {                                      // New member
        member = new Member({
            game_type           : type, 
            game_id             : res._gameNum,
            ticket              : res._ticket,
            address             : contractMember._addr,
            numbers             : [contractMember._n1, contractMember._n2, contractMember._n3, contractMember._n4, contractMember._n5]
        })
    } else {                                                    // Payout
        member.prize = res._prize
        totalFund = web3.utils.fromWei('' + res._totalFund, 'ether')
        fundJackpot = web3.utils.fromWei('' + res._fundJackpot, 'ether')
        fund4 = web3.utils.fromWei('' + res._fund4, 'ether')
        fund3 = web3.utils.fromWei('' + res._fund3, 'ether')
        fund2 = web3.utils.fromWei('' + res._fund2, 'ether')
        status = res._status
    }

    /// 1) Добавить gamePromise
    /// 2) Добавить все поля если === null
    /// 3) Добавить расчёт matchNumbers и winNumbers
    /// 4) Добавить автоматически выставлять payout если игра сыграна и matchNumbers = 1 или 0, prize = 0;



    await Member.deleteOne({ game_type: type, game_id: parseInt(res._gamenum), ticket: parseInt(res._ticket) })
            
    const obj = {}
    obj.game_id = parseInt(res._gamenum)
    obj.ticket = parseInt(res._ticket)
    obj.address = res._addr.toLowerCase()
    obj.numbers = []
    obj.numbers.push(parseInt(res._n1))
    obj.numbers.push(parseInt(res._n2))
    obj.numbers.push(parseInt(res._n3))
    obj.numbers.push(parseInt(res._n4))
    obj.numbers.push(parseInt(res._n5))
    obj.matchNumbers = 0
    obj.prize = 0

    const newMember = new Member(obj)
    await newMember.save()
    io.emit('refreshContractData', { type: type })
    
}

// Synchronize contracts data (called on start serve and every day interval)
function syncData() {
        
    console.log('syncData started ...')

    gameSettings.games.forEach(el => {
        if(!el.isActive) return
        syncContractData(el.type, contracts[el.type])
    })

    async function syncContractData(type, contract) {
        
        // Обновляем игры и участников игр
		const GAME_NUM = await contract.methods.GAME_NUM().call()

		// Определяем номер последней игры в БД
		dbGames = await Game.find({type: type}).sort({ id: -1 }).limit(1)
        if(dbGames === null) return
		        
		// Очищаем в коллекиях Game, Member данные о последней игре
		await Game.deleteMany({ type: type })
		await Member.deleteMany({ game_type: type })

        for (let i = 1; i <= GAME_NUM; i++) 
            addGame(contract, type, i)
        
    }

}
// Функция чтения из контракта игры i и добавления её в коллекцию
async function addGame(contract, type, game_id) {
		    
    console.log(`addGame started ... (game_type: ${type}, game_id: ${game_id}`)
        
    const contractGameInfo = await contract.methods.getGameInfo(game_id).call()
            
        const obj = {}
        obj.winNumbers = []
        
        obj.type = type
        obj.id = game_id
        obj.totalFund = parseFloat(web3.utils.fromWei('' + contractGameInfo[0], 'ether'))
        obj.winNumbers.push(parseInt(contractGameInfo[2]))
        obj.winNumbers.push(parseInt(contractGameInfo[3]))
        obj.winNumbers.push(parseInt(contractGameInfo[4]))
        obj.winNumbers.push(parseInt(contractGameInfo[5]))
        obj.winNumbers.push(parseInt(contractGameInfo[6]))
        obj.status = parseInt(contractGameInfo[7])
        
        obj.p2 = parseFloat(web3.utils.fromWei('' + contractGameInfo[8], 'ether'))
        obj.p3 = parseFloat(web3.utils.fromWei('' + contractGameInfo[9], 'ether'))
        obj.p4 = parseFloat(web3.utils.fromWei('' + contractGameInfo[10], 'ether'))
        obj.p5 = parseFloat(web3.utils.fromWei('' + contractGameInfo[11], 'ether'))
                            
        const newGame = new Game(obj)
        newGame.save()
            
        for (let i = 1; i <= parseInt(contractGameInfo[1]); i++)
            addMember(contract, newGame, i)

}

// Функция чтения из контракта участника i, j и добавления его в коллекцию
async function addMember(contract, game, ticket) {
    
    console.log(`addMember started ... (game_type: ${game.type}, game_id: ${game.id}, ticket: ${ticket})`)
    
    const contractMemberPromise = contract.methods.getMemberInfo(game.id, ticket).call()
    await Member.deleteOne({ game_type: game.type, game_id: game.id, ticket: ticket })

    const contractMember = await contractMemberPromise

    const obj = {}
    obj.game_type = game.type
    obj.game_id = game.id
    obj.ticket = ticket
    obj.address = contractMember[0].toLowerCase()
    obj.numbers = []
    obj.numbers.push(parseInt(contractMember[2]))
    obj.numbers.push(parseInt(contractMember[3]))
    obj.numbers.push(parseInt(contractMember[4]))
    obj.numbers.push(parseInt(contractMember[5]))
    obj.numbers.push(parseInt(contractMember[6]))
    obj.winNumbers = game.winNumbers
    obj.matchNumbers = findMatch(obj.numbers, obj.winNumbers)
    obj.payout = parseInt(contractMember[8])

    if (obj.matchNumbers === 5) { obj.prize = game.p5 }
    if (obj.matchNumbers === 4) { obj.prize = game.p4 }
    if (obj.matchNumbers === 3) { obj.prize = game.p3 }
    if (obj.matchNumbers === 2) { obj.prize = game.p2 }

    const newMember = new Member(obj)
    newMember.save()

}

// Find match numbers function
function findMatch(arr1, arr2) {
    let cnt = 0
    for (let i = 0; i < arr1.length; i++)
        for (let j = 0; j < arr2.length; j++)
            if (arr1[i] === arr2[j]) { cnt++; break; }
    return cnt
}