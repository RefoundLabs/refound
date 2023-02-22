use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize}; // Seralization
use near_sdk::{near_bindgen, Balance, Gas};

use crate::lockup_types::*;
use crate::nft_series_types::*;

mod lockup_types;
mod nft_series_types;

mod deploy_crowdfunding;
mod deploy_donations;
mod deploy_lockup;
mod deploy_multisig;
mod deploy_nft_series;
mod deploy_voting;
mod deploy_whitelist;
mod manager;

const NEAR_PER_STORAGE: Balance = 10_000_000_000_000_000_000; // 10e19yⓃ
const DONATION_CONTRACT: &[u8] = include_bytes!("./wasm-contracts/donation.wasm");
const CROWDFUNDING_CONTRACT: &[u8] = include_bytes!("./wasm-contracts/crowdfunding.wasm");
const LOCKUP_CONTRACT: &[u8] = include_bytes!("./wasm-contracts/lockup.wasm");
const MULTISIG_CONTRACT: &[u8] = include_bytes!("./wasm-contracts/multisig.wasm");
const WHITELIST_CONTRACT: &[u8] = include_bytes!("./wasm-contracts/whitelist.wasm");
const VOTING_CONTRACT: &[u8] = include_bytes!("./wasm-contracts/voting.wasm");
const NFT_SERIES_CONTRACT: &[u8] = include_bytes!("./wasm-contracts/nft_series.wasm");

const TGAS: Gas = Gas(10u64.pow(12)); // 10e12yⓃ
const NO_DEPOSIT: Balance = 0; // 0yⓃ

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    donation_code: Vec<u8>,
    crowdfunding_code: Vec<u8>,
    lockup_code: Vec<u8>,
    multisig_code: Vec<u8>,
    voting_code: Vec<u8>,
    whitelist_code: Vec<u8>,
    nft_series_code: Vec<u8>,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            donation_code: DONATION_CONTRACT.to_vec(),
            crowdfunding_code: CROWDFUNDING_CONTRACT.to_vec(),
            lockup_code: LOCKUP_CONTRACT.to_vec(),
            multisig_code: MULTISIG_CONTRACT.to_vec(),
            voting_code: VOTING_CONTRACT.to_vec(),
            whitelist_code: WHITELIST_CONTRACT.to_vec(),
            nft_series_code: NFT_SERIES_CONTRACT.to_vec(),
        }
    }
}
