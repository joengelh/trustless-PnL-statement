beforeAll(async function () {
  // NOTE: nearlib and nearConfig are made available by near-cli/test_environment
  const near = await nearlib.connect(nearConfig)
  window.accountId = nearConfig.contractName
  window.contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['get_pnl'],
    changeMethods: ['add_statement'],
    sender: window.accountId
  })

  window.walletConnection = {
    requestSignIn() {
    },
    signOut() {
    },
    isSignedIn() {
      return true
    },
    getAccountId() {
      return window.accountId
    }
  }
})

test('get_pnl', async () => {
  const pnl = await window.contract.get_pnl({ account_id: window.accountId })
  expect(pnl).toEqual(0.0)
})

test('set_then_get_pnl', async () => {
  await window.contract.add_statement({ statement: 0.1 })
  const pnl = await window.contract.get_pnl({ account_id: window.accountId })
  expect(pnl).toEqual(0.1)
})

test('get_empty_pnl', async () => {
  const pnl = await window.contract.get_pnl({ account_id: 'idontexist.testnet' })
  expect(pnl).toEqual(0.0)
})