import { toast } from "@services/toast/toast";
import type { Nullable } from "@utils/helper-types";
import { useEffect, useState } from "react";
import type { Post } from "../domain/post.entity";
import { usePostContracts } from "../hooks/use-post-contracts";
import { LoadingPage } from "@modules/common/components/loading-page";
import { PostCard } from "../components/post-card";
const { providers } = require("near-api-js");
const provider = new providers.JsonRpcProvider("https://rpc.testnet.near.org");
import { config } from "@config/config";
import { Grid, Text } from "@mantine/core";
import '@mantine/tiptap/styles.css';
export const DiscoverView = () => {
	const { adapter } = usePostContracts();
	const [posts, setPosts] = useState<Nullable<Post[]>>(undefined);
	const [filteredPosts, setFilteredPosts] = useState<Nullable<Post[]>>(undefined);
	const [showVerifiedPosts, setShowVerifiedPosts] = useState<Boolean>();

	useEffect(() => {
		if (!adapter) return;
		if(adapter){
			console.log(adapter);
			console.log('adapter')
			adapter.getPosts({}).then((result) =>
				result?.match({
					ok: (posts) => {setPosts(posts), setFilteredPosts(posts)},
					fail: (error) => {
						toast.error(error.message, "no-posts");
					},
				}),
			);
		}
	console.log('discover page')
		
		
	}, [adapter]);
	
	useEffect(()=>{
		if(posts) {
			console.log('posts obj')
			console.log(posts);
		}
		//if(!posts) getState();


	}, [posts])

	

	async function getState() {
		const rawResult = await provider.query({
		  request_type: "call_function",
		  account_id: "dev-1669390838754-18143842088820",
		  method_name: "get_series",
		  args_base64: "e30=",
		  finality: "optimistic",
		});
	  
		const res = JSON.parse(Buffer.from(rawResult.result).toString());

		const rawposts = res.filter(
			(item:any) =>
				!config.content.moderationList.posts.includes(item.series_id),
			);

			//console.log('discover get series')
			let newPosts = rawposts.map((item:any) => flattenObject(item));
			//console.log(newPosts)
			setPosts(newPosts);
	}

	 const flattenObject = (obj:any) => {
		const flattened:any = {}
	  
		Object.keys(obj).forEach((key) => {
		  const value = obj[key]
	  
		  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			Object.assign(flattened, flattenObject(value))
			obj.key = "";
		  } else {
			flattened[key] = value
		  }
		})
	  
		return flattened
	  }

	return (
		
		<section className="flex flex-col w-full px-contentPadding max-w-screen-lg mx-auto min-h-[101vh]" style={{marginTop:"8%",}}>
		
		
			<div style={{border:"1px solid lightgrey", padding:"10px", borderRadius:"15px"}}>
	
				<p style={{color:'#656a70'}}>Filters</p>
				<input
					style={{borderRadius:"5px", backgroundColor:"#CBD5E1"}}
					type="checkbox"
					name="verifiedPosts"
					onChange={(e) => {
						if (e.target.checked) {
							setShowVerifiedPosts(true);
							const newFilteredPosts: void | any[] | ((prevState: Nullable<Post[]>) => Nullable<Post[]>) | null = [];
							posts?.forEach((item:any) => {
								if(item.isVerified){
									newFilteredPosts?.push(item);
								}
							})
							setFilteredPosts(newFilteredPosts);
						} else {
							setShowVerifiedPosts(false);
							setFilteredPosts(posts);
						}
					}}
				/>
				<label style={{marginLeft:"10px", marginTop:"-15px", marginRight:"20px", color:"#656a70"}}>NGO Verified</label>
				<input
					style={{borderRadius:"5px", backgroundColor:"#CBD5E1"}}
					type="checkbox"
					name="verifiedPosts"
					onChange={(e) => {
						
					}}
				/>
				<label style={{marginLeft:"10px", marginTop:"-15px", color:"#656a70"}}>NSFW</label>
			</div>
			<div className="grid grid-cols-1 gap-4 py-12 sm:grid-cols-3">
				{filteredPosts ? (
					filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
				) : (
					<LoadingPage />
				)}
			</div>
		</section>
	);
};
