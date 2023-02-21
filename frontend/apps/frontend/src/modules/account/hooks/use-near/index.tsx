import type { ConnectConfig, Near } from "near-api-js";
import { connect, keyStores, WalletConnection } from "near-api-js";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { createContext, useCallback, useContext, useState } from "react";
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

type State = {
	near?: Near;
	wallet?: WalletConnection;
	checkIsLoggedIn: () => boolean;
	requestSignIn: () => Promise<void>;
	requestSignOut: () => Promise<void>;
};

const initialState: State = {
	checkIsLoggedIn: () => {
		console.warn("checkIsLoggedIn is not initialized");
		return false;
	},
	requestSignIn: async () => {
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
		setNear(nearConnection);

		if (!nearConnection) {
			console.error("cannot connect to near");
			setNear(undefined);
			setWallet(undefined);

			return;
		}

		const walletConnection = new WalletConnection(nearConnection, null);
		setWallet(walletConnection);

		if (!WalletConnection) {
			console.error("cannot connect to near wallet");

			return;
		}

		console.log("near initialized");
	}, []);

	const checkIsLoggedIn = useCallback(() => (wallet ? wallet.isSignedIn() : false), [wallet]);

	const requestSignIn = useCallback(async () => {
		if (!wallet) {
			console.warn("Cannot sign in, wallet not found");
			return;
		}

		await wallet.requestSignIn({
			successUrl: `${config.site.host}/discover`,
			failureUrl: `${config.site.host}/sign-in`,
		});
	}, [wallet]);

	const requestSignOut = useCallback(async () => {
		if (!wallet) {
			console.warn("Cannot sign out, wallet not found");
			return;
		}

		wallet.signOut();
		router.push("/");
	}, [wallet]);

	useEffect(() => {
		initNear();
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, []);

	const value: State = useMemo(
		() => ({
			near,
			wallet,
			checkIsLoggedIn,
			requestSignIn,
			requestSignOut,
		}),
		[near, wallet, checkIsLoggedIn, requestSignIn, requestSignOut],
	);

	return <NearContext.Provider value={value}>{children}</NearContext.Provider>;
};
