import { toast } from "@services/toast/toast";
import type { Nullable } from "@utils/helper-types";
import { useEffect, useState } from "react";
import type { Post } from "../domain/post.entity";
import { usePostContracts } from "../hooks/use-post-contracts";
import { LoadingPage } from "@modules/common/components/loading-page";
import { PostCard } from "../components/post-card";

export const DiscoverView = () => {
	const { adapter } = usePostContracts();
	const [posts, setPosts] = useState<Nullable<Post[]>>(undefined);

	useEffect(() => {
		if (!adapter) return;

		adapter.getPosts({}).then((result) =>
			result.match({
				ok: (posts) => setPosts(posts),
				fail: (error) => {
					toast.error(error.message, "no-posts");
				},
			}),
		);
	}, [adapter]);

	return (
		<section className="flex flex-col w-full px-contentPadding max-w-screen-lg mx-auto min-h-[101vh]">
			<div className="grid grid-cols-1 gap-4 py-24 md:grid-cols-3">
				{posts ? (
					posts.map((post) => <PostCard key={post.id} post={post} />)
				) : (
					<LoadingPage />
				)}
			</div>
		</section>
	);
};
