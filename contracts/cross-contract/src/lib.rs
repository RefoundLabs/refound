use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, log, near_bindgen, AccountId, Gas, PanicOnDefault, Promise, PromiseError};

pub mod external;
pub use crate::external::*;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub nft_series_account: AccountId,
}

#[near_bindgen]
impl Contract {
    #[init]
    #[private] // Public - but only callable by env::current_account_id()
    pub fn init(nft_series_account: AccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self { nft_series_account }
    }

    ///////////////////////////////// ENUMERATIONS ////////////////////////////////////
    //////////////////////////////////  nft_total_supply //////////////////////////////////

    // Public - query external greeting
    pub fn query_nft_supply(&self) -> Promise {
        // Create a promise to call HelloNEAR.get_greeting()
        let promise = nft_series::ext(self.nft_series_account.clone())
            .with_static_gas(Gas(5 * TGAS))
            .nft_total_supply();

        return promise.then(
            // Create a promise to callback query_greeting_callback
            Self::ext(env::current_account_id())
                .with_static_gas(Gas(5 * TGAS))
                .query_nft_supply_callback(),
        );
    }

    #[private] // Public - but only callable by env::current_account_id()
    pub fn query_nft_supply_callback(
        &self,
        #[callback_result] call_result: Result<String, PromiseError>,
    ) -> String {
        // Check if the promise succeeded by calling the method outlined in external.rs
        if call_result.is_err() {
            log!("There was an error contacting NFT-Series NEAR");
            return "".to_string();
        }

        // Return the greeting
        let nft_supply: String = call_result.unwrap();
        nft_supply
    }

    //////////////////////////// SERIES ////////////////////////////////////////
    ////////////////////////  nft_mint ///////////////////////////////////////

    // Public - change external greeting
    pub fn nft_mint(&mut self, id: U64, receiver_id: AccountId) -> Promise {
        // Create a promise to call HelloNEAR.set_greeting(message:string)
        nft_series::ext(self.nft_series_account.clone())
            .with_static_gas(Gas(5 * TGAS))
            .nft_mint(id, receiver_id)
            .then(
                // Create a callback change_greeting_callback
                Self::ext(env::current_account_id())
                    .with_static_gas(Gas(5 * TGAS))
                    .change_greeting_callback(),
            )
    }

    #[private]
    pub fn nft_mint_callback(
        &mut self,
        #[callback_result] call_result: Result<(), PromiseError>,
    ) -> bool {
        // Return whether or not the promise succeeded using the method outlined in external.rs
        if call_result.is_err() {
            env::log_str("nft_mint failed...");
            return false;
        } else {
            env::log_str("nft_mint was successful!");
            return true;
        }
    }

    //////////////////////////// NFT CORE //////////////////////////////////////////
    ///////////////////////////// nft_token ///////////////////////////////////////
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     const HELLO_NEAR: &str = "beneficiary";

//     #[test]
//     fn initializes() {
//         let beneficiary: AccountId = HELLO_NEAR.parse().unwrap();
//         let contract = Contract::init(beneficiary);
//         assert_eq!(contract.hello_account, HELLO_NEAR.parse().unwrap())
//     }
// }
