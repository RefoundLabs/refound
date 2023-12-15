import { cloin } from "@utils/styling/cloin";
import { Sidebar } from "../sidebar";
import NextLink from "next/link";
import { useNear } from "@modules/account/hooks/use-near";
import { useAccount } from "@modules/account/hooks/use-account";
import { trimText } from "@utils/trim-text";
import { Header } from "@mantine/core";
import { useState, useEffect} from "react";
import { useRouter } from "next/router";

// import { useAccount } from "@modules/account/hooks/use-auth";

export const SiteHeader = () => {
	//const account = useAccount();
	const [enableMobileMenu, setEnableMenu] = useState(false);
	const router = useRouter();
	const { isSignedIn, signOut, accountId, role } = useAccount();
	console.log(isSignedIn + " isSignedin")

	
	const handleWindowResize =() => {
		if (typeof window !== "undefined") {
		  const btn = document.querySelector("button.mobile-menu-button") as HTMLButtonElement;
		  const menu = document.querySelector(".mobile-menu") as HTMLElement;
	
		  // Add Event Listeners
		  btn.addEventListener("click", () => {
			menu.classList.toggle("hidden");
			console.log(menu.classList);
			console.log('hello');
		  });
		}
	  };


	useEffect(() => {
		// component is mounted and window is available
		handleWindowResize();
		window.addEventListener('resize', handleWindowResize);
		// unsubscribe from the event on component unmount
		return () => window.removeEventListener('resize', handleWindowResize);
	}, []);

	return (
		<header className="fixed top-0 left-0 right-0 w-full z-[5000] bg-white">
			
			{/* <script type="module">import exifr from 'node_modules/exifr/dist/lite.esm.js';</script> */}
			<script src="https://cdn.jsdelivr.net/npm/exifr/dist/lite.umd.js"></script>
			<script src="https://cdn.jsdelivr.net/npm/exifr/dist/lite.legacy.umd.js"></script>
		
		<nav className="bg-white shadow-lg w-full h-headerTopHeight border-primary pt-1">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between">
					<div className="flex space-x-7">
						<div>
							<NextLink href="/" className="flex items-center py-4 px-2">
								<a className="flex flex-row gap-2 items-center justify-center text-[1em]">
									<img className="w-[1.2em] h-[1.2em] mt-3 object-contain" src="/favicon-32x32.png" ></img>
									<h1 className="font-normal leading-none mt-2 text-[2em]">refound</h1>
								</a>
							</NextLink>
						</div>
						<div className="hidden md:flex items-center space-x-1">
							
							<nav className="flex flex-row gap-4 font-bold">
								<NextLink className="py-4 px-2 text-black font-semibold hover:text-zinc-500 transition duration-300" href="/create"><a>Create</a></NextLink>
								<NextLink className="py-4 px-2 text-black font-semibold hover:text-zinc-500 transition duration-300" href="/discover"><a>Discover</a></NextLink>
								<NextLink className="py-4 px-2 text-black font-semibold hover:text-zinc-5000 transition duration-300" href="/faucet"><a>Faucet</a></NextLink>
								<NextLink className="py-4 px-2 text-black-font-semibold hover:text-zinc-500 transition duration-300" href="/waitlist"><a>Waitlist</a></NextLink>
							</nav>
						</div>
					</div>
					<div className="hidden md:flex items-center space-x-3 ">
					
						{accountId ? (
							<div style={{cursor:"pointer"}} className="py-2 px-2 flex flex-row items-center justify-center gap-2">
								<div className="flex flex-row justify-center gap-4 rounded-full badge">
									<NextLink href="/profile" >
										<div>
											<span className="text-background">{trimText(accountId.toString(), 20)}</span>
											{/* <span classNameName="text-background"> as {role}</span> */}
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
							<NextLink href="/sign-in" className="py-2 px-2">
								<a className="btn" style={{borderRadius:"10px"}}>Sign In</a>
							</NextLink>
						)}
					</div>
					<div className="md:hidden flex items-center">
						<button className="outline-none mobile-menu-button">
						<svg className=" w-6 h-6 text-gray-500 hover:text-cyan-500 "
							x-show="!showMenu"
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path d="M4 6h16M4 12h16M4 18h16"></path>
						</svg>
					</button>
					</div>
				</div>
			</div>
			<div className="hidden mobile-menu">
					
				<nav className="fixed top-headerTopHeight right-0 font-bold bg-white p-5 shadow-lg">
					<NextLink className="py-4 px-2 text-black-font-semibold hover:text-zinc-500 transition duration-300 pt-2" href="/create"><a>Create</a></NextLink>
					<br></br>
					<NextLink className="py-4 px-2 text-black-font-semibold hover:text-zinc-500 transition duration-300 pt-2" href="/discover"><a>Discover</a></NextLink>
					<br></br>
					<NextLink className="py-4 px-2 text-black-font-semibold hover:text-zinc-500 transition duration-300 pt-2" href="/faucet"><a>Faucet</a></NextLink>
					<br></br>
					<NextLink className="py-4 px-2 text-black-font-semibold hover:text-zinc-500 transition duration-300 pt-2" href="/waitlist"><a>Waitlist</a></NextLink>
					<div className="md:flex items-center space-x-3 pt-2">
					
						{accountId ? (
							<div style={{cursor:"pointer"}} className="">
								<div className="flex flex-row justify-center rounded-full badge">
									<NextLink href="/profile" >
										<div>
											<span className="text-background">{trimText(accountId.toString(), 20)}</span>
											{/* <span classNameName="text-background"> as {role}</span> */}
										</div>
									</NextLink>
								</div>

								<button
									type="button"
									className="btn btn-xs mt-2" style={{borderRadius:"10px"}}
									onClick={() => {
										signOut();
									}}
								>
									Sign Out
								</button>
							</div>
						) : (
							<NextLink href="/sign-in" className="py-2 px-2">
								<a className="btn btn-xs" style={{borderRadius:"10px"}}>Sign In</a>
							</NextLink>
						)}
					</div>
				</nav>
			</div>
			</nav>
				
		</header>
	);
};
