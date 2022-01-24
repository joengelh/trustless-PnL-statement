# trustless-profit-loss-statement

## Description

As proposed by [coffeezilla](https://www.youtube.com/channel/UCFQMnBA3CS502aghlcr0_aw) on YouTube, 
traders interacting with social media should provide profit-loss statements to prevent fraud and scams.
I want to create a technical proposal for exchanges and brokers to enable algorithmic and non-algorithmic traders to issue trustless or even zero knowledge p&l statements for their social media followers to audit, written in Rust and deployable on the NEAR blockchain.

For now, this demo presents a possibility where every account on near could update their global PnL by posting trading results as percentages. Every Account can only update their own PnL by submitting statements, but every account can get every other accounts current PnL. Furthermore, by querying the blockchain for past transactions accocated to a specific account, past performance and history can be reviewed.

## Smart Contract

The smart contract written in Rust and stored in ``contract/src/lib.rs``, has two callable functions:
1.  add_statement(statement) enables every account on the blockchain to add a PnL statement to their balance
2.  get_pnl(account_id) enables every account to query every other account for their overall PnL


## Credits

This [React] app was initialized with [create-near-app]
Namely, the exact command was:

```bash
npx create-near-app --contract rust --frontend react trustless-PnL-statement
```

## Quick Start

To run this project locally:

1. Prerequisites: Make sure you've installed [Node.js] ≥ 12
2. Install dependencies: `yarn install`
3. Run the local development server: `yarn dev` (see `package.json` for a
   full list of `scripts` you can run with `yarn`)

Now you'll have a local development environment backed by the NEAR TestNet!

Go ahead and play with the app and the code. As you make code changes, the app will automatically reload.


## Exploring The Code

1. The "backend" code lives in the `/contract` folder. See the README there for
   more info.
2. The frontend code lives in the `/src` folder. `/src/main.js` is a great
   place to start exploring.
3. Tests: there are different kinds of tests for the frontend and the smart
   contract. See `contract/README` for info about how it's tested. The frontend
   code gets tested with [jest]. You can run both of these at once with `yarn
   run test`.


## Deploy

Every smart contract in NEAR has its [own associated account][NEAR accounts]. When you run `yarn dev`, your smart contract gets deployed to the live NEAR TestNet with a throwaway account. When you're ready to make it permanent, here's how.


### Step 0: Install near-cli (optional)

[near-cli] is a command line interface (CLI) for interacting with the NEAR blockchain. It was installed to the local `node_modules` folder when you ran `yarn install`, but for best ergonomics you may want to install it globally:

    yarn install --global near-cli

Or, if you'd rather use the locally-installed version, you can prefix all `near` commands with `npx`

Ensure that it's installed with `near --version` (or `npx near --version`)


### Step 1: Create an account for the contract

Each account on NEAR can have at most one contract deployed to it. If you've already created an account such as `your-name.testnet`, you can deploy your contract to `trustless-profit-loss-statement.your-name.testnet`. Assuming you've already created an account on [NEAR Wallet], here's how to create `trustless-profit-loss-statement.your-name.testnet`:

1. Authorize NEAR CLI, following the commands it gives you:

      near login

2. Create a subaccount (replace `YOUR-NAME` below with your actual account name):

      near create-account trustless-profit-loss-statement.YOUR-NAME.testnet --masterAccount YOUR-NAME.testnet


### Step 2: set contract name in code

Modify the line in `src/config.js` that sets the account name of the contract. Set it to the account id you used above.

    const CONTRACT_NAME = process.env.CONTRACT_NAME || 'trustless-profit-loss-statement.YOUR-NAME.testnet'


### Step 3: deploy!

One command:

    yarn deploy

As you can see in `package.json`, this does two things:

1. builds & deploys smart contract to NEAR TestNet
2. builds & deploys frontend code to GitHub using [gh-pages]. This will only work if the project already has a repository set up on GitHub. Feel free to modify the `deploy` script in `package.json` to deploy elsewhere.

## Discussion

On NEAR using storage is being payed for by staking NEAR coins for as long as the data is saved on the main network. Since algorithmic traders regularily exceed 10.000 trades per year, it is not plausibe to save every trades PnL statement on the blockchain for every user. Instead, the PnL statements are simply being added up and only the sum is saved on the blockchain.
Anyhow, due to the nature of the blockchain of course it is possible to backtrace every single transaction and thus the history of the account can be calculated and presented by a blockchain analytics software or explorer.

## Troubleshooting

On Windows, if you're seeing an error containing `EPERM` it may be related to spaces in your path. Please see [this issue](https://github.com/zkat/npx/issues/209) for more details.


  [Vue]: https://vuejs.org/
  [create-near-app]: https://github.com/near/create-near-app
  [Node.js]: https://nodejs.org/en/download/package-manager/
  [jest]: https://jestjs.io/
  [NEAR accounts]: https://docs.near.org/docs/concepts/account
  [NEAR Wallet]: https://wallet.testnet.near.org/
  [near-cli]: https://github.com/near/near-cli
  [gh-pages]: https://github.com/tschaub/gh-pages
