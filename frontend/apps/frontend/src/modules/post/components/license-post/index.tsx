import { LicenseType } from "@modules/post/domain/post.entity";
import type { Post } from "@modules/post/domain/post.entity";
import { usePostContracts } from "@modules/post/hooks/use-post-contracts";
import { toast } from "@services/toast/toast";
import { useState } from "react";
import { cloin } from "@utils/styling/cloin";
import { useAccount } from "@modules/account/hooks/use-account";

export const LicensePost = ({ post }: { post: Post }) => {
	const { adapter } = usePostContracts();
	const { role } = useAccount();
	const [selectedLicense, setSelectedLicense] = useState<LicenseType>(LicenseType.SingleUse);
	const [submitState, setSubmitState] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "FAIL">(
		"IDLE",
	);

	return (
		<div
			className={cloin(
				"flex flex-col",
				role === "verifier" && "pointer-events-none opacity-80",
			)}
		>
			<div
				className={cloin(
					"flex flex-row items-start gap-2",
					!post.isVerified && "pointer-events-none opacity-60",
				)}
			>
				<button
					type="button"
					className={cloin(
						"btn gap-2 ",
						submitState === "SUBMITTING" && "loading btn-disabled",
						submitState === "SUCCESS" && "btn-success",
						submitState === "FAIL" && "btn-error",
						!post.isVerified && "btn-disabled",
					)}
					onClick={(e) => {
						e.preventDefault();

						if (!adapter) {
							toast.error("Please log in before purchasing a license.");
							setSubmitState("IDLE");
							return;
						}

						setSubmitState("SUBMITTING");

						adapter
							.purchaseLicense({ id: post.id, licenseType: selectedLicense })
							.then((confirmation) =>
								confirmation.match({
									ok: () => {
										setSubmitState("SUCCESS");
										toast.error("Purchased!");
									},
									fail: (err) => {
										console.error(err);
										setSubmitState("FAIL");
										toast.error("Failed to purchase license");
									},
								}),
							);
					}}
				>
					{submitState === "SUCCESS" ? "Purchased!" : "Purchase License"}
				</button>

				<div className="flex flex-col gap-2 w-[10em]">
					<select
						className="w-full max-w-xs select select-ghost"
						value={selectedLicense}
						onChange={(e) => {
							setSelectedLicense(e.target.value as LicenseType);
						}}
					>
						<option value={LicenseType.SingleUse}>Single Use</option>
						<option value={LicenseType.Web3License}>Web3 License</option>
						<option value={LicenseType.PrintLicense}>Print License</option>
						<option value={LicenseType.WebLicense}>Web License</option>
						<option value={LicenseType.Outright}>Outright</option>
					</select>
					{selectedLicense === LicenseType.Outright && (
						<span className="text-xs">
							Outright license comes with a 2% royalty for the original creator on all
							future sales.
						</span>
					)}
				</div>
			</div>

			{!post.isVerified && role !== "verifier" && (
				<span className="block w-[20ch] leading-tight mt-[0.5em] text-sm">
					This post is pending verification by an NGO.
					<br />
					Once approved, you may purchase a license.
				</span>
			)}

			{role === "verifier" && (
				<span className="block w-[20ch] leading-tight mt-[0.5em] text-sm">
					You are currently signed in as an NGO verifier. To purchase a license, sign in
					as a user.
				</span>
			)}
		</div>
	);
};
