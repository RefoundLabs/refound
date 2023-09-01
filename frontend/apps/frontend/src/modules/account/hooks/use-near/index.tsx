import type { Account, ConnectConfig, Near } from "near-api-js";
import { connect, keyStores, WalletConnection } from "near-api-js";
import { KeyPair, utils } from "near-api-js";
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
import {setupRamperWallet} from "@near-wallet-selector/ramper-wallet";
import "@near-wallet-selector/modal-ui/styles.css";

import type { Provider } from "near-api-js/lib/providers";
import { textInputRule } from "@tiptap/react";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import type {Wallet, AccountState} from "@near-wallet-selector/core";

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
	walletConnection?: WalletConnection;
	wallet?: Wallet;
	provider?: Provider;
	account?: Account;
	checkIsLoggedIn: () => boolean;
	requestSignInNear: () => Promise<void>;
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
	requestSignOut: async () => {
		console.warn("sign out not initialized");
	},
};

const NearContext = createContext<State>(initialState);
export const useNear = () => useContext(NearContext);

export const NearContextProvider = ({ children }: { children: ReactNode }) => {
	const router = useRouter();
	const [near, setNear] = useState<State["near"]>(initialState.near);
	const [wallet, setWallet] = useState<State["wallet"]>(initialState.wallet);
	const [walletConnection, setWalletConnection] = useState<State["walletConnection"]>(initialState.walletConnection);
	const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_SERIES_ADDRESS as string; // TODO: from .env

	
  	const [provider, setProvider] = useState<any>();
	const [selector, setSelector] = useState<any>();
  	const [nearModal, setNearModal] = useState<any>();
	//const [wallet, setWallet] = useState<any>();
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

		const walletConnection = new WalletConnection(nearConnection, null);
		setWalletConnection(walletConnection);

		// if (!WalletConnection) {
		// 	console.error("cannot connect to near wallet");

		// 	return;
		// }

		console.log('sign in with near');
		const selector = await setupWalletSelector({
			network: "testnet",
			modules: [
				setupRamperWallet(),
				setupMyNearWallet(),
				setupNearWallet(),
				setupSender(),
				setupNightly(),
				setupWelldoneWallet(),
				setupNearFi(),
				setupMeteorWallet(),
				setupHereWallet(),
				setupLedger(),
			  ],
		});
		setSelector(selector);
		
		const modal = setupModal(selector, {
			contractId: contractAddress,
			theme : "dark"
		})
		setNearModal(modal);

		console.log("near initialized");
	}, []);

	const checkIsLoggedIn = useCallback(() => 
		{
			if(account) {
				return true;
			}
			// if(walletConnection){
			// 	return walletConnection.isSignedIn();
			// }
			return false;
		},
	[walletConnection, account]);

	const requestSignInNear = useCallback(async () => {
		if (!nearModal) {
			console.warn("Cannot sign in, wallet not found");
			return;
		}

		nearModal.show();

		// const accounts = await walletSelector.getAccounts();
		//setAccount(accounts[0])
		
		// if(near){
		// 	const account = await near.account(accounts[0].accountId);
		// 	setAccount(account);
		// 	router.push("/discover");
		// }	

		// if(!walletConnection && near){
		// 	const walletConnection = new WalletConnection(near, null);
		// 	setWalletConnection(walletConnection);

		// 	let account = walletConnection.account();
		// 	setAccount(account);
		// }

		if(walletConnection && selector){
			await walletConnection.requestSignIn({
				contractId: contractAddress,
				successUrl: `${config.site.host}/discover`,
				failureUrl: `${config.site.host}/sign-in`,
			});

			let account = walletConnection.account();
			setAccount(account);
		}
		
	}, [walletConnection, account, nearModal, selector]);

	const requestSignOut = useCallback(async () => {
		if (!walletConnection) {
			console.warn("Cannot sign out, wallet not found");
			return;
		}

		walletConnection.signOut();
		

		//near wallet sign out
		if(selector){
			let wallet = await selector.wallet();
			wallet.signOut().catch((err:any) => {
				console.log("Failed to sign out");
				console.error(err);
			});
		}
		router.push("/");
	}, []);

	useEffect(() => {
		initNear();
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, []);

	const value: State = useMemo(
		() => ({
			wallet, walletConnection, provider, account, selector, 
			checkIsLoggedIn,
			requestSignInNear,
			requestSignOut,
		}),
		[ wallet, provider, account, walletConnection, selector, near, checkIsLoggedIn, requestSignInNear, requestSignOut],
	);

	return <NearContext.Provider value={value}>{children}</NearContext.Provider>;
};
