module.exports = {
    websocketProvider: 'wss://mainnet.infura.io/ws',
    etherscanAddressUrl: 'https://.etherscan.io/address/',
    metamaskNetId: 1,
    games: [
        {   
            type: 'w5x36',
            reqNumbers: 5,
            padSize: 36,
            minWinMatch: 2,
            arrSize: 4,                         // REQ_NUMBERS - MIN_WIN_MATCH + 1
            drawDow: 5,                         // Day of week: 0 ... 6 (Sunday ... Saturday), other value - everyday
            drawHour: 9,                        // Hour: 0-23
            drawMinute: 0,                      // Minute: 0-59
            preDrawPeriod: 60,                   // (minutes)
            postDrawPeriod: 60,                  // (minutes)
            ticketPrice: 0.01,
            isActive: true,
            contractAddress: '0x525FF8A24B91078675a347e348fBE0794119EFce',
        },
        {   
            type: 'd6x49',
            reqNumbers: 6,
            padSize: 49,
            minWinMatch: 2,
            arrSize: 4,                         // REQ_NUMBERS - MIN_WIN_MATCH + 1
            drawDow: 0,                         // Day of week: 0 ... 6 (Sunday ... Saturday), other value - everyday
            drawHour: 15,                       // Hour: 0-23
            drawMinute: 48,                     // Minute: 0-59
            preDrawPeriod: 60,                   // (minutes)
            postDrawPeriod: 60,                  // (minutes)
            ticketPrice: 0.01,
            isActive: true,
            contractAddress: '0x525FF8A24B91078675a347e348fBE0794119EFce',
        }
    ]

}