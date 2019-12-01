const gameSettings = require('../../config/server/game-settings-server')

const Game = require('../models/Game.js')
const Member = require('../models/Member.js')
const Ip = require('../models/Ip.js')

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

      socket.on('getAdminData', data => { getAdminData(data, socket) })
        
    })
}

// Return game data by game type to client socket
async function getGameData(data, socket) {

  console.log('getGameData socket called')
  
  if (!data.type) return

  // Define game settings by type
  let _game = null
  for (let i = 0; i < gameSettings.games.length; i++)
    if (gameSettings.games[i].type == data.type) {
      _game = gameSettings.games[i]
      break
    }
  
  const lastGame = await Game.findOne({ type: data.type, id: _game.currentNum })
  if (lastGame === null) return

  const fundsSize = lastGame.funds.length
  const result = {
    GameNum: lastGame.id,
    Jackpot: lastGame.funds[fundsSize - 1],
    Fund: lastGame.totalFund,
    Phase: _game.phase,
    Status: lastGame.status
  }

  socket.emit('getGameDataSuccess', result)

}

// Return game history by game type to client socket
async function getGameHistory(data, socket) {

  if (!data.type) {
    console.log(`getPlayerHistory: Invalid data`)
    return
  }

  try {
    data.page = parseInt(data.page)
  } catch(e) {
    data.page = 1
  }

  // Define game settings by type
  let _game = null
  for (let i = 0; i < gameSettings.games.length; i++)
    if (gameSettings.games[i].type == data.type) {
      _game = gameSettings.games[i]
      break
    }
  
  const historyCountPromise = Game.countDocuments({ type: data.type, id: { $lt: _game.currentNum } })
  const historyPromise = Game.find({ type: data.type, id: { $lt: _game.currentNum } }).sort({ id: -1 }).skip((data.page - 1) * 10).limit(10)

  const historyCount = await historyCountPromise
  const history = await historyPromise

  const result = {
    HistoryCount: 0,
    History: []
  }
  
  result.HistoryCount = historyCount
  for (let i = 0; i < history.length; i++)
    result.History.push({
      type            : history[i].type,
      id              : history[i].id,
      membersCounter  : history[i].membersCounter,
      winNumbers      : history[i].winNumbers,
      totalFund       : history[i].totalFund,
      funds           : history[i].funds,
      winners         : history[i].winners,
      status          : history[i].status
    })
  socket.emit('getGameHistorySuccess', result)
}

// Return player data by game type & player address to client socket
async function getPlayerHistory(data, socket) {

  if (!data.type) {
    console.log(`getPlayerHistory: Invalid data`)
    return
  }

  if (data.address === undefined) data.address = ''
  if (typeof data.address === 'string') data.address = data.address.toLowerCase()

  try {
    data.page = parseInt(data.page)
  } catch(e) {
    data.page = 1
  }

  const historyCountPromise = Member.countDocuments({ game_type: data.type, address: data.address })
  const historyPromise = Member.find({ game_type: data.type, address: data.address }).sort({ game_id: -1, id: 1 }).skip((data.page - 1) * 10).limit(10)
  
  const historyCount = await historyCountPromise
  const history = await historyPromise
  
  const result = {
    HistoryCount: historyCount,
    History: [],
  }

  // Copy and transform history data
  for (let i = 0; i < history.length; i++)
    result.History.push({
      game_type       : history[i].game_type,
      game_id         : history[i].game_id,
      id              : history[i].id,
      numbers         : history[i].numbers,
      winNumbers      : history[i].winNumbers,
      matchNumbers    : history[i].matchNumbers,
      prize           : history[i].prize,
      payout          : history[i].payout
    })

  // Loop tickets
  for(let i = 0; i < result.History.length; i++) {
    // Loop ticket numbers and change numeric array to array of obects
    for(let j = 0; j < result.History[i].numbers.length; j++) {
      const match = (result.History[i].winNumbers.indexOf(result.History[i].numbers[j]) === -1) ? false : true
      const tmp = {
        num: result.History[i].numbers[j],
        match: match
      }
      result.History[i].numbers[j] = tmp
    }
  }

  socket.emit('getPlayerHistorySuccess', result)
}

// Return data for admin page
async function getAdminData(data, socket) {
  // Date From
  let dateFrom = new Date(data.dateFrom)
  dateFrom.setHours(0, 0, 0, 0)
  dateFrom = dateFrom.toISOString()
  // Date To
  let dateTo = new Date(data.dateTo)
  dateTo.setHours(23, 59, 59, 0)
  dateTo = dateTo.toISOString()
  // Query
  const query = {}
  query.created = { $gte: dateFrom, $lte: dateTo};

  const periodDataPromise = Ip.countDocuments(query)
  const allDataPromise = Ip.find({})

  const periodData = await periodDataPromise
  const allData = await allDataPromise

  const result = {}
  result.uniqueUsersByPeriod = periodData
  result.uniqueUsers = allData.length
  result.lookCount = 0

  for (let i = 0; i < allData.length; i++) {
    result.lookCount += allData[i].cnt
  }

  socket.emit('getAdminDataSuccess', result)
  
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
  let x_forwarded_for = []
  
  if(socket.handshake.headers['x-forwarded-for']) {
      x_forwarded_for = socket.handshake.headers['x-forwarded-for'].split(', ')
      origin_client_ip = x_forwarded_for[0]
  } else {
      origin_client_ip = socket.handshake.address
  }
  
  return origin_client_ip

}