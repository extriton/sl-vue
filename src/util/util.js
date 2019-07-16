export default {
    
    calcTimerStart (drawDow, drawHour, drawMinute) {
            
        const MS_IN_DAY = 1 * 24 * 60 * 60 * 1000                           // 86 400 000
        const blockedPeriod = 2 * 60 * 1000                            // 1 hour
        const now = new Date()

        let timeToDraw = (drawHour * 60 + drawMinute) * 60 * 1000
        let timeCurrent = (now.getUTCHours() * 60 + now.getUTCMinutes()) * 60 * 1000 + now.getUTCSeconds() * 1000
        if(drawDow >= 1 && drawDow <= 7) {                                  // For weekly game
            timeToDraw += drawDow * MS_IN_DAY
            if (now.getUTCDay() === 0)                                      // Change Sunday from 0 to 7
                timeCurrent += 7 * MS_IN_DAY
            else
                timeCurrent += now.getUTCDay() * MS_IN_DAY
        }

        // If blocked period, set timer to 0
        if(timeCurrent > (timeToDraw - blockedPeriod) && timeCurrent < (timeToDraw - 2 * blockedPeriod)) return 0

        // Else, return timer value
        if(timeToDraw > timeCurrent) return (timeToDraw - timeCurrent - blockedPeriod)
        if(drawDow >= 1 && drawDow <= 7)                                    // Weekly game
            return (timeToDraw + 7 * MS_IN_DAY - timeCurrent - blockedPeriod)    
        else                                                                // Daily game
            return (timeToDraw + MS_IN_DAY - timeCurrent - blockedPeriod)
        
    },

    timerToStr (timer) {
        let days = '', hours = '', minutes = '', seconds = '';    
        if(timer <= 0) return '00000000'

        const timeLeft = new Date(timer)
        days = '0' + (timeLeft.getUTCDate() - 1)               // days

        hours = '' + timeLeft.getUTCHours()                    // hours
        if(hours.length === 1) hours = '0' + hours

        minutes = '' + timeLeft.getUTCMinutes()                // minutes
        if(minutes.length == 1) minutes = '0' + minutes

        seconds = '' + timeLeft.getUTCSeconds()                // seconds
        if(seconds.length == 1) seconds = '0' + seconds

        return (days + hours + minutes + seconds)            
    },

    formatNumber (value, int, frac) {
        const zeroString = '00000000000000000000'
        
        try {
            value = parseFloat(value)
        } catch(e) {
            return ''
        }

        let _int = '' + parseInt(value)
        let _frac = '' + (value - parseInt(value))
        _frac = _frac.substr(2)

        // Integer part
        if(int > _int.length) _int = zeroString.substr(0, int - _int.length) + _int
        
        // Fractional part
        if(frac === 0) return _int
        if(frac === _frac.length) return _int + '.' + _frac

        if(frac > _frac.length) 
            _frac += zeroString.substr(0, frac - _frac.length)
        else
            _frac = _frac.substr(0, frac)

        return _int + '.' + _frac
    },

    calcDataString (arr) {
        let dataString = ''
        let hex = ''
    
        for(let i = 0; i < arr.length; i++) {
            if(arr[i] === 1) {
                hex = Number(i + 1).toString(16)
                hex = hex.toUpperCase()
                if(hex.length === 1) hex = '0' + hex
                dataString += hex
            }
        }
    
        return dataString
    },

    getGameType (game) {
        if (game.drawDow >= 1 && game.drawDow <= 7)                 // If draw day of week equal 1...7, it`s Weekly lottery, else Daily lottery
            return ('w' + game.reqNumbers + 'x' + game.padSize)
        else
            return ('d' + game.reqNumbers + 'x' + game.padSize)
    },

    getGameName (game) {                                            // If draw day of week equal 1...7, it`s Weekly lottery, else Daily lottery
        if (game.drawDow >= 1 && game.drawDow <= 7)
            return ('Weekly ' + game.reqNumbers + '/' + game.padSize)
        else
            return ('Daily ' + game.reqNumbers + '/' + game.padSize)
    },

}