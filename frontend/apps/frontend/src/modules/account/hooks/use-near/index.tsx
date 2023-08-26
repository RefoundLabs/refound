import type { ConnectConfig, Near } from "near-api-js";
import { connect, keyStores, WalletConnection } from "near-api-js";
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

const NEAR_CONFIG: ConnectConfig = {
	networkId: "testnet",
	// keyStore: new keyStores.BrowserLocalStorageKeyStore(),
	nodeUrl: "https://rpc.testnet.near.org",
	walletUrl: "https://wallet.testnet.near.org",
	helperUrl: "https://helper.testnet.near.org",
	// explorerUrl: "https://explorer.testnet.near.org",
};

type State = {
	near?: Near;
	wallet?: WalletConnection;
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
	//const [near, setNear] = useState<State["near"]>(initialState.near);
	//const [wallet, setWallet] = useState<State["wallet"]>(initialState.wallet);
	const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_SERIES_ADDRESS as string; // TODO: from .env

	
	const [web3auth, setWeb3auth] = useState<any>();
  	const [provider, setProvider] = useState<any>();
	const [selector, setSelector] = useState<any>();
  	const [nearModal, setNearModal] = useState<any>();
	const [address, setAddress] = useState("");
	const [accounts, setAccounts] = useState<any>();

	const initNear = useCallback(async () => {
		if (!window) {
			console.warn("Tried to init Near connection in non-browser environment.");

			return;
		}

		// const nearConnection = await connect({
		// 	...NEAR_CONFIG,
		// 	keyStore:  typeof window === "undefined"
		// 	? new keyStores.InMemoryKeyStore()
		// 	: new keyStores.BrowserLocalStorageKeyStore()
		// });
		// setNear(nearConnection);

		// if (!nearConnection) {
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

		
	}, []);

	const checkIsLoggedIn = useCallback(() => 
		{
			if(selector) return selector.isSignedIn();
		},
	[]);

	const requestSignInWeb3Auth = useCallback(async () => {
		
		const web3auth = new Web3Auth({
			clientId: "BNlvcdTZ8l4U1qFhWxpgFr_jms49M8_OkK4MzU-UgcA77dK5u9f_zdVEQCPF2FkjRdAPivQJikFjJdmhucCanr4", // get it from Web3Auth Dashboard
			web3AuthNetwork: "testnet", // "testnet" or "mainnet, "cyan", "aqua"
			chainConfig: {
			  chainNamespace: "eip155", // for all non EVM and SOLANA chains, use "other"
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
		setWeb3auth(web3auth);
		setProvider(web3authProvider);

	}, [provider, web3auth]);

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
		})
		

		const modal = setupModal(selector, {
			contractId: contractAddress,
			theme : "dark"
		})
		setNearModal(modal);
		setSelector(selector);
		modal.show();

		// const wallet = await selector.wallet();
		// const accounts = await wallet.signIn({ contractId: contractAddress });
    	// const accounts = await wallet.getAccounts();
		// setAccounts(accounts);
		
		
	}, [selector, nearModal, accounts]);

	const requestSignOut = useCallback(async () => {
		// if (!wallet) {
		// 	console.warn("Cannot sign out, wallet not found");
		// 	return;
		// }

		// wallet.signOut();
		// router.push("/");

		//near wallet sign out
		if(selector){
			const wallet = await selector.wallet();

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
			web3auth, nearModal, accounts, selector,
			checkIsLoggedIn,
			requestSignInNear,
			requestSignInWeb3Auth,
			requestSignOut,
		}),
		[ web3auth, nearModal, accounts, selector, checkIsLoggedIn, requestSignInNear, requestSignInWeb3Auth, requestSignOut],
	);

	return <NearContext.Provider value={value}>{children}</NearContext.Provider>;
};
