import { useNear } from "@modules/account/hooks/use-near";
import { PostContractAdapter } from "@modules/post/post.adapter";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createContext, useContext, useMemo } from "react";
import {Wallet} from "@near-wallet-selector/core";
import {signIn, signOut, useSession } from "next-auth/react"
type State = {
	adapter?: PostContractAdapter;
};

const initialState: State = {
	adapter: undefined,
};

const PostContractsContext = createContext<State>(initialState);
export const usePostContracts = () => useContext(PostContractsContext);

export const PostContractsContextProvider = ({ children }: { children: ReactNode }) => {
	const { wallet, near, account, checkIsLoggedIn, requestSignInNear } = useNear();
	const [adapter, setAdapter] = useState<State["adapter"]>(initialState.adapter);

	useEffect(() => {
		if (!checkIsLoggedIn() || !account || !wallet) {
			setAdapter(undefined);
			console.log('not logged in');
			//requestSignInNear();
			return;
		}
		
		PostContractAdapter.init({wallet, account}).then((result) => {
			result.match({
				ok: (contractAdapter: PostContractAdapter) => setAdapter(contractAdapter),
				fail: (error) => {
					console.error("Could not init contract");
					console.error(error);
					setAdapter(undefined);
				},
			});
		});
	}, [account]);

	const value = useMemo(
		() => ({
			adapter,
		}),
		[adapter],
	);

	return <PostContractsContext.Provider value={value}>{children}</PostContractsContext.Provider>;
};
