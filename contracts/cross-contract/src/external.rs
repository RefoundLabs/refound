use near_sdk::ext_contract;
use near_sdk::json_types::{Base58PublicKey, Base64VecU8, U128, U64};

pub const TGAS: u64 = 1_000_000_000_000;
pub const NO_DEPOSIT: u128 = 0;
pub const XCC_SUCCESS: u64 = 1;

// Validator interface, for cross-contract calls
#[ext_contract(nft_series)]
trait NFTSeries {
    fn nft_total_supply(&self) -> U128;
}
