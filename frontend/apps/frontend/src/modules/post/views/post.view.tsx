import { LoadingPage } from "@modules/common/components/loading-page";
import { NotFoundPage } from "@modules/common/components/not-found-page";
import { toast } from "@services/toast/toast";
import type { Nullable } from "@utils/helper-types";
import { isNumber, isString } from "@utils/validation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Post } from "../domain/post.entity";
import { usePostContracts } from "../hooks/use-post-contracts";
import NextHead from "next/head";
import NextImage from "next/image";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { CgPin } from "react-icons/cg";
import NextLink from "next/link";
import { LicensePost } from "../components/license-post";
import { PostInteractions } from "../components/post-interactions";
import { KeypomModal } from "../components/keypom-modal";

export const PostView = () => {
	const router = useRouter();
	const { adapter } = usePostContracts();
	const [post, setPost] = useState<Nullable<Post>>(undefined);
	const [notFound, setNotFound] = useState(false);
	const { id: postIdQuery } = router.query;

	useEffect(() => {
		if (!postIdQuery || !adapter) return;

		const queryId = Number.parseInt(postIdQuery as string);

		if (!isNumber(queryId)) {
			setNotFound(true);
			toast.error("Invalid post id");
			return;
		}

		console.log({ queryId });

		adapter.getPost({ id: queryId }).then((result) =>
			result.match({
				ok: (post) => setPost(post),
				fail: (error) => {
					toast.error(error.message);
					setNotFound(true);
				},
			}),
		);
		console.log(post);
	}, [postIdQuery, adapter, post]);

	if (notFound) return <NotFoundPage />;

	if (!post) return <LoadingPage />;

	return (
		<>
			<NextHead>
				<title>{`Refound | ${post.title}`}</title>
				<link rel="canonical" href={`https://refound-journalism.app/posts/${post.id}`} />
				<meta
					property="og:url"
					content={`https://refound-journalism.app/posts/${post.id}`}
				/>
				<meta property="og:type" content="article" />

				<meta property="og:title" content={post.title} />
				<meta property="og:description" content={post.description} />
				<meta property="og:image" content={post.imageLink} />
			</NextHead>

			<article className="flex flex-col w-full max-w-screen-lg gap-12 mx-auto my-12 sm:gap-16 sm:py-16 px-contentPadding">
				<header className="flex flex-col gap-4">
					<nav className="flex flex-row items-center gap-2 text-sm underline opacity-80">
						<NextLink href="/discover">
							<a>Discover</a>
						</NextLink>
						<ArrowRightIcon />
						<NextLink href="/discover">
							<a>Image Posts</a>
						</NextLink>
					</nav>

					<h1 className="text-3xl font-bold sm:text-4xl">{post.title}</h1>

					<p className="text-sm font-bold">
						by{" "}
						<span className="text-black inline-block text-sm pt-[0.25em] pb-[0.4em] leading-none mr-[0.5em]">
							@{post.owner}
						</span>
					</p>
					

					{post.isVerified && (
						<span className="rounded-full badge badge-lg badge-success">
							NGO Verified
						</span>
					)}
				</header>

				<figure className="w-full overflow-hidden rounded-lg">
					<img src={post.imageLink} alt={post.title} />

					{post.description && (
						<p className="text-base max-w-[50ch] mt-4">{post.description}</p>
					)}
					{JSON.parse(post.extra).locationTaken && <p><CgPin style={{display:"inline"}}></CgPin> {JSON.parse(post.extra).locationTaken}</p>}
					{JSON.parse(post.extra).dateTaken && <p>Date Taken: {JSON.parse(post.extra).dateTaken}</p>}
					{JSON.parse(post.extra).datePosted && <p>Date Posted: {JSON.parse(post.extra).datePosted}</p>}
					{/* {JSON.parse(post.extra).dateGoLive && <p className="">{JSON.parse(post.extra).dateGoLive}</p>}
					{JSON.parse(post.extra).dateEnd && <p className="">{JSON.parse(post.extra).dateEnd}</p>}
					{JSON.parse(post.extra).price && <p className="">Price: {JSON.parse(post.extra).price}</p>} */}
					{JSON.parse(post.extra).tags && <p className="">Tags: {JSON.parse(post.extra).tags}</p>}
				</figure>

				<div className="flex flex-row flex-wrap justify-between w-full gap-8">
					<div className="flex flex-col gap-4">
						<PostInteractions post={post} />
						<KeypomModal />
					</div>

					<LicensePost post={post} />
				</div>

				{/* <div className="flex flex-row flex-wrap gap-8">
					{post.tags.length > 0 && (
						<div>
							<p className="text-sm font-bold mb-[0.5em]">Tags</p>
							<div>
								{post.tags.map((tag) => (
									<span
										key={tag}
										className="border-[1px] border-solid border-black text-black inline-block text-sm rounded-full px-[0.9em] pt-[0.25em] pb-[0.4em] leading-none mr-[0.5em]"
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					)}
					{post.location && (
						<div>
							<p className="text-sm font-bold mb-[0.5em]">Location</p>
							<span className="border-[1px] border-solid border-black text-black inline-block text-sm rounded-full px-[0.9em] pt-[0.25em] pb-[0.4em] leading-none mr-[0.5em]">
								{post.location}
							</span>
						</div>
					)}
				</div> */}
			</article>
		</>
	);
};
