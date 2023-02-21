import type { Account } from "near-api-js";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNear } from "../use-near";

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
	account: undefined,
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
	const { wallet, checkIsLoggedIn, requestSignIn, requestSignOut } = useNear();
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
		console.log(savedRole);
		
		if (!checkIsLoggedIn() || !wallet) {
			reset();
			return;
		}

		const account = wallet.account();
		const { total: totalBalance } = await account.getAccountBalance();
		const id = account.accountId;

		setAccountState({
			isSignedIn: true,
			balance: totalBalance,
			id,
			account,
			role: savedRole,
		});
	}, [wallet]);

	const signIn = async (role: AccountRole) => {
		sessionStorage.setItem("role", role);
		
		await requestSignIn();
	};

	const signOut = async () => {
		sessionStorage.removeItem("role");
		await requestSignOut();
		reset();
	};

	useEffect(() => {
		initAccount();
	}, [wallet]);

	const value: State = {
		...accountState,
		signIn,
		signOut,
	};

	return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};
