const Game = require('../models/Game.js')
const Member = require('../models/Member.js')
const Ip = require('../models/Ip.js')

const Web3 = require('web3')
const gameSettings = require('../config/game-settings.js')()
const web3 = new Web3(new Web3.providers.WebsocketProvider(gameSettings.websocketProvider))

const IPs = []

// Export function
module.exports = io => {
    io.sockets.on('connection', socket => {

      const realSocketIP = getRealSocketIP(socket)
      if(realSocketIP !== '') addSocketIP(realSocketIP)

      socket.on('disconnect', () => {
        if(realSocketIP !== '') removeSocketIP(realSocketIP)
      })

      socket.on('getGameData', data => { getGameData(data, socket) })

      socket.on('getGameHistory', data => { getGameHistory(data, socket) })

      socket.on('getPlayerData', data => { getPlayerData(data, socket) })
        
    })
}

// Return game data by game type to client socket
async function getGameData(data, socket) {
  
  if (!data.type) return

  // Define game by type
  let game = null
  for(let i = 0; i < gameSettings.games.length; i++)
    if(gameSettings.games[i].type === data.type) {
      game = gameSettings.games[i]
      break
    }
  
  // If game type not found in settings
  if(game === null) {
    console.log(`Game type ${data.type} not found ib games settings`)
    return
  }

  // Check game status (isActive)
  if(!game.isActive) {
    console.log(`Game type ${data.type} is not active`)
    return
  }
  
  const contract = new web3.eth.Contract(game.contractAbi, game.contractAddress)
  
  const jackpotPromise = contract.methods.JACKPOT().call()
  const lastGamePromise = Game.findOne({ type: data.type }).sort({ id: -1 })

  let Jackpot = await jackpotPromise
  Jackpot = web3.utils.fromWei('' + Jackpot, 'ether')

  const lastGame = await lastGamePromise

  const result = {
    GameNum: lastGame.id,
    Jackpot: Jackpot,
    Fund: lastGame.totalFund
  }

  socket.emit('getGameDataSuccess', result)

}

// Return game history by game type to client socket
async function getGameHistory(data, socket) {

  if (!data.type) return

  try {
    data.page = parseInt(data.page)
  } catch(e) {
    data.page = 1
  }

  const historyCountPromise = Game.countDocuments({ type: data.type })
  const historyPromise = Game.find({ type: data.type }).skip((data.page - 1) * 10).limit(10)

  const historyCount = await historyCountPromise
  const history = await historyPromise

  // Заглушка для эмуляции 35 позиций в истории
  const tmpCount = 36
  const tmpHistory = []
  for (let i = 1; i <= tmpCount; i++) 
    tmpHistory.push({
      type: 'w5x36',
      id: i,
      winNumbers: [ i, i+1, i+2, i+3, i+4 ],
      totalFund: i * 100,
      p5: 0,
      p4: 0,
      p3: 0,
      p2: 0,
      status: 1,
    })

  for (var i = 0; i < tmpHistory.length; i++) {
    tmpHistory[i].id = i + 1
    tmpHistory[i].totalFund += i * 100
  }
  
  tmpHistory[tmpCount-1].winNumbers = [ 0, 0, 0, 0, 0 ]
  tmpHistory.reverse()
  const tmp = tmpHistory.splice((data.page - 1) * 10, 10) 
  
  const result = {
    HistoryCount: tmpCount,
    History: tmp
  }

  socket.emit('getGameHistorySuccess', result)
}

/*
[ { type: 'w5x36',
    id: 1,
    winNumbers: [ 0, 0, 0, 0, 0 ],
    totalFund: 0.1105,
    p5: 0,
    p4: 0,
    p3: 0,
    p2: 0,
    status: 1,
    _id: 5d2c65ce35d49532508f6495,
    created: 2019-07-15T11:38:54.144Z,
    __v: 0 } ]
*/

// Return player data by game type & player address to client socket
async function getPlayerData(data, socket) {

  if(!data.type || !data.address) {
    console.log(`getPlayerData: Invalid data`)
    return
  }

  if(!data.page) data.page = 1

  const countPromise = Member.find({ game_type: data.type, address: data.address.toLowerCase() }).count()
  const ticketsPromise = Member.find({ game_type: data.type, address: data.address.toLowerCase() })
                                .sort({ game_id: -1, ticket: 1 }).skip((parseInt(data.page) - 1)*10).limit(10)

  const count = await countPromise
  const tickets = await ticketsPromise

  let ticketsCount = tickets.length
  // Loop tickets
  for(let i = 0; i < tickets.length; i++) {
    // Loop ticket numbers and change numeric array to array of obects
    for(let j = 0; j < tickets[i].numbers.length; j++) {
      let tmp = {
        num: tickets[i].numbers[j],
        match: (tickets[i].winNumbers.indexOf(tickets[i].numbers[j]) === -1) ? false : true
      }
      tickets[i].numbers[j] = tmp
    }
  }

  socket.emit('getPlayerDataSuccess', { tickets: tickets, page_max: Math.ceil(count / 10) })

}

// Add socket IP to IPs array and DB
function addSocketIP(socketIP) {
  // Search socketIP in IPs array
  if(IPs.indexOf(socketIP) === -1) {
    // Add in IPs array
    IPs.push(socketIP)
    // Add in DB
    Ip.findOne({ ip: socketIP }).exec((err, ip) => {
        if(err) return
        
        if(!ip) {
            ip = new Ip({
                ip: socketIP,
                cnt: 1,
                updated: new Date()
            })
            ip.save()
        } else {
            ip.cnt = ip.cnt + 1
            ip.updated = new Date()
            ip.save()
        }
    })
  }

}

// Remove socket IP from IPs array
function removeSocketIP(socketIP) {
  if(IPs.indexOf(socketIP) !== -1) {
    let pos = IPs.indexOf(socketIP)
    IPs.splice(pos, 1);
  }
}

// Return real socket IP
function getRealSocketIP(socket) {
        
  let origin_client_ip = ''
  const x_forwarded_for = []
  
  if(socket.handshake.headers['x-forwarded-for']) {
      x_forwarded_for = socket.handshake.headers['x-forwarded-for'].split(', ')
      origin_client_ip = x_forwarded_for[0]
  } else {
      origin_client_ip = socket.handshake.address
  }
  
  return origin_client_ip

}