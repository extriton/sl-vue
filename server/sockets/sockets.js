module.exports = io => {
    io.sockets.on('connection', socket => {

        console.log('New client connected!')
        socket.emit('customEmit', {})
      
        socket.on('toServer:send', data => {
          console.log('toServer:send received')
        })
      
    })
}