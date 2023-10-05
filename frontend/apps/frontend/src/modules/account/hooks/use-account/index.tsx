import type {  ConnectConfig, Near } from "near-api-js";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useState, useMemo } from "react";
import { useNear } from "../use-near";
import type {Wallet, Account, WalletSelector} from "@near-wallet-selector/core";

//import type { Wallet } from "ethers";
import type {
	AccountView,
	CodeResult,
  } from "near-api-js/lib/providers/provider";
type AccountRole = "user" | "verifier";

type BaseState = {
	signIn: (role: AccountRole) => Promise<void>;
	signOut: () => Promise<void>;
};

type AccountState =
	| {
			isSignedIn: true;
			account: Account;
			balance: string;
			accountId: string;
			role: AccountRole;
	  }
	| {
			isSignedIn: false;
			account?: Account;
			balance?: string;
			accountId?: string;
			role?: AccountRole;
	  }
	  ;

type State = BaseState & AccountState;

const initialState: State = {
	isSignedIn: false,
	//account: undefined,
	balance: undefined,
	accountId: undefined,
	role: "user" as AccountRole,
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
	const { account, accountId, balance, provider, wallet, checkIsLoggedIn, requestSignInNear, requestSignOut } = useNear();
	const [accountState, setAccountState] = useState<AccountState>(initialState);

	const reset = useCallback(() => {
		setAccountState(initialState);
	}, []);

	const initAccount = useCallback(async () => {
		if (!window) {
			console.warn("tried to init account outside of browser context");
			return;
		}	

		const savedRole = (sessionStorage.getItem("role") as AccountRole) || "user";
		console.log('session storage')
		console.log(savedRole);
		if (!checkIsLoggedIn()) {
			reset();
			return;
		}
	
		if(account && balance){
			console.log(account);
			console.log('set acccount state');
			console.log(balance);

			setAccountState({
				isSignedIn: true,
				balance: balance?.toString(),
				accountId: account.accountId,
				account: account,
				role: savedRole
			});
			
		}else{
			console.log("no account")
		}
	
		
	}, [wallet, account, balance]);


	const updateRole = useCallback((role:string) => {
		if(accountState.balance && accountState.accountId && accountState.account){
			setAccountState((prevState) => ({
				...prevState,
				role: role as AccountRole,
			  }));
		}
	}, [accountState]);

	const signIn = async (role: AccountRole) => {
			
		sessionStorage.setItem("role", role);
		console.log('setting role type:'+role);
		console.log(role);

		requestSignInNear();
		
	};

	const signOut = async () => {
		sessionStorage.removeItem("walletType");
		await requestSignOut();
		reset();
	};

	useEffect(() => {
		initAccount();
	}, [account]);

	// const value: State = {
	// 	...accountState,
	// 	signIn,
	// 	signOut,
	// 	updateRole
	// };

	const value: State = useMemo(
		() => ({
			...accountState,
			signIn,
			signOut,
		 	updateRole
		}),
		[  provider,  account, signIn, signOut, updateRole],
	);

	return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};
