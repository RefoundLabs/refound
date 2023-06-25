import type { Post } from "@modules/post/domain/post.entity";
import { trimText } from "@utils/trim-text";
import NextImage from "next/image";
import { InteractionsBadge } from "./interactions";

export const PostCard = ({
	post: { imageLink, title, description, id, owner, isVerified, voteCount },
}: {
	post: Post;
}) => {
	return (
		<article className="flex flex-col gap-2 mb-8 group">
			<div className="relative">
				<figure className="relative w-full pb-[80%] overflow-hidden rounded-md">
					<NextImage src={imageLink} layout="fill" objectFit="cover" alt={title} />
					<figcaption className="absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-between transition-opacity duration-300 opacity-0 bg-gradient-to-b from-transparent to-primary/90 group-hover:opacity-100">
						{/* <div className="w-full p-4">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-white inline-block text-xs bg-black rounded-full px-[0.8em] py-[0.2em] leading-none mr-[0.5em]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div> */}
						<span />
						<div className="translate-y-[100%] duration-150 group-hover:translate-y-0 p-2 text-white text-sm">
							<div className="flex flex-row justify-between w-full mt-2">
								<InteractionsBadge voteCount={voteCount} />
								{/* <InteractionsBadge interactionList={interactions} /> */}
								{/* <time
                                className="text-xs"
                                dateTime={new Date(createdAt).toISOString()}
                            >
                                {new Date(createdAt).toDateString()}
                            </time> */}
							</div>
						</div>
					</figcaption>
				</figure>
				<a
					className="absolute top-0 bottom-0 left-0 right-0 w-full h-full"
					href={`/posts?id=${id}`}
					aria-label="go to article"
				/>
			</div>
			<div className="flex flex-row items-baseline justify-between w-full pl-2">
				<h1 className="text-sm font-bold">{trimText(title, 90)}</h1>
				<div className="flex flex-col justify-end gap-1">
					{isVerified && (
						<span className="rounded-full badge badge-sm badge-success">
							NGO Verified
						</span>
					)}

					<a href={"http://localhost:3001/user/" + owner}><span className="text-xs">{owner.split(".")[0].substring(0,20)}</span></a>
				</div>
				{/* <AccountBadge profile={creator} /> */}
			</div>
		</article>
	);
};
