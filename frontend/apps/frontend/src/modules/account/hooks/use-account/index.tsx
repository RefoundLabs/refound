import type { Account } from "near-api-js";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNear } from "../use-near";
//import type { Wallet } from "ethers";
import type {
	AccountView,
	CodeResult,
  } from "near-api-js/lib/providers/provider";
type AccountRole = "user" | "verifier";
type WalletType = "near" | "web3auth";

type BaseState = {
	signIn: (walletType: WalletType) => Promise<void>;
	signOut: () => Promise<void>;
};

type AccountState =
	| {
			isSignedIn: true;
			account: Account;
			balance: string;
			id: string;
			role: AccountRole;
	  }
	| {
			isSignedIn: false;
			account?: Account;
			balance?: string;
			id?: string;
			role?: AccountRole;
	  };

type State = BaseState & AccountState;

const initialState: State = {
	isSignedIn: false,
	//account: undefined,
	balance: undefined,
	id: undefined,
	role: undefined,
	signIn: async () => {
		console.warn("SignIn not initialized");
	},
	signOut: async () => {
		console.warn("SignOut not initialized");
	},
};

const AccountContext = createContext<State>(initialState);
export const useAccount = () => useContext(AccountContext);

export const AccountContextProvider = ({ children }: { children: ReactNode }) => {
	const { wallet, account, provider, checkIsLoggedIn, requestSignInNear, requestSignInWeb3Auth, requestSignOut } = useNear();
	const [accountState, setAccountState] = useState<AccountState>({ isSignedIn: false });

	const reset = useCallback(() => {
		setAccountState({ isSignedIn: false });
	}, []);

	const initAccount = useCallback(async () => {
		if (!window) {
			console.warn("tried to init account outside of browser context");
			return;
		}

		const savedRole = (sessionStorage.getItem("role") as AccountRole) || "user";
		const savedWallet = (sessionStorage.getItem("walletType") as WalletType) || "near";
		console.log('session storage')
		console.log(savedRole);
		console.log(savedWallet);
		
		if (!checkIsLoggedIn() || !account) {
			reset();
			return;
		}
		
		const id = account.accountId;
		const totalBalance = await getAccountBalance(id);
		console.log(totalBalance);

		// if(savedWallet == "web3auth"){
		// 	totalBalance = await account.getAccountBalance().toString();
		// 	console.log(totalBalance);
		// }else if(savedWallet == "near"){
		// 	totalBalance = await getAccountBalance(id);
		// 	console.log("totalabalance" + totalBalance);
		// }

		setAccountState({
			isSignedIn: true,
			balance: totalBalance,
			id,
			account,
			role: savedRole,
		});
		
	}, [accountState, account]);


	const getAccountBalance = async ({
		accountId
	  }: any) => {
		try {
		  const { amount } = await provider.query<AccountView>({
			request_type: "view_account",
			finality: "final",
			account_id: accountId,
		  });
		  const bn = (amount).toString();
		  return bn;
		} catch {
		  return  "0";
		}
	  };

	const signIn = async (type: WalletType) => {
		sessionStorage.setItem("walletType", type);
		console.log('setting wallet type:'+type);
		console.log(type);
		if(type.toString() == "near"){
			await requestSignInNear();
		}else if(type.toString() == "web3auth"){
			await requestSignInWeb3Auth();
		}
		
	};

	const signOut = async () => {
		sessionStorage.removeItem("walletType");
		await requestSignOut();
		reset();
	};

	useEffect(() => {
		initAccount();
	}, [account]);

	const value: State = {
		...accountState,
		signIn,
		signOut,
	};

	return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};
