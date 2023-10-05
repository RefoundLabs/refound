import type { Post } from "@modules/post/domain/post.entity";
import { trimText } from "@utils/trim-text";
import NextImage from "next/image";
import NextLink from "next/link";
import { InteractionsBadge } from "./interactions";
import { useRouter } from "next/router";
import { IconMicrophone } from "@tabler/icons-react";

export const PostCard = ({
	post: { imageLink, media, audioLink, title, description, id, series_id, owner, owner_id, tags, isVerified, voteCount },
}: {
	post: Post;
}) => {
	const router = useRouter();

	const handleOnClick = () => {
		if(id){
			router.push('/posts?id=' + id )
		}else if(series_id){
			router.push('/posts?id=' + series_id)
		}
		
	};


	return (
		<article className="flex flex-col gap-2 mb-8 group" style={{cursor:"pointer"}}>
			<div className="relative">
				<figure className="relative w-full pb-[80%] overflow-hidden rounded-md">
					<NextImage src={imageLink || media} layout="fill" objectFit="cover" alt={title} />
					<figcaption className="absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-between transition-opacity duration-300 opacity-0 bg-gradient-to-b from-transparent to-primary/90 group-hover:opacity-100">
						{tags &&
							<div className="w-full p-4">
								{tags.map((tag:any) => (
									<span
										key={tag}
										className="text-white inline-block text-xs bg-black rounded-full px-[0.8em] py-[0.2em] leading-none mr-[0.5em]"
									>
										{tag}
									</span>
								))}
                   		 </div>
						}
						<span />
						{voteCount && 
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
						}
					</figcaption>
				</figure>
				<a
					className="absolute top-0 bottom-0 left-0 right-0 w-full h-full"
					//href={`/posts?id=${id || series_id}`}
					onClick={handleOnClick}
					aria-label="go to article"
				/>
			</div>
			<div className="flex flex-row items-baseline justify-between w-full pl-2">
				<h1 className="text-sm font-bold">{trimText(title, 45)} {audioLink && <IconMicrophone style={{display:"inline", color:"#00A0B0"}}></IconMicrophone>}</h1>
				<div className="flex flex-col justify-end gap-1">
					{isVerified && (
						<span className="rounded-full badge badge-sm badge-success">
							NGO Verified
						</span>
					)}
					
					{owner &&
						<a href={"https://refound.app/user/" + owner }><span className="text-xs">{owner?.split(".")[0].substring(0,20)}</span></a>
					}
					{!owner && owner_id &&
						<a href={"https://refound.app/user/" + owner_id}><span className="text-xs">{owner_id?.split(".")[0].substring(0,20)}</span></a>
					}
				</div>
				{/* <AccountBadge profile={creator} /> */}
			</div>
		</article>
	);
};
