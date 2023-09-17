import { useNear } from "@modules/account/hooks/use-near";
import { PostWriteContractAdapter } from "@modules/post/postwrite.adapter";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createContext, useContext, useMemo } from "react";
import {Wallet} from "@near-wallet-selector/core";
import {signIn, signOut, useSession } from "next-auth/react"
type State = {
	writeAdapter?: PostWriteContractAdapter;
};

const initialState: State = {
	writeAdapter: undefined,
};

const PostWriteContractsContext = createContext<State>(initialState);
export const useWritePostContracts = () => useContext(PostWriteContractsContext);

export const PostWriteContractsContextProvider = ({ children }: { children: ReactNode }) => {
	const { wallet, account, checkIsLoggedIn } = useNear();
	const [writeAdapter, setAdapter] = useState<State["writeAdapter"]>(initialState.writeAdapter);

	useEffect(() => {
		if (!checkIsLoggedIn() || !account || !wallet) {
			setAdapter(undefined);
			console.log('not logged in');
			//requestSignInNear();
			return;
		}
		
		PostWriteContractAdapter.init({account, wallet}).then((result:any) => {
			result.match({
				ok: (contractAdapter: PostWriteContractAdapter) => setAdapter(contractAdapter),
				fail: (error:any) => {
					console.error("Could not init contract");
					console.error(error);
					setAdapter(undefined);
				},
			});
		});
	}, [account]);

	const value = useMemo(
		() => ({
			writeAdapter,
		}),
		[writeAdapter],
	);

	return <PostWriteContractsContext.Provider value={value}>{children}</PostWriteContractsContext.Provider>;
};
