use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, ext_contract, near_bindgen, AccountId, Balance, Gas, PanicOnDefault, Promise,
    PromiseResult, PublicKey,
};

/// Gas attached to the callback from account creation.
pub const ON_CREATE_ACCOUNT_CALLBACK_GAS: Gas = Gas(20_000_000_000_000);

const SPONSOR_FEE: u128 = 100_000_000_000_000_000_000_000;
pub type TokenId = String;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Guest {
    pub account_id: AccountId,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    /// standard fields (draft)
    pub owner_id: AccountId,

    /// custom fields for guests and example app (with no backend need to store list of tokens)
    pub guests: LookupMap<PublicKey, Guest>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        let this = Self {
            guests: LookupMap::new(b"g".to_vec()),
            owner_id: owner_id.into(),
        };
        this
    }

    /// user wants to become a real NEAR account
    pub fn upgrade_guest(&mut self, public_key: PublicKey) -> Promise {
        let pk = env::signer_account_pk();
        let guest = self.guests.get(&pk).expect("No guest");
        let balance: Balance = env::account_balance();
        let fees = SPONSOR_FEE;
        assert!(balance > fees, "Not enough to upgrade");
        env::log_str(&format!("Withdrawing {} from contract", balance));

        let account_id = guest.account_id;
        Promise::new(account_id.clone())
            .create_account()
            .add_full_access_key(public_key.into())
            .transfer(balance - fees)
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(ON_CREATE_ACCOUNT_CALLBACK_GAS)
                    .on_account_created(pk),
            )
    }

    /// only owner/backend API should be able to do this to avoid unwanted storage usage in creating new guest records

    /// add account_id to guests for get_predecessor and to storage to receive tokens
    pub fn add_guest(&mut self, account_id: AccountId, public_key: PublicKey) {
        // verify that the caller is the owner of the contract
        // FIX This is not working, need to figure out why
        assert_eq!(
            env::predecessor_account_id(),
            self.owner_id,
            "must be owner_id"
        );

        if self
            .guests
            .insert(&public_key.into(), &Guest { account_id })
            .is_some()
        {
            env::panic_str("guest account already added");
        }
    }

    pub fn remove_guest(&mut self, public_key: PublicKey) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner_id,
            "must be owner_id"
        );
        let _guest = self
            .guests
            .get(&public_key.clone().into())
            .expect("not a guest");
        self.guests.remove(&public_key.into());
    }

    /// view methods

    pub fn get_guest(&self, public_key: PublicKey) -> Guest {
        self.guests.get(&public_key.into()).expect("no guest")
    }

    /// self callbacks

    /// after account creation delete all the guests activity
    pub fn on_account_created(&mut self, public_key: PublicKey) -> bool {
        let success = is_promise_success();
        if success {
            self.guests.remove(&public_key);
        }
        success
    }
}

/// Callback for after upgrade_guest
#[ext_contract(ext_self)]
pub trait ExtContract {
    fn on_account_created(&mut self, public_key: PublicKey) -> bool;
}

fn is_promise_success() -> bool {
    assert_eq!(
        env::promise_results_count(),
        1,
        "Contract expected a result on the callback"
    );
    match env::promise_result(0) {
        PromiseResult::Successful(_) => true,
        _ => false,
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 */
#[cfg(test)]

mod tests {
    use super::*;
    use near_sdk::test_utils::accounts;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::{testing_env, VMContext};

    fn get_context(is_view: bool) -> VMContext {
        VMContextBuilder::new()
            .signer_account_id(accounts(0))
            .current_account_id(accounts(0))
            .predecessor_account_id(accounts(0))
            .is_view(is_view)
            .build()
    }

    #[test]
    fn create_contract() {
        let context = get_context(false);
        testing_env!(context);

        let contract = Contract::new(env::current_account_id());

        // this test did not call set_greeting so should return the default "Hello" greeting
        assert_eq!(contract.owner_id, env::current_account_id());
    }

    #[test]
    fn add_guest_account() {
        let context = get_context(false);
        testing_env!(context);

        let mut contract = Contract::new(env::current_account_id());

        let signer_guest_account_pk: PublicKey = "BGCCDDHfysuuVnaNVtEhhqeT4k9Muyem3Kpgq2U1m9HX"
            .parse()
            .unwrap();

        env::log_str(&format!("public_key {:?}", signer_guest_account_pk));

        let guest_account: AccountId = ("guest.".to_string() + accounts(1).as_str())
            .parse()
            .unwrap();

        env::log_str(&format!("account_name {:?}", guest_account));

        contract.add_guest(guest_account.clone(), signer_guest_account_pk.clone());

        let guest = contract.get_guest(signer_guest_account_pk);

        env::log_str(&format!("guest {:?}", guest.account_id));

        assert_eq!(guest.account_id.as_str(), guest_account.clone().as_str());
    }
}
