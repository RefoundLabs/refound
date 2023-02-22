## 1. Deploy the Donations Contract Into a Sub-Account

`create_factory_subaccount_and_deploy_donations` will create a sub-account of the factory and deploy the
stored contract on it.

```bash
near call <factory-account> create_factory_subaccount_and_deploy_donations '{ "name": "donations", "beneficiary": "<account-to-be-beneficiary>"}' --deposit 1.24 --accountId <account-id> --gas 300000000000000
```

This will create the `donations.<factory-account>`, which will have a `donation` contract deployed on it:

```bash
near view donations.<factory-account> get_beneficiary
# expected response is: <account-to-be-beneficiary>
```

## 2. Deploy the Crowdfunding Contract Into a Sub-Account

`create_factory_subaccount_and_crowdfunding_deploy` will create a sub-account of the factory and deploy the
stored contract on it.

```bash
near call <factory-account> create_factory_subaccount_and_deploy_crowdfunding '{ "name": "crowdfunding", "owner": "<account-to-be-owner>"}' --deposit 10 --accountId <account-id> --gas 300000000000000
```

## 3. Deploy the Lockup Contract Into a Sub-Account

`create_factory_subaccount_and_deploy_lockup` will create a sub-account of the factory and deploy the
stored contract on it.

```bash
near call <factory-account> create_factory_subaccount_and_deploy_lockup '{"name": "lockup", "owner_account_id": ",account-to-be-owner", "lockup_duration": "0", "lockup_timestamp": "1535760000000000000", "release_duration": "126230400000000000", "transfers_information": {"TransfersEnabled": {"transfers_timestamp": "1602614338293769340"}}, "vesting_schedule": None, "staking_pool_whitelist_account_id": "<staking-pool-acount-id>", "foundation_account_id": "<foundation-account-id>"}' --deposit 1.24 --accountId <account-id> --gas 300000000000000
```

NOTE: Not Tested

## 4. Deploy the Multisig Contract Into a Sub-Account

`create_factory_subaccount_and_deploy_multisig` will create a sub-account of the factory and deploy the
stored contract on it.

```bash
near call <factory-account> create_factory_subaccount_and_deploy_multisig '{ "name": "multisig", "num_confirmations": <number-of-multisig-confirmations> }' --deposit 10 --accountId <account-id> --gas 300000000000000
```

## 5. Deploy the Voting Contract Into a Sub-Account

`create_factory_subaccount_and_deploy_voting` will create a sub-account of the factory and deploy the
stored contract on it.

```bash
near call <factory-account> create_factory_subaccount_and_deploy_voting '{ "name": "voting"}' --deposit 10 --accountId <account-id> --gas 300000000000000
```

## 6. Deploy the Whitelist Contract Into a Sub-Account

`create_factory_subaccount_and_deploy_whitelist` will create a sub-account of the factory and deploy the
stored contract on it.

```bash
near call <factory-account> create_factory_subaccount_and_deploy_whitelist '{ "name": "whitelist",  "foundation_account_id": "<foundation-account-id>"}' --deposit 10 --accountId <account-id> --gas 300000000000000
```

## 7. Deploy the NFT Contract Into a Sub-Account

`create_factory_subaccount_and_deploy_nft_series` will create a sub-account of the factory and deploy the
stored contract on it.

```bash
near call <factory-account> create_factory_subaccount_and_deploy_nft_series '{ "name": "nft-series", "owner_id": "<owner-id>", "metadata": {   "spec": "nft-1.0.0", "name": "NFT Series Contract", "symbol": "GOTEAM" }}' --deposit 10 --accountId <account-id> --gas 300000000000000
```

NOTE: you can add more metadata fields if you want.

<br>

---

<br>
```
