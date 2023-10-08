use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::json_types::{U64};
use near_sdk::{ near_bindgen, Balance, PanicOnDefault };

pub type LicenseId = u64;
pub type LicenseIdJson = U64;

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct License {
    pub id: LicenseId,
    pub name: String,
    pub price: Balance,
    pub file: String
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct LicenseJson {
    pub id: LicenseIdJson,
    pub name: String,
    pub price: Balance,
    // cid of license file
    pub file: String
}

impl License {
    pub(crate) fn new(id: LicenseIdJson, _name: String, _price: Balance, _file: String) -> Self {
        License {
            id: id.0,
            name: _name,
            price: _price,
            file: _file
        }
    }
    pub(crate) fn to_json(&self) -> LicenseJson {
        LicenseJson {
           id: U64::from(self.id.clone()),
           name: self.name.clone(),
           price: self.price,
           file: self.file.clone()
        }
    }
}

#[near_bindgen]
impl Contract {

    pub fn add_license(&mut self, license_id: LicenseIdJson, name: String, price: Balance, file: String) {
        let account_id = &env::predecessor_account_id();
         //make sure that the person calling the function is a valid creator
        // self.assert_approved_creator(&account_id);
        let license = License{ id: license_id.0, name, price, file };
    
        let mut licenses = self.licenses_per_creator.get(&account_id).unwrap_or_else(|| {
            //if the series doesn't have any license, we create a new unordered map
            UnorderedMap::new(
                StorageKey::LicensesPerCreatorInner {
                    //we get a new unique prefix for the collection
                    hash_id: hash_account_id(&account_id.to_string()),
                }
            )
        });

        licenses.insert(&license_id.0, &license);
        self.licenses_per_creator.insert(&account_id, &licenses);
    }

    pub fn remove_license(&mut self, license_id: LicenseIdJson) {
        let account_id =  &env::predecessor_account_id();
         //make sure that the person calling the function is a valid creator
        // self.assert_approved_creator(&account_id);
        let mut licenses = self.licenses_per_creator.get(&account_id).expect("No licenses found");
        let license = licenses.get(&license_id.0).expect("License not found for creator");
        licenses.remove(&license_id.0);
        self.licenses_per_creator.insert(&account_id, &licenses);
    }
}
