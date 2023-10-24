use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::json_types::{U128};
use near_sdk::{ near_bindgen, Balance, PanicOnDefault };

pub type LicenseId = String;

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
    pub id: LicenseId,
    pub name: String,
    pub price: U128,
    // cid of license file
    pub file: String
}

impl License {
    pub(crate) fn new(id: LicenseId, _name: String, _price: Balance, _file: String) -> Self {
        License {
            id: id,
            name: _name,
            price: _price,
            file: _file
        }
    }
    pub(crate) fn to_json(&self) -> LicenseJson {
        LicenseJson {
           id: self.id.clone(),
           name: self.name.clone(),
           price: U128::from(self.price),
           file: self.file.clone()
        }
    }
}

#[near_bindgen]
impl Contract {

    pub fn add_license(&mut self, license_id: &LicenseId, name: String, price: U128, file: String) {
        let account_id = &env::predecessor_account_id();
         let license = License{ id: license_id.clone(), name, price: price.0, file };
    
        let mut licenses = self.licenses_per_creator.get(&account_id).unwrap_or_else(|| {
            //if the series doesn't have any license, we create a new unordered map
            UnorderedSet::new(
                StorageKey::LicensesPerCreatorInner {
                    //we get a new unique prefix for the collection
                    hash_id: hash_account_id(&account_id.to_string()),
                }
            )
        });
        
        licenses.insert(license_id);
         //insert the license ID and license struct and make sure that the license doesn't exist
         require!(
            self.licenses_by_id.insert(&license_id, &license).is_none(),
            "License already exists"
        );
        self.licenses_per_creator.insert(&account_id, &licenses);
    }

    pub fn remove_license(&mut self, license_id: &LicenseId) {
        let account_id =  &env::predecessor_account_id();
        let mut licenses = self.licenses_per_creator.get(&account_id).expect("No licenses found");
        let license = self.licenses_by_id.get(license_id).expect("License not found");
        licenses.remove(license_id);  
        self.licenses_per_creator.insert(&account_id, &licenses);
        self.licenses_by_id.remove(license_id);
    }

    pub fn get_license_by_id(&self, license_id: LicenseId) -> Option<LicenseJson> {
        match self.licenses_by_id.get(&license_id) {
            Some(l) => Some(l.to_json()),
            None => None,
        }
    }

    pub fn get_licenses_per_creator(&self, account_id: AccountId) -> Option<Vec<LicenseJson>> {
        let mut result = Vec::<LicenseJson>::new();
         match self.licenses_per_creator.get(&account_id) {
            Some(licenses) => {  
                for license_id in licenses.iter() {
                    self.get_license_by_id(license_id).map(|l| {
                        result.push(l);
                    });
                }
                Some(result)
            },
            _ =>  None
        }
    }
}
