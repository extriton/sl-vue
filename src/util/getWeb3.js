import Web3 from 'web3'

/*
* 1. Check for injected web3 (mist/metamask)
* 2. If metamask/mist create a new web3 instance and pass on result
* 3. Get networkId - Now we can check the user is connected to the right network to use our dApp
* 4. Get user account from metamask
* 5. Get user balance
*/

let getWeb3 = new Promise(function (resolve, reject) {
  // Check for injected web3 (mist/metamask)
  const web3js = window.web3

  if (typeof web3js !== 'undefined') {
    const web3 = new Web3(web3js.currentProvider)
    
    // Disable refresh page if network id changed in metamask (only in window[ethereum])
    if (window['ethereum']) window['ethereum'].autoRefreshOnNetworkChange = false


    // Check for Mitamask / Mist unlocked
    web3.eth.getAccounts((err, accounts) => {
      if (err) reject(new Error('getAccounts error: ' + err))
      else if (accounts.length === 0) reject(new Error('Metamask is locked'))
      else { 
        resolve({ injectedWeb3: true, web3 () { return web3 } })
      }
    })
    
  } else {
    reject(new Error('Unable to connect to Metamask'))
  }
})
  .then(result => {
    return new Promise(function (resolve, reject) {
      // Retrieve network ID
      result.web3().eth.net.getId((err, networkId) => {
        if (err) {
          reject(new Error('Unable to retrieve network ID'))
        } else {
          // Assign the networkId property to our result and resolve promise
          result = Object.assign({}, result, {networkId})
          resolve(result)
      }
      })
    })
  })
  .then(result => {
    return new Promise(function (resolve, reject) {
      // Retrieve coinbase
      result.web3().eth.getCoinbase((err, coinbase) => {
        if (err) {
          reject(new Error('Unable to retrieve coinbase'))
        } else {
          result = Object.assign({}, result, { coinbase })
          resolve(result)
        }
      })
    })
  })
  .then(result => {
    return new Promise(function (resolve, reject) {
      // Retrieve balance for coinbase
      result.web3().eth.getBalance(result.coinbase, (err, balance) => {
        if (err) {
          reject(new Error('Unable to retrieve balance for address: ' + result.coinbase))
        } else {
          result = Object.assign({}, result, { balance })
          resolve(result)
        }
      })
    })
  })

export default getWeb3