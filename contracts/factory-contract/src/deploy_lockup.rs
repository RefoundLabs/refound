use near_sdk::serde::Serialize;

use near_sdk::{env, log, near_bindgen, AccountId, Balance, Promise, PromiseError, PublicKey};

use crate::{Contract, ContractExt, NEAR_PER_STORAGE, NO_DEPOSIT, TGAS};

use crate::{TransfersInformation, VestingScheduleOrHash, WrappedDuration, WrappedTimestamp};

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// LOCKUP CONTRACT ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
struct LockupInitArgs {
    owner_account_id: AccountId,
    lockup_duration: WrappedDuration,
    lockup_timestamp: Option<WrappedTimestamp>,
    transfers_information: TransfersInformation,
    vesting_schedule: Option<VestingScheduleOrHash>,
    release_duration: Option<WrappedDuration>,
    staking_pool_whitelist_account_id: AccountId,
    foundation_account_id: Option<AccountId>,
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn create_factory_subaccount_and_deploy_lockup(
        &mut self,
        name: String,
        // INIT ARGS
        owner_account_id: AccountId,
        lockup_duration: WrappedDuration,
        lockup_timestamp: Option<WrappedTimestamp>,
        transfers_information: TransfersInformation,
        vesting_schedule: Option<VestingScheduleOrHash>,
        release_duration: Option<WrappedDuration>,
        staking_pool_whitelist_account_id: AccountId,
        foundation_account_id: Option<AccountId>,

        public_key: Option<PublicKey>,
    ) -> Promise {
        // Assert the sub-account is valid
        let current_account = env::current_account_id().to_string();
        let subaccount: AccountId = format!("{name}.{current_account}").parse().unwrap();
        assert!(
            env::is_valid_account_id(subaccount.as_bytes()),
            "Invalid subaccount"
        );

        // Assert enough money is attached to create the account and deploy the contract
        let attached = env::attached_deposit();

        let contract_bytes = self.lockup_code.len() as u128;
        let minimum_needed = NEAR_PER_STORAGE * contract_bytes;
        assert!(
            attached >= minimum_needed,
            "Attach at least {minimum_needed} yⓃ"
        );

        let init_args = near_sdk::serde_json::to_vec(&LockupInitArgs {
            owner_account_id,
            lockup_duration,
            lockup_timestamp,
            transfers_information,
            vesting_schedule,
            release_duration,
            staking_pool_whitelist_account_id,
            foundation_account_id,
        })
        .unwrap();

        let mut promise = Promise::new(subaccount.clone())
            .create_account()
            .transfer(attached)
            .deploy_contract(self.donation_code.clone())
            .function_call("new".to_owned(), init_args, NO_DEPOSIT, TGAS * 5);

        // Add full access key is the user passes one
        if let Some(pk) = public_key {
            promise = promise.add_full_access_key(pk);
        }

        // Add callback
        promise.then(
            Self::ext(env::current_account_id())
                .create_factory_subaccount_and_deploy_lockup_callback(
                    subaccount,
                    env::predecessor_account_id(),
                    attached,
                ),
        )
    }

    #[private]
    pub fn create_factory_subaccount_and_deploy_lockup_callback(
        &mut self,
        account: AccountId,
        user: AccountId,
        attached: Balance,
        #[callback_result] create_deploy_result: Result<(), PromiseError>,
    ) -> bool {
        if let Ok(_result) = create_deploy_result {
            log!(format!("Correctly created and deployed to {account}"));
            return true;
        };

        log!(format!(
            "Error creating {account}, returning {attached}yⓃ to {user}"
        ));
        Promise::new(user).transfer(attached);
        false
    }
}
