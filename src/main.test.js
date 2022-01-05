beforeAll(async function () {
  // NOTE: nearlib and nearConfig are made available by near-cli/test_environment
  const near = await nearlib.connect(nearConfig)
  window.accountId = nearConfig.contractName
  window.contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['get_fund_name'],
    changeMethods: [],
    sender: window.accountId
  })
})

test('get_fund_name', async () => {
  const message = await window.contract.get_fund_name({ account_id: window.accountId })
  expect(message).toEqual('Hello')
})
