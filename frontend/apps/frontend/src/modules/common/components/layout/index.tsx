import type { ReactNode } from "react";
import { SiteHeader } from "../site-header";
import { Button } from "@mantine/core";
import { Grid } from "@mantine/core";
import NextLink from "next/link";
import { TwitterLogoIcon } from "@radix-ui/react-icons";
import { FiGlobe } from "react-icons/fi";
import { IconBrandDiscord, IconBrandTwitter } from '@tabler/icons-react';

export const Layout = ({ children }: { children: ReactNode }) => {
	return (
		<>
			<SiteHeader />
			<main className="w-full overflow-x-hidden min-h-[101vh]">{children}</main>
			<footer style={{height:"50px", backgroundColor:"lightgrey"}}>
				
				<Grid>
					<Grid.Col sm={2}>
						<NextLink href="/">
							<a className="flex flex-row gap-2 items-center justify-center text-[1em]">
								<img className="w-[1.5em] h-[1.5em] object-contain" src="/favicon-32x32.png" />
								<h1 className="font-normal leading-none text-[2em]">refound</h1>
							</a>
						</NextLink>
					</Grid.Col>
					<Grid.Col sm={9}></Grid.Col>
					<Grid.Col sm={1}>
						<NextLink href="https://twitter.com/_refound" target="_blank">
							<IconBrandTwitter style={{display:"inline", color:"00A0B0", marginRight:"10px"}}></IconBrandTwitter>
						</NextLink>
						<NextLink href="https://discord.gg/PE8jydDHGn" target="_blank">
							<IconBrandDiscord style={{display:"inline", color:"00A0B0"}}></IconBrandDiscord>
						</NextLink>
					</Grid.Col>
				</Grid>
			</footer>
		</>
	);
};
