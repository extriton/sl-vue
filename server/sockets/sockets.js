const gameSettings = require('../../config/server/game-settings-server')

const Game = require('../models/Game.js')
const Member = require('../models/Member.js')
const Ip = require('../models/Ip.js')
const Ipstat = require('../models/Ipstat.js')

const excludeIPs = gameSettings.excludeIPs


// Export function
module.exports = io => {
    io.sockets.on('connection', socket => {

      const realSocketIP = getRealSocketIP(socket)
      if(realSocketIP !== '') addSocketIP(realSocketIP)

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

  if (!data.year || !data.month) {
    const now = new Date()
    data.year = now.getFullYear()
    data.month = now.getMonth() + 1
  }

  try {
    data.year = parseInt(data.year)
    data.month = parseInt(data.month)
  } catch {
    const now = new Date()
    data.year = now.getFullYear()
    data.month = now.getMonth() + 1
  }
  
  const ipsPromise = Ip.find({})
  const ipStatPromise = Ipstat.find({ year: data.year, month: data.month })

  const ips = await ipsPromise
  const ipStat = await ipStatPromise

  const result = {
    newUsers: ips.length,
    visits:  0,
    ipStat: []
  }

  for (let i = 0; i < ips.length; i++) {
    if (excludeIPs.indexOf(ips[i].ip) !== -1) {
      result.visits += ips[i].cnt
    }
  }

  result.ipStat = ipStat

  socket.emit('getAdminDataSuccess', result)
  
}

// Add socket IP
async function addSocketIP(socketIP) {

    if (excludeIPs.indexOf(socketIP) !== -1) return
  
    // Add in DB
    Ip.findOne({ ip: socketIP }).exec((err, ip) => {
        if(err) return
        
        let isNew = false

        if (!ip) {
            ip = new Ip({
                ip: socketIP,
                cnt: 1,
                updated: new Date()
            })
            isNew = true
        } else {
            ip.cnt = ip.cnt + 1
            ip.updated = new Date()
        }
        ip.save()

        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const date = now.getDate()
        
        Ipstat.findOne({ year: year, month: month, date: date }).exec((err, stat) => {
          if(err) return

          if (!stat) {
            stat = new Ipstat({
              year: year,
              month: month,
              date: date,
              newUsers: 0,
              visits: 1
            })
          } else {
            stat.visits += 1
          }

          if (isNew) {
            stat.newUsers += 1
          }
          stat.save()
        })

    })

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