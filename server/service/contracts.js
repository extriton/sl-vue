const config = require('../config/config')
const Game = require('../models/Game')
const Member = require('../models/Member')
const Web3 = require('web3')
const gameSettings = require('../config/game-settings.js')()
const web3 = new Web3(new Web3.providers.WebsocketProvider(gameSettings.websocketProvider))

let io = null
const contracts = {};

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
        if(!el.isActive) return
        setContractListeners(el.type, contracts[el.type])
    })

}

// Set listeners for contract
function setContractListeners(type, contract) {

    // ---------- EVENTS ----------
    // Обработка события для новой игры
    contract.events.NewGame({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event NewGame started... (game_type: ${type})`)
        if(error) { console.log(error); return; }
        NewGame(event.returnValues)
    })

    // Обработка события для нового игрока 
    contract.events.NewMember({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event NewMember started... (game_type: ${type})`);
        if(error) { console.log(error); return; }
        NewMember(event.returnValues)
    })

    // Обработка события обновления баланса игры
    contract.events.UpdateFund({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event UpdateFund started... (game_type: ${type})`)
        if(error) { console.log(error); return; }
        UpdateFund(event.returnValues)
    })

    // Обработка события обновления джекпота
    contract.events.UpdateJackpot({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event UpdateJackpot started... (game_type: ${type})`)
        if(error) { console.log(error); return; }
        const res = event.returnValues
        io.emit('updateJackpotSuccess', { new_jackpot: web3.utils.fromWei(res._jackpot, 'ether') })
    })

    // Обработка события обновления выигрышных номеров
    contract.events.WinNumbers({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event WinNumbers started... (game_type: ${type})`)
        if(error) { console.log(error); return; }
        WinNumbers(event.returnValues)        
    })

    // Обработка события выплаты по билетам
    contract.events.PayOut({ fromBlock: 'latest', toBlock: 'latest' }, (error, event) => {
        console.log(`Event PayOut started... (game_type: ${type})`)
        if(error) { console.log(error); return; }
        PayOut(event.returnValues)
    })

    // ---------- FUNCTIONS ----------
    async function NewGame(res) {
        
        const prevGameIndex = parseInt(res._gamenum) - 1
        
        const newGame = new Game({ type: type, id: res._gamenum })
        newGame.save()
        
        if(prevGameIndex === 0) return

        const contractPrevGamePromise = contract.methods.getGameInfo(prevGameIndex).call()
        const dbPrevGamePromise = Game.findOne({ type: type, id: prevGameIndex })

        const contractPrevGame = await contractPrevGamePromise
        const dbPrevGame = await dbPrevGamePromise

        dbPrevGame.type = type
        dbPrevGame.totalFund = web3.utils.fromWei(contractPrevGame[0], 'ether')
        dbPrevGame.win_numbers = []
	    dbPrevGame.win_numbers.push(parseInt(contractPrevGame[2]))
	    dbPrevGame.win_numbers.push(parseInt(contractPrevGame[3]))
	    dbPrevGame.win_numbers.push(parseInt(contractPrevGame[4]))
	    dbPrevGame.win_numbers.push(parseInt(contractPrevGame[5]))
	    dbPrevGame.win_numbers.push(parseInt(contractPrevGame[6]))
	    dbPrevGame.status = parseInt(contractPrevGame[7])
	        
	    dbPrevGame.p2 = web3.utils.fromWei(contractPrevGame[8], 'ether')
	    dbPrevGame.p3 = web3.utils.fromWei(contractPrevGame[9], 'ether')
	    dbPrevGame.p4 = web3.utils.fromWei(contractPrevGame[10], 'ether')
	    dbPrevGame.p5 = web3.utils.fromWei(contractPrevGame[11], 'ether')
        dbPrevGame.save()

        await Member.deleteMany({ game_type: type, game_id: prevGameIndex })
        for(let i = 1; i <= contractPrevGame[1]; i++)
            addMember(contract, dbPrevGame, i)
        
        setTimeout(() => { io.emit('server:updateData') }, 10 * 1000)

    }

    async function NewMember(res) {
        
        await Member.deleteOne({ game_type: type, game_id: parseInt(res._gamenum), ticket: parseInt(res._ticket) })
                
        const obj = {};
        obj.game_id = parseInt(res._gamenum)
        obj.ticket = parseInt(res._ticket)
        obj.address = res._addr.toLowerCase()
        obj.numbers = [];
        obj.numbers.push(parseInt(res._n1))
        obj.numbers.push(parseInt(res._n2))
        obj.numbers.push(parseInt(res._n3))
        obj.numbers.push(parseInt(res._n4))
        obj.numbers.push(parseInt(res._n5))
        obj.matchNumbers = 0
        obj.prize = 0

        const newMember = new Member(obj)
        await newMember.save()
        io.emit('server:updateData', {})
        
    }
    
    async function UpdateFund(res) {

        const contractGameNum = await contract.methods.GAME_NUM().call()
        const dbGame = await Game.findOne({ type: type, id: contractGameNum})
        
        dbGame.totalFund = web3.utils.fromWei('' + res._fund, 'ether')
        dbGame.save()
        io.emit('updateFundSuccess', { new_fund: dbGame.totalFund })

    }

    async function WinNumbers(res) {
        
        const dbGame = await Game.findOne({ type: type, id: res._gamenum})
        dbGame.win_numbers = []
        dbGame.win_numbers.push(parseInt(res._n1))
        dbGame.win_numbers.push(parseInt(res._n2))
        dbGame.win_numbers.push(parseInt(res._n3))
        dbGame.win_numbers.push(parseInt(res._n4))
        dbGame.win_numbers.push(parseInt(res._n5))
        await dbGame.save()
        
        io.emit('updateWinNumbersSuccess', { win_numbers: dbGame.win_numbers })
                    
        // Find match numbers
        const dbMembers = await Member.find({ game_type: type, game_id: dbGame.id })
        for(let i = 0; i < dbMembers.length; i++) {
            let mn = findMatch(game.win_numbers, members[i].numbers)
            dbMembers[i].matchNumbers = mn
            dbMembers[i].save()
        }

    }
    
    async function PayOut(res) {
        
        const dbMember = await Member.findOne({ game_type: type, game_id: res._gamenum, ticket: res._ticket })
        dbMember.prize = web3.utils.fromWei(res._prize, 'ether')
        dbMember.payout = parseInt(res._payout)
        dbMember.save()
        io.emit('server:updateData')
        
    }
    
}

function syncData() {
        
    console.log('syncData started ...')

    gameSettings.games.forEach(el => {
        if(!el.isActive) return
        syncContractData(el.type, contracts[el.type])
    })

    async function syncContractData(type, contract) {
        
        // Обновяем игры и участников игр
		const GAME_NUM = await contract.methods.GAME_NUM().call()

		// Определяем номер последней игры в БД
		dbGames = await Game.find({type: type}).sort({ id: -1 }).limit(1)
        if(dbGames === null) return
		        
		// Очищаем в коллекиях Game, Member данные о последней игре
		await Game.deleteMany({ type: type })
		await Member.deleteMany({ game_type: type })

        for(let i = 1; i <= GAME_NUM; i++) 
            addGame(contract, type, i)
        
    }

}
// Функция чтения из контракта игры i и добавления её в коллекцию
async function addGame(contract, type, game_id) {
		    
    console.log(`addGame started ... (game_type: ${type}, game_id: ${game_id}`)
        
    const contractGameInfo = await contract.methods.getGameInfo(game_id).call()
            
        const obj = {}
        obj.win_numbers = []
        
        obj.type = type
        obj.id = game_id
        obj.totalFund = parseFloat(web3.utils.fromWei('' + contractGameInfo[0], 'ether'))
        obj.win_numbers.push(parseInt(contractGameInfo[2]))
        obj.win_numbers.push(parseInt(contractGameInfo[3]))
        obj.win_numbers.push(parseInt(contractGameInfo[4]))
        obj.win_numbers.push(parseInt(contractGameInfo[5]))
        obj.win_numbers.push(parseInt(contractGameInfo[6]))
        obj.status = parseInt(contractGameInfo[7])
        
        obj.p2 = parseFloat(web3.utils.fromWei('' + contractGameInfo[8], 'ether'))
        obj.p3 = parseFloat(web3.utils.fromWei('' + contractGameInfo[9], 'ether'))
        obj.p4 = parseFloat(web3.utils.fromWei('' + contractGameInfo[10], 'ether'))
        obj.p5 = parseFloat(web3.utils.fromWei('' + contractGameInfo[11], 'ether'))
                            
        const newGame = new Game(obj)
        newGame.save()
            
        for(let i = 1; i <= parseInt(contractGameInfo[1]); i++)
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
    /* obj.prize = parseFloat(web3.utils.fromWei(contractMember[7], 'ether')) */
    obj.payout = parseInt(contractMember[8])
    obj.matchNumbers = findMatch(game.win_numbers, obj.numbers)

    if(obj.matchNumbers === 5) { obj.prize = game.p5 }
    if(obj.matchNumbers === 4) { obj.prize = game.p4 }
    if(obj.matchNumbers === 3) { obj.prize = game.p3 }
    if(obj.matchNumbers === 2) { obj.prize = game.p2 }

    const newMember = new Member(obj)
    newMember.save()

}

// Find match numbers function
function findMatch(arr1, arr2) {
    let cnt = 0
    for(let i = 0; i < arr1.length; i++)
        for(let j = 0; j < arr2.length; j++)
            if(arr1[i] === arr2[j]) { cnt++; break; }
    return cnt
}