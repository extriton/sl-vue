const config = require('../config/config')
const Game = require('../models/Game')
const Member = require('../models/Member')
const Web3 = require('web3')
const gameSettings = require('../config/game-settings.js')()
const web3 = new Web3(new Web3.providers.WebsocketProvider(gameSettings.websocketProvider))

let io = null
const contracts = {};

module.exports = {
    setListeners:  setListeners
}

// Set listeners for all contracts
function setListeners(_io) {
    console.log('contracts.setListeners started...')
    io = _io
    
    gameSettings.games.forEach(el => {
        contracts[el.type] = new web3.eth.Contract(el.contractAbi, el.contractAddress)
        setContractListeners(contracts[el.type])
    })

}

// Set listeners for contract
function setContractListeners(contract) {

    // Обработка события для новой игры
    contract.events.NewGame({ fromBlock: 'latest', toBlock: 'latest' }, function(error, event) {
        
        console.log('Event NewGame started ...')
        
        if(error) { 
            console.log(error)
            return
        }
        
        const res = event.returnValues
        const prev_game = parseInt(res._gamenum) - 1
        
        const game = new Game({ id: res._gamenum })
        game.save()
        
        if(prev_game === 0) return

        // Вычитываем из контракта новое состояние предыдущей игры
        contract.methods.getGameInfo(prev_game).call().then(function(result) {
            
            Game.findOne({ id: prev_game }).exec(function(err, game) {
                
                game.totalFund = web3.utils.fromWei(result[0], 'ether')
                game.win_numbers = []
	            game.win_numbers.push(parseInt(result[2]))
	            game.win_numbers.push(parseInt(result[3]))
	            game.win_numbers.push(parseInt(result[4]))
	            game.win_numbers.push(parseInt(result[5]))
	            game.win_numbers.push(parseInt(result[6]))
	            game.status = parseInt(result[7])
	        
	            game.p2 = web3.utils.fromWei(result[8], 'ether')
	            game.p3 = web3.utils.fromWei(result[9], 'ether')
	            game.p4 = web3.utils.fromWei(result[10], 'ether')
	            game.p5 = web3.utils.fromWei(result[11], 'ether')
	            
	            game.save(function(err, res) {
	                
                    Member.remove({ game_id: prev_game }).exec(function(err, res) {
                        for(let i = 1; i <= result[1]; i++)
                            addMember(contract, prev_game, i, game)
                    })
                    
                    setTimeout(function() { io.emit('server:updateData', {}) }, 10 * 1000)

	            })

            })

        })
        
    })

    // Обработка события для нового игрока 
    contract.events.NewMember({ fromBlock: 'latest', toBlock: 'latest' }, function(error, event) {
        
        console.log('Event NewMember started ...');
        
        if(error) {
            console.log(error)
            return
        }
        
        const res = event.returnValues
        
        Member.findOne({ game_id: parseInt(res._gamenum), ticket: parseInt(res._ticket) }).exec(function(err, member) {
                
            console.log(member)
            if(err || member !== null) return
        
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

            const member = new Member(obj)
            member.save(function(err, res) {
            
                if(error) {
                    console.log(error)
                    return
                }    

                io.emit('server:updateData', {})
            })
        
        })
        
    })
    
    // Обработка события обновления баланса игры
    contract.events.UpdateFund({ fromBlock: 'latest', toBlock: 'latest' }, function(error, event) {
        
        console.log('Event UpdateFund started ...')
        
        if(error) {
            console.log(error)
            return
        }
        
        const res = event.returnValues
        contract.methods.GAME_NUM().call().then(function(result) {
            Game.findOne({ id: result}).exec(function(err, game) {
                const new_fund = web3.utils.fromWei(res._fund, 'ether')
                game.totalFund = new_fund
                game.save(function(err, res) {
                    if(err) return
                    io.emit('updateFundSuccess', { new_fund: new_fund })
                })
            
            })
        })

    })

    
    // Обработка события обновления джекпота
    contract.events.UpdateJackpot({ fromBlock: 'latest', toBlock: 'latest' }, function(error, event) {
        
        console.log('Event UpdateJackpot started ...')
        
        if(error) {
            console.log(error)
            return
        }
        
        const res = event.returnValues
        const new_jackpot = web3.utils.fromWei(res._jackpot, 'ether')
        io.emit('updateJackpotSuccess', { new_jackpot: new_jackpot })
        
    })

    // Обработка события обновления выигрышных номеров
    contract.events.WinNumbers({ fromBlock: 'latest', toBlock: 'latest' }, function(error, event) {
        
        console.log('Event WinNumbers started ...')
        
        if(error) {
            console.log(error)
            return
        }
        
        const res = event.returnValues
        
        Game.findOne({ id: res._gamenum}).exec(function(err, game) {
            game.win_numbers = []
            game.win_numbers.push(parseInt(res._n1))
            game.win_numbers.push(parseInt(res._n2))
            game.win_numbers.push(parseInt(res._n3))
            game.win_numbers.push(parseInt(res._n4))
            game.win_numbers.push(parseInt(res._n5))
            game.save(function(err, res) {
                if(err) return
                io.emit('updateWinNumbersSuccess', { win_numbers: game.win_numbers })
                    
                // Find match numbers
                Member.find({ game_id: game.id }).exec(function(err, members) {
                    for(let i = 0; i < members.length; i++) {
                        let mn = findMatch(game.win_numbers, members[i].numbers)
                        members[i].matchNumbers = mn
                        members[i].save()
                    }
                })

            })
            
        })

    })
    
    // Обработка события выплаты по билетам
    contract.events.PayOut({ fromBlock: 'latest', toBlock: 'latest' }, function(error, event) {
        
        console.log('Event PayOut started ...')
        
        if(error) {
            console.log(error)
            return
        }
        
        const res = event.returnValues
        
        Member.findOne({ game_id: res._gamenum, ticket: res._ticket }).exec(function(err, ticket) {
            
            ticket.prize = web3.utils.fromWei(res._prize, 'ether')
            ticket.payout = parseInt(res._payout)
            ticket.save(function(err, res) {
                app.io.emit('server:updateData', {})
            })
            
        })
        
    })
    
}
    
// Функция чтения из контракта участника i, j и добавления его в коллекцию
function addMember(contract, i, j, game) {
    
    console.log('addMember started ... ' + i + ', ' + j)
    
    contract.methods.getMemberInfo(i, j).call().then(function(result) {
        
        Member.findOne({ game_id: i, ticket: j }).exec(function(err, member) {
            
            if(err || member !== null) return
        
            let mn = 0;                            
        
            const obj = {}
            obj.game_id = i
            obj.ticket = j
            obj.address = result[0].toLowerCase()
            obj.numbers = []
            obj.numbers.push(parseInt(result[2]))
            obj.numbers.push(parseInt(result[3]))
            obj.numbers.push(parseInt(result[4]))
            obj.numbers.push(parseInt(result[5]))
            obj.numbers.push(parseInt(result[6]))
            obj.prize = parseFloat(web3.utils.fromWei(result[7], 'ether'))
            obj.payout = parseInt(result[8])
        
            mn = findMatch(game.win_numbers, obj.numbers)
            obj.matchNumbers = mn

            if(mn === 5) { obj.prize = game.p5 }
            if(mn === 4) { obj.prize = game.p4 }
            if(mn === 3) { obj.prize = game.p3 }
            if(mn === 2) { obj.prize = game.p2 }

            const member = new Member(obj)
            member.save()
        
        })
    
    })

}

// Find match numbers function
function findMatch(arr1, arr2) {
    
    let cnt = 0
    for(let i = 0; i < arr1.length; i++) {
        for(let j = 0; j < arr2.length; j++) {
            if(arr1[i] === arr2[j]) {
                cnt++
                break
            }
        }
    }
    
    return cnt

}