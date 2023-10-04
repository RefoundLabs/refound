#!/bin/bash
set -e
clear

NEAR_ACCOUNT="manzatest.testnet"
ADMIN_ADDRESS="refound_admin.testnet"
CONTRACT_ID="v15.refound.testnet"
YOCTO_UNITS="000000000000000000000000"
TOTAL_PREPAID_GAS=300000000000000
echo "------------------------- CREATING SERIES"
NEAR_ENV=testnet near call $CONTRACT_ID create_series '{"series_id":"0","metadata":{"title":"A Japanese journalist was barred from entering Hong Kong without a clear reason","description": "A Japanese journalist was barred from entering Hong Kong without a clear reason and was sent back to his country","media":"https://bafybeiafvzgxii6ve7kortc3b5eqir2hmlhvksucqy7txjplnryk5tdsiy.ipfs.w3s.link/","copies": null,"starts_at": null,"issued_at": null,"extra":"{\"locationTaken\":\"Hong Kong, China\",\"dateTaken\":\"6/22/2023\",\"tags\":\"Hong Kong, China\"}"},"price": "10"}' --account_id $ADMIN_ADDRESS --gas $TOTAL_PREPAID_GAS --depositYocto 6860000000000000000000