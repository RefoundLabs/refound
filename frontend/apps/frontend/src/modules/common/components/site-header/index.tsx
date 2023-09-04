import { cloin } from "@utils/styling/cloin";
import { Sidebar } from "../sidebar";
import NextLink from "next/link";
import { useNear } from "@modules/account/hooks/use-near";
import { useAccount } from "@modules/account/hooks/use-account";
import { trimText } from "@utils/trim-text";
// import { useAccount } from "@modules/account/hooks/use-auth";

export const SiteHeader = () => {
	//const account = useAccount();

	const { isSignedIn, signOut, id, role } = useAccount();
	console.log(isSignedIn + "isSignedin")

	return (
		<header className="px-sitepad fixed top-0 left-0 right-0 flex flex-row items-center justify-between border-b-2 border-solid h-headerTopHeight border-primary z-[5000] bg-white">
			<NextLink href="/">
				<a className="flex flex-row gap-2 items-center justify-center text-[1em]">
					<img className="w-[1.5em] h-[1.5em] object-contain" src="/favicon-32x32.png" />
					<h1 className="font-normal leading-none text-[2em]">refound</h1>
				</a>
			</NextLink>
			<script src={"https://maps.googleapis.com/maps/api/js?key=" + process.env.NEXT_PUBLIC_GOOGLE_API_KEY + "&libraries=places"}></script>
			{/* <script type="module">import exifr from 'node_modules/exifr/dist/lite.esm.js';</script> */}
			<script src="https://cdn.jsdelivr.net/npm/exifr/dist/lite.umd.js"></script>
			<script src="https://cdn.jsdelivr.net/npm/exifr/dist/lite.legacy.umd.js"></script>
			

			<div className="flex flex-row items-center gap-8">
				{/* <button
					type="button"
					className={cloin("btn", status === "CONNECTING" && "loading")}
					onClick={() => {
						if (status === "CONNECTED") {
							logout();
							return;
						}

						login();
					}}
				>
					{status === "DISCONNECTED" ? "Sign In" : "Sign Out"}
				</button> */}
				<nav className="flex flex-row gap-4 font-bold">
					<NextLink href="/create"><a>Create</a></NextLink>
					<NextLink href="/discover"><a>Discover</a></NextLink>
					<NextLink href="/trial"><a>Free Trial</a></NextLink>
					<NextLink href="/waitlist"><a>Waitlist</a></NextLink>
				</nav>

				{isSignedIn ? (
					<div style={{cursor:"pointer"}} className="flex flex-row items-center justify-center gap-2">
						<div className="flex flex-row justify-center gap-4 rounded-full badge">
							<NextLink href="/profile" >
								<div>
									<span className="text-background">{trimText(id, 20)}</span>
									{/* <span className="text-background"> as {role}</span> */}
								</div>
							</NextLink>
						</div>

						<button
							type="button"
							className="btn btn-sm" style={{borderRadius:"10px"}}
							onClick={() => {
								signOut();
							}}
						>
							Sign Out
						</button>
					</div>
				) : (
					<NextLink href="/sign-in">
						<a className="btn" style={{borderRadius:"10px"}}>Sign In</a>
					</NextLink>
				)}

				{/* {account.status === "connected" && (
					<>
						<button
							type="button"
							className="btn"
							onClick={() => {
								account.signOut();
							}}
						>
							Sign Out
						</button>

						<span>
							{account.id} || {account.role}
						</span>
					</>
				)}

				{account.status === "ready" && (
					<a className="btn" href="/sign-in">
						Sign In
					</a>
				)}

				{account.status === "no_wallet" && (
					<span className="btn btn-disabled">No Wallet Detected</span>
				)} */}

				{/* <button
					type="button"
					className="btn"
					onClick={() => {
						if (status === "connected") {
							signOut();
							return;
						}

						signIn();
					}}
				>
					{isLoggedIn ? "Near Sign Out" : "Near Sign In"}
				</button> */}

				{/* <Sidebar /> */}
			</div>
		</header>
	);
};
