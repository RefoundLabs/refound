// import { useAccount } from "@modules/account/hooks/use-auth";
import { ContentSection } from "@modules/ui/content-section";
import { cloin } from "@utils/styling/cloin";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { config } from "@config/config";

export const TrialView: NextPage = () => {
	const router = useRouter();

	return (
		<ContentSection width="xs" className="flex flex-col items-center gap-12">
			<div className="w-full pt-16 pb-4">
				<h1 className="text-4xl font-bold text-center">Free Trial</h1>

				<div className="mt-8 prose-sm prose">
					<p className="w-full pt-[0.5em] mx-auto">
						Your Free Trial allows you a speedy on-boarding onto Refound and you can
						begin using the application with
					</p>

					<ul>
						<li>An airdrop of 5 NEAR</li>
						<li>
							A collectible NFT as being part of the pioneering contributors to
							Refound
						</li>
					</ul>
				</div>
			</div>

			<div className="w-full">
				<div className="w-full pb-[2rem]">
					<NextLink href={config.keypom.trials.user}>
						<a
							target="_blank"
							className={cloin(
								"btn btn-lg w-full rounded-md",
								/* status === "no_wallet" && "btn-disabled", */
							)}
						>
							Journalists
						</a>
					</NextLink>
					<p className="w-full text-sm text-center pt-[0.5em] max-w-[30ch] mx-auto">
						Free Trial as a journalist or citizen journalist
					</p>
				</div>

				<div className="w-full pb-[2rem]">
					<NextLink href={config.keypom.trials.ngo}>
						<a
							className={cloin(
								"btn btn-lg w-full rounded-md",
								/* status === "no_wallet" && "btn-disabled", */
							)}
							target="_blank"
						>
							NGOs
						</a>
					</NextLink>
					<p className="w-full text-sm text-center pt-[0.5em] max-w-[30ch] mx-auto">
						Free trial as an NGO to verify content
					</p>
				</div>

				<div className="mx-auto prose-sm prose text-center">
					<p>
						Powered by{" "}
						<NextLink href="https://keypom.xyz/">
							<a target="_blank">Keypom</a>
						</NextLink>{" "}
						on{" "}
						<NextLink href="https://near.org/">
							<a target="_blank">Near</a>
						</NextLink>
					</p>
				</div>
			</div>
		</ContentSection>
	);
};
