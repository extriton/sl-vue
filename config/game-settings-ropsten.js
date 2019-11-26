module.exports = {
    etherscanAddressUrl: 'https://ropsten.etherscan.io/address/',
    metamaskNetId: 3,
    games: [
        {   
            reqNumbers: 5,
            padSize: 36,
            minWinMatch: 2,
            arrSize: 4,                         // REQ_NUMBERS - MIN_WIN_MATCH + 1
            drawDow: 1,                         // Day of week: 0 ... 6 (Sunday ... Saturday), other value - everyday
            drawHour: 13,                        // Hour: 0-23
            drawMinute: 0,                      // Minute: 0-59
            preDrawPeriod: 10,                   // (minutes)
            postDrawPeriod: 10,                  // (minutes)
            ticketPrice: 0.01,
            distribFund: { '2': 20, '3': 30, '4': 35, '5': 15},
            isActive: true,
            contractAddress: '0x19968Ba6c4Fa784E88D7C1f1836274744F92dd1E',
        }
    ]

}