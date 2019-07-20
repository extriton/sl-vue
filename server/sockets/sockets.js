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

      socket.on('getPlayerHistory', data => { getPlayerHistory(data, socket) })
        
    })
}

// Return game data by game type to client socket
async function getGameData(data, socket) {
  
  if (!data.type) return

  const lastGame = await Game.findOne({ type: data.type }).sort({ id: -1 })
  
  const fundsSize = lastGame.funds.length
  const result = {
    GameNum: lastGame.id,
    Jackpot: lastGame.funds[fundsSize - 1],
    Fund: lastGame.totalFund,
    Status: lastGame.status
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
  const historyPromise = Game.find({ type: data.type }).sort({ id: -1 }).skip((data.page - 1) * 10).limit(10)

  const historyCount = await historyCountPromise
  const history = await historyPromise
  
  const result = {
    HistoryCount: historyCount,
    History: history
  }

  socket.emit('getGameHistorySuccess', result)
}

// Return player data by game type & player address to client socket
async function getPlayerHistory(data, socket) {

  if (!data.type) {
    console.log(`getPlayerHistory: Invalid data`)
    return
  }

  if (data.address === undefined) data.address = ''
  if (typeof data.address === 'string') data.address.toLowerCase()

  try {
    data.page = parseInt(data.page)
  } catch(e) {
    data.page = 1
  }

  const historyCountPromise = Member.countDocuments({ game_type: data.type, address: data.address })
  const historyPromise = Member.find({ game_type: data.type, address: data.address }).sort({ game_id: -1, ticket: 1 }).skip((data.page - 1) * 10).limit(10)

  const historyCount = await historyCountPromise
  const history = await historyPromise

  // Loop tickets
  for(let i = 0; i < history.length; i++) {
    // Loop ticket numbers and change numeric array to array of obects
    for(let j = 0; j < history[i].numbers.length; j++) {
      let tmp = {
        num: history[i].numbers[j],
        match: (history[i].winNumbers.indexOf(history[i].numbers[j]) === -1) ? false : true
      }
      history[i].numbers[j] = tmp
    }
  }

  const result = {
    HistoryCount: historyCount,
    History: history
  }

  socket.emit('getPlayerHistorySuccess', result)

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