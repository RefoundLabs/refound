#!/bin/bash
set -e

./build.sh

if [ $? -ne 0 ]; then
  echo ">> Error building contract"
  exit 1
fi

echo ">> Deploying contract"

export NEAR_ENV="testnet"
MASTER_ACCOUNT_ADDRESS="refound.testnet"
ADMIN_ADDRESS="refound_admin.testnet"
CONTRACT_ADDRESS="v15.refound.testnet"

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"


# create contract account
near create-account $CONTRACT_ADDRESS --masterAccount $MASTER_ACCOUNT_ADDRESS --initialBalance 10

# Deploy Contract
NEAR_ENV=testnet near deploy --wasmFile ./res/nft_simple.wasm  --initFunction new_default_meta --initArgs '{"owner_id": "'$ADMIN_ADDRESS'"}'  --accountId $CONTRACT_ADDRESS

# Redeploy Contract
#NEAR_ENV=testnet near deploy --wasmFile ./target/wasm32-unknown-unknown/release/nft_simple.wasm --accountId $CONTRACT_ADDRESS