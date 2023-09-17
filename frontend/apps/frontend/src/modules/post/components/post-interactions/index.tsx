import { useAccount } from "@modules/account/hooks/use-account";
import type { Post } from "@modules/post/domain/post.entity";
import { usePostContracts } from "@modules/post/hooks/use-post-contracts";
import { useWritePostContracts } from "@modules/post/hooks/use-post-write-contracts";
import { DownArrowIcon, ThumbsUpIcon, UpArrowIcon } from "@modules/ui/icons/menu-icons";
import { toast } from "@services/toast/toast";
import { cloin } from "@utils/styling/cloin";
import { useState } from "react";
import NextLink from "next/link";

export const PostInteractions = ({ post }: { post: Post }) => {
	//const { adapter } = usePostContracts();
	const {writeAdapter} =  useWritePostContracts();
	const { role } = useAccount();

	const [votingState, setVotingState] = useState<"IDLE" | "SUBMITTING" | "SUCCESS" | "FAIL">(
		"IDLE",
	);
	const [verificationState, setVerificationState] = useState<
		"IDLE" | "SUBMITTING" | "SUCCESS" | "FAIL"
	>("IDLE");

	return (
		<div className="flex flex-row flex-wrap items-start gap-2">
			<div className="tooltip" data-tip="Upvote this post">
				<button
					type="button"
					className={cloin(
						"btn btn-sm gap-2 font-mono flex-nowrap",
						post.userHasVoted && "btn-success pointer-events-none",
						!post.userHasVoted &&
							votingState === "SUBMITTING" &&
							"loading btn-disabled",
						!post.userHasVoted && votingState === "SUCCESS" && "btn-success",
						!post.userHasVoted && votingState === "FAIL" && "btn-error",
					)}
					onClick={() => {
						if (!writeAdapter) {
							toast.warning("Sign in to vote for post", "post-vote");
							return;
						}

						if (votingState !== "IDLE") return;
						setVotingState("SUBMITTING");

						writeAdapter?.vote({ id: post.id }).then((result) =>
							result.match({
								ok: () => {
									setVotingState("SUCCESS");
									toast.success("Vote received!");
								},
								fail: () => {
									setVotingState("FAIL");
									toast.error("Vote failed", "post-vote-fail");
								},
							}),
						);
					}}
				>
					<UpArrowIcon filled className="h-[1.2em] w-[1.2em]" />
					{votingState === "SUCCESS" ? "Upvoted!" : "Vote"}
				</button>
			</div>

			<div className="tooltip" data-tip="Verify this post">
				<button
					type="button"
					className={cloin(
						"btn btn-sm gap-2 font-mono flex-nowrap",
						verificationState === "SUBMITTING" && "loading btn-disabled",
						verificationState === "SUCCESS" && "btn-success",
						verificationState === "FAIL" && "btn-error",
					)}
					onClick={() => {
						if (!writeAdapter) {
							toast.warning("Sign in to verify this post", "post-verify");
							return;
						}

						if (role !== "verifier") {
							toast.warning(
								"You must be signed in as an NGO Verifier to verify posts.",
							);
							return;
						}

						if (verificationState !== "IDLE") return;
						setVerificationState("SUBMITTING");

						writeAdapter?.verifyPost({ id: post.id }).then((result) =>
							result.match({
								ok: () => {
									setVerificationState("SUCCESS");
									toast.success("Verified!");
								},
								fail: () => {
									setVerificationState("FAIL");
									toast.error("Vote failed", "post-verification-fail");
								},
							}),
						);
					}}
				>
					<ThumbsUpIcon filled className="h-[1.2em] w-[1.2em]" />
					{verificationState === "SUCCESS" ? "Verified!" : "Verify"}
				</button>
			</div>
			{/* 
				<button
					type="button"
					className={cloin(
						"btn btn-sm gap-2 font-mono flex-nowrap",
						upvoteState === "SUBMITTING" && "loading btn-disabled",
						upvoteState === "SUCCESS" && "btn-success",
						upvoteState === "FAIL" && "btn-error",
					)}
					onClick={() => {
						if (!adapter) {
							toast.warning("Sign in to upvote posts", "upvote");
							return;
						}

						if (upvoteState !== "IDLE") return;
						setUpvoteState("SUBMITTING");

						interactWithPost(post.postId, "UpVote").then((confirmation) => {
							confirmation.match({
								ok: () => {
									setUpvoteState("SUCCESS");
									toast.success("Upvoted!");
								},
								fail: () => {
									setUpvoteState("IDLE");
									toast.error("Upvote failed.");
								},
							});
						});
					}}
				>
					<UpArrowIcon filled className="h-[1.2em] w-[1.2em]" />
					{upvoteState === "SUCCESS" ? "Upvoted!" : post.interactions.UpVote}
				</button>
			</div>

			<div className="tooltip" data-tip="Downvote this post">
				<button
					type="button"
					className={cloin(
						"btn btn-sm gap-2 font-mono  flex-nowrap",
						downvoteState === "SUBMITTING" && "loading btn-disabled",
						downvoteState === "SUCCESS" && "btn-success",
						downvoteState === "FAIL" && "btn-error",
					)}
					onClick={() => {
						if (!adapter) {
							toast.warning("Sign in to downvote post", "downvote");
							return;
						}

						if (downvoteState !== "IDLE") return;
						setDownvoteState("SUBMITTING");

						interactWithPost(post.postId, "DownVote").then((confirmation) => {
							confirmation.match({
								ok: () => {
									setDownvoteState("SUCCESS");
									toast.success("Downvoted!");
								},
								fail: () => {
									setDownvoteState("IDLE");
									toast.error("Downvote failed.");
								},
							});
						});
					}}
				>
					<DownArrowIcon filled className="h-[1.2em] w-[1.2em]" />
					{downvoteState === "SUCCESS" ? "Downvoted!" : post.interactions.DownVote}
				</button>
			</div>

			<div className="tooltip" data-tip="Report this post">
				<button
					type="button"
					className={cloin(
						"btn btn-sm gap-2 font-mono flex-nowrap",
						reportState === "SUBMITTING" && "loading btn-disabled",
						reportState === "SUCCESS" && "btn-success",
						reportState === "FAIL" && "btn-error",
					)}
					onClick={() => {
						if (!account.address) {
							toast.warning("Sign in to report post", "report");
							return;
						}

						if (reportState !== "IDLE") return;
						setReportState("SUBMITTING");

						interactWithPost(post.postId, "Report").then((confirmation) => {
							confirmation.match({
								ok: () => {
									setReportState("SUCCESS");
									toast.success("Reported!");
								},
								fail: () => {
									setReportState("IDLE");
									toast.error("Report failed.");
								},
							});
						});
					}}
				>
					<FlagIcon filled className="h-[1.2em] w-[1.2em]" />
					{reportState === "SUCCESS" ? "Reported!" : post.interactions.Report}
				</button>
			</div> */}

			<NextLink
				href={
					post
						? `https://twitter.com/share?url=https://refound-journalism.app/posts?id=${post.id}`
						: ""
				}
			>
				<a
					className={cloin("btn btn-sm", !post && "btn-disabled")}
					target="_blank"
					rel="noreferrer"
				>
					Share
				</a>
			</NextLink>
		</div>
	);
};
