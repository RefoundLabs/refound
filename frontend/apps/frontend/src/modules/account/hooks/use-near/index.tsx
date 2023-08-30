import type { Account, ConnectConfig, Near } from "near-api-js";
//import { connect, keyStores, WalletConnection } from "near-api-js";
import { connect, KeyPair, keyStores, utils } from "near-api-js";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { config } from "@config/config";
import { useRouter } from "next/router";
import { ContractFactory, ethers } from "ethers";
import { Web3Auth } from "@web3auth/modal";
import Web3 from "web3";
import { setupWalletSelector } from "@near-wallet-selector/core";
import {setupModal} from "@near-wallet-selector/modal-ui";
import {setupNearWallet} from "@near-wallet-selector/near-wallet"
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupNightlyConnect } from "@near-wallet-selector/nightly-connect";
import { setupSender } from "@near-wallet-selector/sender";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import "@near-wallet-selector/modal-ui/styles.css";
import type { Provider } from "near-api-js/lib/providers";
import { textInputRule } from "@tiptap/react";

const NEAR_CONFIG: ConnectConfig = {
	networkId: "testnet",
	// keyStore: new keyStores.BrowserLocalStorageKeyStore(),
	nodeUrl: "https://rpc.testnet.near.org",
	walletUrl: "https://wallet.testnet.near.org",
	helperUrl: "https://helper.testnet.near.org",
	//explorerUrl: "https://explorer.testnet.near.org",
};

type State = {
	near?: Near;
	//wallet?: WalletConnection;
	wallet?: any;
	provider?: Provider;
	account?: Account;
	checkIsLoggedIn: () => boolean;
	requestSignInNear: () => Promise<void>;
	requestSignInWeb3Auth: () => Promise<void>;
	requestSignOut: () => Promise<void>;
};

const initialState: State = {
	checkIsLoggedIn: () => {
		console.warn("checkIsLoggedIn is not initialized");
		return false;
	},
	requestSignInNear: async () => {
		console.warn("sign in not initialized");
	},
	requestSignInWeb3Auth: async () => {
		console.warn("sign in not initialized");
	},
	requestSignOut: async () => {
		console.warn("sign out not initialized");
	},
};

const NearContext = createContext<State>(initialState);
export const useNear = () => useContext(NearContext);

export const NearContextProvider = ({ children }: { children: ReactNode }) => {
	const router = useRouter();
	const [near, setNear] = useState<State["near"]>(initialState.near);
	//const [wallet, setWallet] = useState<State["wallet"]>(initialState.wallet);
	const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_SERIES_ADDRESS as string; // TODO: from .env

	
  	const [provider, setProvider] = useState<any>();
	const [web3auth, setWeb3Auth] = useState<any>();
	const [selector, setSelector] = useState<any>();
  	const [nearModal, setNearModal] = useState<any>();
	const [wallet, setWallet] = useState<any>();
	const [account, setAccount] = useState<any>();

	const initNear = useCallback(async () => {
		if (!window) {
			console.warn("Tried to init Near connection in non-browser environment.");

			return;
		}

		const nearConnection = await connect({
			...NEAR_CONFIG,
			keyStore:  typeof window === "undefined"
			? new keyStores.InMemoryKeyStore()
			: new keyStores.BrowserLocalStorageKeyStore()
		});
		//console.log(nearConnection)
		setNear(nearConnection);

		// if (!near) {
		// 	console.error("cannot connect to near");
		// 	setNear(undefined);
		// 	setWallet(undefined);
		// 	return;
		// }

		//const walletConnection = new WalletConnection(nearConnection, null);
		//setWallet(walletConnection);

		// if (!WalletConnection) {
		// 	console.error("cannot connect to near wallet");

		// 	return;
		// }
		console.log("near initialized");
	}, []);

	const checkIsLoggedIn = useCallback(() => 
		{
			if(account) {
				return true;
			}
			if(wallet){
				return wallet.isSignedIn();
			}
		},
	[account, wallet]);

	const requestSignInWeb3Auth = useCallback(async () => {
		
		const web3auth = new Web3Auth({
			clientId: "BNlvcdTZ8l4U1qFhWxpgFr_jms49M8_OkK4MzU-UgcA77dK5u9f_zdVEQCPF2FkjRdAPivQJikFjJdmhucCanr4", // get it from Web3Auth Dashboard
			web3AuthNetwork: "testnet", // "testnet" or "mainnet, "cyan", "aqua"
			chainConfig: {
			  chainNamespace: "other", // for all non EVM and SOLANA chains, use "other"
			  rpcTarget: "https://rpc.testnet.near.org",
			  displayName: "Near",
			  chainId: "near",
			  blockExplorer: "https://explorer.testnet.near.org",
			  ticker: "NEAR",
			  tickerName: "NEAR",
			},
		});

		console.log("web3auth initialized");

		await web3auth.initModal();
		const web3authProvider = await web3auth.connect(); // web3auth.provider
		setProvider(web3authProvider);
		setWeb3Auth(web3auth);

		const privateKey = await web3authProvider?.request({ method: "private_key" }) as string;

		// Convert the secp256k1 key to ed25519 key
		const { getED25519Key } = await import("@toruslabs/openlogin-ed25519");
		
		if(near && privateKey){
			const privateKeyEd25519 = getED25519Key(privateKey).sk.toString("hex");

			// Convert the private key to Buffer
			const privateKeyEd25519Buffer = Buffer.from(privateKeyEd25519, "hex");

			// Convert the private key to base58
			const bs58encode = utils.serialize.base_encode(privateKeyEd25519Buffer);

			// Convert the base58 private key to KeyPair
			const keyPair = KeyPair.fromString(bs58encode);

			// publicAddress
			const publicAddress = keyPair?.getPublicKey().toString();

			// accountId is the account address which is where funds will be sent to.
			const accountId = utils.serialize.base_decode(publicAddress.split(":")[1]).toString("hex");

			const account = await near.account(accountId);
			setAccount(account);
			//console.log('web3auth set near account');
			console.log(account);
			router.push("/discover");
		}
	}, [account, provider]);

	const requestSignInNear = useCallback(async () => {
		// if (!wallet) {
		// 	console.warn("Cannot sign in, wallet not found");
		// 	return;
		// }

		// await wallet.requestSignIn({
		// 	successUrl: `${config.site.host}/discover`,
		// 	failureUrl: `${config.site.host}/sign-in`,
		// });
		console.log('sign in with near');
		const selector = await setupWalletSelector({
			network: "testnet",
			modules: [
				setupMyNearWallet(),
				setupLedger(),
				setupNearWallet(),
				setupSender(),
				setupNightly(),
				setupWelldoneWallet(),
				setupNearFi(),
				setupMeteorWallet(),
				setupHereWallet()
			  ],
		});

		const modal = setupModal(selector, {
			contractId: contractAddress,
			theme : "dark"
		})
		setSelector(selector);
		modal.show();

		const wallet = await selector.wallet();
		console.log(wallet);
		setWallet(wallet);

		const accounts = await wallet.getAccounts();
		//setAccount(accounts[0])
		
		if(near){
			const account = await near.account(accounts[0].accountId);
			setAccount(account);
			router.push("/discover");
		}	
	
		
		modal.hide();
		
	}, [wallet, selector, nearModal, account]);

	const requestSignOut = useCallback(async () => {
		// if (!wallet) {
		// 	console.warn("Cannot sign out, wallet not found");
		// 	return;
		// }

		// wallet.signOut();
		// router.push("/");

		//near wallet sign out
		if(wallet){
			wallet.signOut().catch((err:any) => {
			console.log("Failed to sign out");
			console.error(err);
			});
		}

		//web3auth
		if(web3auth){
			await web3auth.logout();
			setProvider(null);
		}
	}, []);

	useEffect(() => {
		initNear();
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, []);

	const value: State = useMemo(
		() => ({
			wallet, provider, account, selector,
			checkIsLoggedIn,
			requestSignInNear,
			requestSignInWeb3Auth,
			requestSignOut,
		}),
		[ wallet, provider,  account, selector, near, checkIsLoggedIn, requestSignInNear, requestSignInWeb3Auth, requestSignOut],
	);

	return <NearContext.Provider value={value}>{children}</NearContext.Provider>;
};
