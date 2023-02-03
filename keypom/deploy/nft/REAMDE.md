# Deploy

NFT-series keypom

```bash
near deploy --wasmFile __tests__/ext-wasm/nft-series.wasm --accountId nft.slyracoon-nonledger.testnet
```

# Inialize contract

```bash
near call $NFT_CONTRACT_ID new_default_meta '{"owner_id": "'$NFT_CONTRACT_ID'"}' --accountId $NFT_CONTRACT_ID
```
