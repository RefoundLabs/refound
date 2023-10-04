#!/bin/bash
set -e
clear

NEAR_ACCOUNT="manzatest.testnet"
CONTRACT_ID="v04.refound.testnet"
YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS=300000000000000

echo "------------------------- CREATING SERIES"
NEAR_ENV=testnet near call $CONTRACT_ID create_series '{"id": "0","metadata":{"title":"A Japanese journalist was barred from entering Hong Kong without a clear reason","description": "A Japanese journalist was barred from entering Hong Kong without a clear reason and was sent back to his country","media":"https://bafybeiafvzgxii6ve7kortc3b5eqir2hmlhvksucqy7txjplnryk5tdsiy.ipfs.w3s.link/","copies": "0","starts_at": 0,"issued_at": 342,"extra":"{\"locationTaken\":\"Hong Kong, China\",\"dateTaken\":\"6/22/2023\",\"tags\":\"Hong Kong, China\"}"},"price": "10"}' --account_id $NEAR_ACCOUNT --gas $TOTAL_PREPAID_GAS