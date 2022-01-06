import 'regenerator-runtime/runtime'

import { initContract, login, logout } from './utils'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

// global variable used throughout
let currentStatement

const submitButton = document.querySelector('form button')

document.querySelector('form').onsubmit = async (event) => {
  event.preventDefault()

  // get elements from the form using their id attribute
  const { fieldset, statement } = event.target.elements

  // disable the form while the value gets updated on-chain
  fieldset.disabled = true

  try {
    // make an update call to the smart contract
    await window.contract.add_statement({
      // pass the value that the user entered in the statement field
      message: statement.value
    })
  } catch (e) {
    alert(
      'Something went wrong! ' +
      'There is nothing you can do..')
    throw e
  } finally {
    // re-enable the form, whether the call succeeded or failed
    fieldset.disabled = false
  }

  // disable the save button, since it now matches the persisted value
  submitButton.disabled = true

  // update the statement in the UI
  await fetchName()

  // show notification
  document.querySelector('[data-behavior=notification]').style.display = 'block'

  // remove notification again after css animation completes
  // this allows it to be shown again next time the form is submitted
  setTimeout(() => {
    document.querySelector('[data-behavior=notification]').style.display = 'none'
  }, 11000)
}

document.querySelector('input#statement').oninput = (event) => {
  if (event.target.value !== currentStatement) {
    submitButton.disabled = false
  } else {
    submitButton.disabled = true
  }
}

document.querySelector('#sign-in-button').onclick = login
document.querySelector('#sign-out-button').onclick = logout

// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('#signed-out-flow').style.display = 'block'
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
  document.querySelector('#signed-in-flow').style.display = 'block'

  document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
    el.innerText = window.accountId
  })

  // populate links in the notification box
  const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
  accountLink.href = accountLink.href + window.accountId
  accountLink.innerText = '@' + window.accountId
  const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
  contractLink.href = contractLink.href + window.contract.contractId
  contractLink.innerText = '@' + window.contract.contractId

  // update with selected networkId
  accountLink.href = accountLink.href.replace('testnet', networkId)
  contractLink.href = contractLink.href.replace('testnet', networkId)

  fetchName()
}

// update global currentStatement variable; update DOM with it
async function fetchName() {
  currentStatement = await contract.get_statement({ account_id: window.accountId })
  document.querySelectorAll('[data-behavior=statement]').forEach(el => {
    // set divs, spans, etc
    el.innerText = currentStatement

    // set input elements
    el.value = currentStatement
  })
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
  .then(() => {
    if (window.walletConnection.isSignedIn()) signedInFlow()
    else signedOutFlow()
  })
  .catch(console.error)
