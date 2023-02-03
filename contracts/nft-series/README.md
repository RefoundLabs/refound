# Tutorial

https://docs.near.org/tutorials/nfts/series#new-contract-file-structure

# Build and Deploy the contract

```bash
./build.sh
```

and

```bash
./deploy.sh
```

# Create NFT contract metadata

```bash
near call $NFT_CONTRACT_ID new_default_meta '{"owner_id": "'$NFT_CONTRACT_ID'"}' --accountId $NFT_CONTRACT_ID
```

# Creating Basic Series

```bash
near call $NFT_CONTRACT_ID create_series '{"id": 1, "metadata": {"title": "SERIES!", "description": "testing out the new series contract", "media": "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif"}}' --accountId $NFT_CONTRACT_ID --amount 1
```

# Get Series

```bash
near view $NFT_CONTRACT_ID get_series
```

# Change Series Verification

```bash
near call $NFT_CONTRACT_ID change_series_verification '{"id": 1, "verified": true}' --accountId $NFT_CONTRACT_ID
```

# Voting on Series

```bash
near call $NFT_CONTRACT_ID vote '{"id": "1"}' --accountId $NFT_CONTRACT_ID
```

# Get Votes fo Series

```bash
near view $NFT_CONTRACT_ID get_votes '{"id": "1"}'
```

# get Total Votes for Series

```bash
near view $NFT_CONTRACT_ID get_total_votes '{"id": "1"}'
```

# set Vote result for Series

```bash
near call $NFT_CONTRACT_ID set_vote_result '{"id": "1"}' --accountId $NFT_CONTRACT_ID
```

NOTE: This sets the timestamp(unix) and stops voting

# get Vote Result

```bash
near view $NFT_CONTRACT_ID get_vote_result '{"id": "1"}'
```

NOTE
WHY SERIES NEEDS STRING vs INT
