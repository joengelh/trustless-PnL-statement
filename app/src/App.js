import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // use React Hooks to store statement in component state
  const [statement, add_statement] = React.useState()

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.get_pnl({ account_id: window.accountId })
          .then(statementFromContract => {
            add_statement(statementFromContract)
          })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to trustless PnL</h1>
        <p>
          Here you can check the PnL statement of other 
          accounts.
        </p>
        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { fieldset, account } = event.target.elements

          // disable the form while the value gets updated on-chain
          fieldset.disabled = true
          try {
            // make an update call to the smart contract
            const pnl = await window.contract.get_pnl({
              // pass the value that the user entered in the statement field
              account_id: account.value
            })
            document.getElementById('pnlResult').value = pnl;
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }
        }}>
          <fieldset id="fieldset">
            <label
              htmlFor="account"
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
            </label>
            <div style={{ display: 'flex' }}>
              <input
                placeholder="Query Account"
                id="account"
                onChange={e => setButtonDisabled(e.target.value === statement)}
                style={{ flex: 1 }}
              />
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Query
              </button>
            </div>
          </fieldset>
        </form>
        Queried Account's PnL:
        <input type="text" 
          class="form-control" 
          size="12" 
          value="N.A." 
          id="pnlResult"
        ></input>
        <p>
          <br></br>
          If you sign in with your NEAR wallet, you can set your own PnL statements
          for others to verify immutably on the NEAR blockchain.
        </p>
        <p>
          <a target="_blank" href="https://github.com/joengelh/trustless-PnL-statement">This Project is open sourced on GitHub</a>
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <label
            htmlFor="statement"
            style={{
              color: 'var(--secondary)',
              borderBottom: '2px solid var(--secondary)'
            }}
          >
          </label>
          {' '/* React trims whitespace around tags; insert literal space character when needed */}
          Hello {window.accountId}, <br></br> your current PnL: {statement}
        </h1>
        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { fieldset, statement } = event.target.elements

          // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
          const newStatement = statement.value

          // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // make an update call to the smart contract
            await window.contract.add_statement({
              // pass the value that the user entered in the statement field
              statement: parseFloat(newStatement)
            })
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }

          // update local `statement` variable to match persisted value
          let newPnl = await window.contract.get_pnl({ account_id: window.accountId })
          add_statement(newPnl)

          // show Notification
          setShowNotification(true)

          // remove Notification again after css animation completes
          // this allows it to be shown again next time the form is submitted
          setTimeout(() => {
            setShowNotification(false)
          }, 11000)
        }}>
          <fieldset id="fieldset">
            <label
              htmlFor="statement"
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
            </label>
            <div style={{ display: 'flex' }}>
              <input
                autoComplete="off"
                placeholder='Enter your PnL Statement'
                id="statement"
                onChange={e => setButtonDisabled(e.target.value === statement)}
                style={{ flex: 1 }}
              />
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Submit
              </button>
            </div>
          </fieldset>
        </form>
        <p>
          This PnL Statement is stored on the NEAR blockchain for each account-id individually.
        </p>
        <ol>
          <li>
            Each PnL Statement is expressed as percentage of the total psition size.
          </li>
          <li>
            The PnL Statement is updated every time a new statement is being made by adding it to the existing statement.
          </li>
          <li>
            The Value can be called by everyone, but only updated by the owner of the account.
          </li>
        </ol>
        <p>
          <a target="_blank" href="https://github.com/joengelh/trustless-PnL-statement">This Project is open sourced on GitHub</a>
        </p>
      </main>
      {showNotification && <Notification />}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'add_statement' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
