import { toast } from "@services/toast/toast";
import type { Account, ConnectConfig, Near } from "near-api-js";
import { connect, keyStores, WalletConnection } from "near-api-js";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import { createContext, useContext, useState } from "react";
import { config } from "@config/config";
import { useRouter } from "next/router";

const NEAR_CONFIG: ConnectConfig = {
	networkId: "testnet",
	// keyStore: new keyStores.BrowserLocalStorageKeyStore(),
	nodeUrl: "https://rpc.testnet.near.org",
	walletUrl: "https://wallet.testnet.near.org",
	helperUrl: "https://helper.testnet.near.org",
	// explorerUrl: "https://explorer.testnet.near.org",
};

type AccountRole = "user" | "verifier";

type AccountState =
	| {
			status: "no_wallet";
			near?: Near;
			wallet?: WalletConnection;
	  }
	| {
			status: "ready";
			near: Near;
			wallet: WalletConnection;
	  }
	| {
			status: "connected";
			near: Near;
			wallet: WalletConnection;
			account: Account;
			balance: string;
			id: string;
			role: AccountRole;
	  };

type State = {
	signIn: (role: AccountRole) => Promise<void>;
	signOut: () => Promise<void>;
} & AccountState;

const initialState: State = {
	status: "no_wallet",
	signIn: async () => {
		console.warn("not initialized");
	},
	signOut: async () => {
		console.warn("not initialized");
	},
};

const AuthContext = createContext<State>(initialState);
export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
	const router = useRouter();
	const [state, setState] = useState<AccountState>(initialState);

	const initNear = useCallback(async () => {
		if (!window) {
			console.warn("Tried to init Near connection in non-browser environment.");

			setState({ status: "no_wallet" });
			return;
		}

		const nearConnection = await connect({
			...NEAR_CONFIG,
			keyStore: new keyStores.BrowserLocalStorageKeyStore(),
		});

		const walletConnection = new WalletConnection(nearConnection, null);

		if (!walletConnection) {
			console.error("cannot connect to near wallet");
			toast.error("Cannot connect to Near wallet", "near-wallet");

			setState({ status: "no_wallet" });
			return;
		}

		console.log({
			data: {
				nearConnection,
				walletConnection,
			},
		});

		setState({
			status: "ready",
			near: nearConnection,
			wallet: walletConnection,
		});
	}, []);

	const getProfileDetails = async (
		wallet: WalletConnection,
	): Promise<
		Pick<Extract<AccountState, { status: "connected" }>, "account" | "balance" | "id">
	> => {
		const account = await wallet.account();
		const id = account.accountId;
		const { total: totalBalance } = await account.getAccountBalance();

		return {
			account,
			id,
			balance: totalBalance,
		};
	};

	const signIn: State["signIn"] = useCallback(
		async (role: AccountRole) => {
			if (state.status !== "ready") {
				toast.error("Cannot sign in.");

				return;
			}

			await state.wallet.requestSignIn({
				successUrl: `${config.site.host}/discover`,
			});

			const isSignedIn = state.wallet.isSignedIn();

			console.log({ isSignedIn });

			if (!isSignedIn) {
				toast.error("Failed to sign in.");

				setState({ status: "no_wallet" });

				return;
			}

			const accountInfo = await getProfileDetails(state.wallet);

			console.log({ accountInfo });

			setState({
				...state,
				status: "connected",
				role,
				...accountInfo,
			});

			router.push("/discover");
		},
		// @ts-expect-error: union throws error here
		[state?.wallet, state?.near, state.status],
	);

	const signOut: State["signOut"] = useCallback(async () => {
		if (state.status !== "connected") return;

		state.wallet.signOut();

		await initNear();
		// @ts-expect-error: union throws error here
	}, [state.status, state?.wallet]);

	useEffect(() => {
		initNear();
		console.log({ loading: state?.wallet?.isSignedIn });
	}, []);

	useEffect(() => {
		if (state.status !== "connected") {
			return;
		}

		getProfileDetails(state.wallet).then((accountInfo) =>
			setState({ ...state, ...accountInfo }),
		);
	}, [state.status]);

	console.log({ state });

	const value: State = useMemo(
		() => ({
			...state,
			signIn,
			signOut,
		}),
		[state, signIn, signOut],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
