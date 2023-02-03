import anyTest, { TestFn } from "ava";
import { Account, NEAR, NearAccount, Worker } from "near-workspaces";
import {
  CONTRACT_METADATA,
  generateKeyPairs,
  LARGE_GAS,
  queryAllViewFunctions,
  WALLET_GAS,
} from "../utils/general";
import {
  DropConfig,
  JsonKeyInfo,
  JsonNFTData,
  JsonToken,
} from "../utils/types";
import {
  keypom_args,
  mintNFTs,
  nftMetadata,
  nftSeriesMetadata,
  sendNFTs,
} from "./utils/nft-utils";

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
  keypomInitialBalance: NEAR;
}>;

test.beforeEach(async (t) => {
  // Comment this if you want to see console logs
  //console.log = function() {}

  // Init the worker and start a Sandbox server
  const worker = await Worker
    .init
    // {
    // network: 'testnet',
    // testnetMasterAccountId: 'dev-1669216070174-16492444596733.testnet',
    // }
    ();

  // Prepare sandbox for tests, create accounts, deploy contracts, etc.
  const root = worker.rootAccount;

  // Deploy all 3 contracts
  const keypom = await root.devDeploy(`./out/keypom.wasm`);
  await root.deploy(`./__tests__/ext-wasm/linkdrop.wasm`);
  // Q: Is this the same nft-series from refound?
  const nftSeries = await root.devDeploy(
    `./__tests__/ext-wasm/nft-series.wasm`
  );

  // Init the 3 contracts
  await root.call(root, "new", {});
  await keypom.call(keypom, "new", {
    root_account: "test.near",
    owner_id: keypom,
    contract_metadata: CONTRACT_METADATA,
  });
  // TODO: change init args
  await nftSeries.call(nftSeries, "new", {
    owner_id: nftSeries,
    metadata: nftSeriesMetadata,
  });

  // Test users
  const ali = await root.createSubAccount("ali");
  const owner = await root.createSubAccount("owner");
  const minter = await root.createSubAccount("minter");

  // Add 10k $NEAR to owner's account

  await root.transfer(owner, "10000000000000000000000000");
  // await owner.updateAccount({
  //   amount: NEAR.parse("10000 N").toString(),
  // });

  await owner.call(keypom, "add_to_balance", {}, { attachedDeposit: "0" });

  // Mint the NFT
  // TODO: change mint args
  await nftSeries.call(
    nftSeries,
    "create_series",
    { mint_id: 0, metadata: nftMetadata },
    { attachedDeposit: NEAR.parse("1").toString() }
  );
  // Q: Why are keypom args needed here?
  await nftSeries.call(
    nftSeries,
    "nft_mint",
    { mint_id: "0", receiver_id: minter, keypom_args },
    { attachedDeposit: NEAR.parse("1").toString() }
  );

  let keypomBalance = await keypom.balance();
  console.log("keypom available INITIAL: ", keypomBalance.available.toString());
  console.log("keypom staked INITIAL: ", keypomBalance.staked.toString());
  console.log(
    "keypom stateStaked INITIAL: ",
    keypomBalance.stateStaked.toString()
  );
  console.log("keypom total INITIAL: ", keypomBalance.total.toString());

  // Save state for test runs
  t.context.worker = worker;
  t.context.accounts = { root, keypom, owner, ali, minter, nftSeries };
  t.context.keypomInitialBalance = keypomBalance.available;
});

// If the environment is reused, use test.after to replace test.afterEach
test.afterEach(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("Claim Multi NFT Drop And Ensure Keypom Balance Increases", async (t) => {
  const { keypom, owner, ali, nftSeries, minter } = t.context.accounts;
  const keypomInitialBalance = t.context.keypomInitialBalance;

  console.log("adding to balance");
  await owner.call(
    keypom,
    "add_to_balance",
    {},
    { attachedDeposit: NEAR.parse("20").toString() }
  );

  // KEYS ARE Generated
  let { keys, publicKeys } = await generateKeyPairs(6);
  let nft: JsonNFTData = {
    sender_id: minter.accountId,
    contract_id: nftSeries.accountId,
  };
  let config: DropConfig = {
    uses_per_key: 2,
  };

  // Creating the NFT drop with 5 keys
  await owner.call(
    keypom,
    "create_drop",
    {
      public_keys: publicKeys.slice(0, 5),
      deposit_per_use: NEAR.parse("1").toString(),
      nft,
      config,
    },
    { gas: LARGE_GAS }
  );

  // Get roughly the min for storing those token IDs
  await owner.call(keypom, "withdraw_from_balance", {});
  await owner.call(
    keypom,
    "add_to_balance",
    {},
    { attachedDeposit: NEAR.parse("0.009").toString() }
  );

  // Mint another 9 NFTs (there is now 10 in total)
  await mintNFTs(minter, nftSeries, "0", 9);
  await sendNFTs(
    minter,
    ["1:1", "1:2", "1:3", "1:4", "1:5", "1:6", "1:7", "1:8", "1:9", "1:10"],
    keypom,
    nftSeries,
    "0"
  );

  let viewFunctions = await queryAllViewFunctions({
    contract: keypom,
    account_id: owner.accountId,
    drop_id: "0",
  });
  console.log("viewFunctions.dropInformation: ", viewFunctions.dropInformation);
  console.log("viewFunctions.keysForDrop: ", viewFunctions.keysForDrop);
  t.is(viewFunctions.dropInformation?.registered_uses, 10);

  let tokenInfos: JsonToken[] = await nftSeries.view("nft_tokens_for_owner", {
    account_id: keypom.accountId,
  });
  console.log("tokenInfos: ", tokenInfos);
  t.is(tokenInfos.length, 10);

  // 10 NFTs with Near have ben minted and sent to keypom
  for (let i = 0; i < 5; i++) {
    console.log("claiming key: ", keys[i]);
    await keypom.setKey(keys[i]);
    // Remove access updating
    // await keypom.updateAccessKey(
    //   keys[i], // public key
    //   {
    //     nonce: 0,
    //     permission: "FullAccess",
    //   }
    // );

    // Create an account and clams the NFT
    await keypom.call(
      keypom,
      "create_account_and_claim",
      { new_account_id: `${i}.test.near`, new_public_key: publicKeys[5] },
      { gas: WALLET_GAS }
    );
    await keypom.call(
      keypom,
      "claim",
      { account_id: `${i}.test.near` },
      { gas: WALLET_GAS }
    );

    let tokenInfos: JsonToken[] = await nftSeries.view("nft_tokens_for_owner", {
      account_id: `${i}.test.near`,
    });
    console.log(`account ID: ${i}.test.near`);
    console.log("tokenInfos: ", tokenInfos);
    t.is(tokenInfos[0].owner_id, `${i}.test.near`);
    t.is(tokenInfos[1].owner_id, `${i}.test.near`);
    t.is(tokenInfos.length, 2);
  }

  // tokenInfos = await nftSeries.view("nft_tokens_for_owner", {
  //   account_id: keypom.accountId,
  // });
  // console.log("tokenInfos at END for keypom: ", tokenInfos);
  // t.is(tokenInfos.length, 0);

  // tokenInfos = await nftSeries.view("nft_tokens_for_owner", {
  //   account_id: minter.accountId,
  // });
  // console.log("tokenInfos at END for minter: ", tokenInfos);
  // t.is(tokenInfos.length, 0);

  // viewFunctions = await queryAllViewFunctions({
  //   contract: keypom,
  //   account_id: owner.accountId,
  //   drop_id: "0",
  // });
  // console.log(
  //   "viewFunctions.dropInformation: FINAL ",
  //   viewFunctions.dropInformation
  // );
  // console.log("viewFunctions.keysForDrop: FINAL ", viewFunctions.keysForDrop);
  // t.is(viewFunctions.dropInformation?.registered_uses, 0);
  // t.is(viewFunctions.keysForDrop?.length, 0);

  // await owner.call(keypom, "delete_keys", { drop_id: "0" });
  // let ownerBal = await keypom.view("get_user_balance", { account_id: owner });
  // t.assert(ownerBal !== "0");
  // await owner.call(keypom, "withdraw_from_balance", {});
  // ownerBal = await keypom.view("get_user_balance", { account_id: owner });
  // t.assert(ownerBal === "0");

  // let keypomBalance = await keypom.balance();
  // console.log("keypom available FINAL: ", keypomBalance.available.toString());
  // t.assert(keypomBalance.available > keypomInitialBalance);
});
