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
	const { account, provider, checkIsLoggedIn, requestSignInNear, requestSignInWeb3Auth } = useNear();
	const [adapter, setAdapter] = useState<State["adapter"]>(initialState.adapter);

	useEffect(() => {
		// if (!checkIsLoggedIn() || !wallet) {
		// 	setAdapter(undefined);
		// 	console.log('not logged in');
		// 	requestSignInNear();
		// 	return;
		// }
		if(account){
			console.log('account')
			console.log(account)	
		}
		
		PostContractAdapter.init({ account: account }).then((result) => {
			result.match({
				ok: (contractAdapter) => setAdapter(contractAdapter),
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
