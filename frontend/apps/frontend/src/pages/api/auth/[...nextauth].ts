import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getCsrfToken } from "next-auth/react";
import { connect, KeyPair, keyStores, utils } from "near-api-js";

const myKeyStore = new keyStores.InMemoryKeyStore();

const contractName = "v15.refound.testnet";//"dev-1616611682822-1712761";

const config = {
  myKeyStore,
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  GAS: "200000000000000",
  DEFAULT_NEW_ACCOUNT_AMOUNT: "5",
  GUESTS_ACCOUNT_SECRET:
    "7UVfzoKZL4WZGF98C3Ue7tmmA6QamHCiB1Wd5pkxVPAc7j6jf3HXz5Y9cR93Y68BfGDtMLQ9Q29Njw5ZtzGhPxv",
  contractMethods: {
    changeMethods: [
      "new",
      "nft_mint",
      "nft_transfer",
      "add_guest",
      "remove_guest",
      "nft_approve_account_id",
      "nft_mint_guest",
      "nft_add_sale_guest",
      "nft_remove_sale_guest",
      "upgrade_guest",
    ],
    viewMethods: ["get_guest", "get_token_ids", "nft_token", "get_sale"],
  },
  marketDeposit: "100000000000000000000000",
  marketId: "market." + contractName,
};

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: any, res: any) {
  const providers = [
    CredentialsProvider({
      name: "NEAR Refound",
      credentials: {
        // Take public key from message
        public_key: {
          label: "public key",
          type: "text",
          placeholder: "0x0",
        },
        account_id: {
          label: "account_id",
          type: "text",
          placeholder: "bob" + "." + contractName + "." + config.networkId,
        },
      },

      async authorize(credentials, req) {
        try {
          const near = await connect(config);

          const publicKey = credentials?.public_key || "";
          const accountId = credentials?.account_id || "";

          const contractId = contractName + "." + config.networkId;
          /// setup signer for guestAccount txs
          const guestId = "guests." + contractId;
          // creates a public / private key pair using the provided private key
          const guestKeyPair = KeyPair.fromString(
            process.env.GUESTS_ACCOUNT_SECRET
          );

          // adds the keyPair you created to keyStore
          await myKeyStore.setKey(config.networkId, guestId, guestKeyPair);

          const guestsAccount = await near.account(guestId);

          // TODO: CREATE CONTRACT
          // const addKey = await guestsAccount.addKey(
          //   publicKey,
          //   contractId,
          //   config.contractMethods.changeMethods,
          //   utils.format.parseNearAmount("0.1")
          // );

          // Refound Account
          const contractAccount = await near.account(contractName);
          // TODO: CREATE CONTRACT
          // const add_guest = await contractAccount.functionCall({
          //   contractId: contractId,
          //   methodName: "add_guest",
          //   args: {
          //     new_account_id: accountId,
          //     new_public_key: publicKey,
          //   },
          //   gas: config.GAS,
          //   attachedDeposit: utils.format.parseNearAmount("0"),
          // });

          return { id: guestId };
          // return { success: true, result: { addKey, add_guest } };

          // console.log(`public_key: ${publicKey}`);
          // console.log(`account_id: ${accountId}`);
          // return { id: "guestId" };
        } catch (e) {
          console.log(e);
          return null;
        }
      },
    }),
    // FIXME: THIS IS NEEDED OR ELSE THE UI IS BROKEN
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ];

  const isDefaultSigninPage =
    req.method === "GET" && req.query.nextauth.includes("signin");

  // Hide Sign-In with Near from default sign page
  if (isDefaultSigninPage) {
    providers.pop();
  }

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        session.address = token.sub;
        session.user.name = token.sub;
        session.user.image = "https://www.fillmurray.com/128/128";
        return session;
      },
    },
  });
}
