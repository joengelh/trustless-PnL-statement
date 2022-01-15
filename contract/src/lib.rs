use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, setup_alloc};
use near_sdk::collections::LookupMap;

setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Pnl {
    records: LookupMap<String, f64>,
}

impl Default for Pnl {
  fn default() -> Self {
    Self {
      records: LookupMap::new(b"a".to_vec()),
    }
  }
}

#[near_bindgen]
impl Pnl {
    pub fn set_greeting(&mut self, statement: f64) {
        let account_id = env::signer_account_id();
        let old_pnl: f64 = self.get_greeting(env::signer_account_id());
        if old_pnl != 0.0 {
            self.records.insert(&account_id, &(&(&old_pnl + &statement)));
        } else {
            self.records.insert(&account_id, &statement);
        }
    }

    pub fn get_greeting(&self, account_id: String) -> f64 {
        match self.records.get(&account_id) {
            Some(pnl) => (pnl * 100.0).round() / 100.0,
            None => 0.0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice.near".to_string(),
            signer_account_id: "bob.near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol.near".to_string(),
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
    fn add_then_get_two_trades() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = Pnl::default();
        contract.set_greeting(20.0);
        contract.set_greeting(10.0);
        assert_eq!(
            30.0,
            contract.get_greeting("bob.near".to_string())
        );
    }

    #[test]
    fn add_then_get_one_trade() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = Pnl::default();
        contract.set_greeting(20.0);
        assert_eq!(
            20.0,
            contract.get_greeting("bob.near".to_string())
        );
    }

    #[test]
    fn add_negative_trade() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = Pnl::default();
        contract.set_greeting(-1.0);
        contract.set_greeting(-3.0);
        assert_eq!(
            -4.0,
            contract.get_greeting("bob.near".to_string())
        );
    }

    #[test]
    fn add_decimal_trade() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = Pnl::default();
        contract.set_greeting(-1.36);
        contract.set_greeting(1.36);
        assert_eq!(
            0.0,
            contract.get_greeting("bob.near".to_string())
        );
    }

    #[test]
    fn add_to_other_account_id() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = Pnl::default();
        contract.set_greeting(1.36);
        assert_eq!(
            0.0,
            contract.get_greeting("francis.near".to_string())
        );
    }

    #[test]
    fn get_default_pnl() {
        let context = get_context(vec![], true);
        testing_env!(context);
        let contract = Pnl::default();
        assert_eq!(
            0.0,
            contract.get_greeting("francis.near".to_string())
        );
    }
}
