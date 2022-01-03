/*
 * This is an example of a Rust smart contract with two simple, symmetric functions:
 *
 * 1. add_trade: accepts a trades result in percent, such as "12", and records it for the user (account_id)
 *    who sent the request
 * 2. get_pnl: accepts an account_id and returns the average result saved for it, defaulting to
 *    0
 *
 * Learn more about writing NEAR smart contracts with Rust:
 * https://github.com/near/near-sdk-rs
 *
 */

// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, setup_alloc};
use near_sdk::collections::LookupMap;

setup_alloc!();

// Structs in Rust are similar to other languages, and may include impl keyword as shown below
// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Trades {
    records: LookupMap<String, i32>,
}

impl Default for Trades {
  fn default() -> Self {
    Self {
      records: LookupMap::new(b"a".to_vec()),
    }
  }
}

#[near_bindgen]
impl Trades {
    pub fn add_trade(&mut self, message: String) {
        let account_id = env::signer_account_id();

        // Use env::log to record logs permanently to the blockchain!
        env::log(format!("Saving trade '{}' for account '{}'", message, account_id,).as_bytes());

        self.records.insert(&account_id, &message);
    }

    // `match` is similar to `switch` in other languages; here we use it to default to "Hello" if
    // self.records.get(&account_id) is not yet defined.
    // Learn more: https://doc.rust-lang.org/book/ch06-02-match.html#matching-with-optiont
    pub fn get_pnl(&self, account_id: String) -> String {
        match self.records.get(&account_id) {
            Some(trade) => trade,
            None => "Hello".to_string(),
        }
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 *
 * To run from contract directory:
 * cargo test -- --nocapture
 *
 * From project root, to run in combination with frontend tests:
 * yarn test
 *
 */
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    // mock the context for testing, notice "signer_account_id" that was accessed above from env::
    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice_near".to_string(),
            signer_account_id: "bob_near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol_near".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }

    #[test]
    fn add_then_get_pnl() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = Trades::default();
        contract.add_trade("howdy".to_string());
        assert_eq!(
            "howdy".to_string(),
            contract.get_pnl("bob_near".to_string())
        );
    }

    #[test]
    fn get_default_trade() {
        let context = get_context(vec![], true);
        testing_env!(context);
        let contract = Trades::default();
        // this test did not call add_trade so should return the default "Hello" trade
        assert_eq!(
            "Hello".to_string(),
            contract.get_pnl("francis.near".to_string())
        );
    }
}
