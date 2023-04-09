use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
#[allow(unused_imports)]
use near_sdk::{env, near_bindgen};
use near_sdk::serde::{Deserialize, Serialize};

/// Account Ids in Near are just strings.
pub type AccountId = String;
/// Gas is u64
pub type Gas = u64;
/// Amounts, Balances, and Money in NEAR are u128.
pub type Amount = u128;
pub type Money = Amount;

/// Timestamp in NEAR is a number.
pub type Timestamp = u64;


use crate::{
    AccountId,
    Money,
    Timestamp
};

#[derive(Clone, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]

pub struct Crowdfund{
    id: i32,
  pub creator: AccountId,
    created_at: Timestamp,
    title: String,
    donation_target: u128,
    pub total_donations: u128,
   pub total_votes: i64,//not needed?
    description: String,
   pub votes: Vec<String>//not needed?
}

//todo: original solidity struct
// struct Campaign {
//     address creator;
//     uint256 goal;
//     string title;
//     string description;
//     string imageLink;
//     uint256 pledged;
//     uint256 startAt;
//     uint256 endAt;
//     bool claimed;
// }

impl Crowdfund{
    pub fn new(id:i32, title: String, donation_target:u128, description: String) -> Self {
        
        Crowdfund{
            id,
            creator: env::signer_account_id(),
            created_at: env::block_timestamp(),
            title,
            donation_target,
            total_donations: 0,
            total_votes : 0,//not needed?
            description,
            votes: vec![],//not needed?
        }
    }
}

#[derive(Clone, Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]

pub struct Donation {
    donor: AccountId,
    amount: Money
}

impl Donation {
    pub fn new() -> Self {        
      Donation{
        amount: env::attached_deposit(),
        donor: env::predecessor_account_id(),
        }
    }  
}

//todo: unpledge / remove donation function

///lib.rs

/// ONE_NEAR = unit of NEAR token in yocto Ⓝ (1e24)
pub const ONE_NEAR: u128 = 1_000_000_000_000_000_000_000_000 as u128;

near_sdk::setup_alloc!();   
use crate::{
        AccountId,
        ONE_NEAR,
        assert_self,
        assert_single_promise_success,
        Crowdfund,
        Donation
};

#[near_bindgen]
#[derive(Clone, Default, BorshDeserialize, BorshSerialize)]
pub struct Contract {
    owner: AccountId,
    crowdfunds: Vec<Crowdfund>,
    donations: Vec<Donation>,
}

#[near_bindgen]
impl Contract{
    #[init]
    pub fn init(
        owner: AccountId,
    ) -> Self{
        let crowdfunds: Vec<Crowdfund> = Vec::new();
        let donations: Vec<Donation> = Vec::new();

        Contract{
            owner,
            crowdfunds,
            donations
        }
    }
}

pub fn add_crowdfund(&mut self, title: String, donate:u128,description: String) {
            
    let id = self.crowdfunds.len() as i32;
    
    self.crowdfunds.push(Crowdfund::new(
        id,
        title,
        donate,
        description
    ));
    env::log("Added a new crowdfund".as_bytes());
}


pub fn add_donation(&mut self, id:usize, amount:u128) {
    let transfer_amount: u128 = ONE_NEAR * amount;
    let crowdfund: &mut Crowdfund = self.crowdfunds.get_mut(id).unwrap();
    crowdfund.total_donations = crowdfund.total_donations + transfer_amount;
    self.donations.push(Donation::new());
   
   Promise::new(env::predecessor_account_id()).transfer(transfer_amount);
  env::log("You have donated succesfully".as_bytes());
}

pub fn crowdfund_count(&mut self) -> usize {
    return self.crowdfunds.len();
}

pub fn list_crowdfunds(&self) -> Vec<Crowdfund> {
    assert_self();
   let crowdfunds = &self.crowdfunds;
   return crowdfunds.to_vec();
}

//todo: list crowdfunds by creator

pub fn get_total_donations(&mut self, id:usize) -> u128 {
    let crowdfund: &mut Crowdfund = self.crowdfunds.get_mut(id).unwrap();
    return crowdfund.total_donations;
}



