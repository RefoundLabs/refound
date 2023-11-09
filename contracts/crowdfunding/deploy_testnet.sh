#!/bin/bash
set -e

./build.sh

if [ $? -ne 0 ]; then
  echo ">> Error building contract"
  exit 1
fi

echo ">> Deploying contract"

export NEAR_ENV="testnet"
MASTER_ACCOUNT_ADDRESS="refoundcrowdfund.testnet"
ADMIN_ADDRESS="genwav.testnet"
CONTRACT_ADDRESS="refoundcrowdfund.testnet"
#contract_addresss increments - v1,v2,v3

YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS="300000000000000"


#create contract account
#near create-account $CONTRACT_ADDRESS --masterAccount $MASTER_ACCOUNT_ADDRESS --initialBalance 3

#Deploy Contract
NEAR_ENV=testnet near deploy --wasmFile ./res/crowdfunding.wasm  --initFunction init --initArgs '{"owner": "'$ADMIN_ADDRESS'"}'  --accountId $CONTRACT_ADDRESS

#Redeploy Contract
#NEAR_ENV=testnet near deploy --wasmFile ./target/wasm32-unknown-unknown/release/nft_simple.wasm --accountId $CONTRACT_ADDRESS