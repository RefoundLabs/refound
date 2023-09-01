import HeroImage from "../../../../../public/assets/printing-machine-etching.jpg";
import NextJsIcon from "../../../../../public/assets/nextjs-icon.png";
import NearIcon from "../../../../../public/assets/near.png";
import ipfsIcon from "../../../../../public/assets/ipfs.png";
import w3jsIcon from "../../../../../public/assets/web3js.jpeg";
import JournalistIcon from "../../../../../public/assets/journalist.png";
import NewsIcon from "../../../../../public/assets/newspaper.png";
import NGOIcon from "../../../../../public/assets/team.png";
import ConsumersIcon from "../../../../../public/assets/discuss.png";
import NewsPaperIcon from "../../../../../public/assets/news-paper.png";
import WarCrimesIcon from "../../../../../public/assets/stock.png";
import LicenseIcon from "../../../../../public/assets/contract.png";

import  PublishingIcon from "../../../../../public/assets/sosicon.png";
import  PoWIcon	from "../../../../../public/assets/govicon.png";
import  RevenueIcon from "../../../../../public/assets/money.png";
import KeyPomIcon from "../../../../../public/assets/KeyPOM_400x400.jpeg";
import  CameraIcon from "../../../../../public/assets/cameraicon.png";
import AutomationIcon from "../../../../../public/assets/smartcontractsicon.png";
import DecentralizedIcon from "../../../../../public/assets/decentralizedicon.png";
import  ChainIcon from "../../../../../public/assets/beneficiaryicon.png";
import Image from "next/image";
import type { NextPage } from "next";
import { Grid, Card } from "@mantine/core";
import { CardContent, Typography, CardMedia} from "@mui/material";
import { useEffect, useState } from "react";
import NextLink from "next/link";
// import { useRefoundContracts } from "@modules/common/hooks/celo-context";

import Typewriter from "typewriter-effect";
export const HomeView: NextPage = () => {
	const [posts, setPosts] = useState<any>();
	//const { getAllImagePosts } = useRefoundContracts();

	// useEffect(() => {
	// 	if (!posts) {
	// 		loadImages();
	// 	}
	// }, [posts]);

	// const loadImages = async () => {
	// 	(await getAllImagePosts()).match({
	// 		ok: (posts:any) => {
	// 			setPosts(posts);
	// 		},
	// 		fail: (err:any) => {
	// 			console.error(err);
	// 			toast.error("Could not load images.");
	// 		},
	// 	});
	// };

	return (
		<div>
			<section className="relative w-full h-[110vh] pt-headerTopHeight">
				<div className="relative w-full h-full max-w-screen-3xl p-contentPadding">
					<div className="relative z-[12] text-stone-800 flex flex-col h-full justify-between pb-[10vh]">
						<h1 className="text-[10vw] max-w-[80%] leading-[10vw] font-bold text-stone-800">
							<span className="text-[8vw] font-normal italic">the</span>{" "}
							<span className="accentColor">Platform</span>
							<br />
							<span className="text-[8vw] font-normal italic">for verified</span>{" "}
							<span className="accentColor">Journalism</span>
							{/* Own the Stories You Share with the World */}
						</h1>

						<p className="relative text-xl">
							Empowered and Protected on the Blockchain
						</p>

						<div className="flex flex-row gap-4">
							<NextLink href="/sign-in"><a className="btn btn-lg" style={{ borderRadius: "15px" }}>Sign Up</a></NextLink>
							<NextLink href="/learn-more"><a className="btn btn-lg btn-outline" style={{ borderRadius: "15px" }}>Learn More</a></NextLink>
						</div>
					</div>

					<figure style={{width:"100%!important",height:"100%"}} className="absolute top-0 bottom-0 object-right w-[100%] z-0">
						<Image src={HeroImage} layout="fill" objectFit="cover"  />
						<span className="relative block w-full h-full bg-gradient-to-l from-background/80 to-background" />
					</figure>
				</div>
			</section>
			<Grid
				style={{ margin: "0 auto", padding: "2%", paddingTop: "2%", paddingBottom: "1%" }}
			>
				<Grid.Col md={3}></Grid.Col>
				<Grid.Col md={6} xs={12}>
					<Typewriter
						options={{
							strings: ["	Mint with Proof of Verification."],
							autoStart: true,
							loop: true,
						}}
					/>
				</Grid.Col>
				<Grid.Col md={3}></Grid.Col>
			</Grid>
			<Grid >
				<Grid.Col  md={4}></Grid.Col>
				<Grid.Col  sm={12} md={4} style={{ margin: "0 2%" }}>
					<p style={{ display: "inline-block", marginRight: "20px" }}>Powered by</p>
					<span style={{ display: "inline-block", marginRight: "20px" }}><Image src={NextJsIcon} width="100" height="20" style={{ paddingRight: "20px" }}/></span>
					<span style={{ display: "inline-block", marginRight: "20px" }}><Image src={NearIcon} width="100" height="20" style={{ paddingRight: "20px" }}/></span>
					<span style={{ display: "inline-block", marginRight: "20px" }}><Image src={ipfsIcon} width="30" height="30" style={{ paddingRight: "20px" }}/></span>
					<span style={{ display: "inline-block", marginRight: "20px" }}><Image src={w3jsIcon} width="30" height="30" style={{ paddingRight: "20px" }}/></span>
				</Grid.Col>
				<Grid.Col  md={4}></Grid.Col>
			</Grid>
			<Grid style={{ margin: "0 auto", padding: "5%", paddingTop: "2%" }}>
				<Grid.Col md={2}></Grid.Col>
				<Grid.Col md={8} xs={12}>
					<p style={{ textAlign: "center", lineHeight: "1.8em" }}>
						Refound’s mission is part of the Regenerative Finance (ReFi) movement,
						specifically to leverage blockchain technology to help journalists and
						photographers directly sell their content to the public and news media at
						higher margins and with greater financial control, helping regenerate their
						economic cycle. Our decentralized application provides journalists a
						platform to share their content, monetize it, and maintain anonymity and
						safety by using a wallet sign-in.
					</p>
				</Grid.Col>
				<Grid.Col md={2}></Grid.Col>
			</Grid>

			<h1
				style={{ fontSize: "2.5em", textAlign: "center" }}
				className="font-bold accentColor"
			>
				Who Are We Building For?
			</h1>
			<Grid style={{ margin: "0 auto" }}>
				<Grid.Col sm={12} md={3} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								component="div"
								className="accentColor"
							>
								Citizen and Freelance Journalists
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Our publishing platform allows journalists and photographers to
								share first person, creative content from the frontlines swiftly,
								raise awareness, and sell directly to businesses.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={JournalistIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
				<Grid.Col sm={12} md={3} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								component="div"
								className="accentColor"
							>
								NGOs / Eye Witnesses
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Eye Witnesses, NGOs, and Government Bodies can verify content,
								helping build trust between journalists and the public.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={NGOIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
				<Grid.Col sm={12} md={3} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								component="div"
								className="accentColor"
							>
								The Media/Publications
							</Typography>
							<Typography variant="body2" color="text.secondary">
								A platform to curate and purchase licenses for direct, and verified
								frontline content.{" "}
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={NewsIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>

				<Grid.Col sm={12} md={3} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								component="div"
								className="accentColor"
							>
								News Consumers
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Consumers of our platform can curate their News feed and directly
								support Journalists.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={ConsumersIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
			</Grid>

			<h1
				style={{ fontSize: "2.5em", textAlign: "center" }}
				className="font-bold accentColor"
			>
				Use Cases
			</h1>
			<Grid style={{ margin: "0 auto" }}>
				<Grid.Col sm={12} md={4} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h6"
								component="div"
								className="accentColor"
							>
								Verified Journalism
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Our smart contracts allow a multisig wallet sign-in by a local NGO,
								a local governing body, and up to 2 eye witnesses to authenticate
								the veracity (verification) of the photo or article content.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={NewsPaperIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
				<Grid.Col sm={12} md={4} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h6"
								component="div"
								className="accentColor"
							>
								War Crimes Documentation
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Our tools may also apply to war crimes providing a protocol for
								documentation and verification of events.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={WarCrimesIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>

				<Grid.Col sm={12} md={4} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h6"
								component="div"
								className="accentColor"
							>
								Media Licensing Management
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Our smart contracts give journalists the ability to create and
								manage multiple licenses with their NFTS and buyers the ability to
								purchase multiple use licenses for an NFT.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={LicenseIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
			</Grid>

			<h1
				style={{ fontSize: "2.5em", textAlign: "center" }}
				className="font-bold accentColor"
			>
				Features
			</h1>

			<Grid style={{ margin: "0 auto" }}>
				<Grid.Col  sm={12} md={6} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 400 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h5"
								component="div"
								className="accentColor"
							>
								Simplified Publishing
							</Typography>
							<Typography variant="body2" color="text.secondary">
								We allow Journalists to swiftly create and sell NFTs of their
								content directly to news rooms, the media, and the public.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={PublishingIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
				<Grid.Col sm={12} md={6} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 400 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h5"
								component="div"
								className="accentColor"
							>
								Proof of Witness
							</Typography>
							<Typography variant="body2" color="text.secondary">
								When an NFT is created, it has to pass through our smart contract
								and it requires Third Party Verification in order for it to be
								validated as true and confirmed for minting. Allows a multisig
								wallet sign-in to allow a local NGO, a local governing body, and up
								to 2 eye witnesses to authenticate the veracity (verification) of
								the photo or article content.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={PoWIcon} width="100" height="90"/>
						</CardMedia>
					</Card>
				</Grid.Col>
			</Grid>
			<Grid style={{ margin: "0 auto" }}>
				<Grid.Col sm={12} md={6} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h5"
								component="div"
								className="accentColor"
							>
								Revenue Sharing
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Journalists can share revenue from their photos and articles with
								those impacted by conflict. The smart contract will split the
								royalties between the journalist and the NGO or to the person
								photographed.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={RevenueIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>

				<Grid.Col sm={12} md={6} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h5"
								component="div"
								className="accentColor"
							>
								Easy one click on-boarding on NEAR using Keypom
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Only NEAR allows the creation of programmable keys, which they call
								“keypoms.” These keys allow users to start using our dApp right away
								without needing to create an account.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={KeyPomIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
			</Grid>
			<Grid  style={{ margin: "0 auto" }}>
				<Grid.Col sm={12} md={6} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h5"
								component="div"
								className="accentColor"
							>
								In app camera capability
							</Typography>
							<Typography variant="body2" color="text.secondary">
								to capture live photos for NFTs. This helps store the meta data of
								time and place directly on the blockchain on IPFS and helping
								viewers and newsrooms know that the image is not altered or
								doctored.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={CameraIcon} width="100" height="70"/>
						</CardMedia>
					</Card>
				</Grid.Col>
				<Grid.Col sm={12} md={6} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h5"
								component="div"
								className="accentColor"
							>
								Automated Licensing
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Licenses are stored on chain and our smart contracts allow NFT
								minters to purchase multiple licenses for different uses.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={AutomationIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
			</Grid>
			<Grid  style={{ margin: "0 auto" }}>
				<Grid.Col sm={12} md={6} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h5"
								component="div"
								className="accentColor"
							>
								Immutable and Decentralized
							</Typography>
							<Typography variant="body2" color="text.secondary">
								The immutability of the blockchain allows the journalists to post
								content that is wrapped in utility NFTs and reducing the risk of
								censorship and later modification of their original works, since the
								blockchain will always have a record of the original photograph or
								article when it was uploaded by the journalist.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={DecentralizedIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
				<Grid.Col sm={12} md={6} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 350 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h5"
								component="div"
								className="accentColor"
							>
								Publicly Visible Chain of Approvals
							</Typography>
							<Typography variant="body2" color="text.secondary">
								On chain data is public and transparent, displaying the verifying
								parties that were involved in verification.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={ChainIcon} width="100" height="100"/>
						</CardMedia>
					</Card>
				</Grid.Col>
			</Grid>
			<Grid style={{ margin: "0 auto" }}>
				<Grid.Col sm={12} md={6} style={{ padding: "3%" }}>
					<Card sx={{ maxWidth: 600, height: 300 }}>
						<CardContent>
							<Typography
								gutterBottom
								variant="h5"
								component="div"
								className="accentColor"
							>
								Cryptocurrency Benefits
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Ease of payment to journalists and their local sources, fixers, and
								contacts in war zones and conflict zones via stable coin using a an
								easy setup crypto wallet on Near. Cryptocurrency provides a transfer
								of value that is much faster than banks, and much cheaper even in
								cases of international transfers. Account transactions are publicly
								auditable and secure, and easily accessible with a smartphone.
							</Typography>
						</CardContent>
						<CardMedia style={{ maxWidth: "100px", margin: "0 auto" }}>
							<Image src={NearIcon} width="100" height="30"/> 
						</CardMedia>
					</Card>
				</Grid.Col>
			</Grid>

			{/* <Grid container justifyContent="left" sm={10} style={{ margin: "0 auto" }}>
				<h1
					className="font-bold"
					style={{ fontSize: "2em", padding: "2%", color: "#01A0B0" }}
				>
					Highlights
				</h1>
			</Grid>

			<Grid container justifyContent="center" sm={12} style={{ margin: "0 auto" }}>
				{posts &&
					posts.slice(0, 5).map((post: any) => (
						<>
							<Grid item xs={6} md={2} style={{ padding: "1%" }}>
								<a href="/posts/" {...post.postId} className="hover:animate-pulse">
									<PhotographCard key={post.postId} photoData={post} />
								</a>
							</Grid>
						</>
					))}
			</Grid> */}

			<Grid >
				<Grid.Col sm={12}>
					<h1
						className="font-bold accentColor"
						style={{
							fontSize: "3em",
							padding: "2%",
							textAlign: "center",
						}}
					>
						Mint the art of journalism back to life and start publishing.
					</h1>
				</Grid.Col>
			</Grid>
			<Grid
				style={{ margin: "0 auto", marginBottom: "5%", textAlign:"center" }}
			>
				<Grid.Col sm={4}></Grid.Col>
				<Grid.Col sm={4}><NextLink href="/sign-in"><a className="btn btn-lg animate-bounce backgroundColorAccent" style={{ borderRadius: "15px"}}>Sign Up</a></NextLink></Grid.Col>
				<Grid.Col sm={4}></Grid.Col>
			</Grid>
		</div>
	);
};
