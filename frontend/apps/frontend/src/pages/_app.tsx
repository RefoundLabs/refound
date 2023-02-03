import "@styles/globals.css";
import "@styles/overrides.css";
import "@celo/react-celo/lib/styles.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { Layout } from "@modules/common/components/layout";
import { UIProvider } from "@modules/common/hooks/ui-context";
// import { CeloProvider } from "@modules/common/hooks/celo-context";
// import { AuthProvider } from "@modules/account/hooks/auth-context";
// import { AccountProvider } from "@modules/account/hooks/use-account";
// import { NearProvider } from "@modules/common/hooks/near-context";
import "../styles/base/colors.css";
// import { AccountContextProvider } from "@modules/account/hooks/use-auth";
import { NearContextProvider } from "@modules/account/hooks/use-near";
import { AccountContextProvider } from "@modules/account/hooks/use-account";
import { PostContractsContextProvider } from "@modules/post/hooks/use-post-contracts";
import { IpfsContextProvider } from "@modules/post/hooks/use-ipfs";
// import { WalletSelectorContextProvider } from "@modules/auth/hooks/use-auth";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps : {session, ...pageProps} }: AppProps) {
	return (
		<SessionProvider session={session}>
			<NearContextProvider>
				<AccountContextProvider>
					<IpfsContextProvider>
						<PostContractsContextProvider>
								<UIProvider>
									<Layout>
										<Component {...pageProps} />
									</Layout>
									<Toaster position="bottom-center" />
								</UIProvider>
						</PostContractsContextProvider>
					</IpfsContextProvider>
				</AccountContextProvider>
			</NearContextProvider>
		</SessionProvider>
	);
}

export default MyApp;
