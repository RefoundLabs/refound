import { useNear } from "@modules/account/hooks/use-near";
import { PostContractAdapter } from "@modules/post/post.adapter";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createContext, useContext, useMemo } from "react";

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
	const { wallet, checkIsLoggedIn, requestSignIn } = useNear();
	const [adapter, setAdapter] = useState<State["adapter"]>(initialState.adapter);

	useEffect(() => {
		if (!checkIsLoggedIn() || !wallet) {
			setAdapter(undefined);
			console.log('not logged in');
			//requestSignIn();
			return;
		}


		PostContractAdapter.init({ walletConnection: wallet }).then((result) => {
			result.match({
				ok: (contractAdapter) => setAdapter(contractAdapter),
				fail: (error) => {
					console.error("Could not init contract");
					console.error(error);
					setAdapter(undefined);
				},
			});
		});
	}, [wallet]);

	const value = useMemo(
		() => ({
			adapter,
		}),
		[adapter],
	);

	return <PostContractsContext.Provider value={value}>{children}</PostContractsContext.Provider>;
};
