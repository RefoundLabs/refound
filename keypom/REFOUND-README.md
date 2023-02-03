# Overview

The KeyPom Refound onboarding allows for seemless acplication interacttion without previously having a Near Wallet.

There are two main implications:

1. Refound is able to give the best UX experiece for users who don’t already have a NEAR wallet and have been previously onboarded
2. NGOs and other organization can select which inviduals get to interact with a specific post or action on refound for selective onboarding.

# Quck Start Guide

Generalized setup steps for the keypom — more details are provided please see [Keypom](https://github.com/keypom/keypom) documentation if more details and setup is needed.

## Prerequisites

In order to successfully interact with this contract using the deploy scripts, you should have the following:

- [NEAR account](https://docs.near.org/concepts/basics/account)
- [Node JS](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

NOTE: This is following Keypom README.md

## Running Scripts

First is an example to mint function keys that will work we refound:

Change directory and yarn install

```jsx
cd keypom && yarn
```

### Simple Drop

Run

```jsx
yarn simple
```

This will log the function keys/linkdrops needed to interact with refound fast onboarding page
Following code demonstrates the Near Drop

```jsx
await fundingAccount.functionCall(
  KEYPOM_CONTRACT,
  "create_drop",
  {
    public_keys: pubKeys,
    deposit_per_use: DEPOSIT_PER_USE,
    config: DROP_CONFIG,
    metadata: JSON.stringify(DROP_METADATA),
  },
  "300000000000000"
);
```

To change certain parameters you can modify `deploy/simple/configurations.js`

```jsx
const DROP_CONFIG = {
  // How many claims can each key have.
  uses_per_key: 100,

  // Should the drop be automatically deleted when all the keys are used? This is defaulted to false and
  // Must be overwritten
  delete_on_empty: true,

  // When this drop is deleted and it is the owner's *last* drop, automatically withdraw their balance.
  auto_withdraw: true,

  // Minimum block timestamp that keys can be used. If None, keys can be used immediately
  // Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
  start_timestamp: null,

  // How often can a key be used
  // Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
  throttle_timestamp: null,

  // If claim is called, refund the deposit to the owner's balance. If None, default to false.
  on_claim_refund_deposit: null,

  // Can the access key only call the claim method_name? Default to both method_name callable
  claim_permission: null,

  // Root account that all sub-accounts will default to. If None, default to the global drop root.
  drop_root: null,
};
```

### NFT Drop

Run

```jsx
yarn nft
```

This will log the function keys/linkdrops needed to interact with refound fast onboarding page

Following code show the NFT drop

```jsx
await fundingAccount.functionCall(
  KEYPOM_CONTRACT,
  "create_drop",
  {
    public_keys: pubKeys,
    deposit_per_use: DEPOSIT_PER_USE,
    config: DROP_CONFIG,
    metadata: JSON.stringify(DROP_METADATA),
    nft_data: NFT_DATA,
  },
  "300000000000000"
);
```

To change certain parameters you can modify `deploy/nft/configurations.js`

```jsx
const NFT_DATA = {
  // NFT Contract Id that the tokens will come from
  contract_id: NFT_CONTRACT_ID,
  // Who will be sending the NFTs to the Keypom contract
  sender_id: FUNDING_ACCOUNT_ID,
};

const DROP_CONFIG = {
  // How many claims can each key have.
  uses_per_key: 100,

  // Should the drop be automatically deleted when all the keys are used? This is defaulted to false and
  // Must be overwritten
  delete_on_empty: true,

  // When this drop is deleted and it is the owner's *last* drop, automatically withdraw their balance.
  auto_withdraw: true,

  // Minimum block timestamp that keys can be used. If None, keys can be used immediately
  // Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
  start_timestamp: null,

  // How often can a key be used
  // Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
  throttle_timestamp: null,

  // If claim is called, refund the deposit to the owner's balance. If None, default to false.
  on_claim_refund_deposit: null,

  // Can the access key only call the claim method_name? Default to both method_name callable
  claim_permission: null,

  // Root account that all sub-accounts will default to. If None, default to the global drop root.
  drop_root: null,
};
```

## Notes

- Refound uses keypom for easy onboarding which improves the UX and onboarding
- Future improvments are
  - Building an linkdrop for NFT creation at user-interaction instead of pre-existing NFT drop
  - Convert Password protected keys to more flexible onboarding such as DKG/MPC keys or using an oracle service.

[Refound keypom user journey](https://www.notion.so/Refound-keypom-user-journey-2a999127ab334ebd815fc5bd8131c92a)
