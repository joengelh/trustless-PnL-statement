<template>
  <div>
    <button class="link" style="float: right" v-on:click="logout">Sign out</button>
    <main>
      <h1>
        <label
          for="statement"
          style="color: var(--secondary);border-bottom: 2px solid var(--secondary);"
        >{{ records }}</label>
        {{ accountId }}
      </h1>
      <form v-on:submit.prevent="addPnl">
        <fieldset ref="fieldset">
          <label
            for="statement"
            style="display:block; color:var(--gray);margin-bottom:0.5em;"
          >Add PnL Statement</label>
          <div style="display:flex">
            <input v-model="newPnl" autocomplete="off" id="statement" style="flex:1" />
            <button id="save" style="border-radius:0 5px 5px 0">Save</button>
          </div>
        </fieldset>
      </form>
      <p>Look at that! A Hello World app! This statement is stored on the NEAR blockchain. Check it out:</p>
      <ol>
        <li>
          Look in
          <code>src/App.vue</code> and
          <code>src/utils.js</code>
          - you'll see
          <code>get_pnl</code>
          and
          <code>add_statement</code> being called on
          <code>contract</code>. What's this?
        </li>
        <li>
          Ultimately, this
          <code>contract</code> code is defined in
          <code>assembly/main.ts</code>
          - this is the source code for your
          <a
            target="_blank"
            rel="noreferrer"
            href="https://docs.near.org/docs/develop/contracts/overview"
          >smart contract</a>.
        </li>
        <li>
          When you run
          <code>npm run dev</code> or
          <code>yarn dev</code>, the code in
          <code>assembly/main.ts</code>
          gets deployed to the NEAR testnet. You can see how this happens by looking in
          <code>package.json</code>
          at the
          <code>scripts</code> section to find the
          <code>dev</code> command.
        </li>
      </ol>
      <hr />
      <p>
        To keep learning, check out
        <a
          target="_blank"
          rel="noreferrer"
          href="https://docs.near.org"
        >the NEAR docs</a> or look through some
        <a
          target="_blank"
          rel="noreferrer"
          href="https://examples.near.org"
        >example apps</a>.
      </p>
    </main>

    <Notification
      v-show="notificationVisible"
      ref="notification"
      :networkId="networkId"
      :msg="'called method: add_statement'"
      :contractId="contractId"
      :visible="false"
    />
  </div>
</template>

<script>
import { logout } from "../utils"

import Notification from "./Notification.vue"

export default {
  name: "SignedIn",

  beforeMount() {
    if (this.isSignedIn) {
      this.retrieveSavedGreeting()
    }
  },

  components: {
    Notification,
  },

  data: function () {
    return {
      records: "",
      newPnl: "",
      notificationVisible: false,
    }
  },

  computed: {
    isSignedIn() {
      return window.walletConnection? window.walletConnection.isSignedIn(): false
    },
    accountId() {
      return window.accountId
    },
    contractId() {
      return window.contract? window.contract.contractId: null
    },
    networkId() {
      return window.networkId
    },
  },

  methods: {
    retrieveSavedGreeting() {
      //retrieve statement
      window.contract
        .get_pnl({ account_id: window.accountId })
        .then((statementFromContract) => {
          this.records = statementFromContract
          this.newPnl = statementFromContract
        })
    },

    addPnl: async function (event) {
      // fired on form submit button used to update the statement

      // disable the form while the value gets updated on-chain
      this.$refs.fieldset.disabled = true

      try {
        
        // make an update call to the smart contract
        await window.contract.add_statement({
          // pass the new statement
          message: this.newPnl,
        })
      } catch (e) {
        alert(
          "Something went wrong! " +
            "Maybe you need to sign out and back in? " +
            "Check your browser console for more info."
        )
        throw e //re-throw
      } finally {
        // re-enable the form, whether the call succeeded or failed
        this.$refs.fieldset.disabled = false
      }

      // update records with persisted value
      this.records = this.newPnl

      this.notificationVisible = true //show new notification

      // remove Notification again after css animation completes
      // this allows it to be shown again next time the form is submitted
      setTimeout(() => {
        this.notificationVisible = false
      }, 11000)

    },

    logout: logout,
  },
}
</script>
