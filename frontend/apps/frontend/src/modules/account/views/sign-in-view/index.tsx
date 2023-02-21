// import { useAccount } from "@modules/account/hooks/use-auth";
// import { useAccount } from "@modules/account/hooks/use-account";
import { useAccount } from "@modules/account/hooks/use-account";
import { useNear } from "@modules/account/hooks/use-near";
import { ContentSection } from "@modules/ui/content-section";
import { cloin } from "@utils/styling/cloin";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const SignInView: NextPage = () => {
	const router = useRouter();
	//const { signIn, isSignedIn } = useAccount();
	const { wallet, checkIsLoggedIn, requestSignIn, requestSignOut } = useNear();
	//const {data:session, status} = useSession();
	useEffect(() => {
		if (checkIsLoggedIn) {
			router.push("/sign-up");
			console.log(checkIsLoggedIn);
		}

		
	}, [checkIsLoggedIn]);

	return (
		<ContentSection width="xs" className="flex flex-col items-center gap-12">
			<div className="w-full pt-16 pb-4">
				<h1 className="text-4xl font-bold text-center">Sign In</h1>
				<p className="w-full text-sm text-center pt-[0.5em] max-w-[25ch] mx-auto">
					To use this demo, select the role which you want to use.
				</p>
			</div>

			<div className="w-full">
				<div className="w-full pb-[2rem]">
					<button
						className={cloin(
							"btn btn-lg w-full rounded-md",
							/* status === "no_wallet" && "btn-disabled", */
						)}
						onClick={() => {
							requestSignIn();
						}}
					>
						Sign In
					</button>
					{/* <p className="w-full text-sm text-center pt-[0.5em] max-w-[30ch] mx-auto">
						Sign in from the perspective of a journalist or user who will create and
						purchase NFTs.
					</p> */}
				</div>

				<div className="w-full pb-[2rem]">
					<button
						className={cloin(
							"btn btn-lg w-full rounded-md",
							/* status === "no_wallet" && "btn-disabled", */
						)}
						onClick={() => {
							router.push("/onboarding");
						}}
					>
						No Wallet Sign In 
					</button>
					<p className="w-full text-sm text-center pt-[0.5em] max-w-[30ch] mx-auto">
						Sign in with Refound wallet.
					</p>
				</div>
			</div>

			

			<div className="shadow-lg alert">
				<div>
					<div className="leading-tight prose-sm prose">
						<h3>What&apos;s a Wallet?</h3>
						<p>
							In web3, your identity is linked to your wallet, think of it like your
							email address, but with the ability to hold your currencies and assets.
						</p>

						<h3>Installing a Wallet</h3>
						<p>
							To signup with Refound, make sure you have a{" "}
							<a
								href="https://wallet.near.org/"
								target="_blank"
								className="link"
								rel="noreferrer"
							>
								Near Wallet
							</a>{" "}
							set up so you can sign into this site. If you don&apos;t have one yet,
							the sign up link should guide you through it.
						</p>

						<h3>Funding Your Wallet</h3>
						<p>
							This demo application is running on Near&apos;s testnet. Upon signing
							in, you should have some free test funds available in your wallet.
						</p>
						{/* <p>
							If you need some free test funds, you can{" "}
							<a
								href="https://celo.org/developers/faucet"
								target="_blank"
								rel="noreferrer"
							>
								visit this link
							</a>
							.
						</p>

						<h3>Reach Out</h3>
						<p>
							To register your interest and setup a tutorial with the Refound team,
							please email us at hello@refound.app
						</p> */}
					</div>
				</div>
			</div>
		</ContentSection>
	);
};
