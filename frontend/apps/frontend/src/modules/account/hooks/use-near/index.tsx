import type { ConnectConfig, Near } from "near-api-js";
//import { connect, keyStores, WalletConnection } from "near-api-js";
import { KeyPair, utils } from "near-api-js";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { config } from "@config/config";
import { useRouter } from "next/router";
import { ContractFactory, ethers } from "ethers";
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
import type {
	AccountView,
	CodeResult,
  } from "near-api-js/lib/providers/provider";
import BN from "bn.js";
import type { Transaction } from "@near-wallet-selector/core";
import { verifyFullKeyBelongsToUser } from "@near-wallet-selector/core";
import { verifySignature } from "@near-wallet-selector/core";
import { providers } from "near-api-js";
import type { Provider } from "near-api-js/lib/providers";
import type {Wallet, Account, AccountState, WalletSelector} from "@near-wallet-selector/core";
import { useWalletSelector } from "./WalletSelectorContext";
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
	//walletConnection?: WalletConnection;
	wallet?: Wallet;
	balance?: BN;
	selector?: WalletSelector;
	provider?: Provider;
	account?: Account;
	accountId?: string;
	checkIsLoggedIn: () => Promise<boolean>;
	requestSignInNear: () => Promise<void>;
	requestSignOut: () => Promise<void>;
};

const initialState: State = {
	checkIsLoggedIn: () => {
		console.warn("checkIsLoggedIn is not initialized");
		return Promise<false>;
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
	const [balance, setBalance] = useState<State["balance"]>(initialState.balance);
	//const [selector, setSelector] = useState<State["selector"]>(initialState.selector);
	//const [walletConnection, setWalletConnection] = useState<State["walletConnection"]>(initialState.walletConnection);
	const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_SERIES_ADDRESS as string; // TODO: from .env
	
	const [account, setAccount] = useState<State["account"]>(initialState.account);
	const [messages, setMessages] = useState<Array<any>>([]);
  	const [provider, setProvider] = useState<any>();
  	const [nearModal, setNearModal] = useState<any>();
	//const [accounts, setAccounts] = useState<any>();
	const [loading, setLoading] = useState<boolean>(false);
	const { selector, modal, accounts, accountId } = useWalletSelector();

	const initNear = useCallback(async () => {
		if (!window) {
			console.warn("Tried to init Near connection in non-browser environment.");

			return;
		}

		
		console.log("near initialized")
	}, []);

	const checkIsLoggedIn = useCallback(async() => 
		{
			const isSignedIn = selector.isSignedIn();
			
			if(isSignedIn) {
				console.log('signed in')
				
				const wal = await selector.wallet();
				setWallet(wal);
				console.log(wal);
				
				setAccount(selector.store.getState().accounts[0]);
				console.log(selector.store.getState().accounts[0]);
				
				//Get Account and Return True
				return true;
				
			}else{
				return false;
			}
		},
	[accounts, selector, account, wallet]);

	const requestSignInNear = useCallback(async () => {
		if (!selector) {
			console.warn("Cannot sign in, wallet not found");
			return;
		}

		//nearModal.show();

		// const accounts = await walletSelector.getAccounts();
		// setAccount(accounts[0])
		
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

		if(selector){
			// await walletConnection.requestSignIn({
			// 	contractId: contractAddress,
			// 	successUrl: `${config.site.host}/discover`,
			// 	failureUrl: `${config.site.host}/sign-in`,
			// });

			// let account = walletConnection.account();
			// setAccount(account);

			//const wallett = await selector.wallet();
			
			//const accounts = await wallett.signIn({contractId: contractAddress});
			//setWallet(wallett);
			//setAccounts(accounts);
			
			handleSignIn();
			
		}
		return null;
		
	}, [accounts, nearModal, wallet, selector]);

	const requestSignOut = useCallback(async () => {
		// if (!walletConnection) {
		// 	console.warn("Cannot sign out, wallet not found");
		// 	return;
		// }

		// walletConnection.signOut();
		

		//near wallet sign out
		// if(selector){
		// 	let wallet = await selector.wallet();
		// 	wallet.signOut().catch((err:any) => {
		// 		console.log("Failed to sign out");
		// 		console.error(err);
		// 	});
		// }

		//wallet-selector-sign-out

		handleSignOut();
		router.push("/");
	}, []);

	//from github wallet selector example
	  const SUGGESTED_DONATION = "0";
	  const BOATLOAD_OF_GAS = utils.format.parseNearAmount("0.00000000003")!;
	  
	  interface GetAccountBalanceProps {
		provider: providers.Provider;
		accountId: string;
	  }
	  
	  const getAccountBalance = async ({
		provider,
		accountId,
	  }: GetAccountBalanceProps) => {
		
		  const { amount } = await provider.query<AccountView>({
			request_type: "view_account",
			finality: "final",
			account_id: accountId,
		  });
		  const bn = new BN(amount);
		  return { bn };
		
	  };

	const getAccount = useCallback(async (): Promise<Account | null> => {
		console.log('get acc');
		if (!accountId) {
			console.log('no account found');
		  	return null;
		}
	
		const { network } = selector.options;
		const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

		const {bn} = await getAccountBalance({
			provider,
			accountId,
		});

		setBalance(bn);
		console.log('balance: ' + bn.toString());	

		if (!bn) {
		  window.alert(
			`Account ID: ${accountId} has not been founded. Please send some NEAR into this account.`
		  );
		  //const wallet = await selector.wallet();
		  //await wallet.signOut();
		  return null;
		}
	
		return provider?.query<AccountView>({
			request_type: "view_account",
			finality: "final",
			account_id: accountId,
		  })
		  .then((data:any) => ({
			...data,
			account_id: accountId,
		  }));
	  }, [accountId, account, wallet, selector]);
	
	  const handleSignOut = async () => {
		const wallet = await selector.wallet();
	
		wallet.signOut().catch((err) => {
		  console.log("Failed to sign out");
		  console.error(err);
		});
	  };
	
	  const handleSwitchWallet = () => {
		modal.show();
	  };
	
	  const handleSwitchAccount = () => {
		const currentIndex = accounts.findIndex((x) => x.accountId === accountId);
		const nextIndex = currentIndex < accounts.length - 1 ? currentIndex + 1 : 0;
	
		const nextAccountId = accounts[nextIndex].accountId;
	
		selector.setActiveAccount(nextAccountId);
	
		alert("Switched account to " + nextAccountId);
	  };

	  const handleSignIn = () => {
		console.log('sign in')
		try{
			modal.show();
		}catch(error:any){
			//window.alert(error);
			
		}

	};

	useEffect(() => {
		if (!accountId) {
		  return setAccount(undefined);
		}
	
		setLoading(true);
		console.log('get account')
		console.log('call get account')
		
		if(!account){
			getAccount().then((nextAccount:any) => {
				setAccount(nextAccount);
				setLoading(false);
				console.log('get account- next account: ')
				console.log(nextAccount);
				//return account;
			}).catch((error:any) => {
				//window.alert(error.toString());
				console.log('error');
				console.log(error);
				//window.alert('You must fund your NEAR wallet before performing any transactions. AccountID: ' + accountId);
				router.push({
					pathname: "/faucet",
					query: {accountId: accountId}
				}, '/faucet');
				
				//handleSignOut();
				//return null;
			});
		}

		if(account){
			console.log(account);
		}
	  }, [account, selector, accountId, getAccount, balance]);
	

	useEffect(() => {
		initNear();
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, []);

	const value: State = useMemo(
		() => ({
			wallet, provider, accounts, selector, account, balance, 
			checkIsLoggedIn,
			requestSignInNear,
			requestSignOut,
		}),
		[ wallet, provider, accounts, account, balance,  selector, near, checkIsLoggedIn, requestSignInNear, requestSignOut],
	);

	return <NearContext.Provider value={value}>{children}</NearContext.Provider>;
};
