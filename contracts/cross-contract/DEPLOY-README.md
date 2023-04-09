## 1. Initalize smart-contract

`init` will create a sub-account of the factory and deploy the
stored contract on it.

```bash
near call <cross-contract-account> init '{ "nft_series_account": "<nft_series_account>"}' --accountId <account-id> --gas 300000000000000
```

## 2. Call query_nft_supply

`query_nft_supply` will return the number of NFTs minted for a given NFT series.

```bash
near call dev-1668989623846-57617132588473  query_nft_supply  --accountId dev-1668989623846-57617132588473 --gas 300000000000000
```
