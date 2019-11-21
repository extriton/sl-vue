module.exports = {
    etherscanAddressUrl: 'https://ropsten.etherscan.io/address/',
    metamaskNetId: 3,
    games: [
        {   
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
            distribFund: { '2': 20, '3': 30, '4': 35, '5': 15},
            isActive: true,
            contractAddress: '0xC8ab1121655Cd5a8c314e07574c0AC2F8Ad60F8B',
        },
        {   
            reqNumbers: 6,
            padSize: 49,
            minWinMatch: 2,
            arrSize: 4,                         // REQ_NUMBERS - MIN_WIN_MATCH + 1
            drawDow: 7,                         // Day of week: 0 ... 6 (Sunday ... Saturday), other value - everyday
            drawHour: 10,                       // Hour: 0-23
            drawMinute: 10,                     // Minute: 0-59
            preDrawPeriod: 2,                   // (minutes)
            postDrawPeriod: 2,                  // (minutes)
            ticketPrice: 0.01,
            distribFund: { '3': 20, '4': 30, '5': 35, '6': 15},
            isActive: false,
            contractAddress: '0x525FF8A24B91078675a347e348fBE0794119EFce',
        }
    ]

}