import type { Result } from "@utils/monads";
import { result } from "@utils/monads";
import type { WalletConnection } from "near-api-js";
import { Contract as NearContract } from "near-api-js";
import { config } from "@config/config";
import type { LicenseType, Post } from "./domain/post.entity";
import type { Account } from "near-api-js";
const { providers } = require("near-api-js");
//network config (replace testnet with mainnet or betanet)
const provider = new providers.JsonRpcProvider(
  "https://rpc.testnet.near.org"
);
import {decode as base64_decode, encode as base64_encode} from 'base-64';

type SeriesId = number;
type Base64VecU8 = string;
type AccountId = string;
type Timestamp = string;
type WrappedTimestamp = number;

type TokenMetadata = {
	title?: string;
	description?: string;
	media?: string;
	media_hash?: Base64VecU8;
	copies?: number;
	issued_at?: number;
	expires_at?: number;
	starts_at?: number;
	updated_at?: number;
	extra?: string;
	reference?: string;
	reference_hash?: Base64VecU8;
	
};

type VotingSeries = {
	/// How much each accountID votes
	votes: Record<AccountId, number>;
	/// When the voting ended. `None` means the poll is still open.
	result?: WrappedTimestamp;
};

type JsonSeries = {
	series_id: SeriesId;
	// Metadata including title, num copies etc.. that all tokens will derive from
	metadata: TokenMetadata;
	// Royalty used for all tokens in the collection
	royalty?: Record<AccountId, number>;
	// Owner of the collection
	owner_id: AccountId;
	// Series Verified: If the series is verified by the votees
	verified: boolean;
	// Voting
	vote: VotingSeries;
};

const queries = [
	"get_series_details",
	"get_series",
	"get_votes",
	"get_total_votes",
	"get_vote_result",
];

interface SeriesQueries {
	get_series_details: (query: { id: number }) => Promise<JsonSeries>;
	get_series: (query: { from_index?: number; limit?: number }) => Promise<JsonSeries[]>;
	get_votes: (query: { id: string }) => Promise<Record<AccountId, number>>;
	get_total_votes: (query: { id: number }) => Promise<number>;
	get_vote_result: (query: { id: number }) => Promise<Timestamp | null | undefined>;
}

const commands = [
	"create_series",
	"change_series_verification",
	"vote",
	"set_vote_result",
	"nft_mint",
];

interface SeriesCommands {
	create_series: (
		payload: {
			id: number;
			metadata: TokenMetadata;
			royalty?: Record<AccountId, number>;
			price?: string;
		},
		gas?: string,
		deposit?: string,
	) => Promise<void>;
	change_series_verification: (payload: { id: number; verified: boolean }) => Promise<void>;
	vote: (payload: { id: number }) => Promise<void>;
	set_vote_result: (payload: { id: number }) => Promise<void>;
	nft_mint: (
		payload: { id: string; receiver_id: string },
		gas?: string,
		deposit?: string,
	) => Promise<void>;
}

type SeriesContract = NearContract & SeriesCommands & SeriesQueries;

export class PostContractAdapter {
	private static contractAddress = process.env.NEXT_PUBLIC_CONTRACT_SERIES_ADDRESS as string; // TODO: from .env

	// private wallet: WalletConnection;
	private contract: SeriesContract;

	private constructor({
		// walletConnection,
		contract,
	}: {
		// walletConnection: WalletConnection;
		contract: SeriesContract;
	}) {
		// this.wallet = walletConnection;
		this.contract = contract;
	}

	static async init({
		account,
	}: {
		account: Account;
	}): Promise<Result<PostContractAdapter>> {
		try {
			console.log(account);
			console.log(this.contractAddress)
			const contract = (await new NearContract(
				account,
				this.contractAddress,
				{
					viewMethods: queries,
					changeMethods: commands,
				},
			)) as SeriesContract;

			return result.ok(new PostContractAdapter({ /*  walletConnection, */ contract }));
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Could not initialize contract adapter"));
		}
	}

	//----------------------------------------
	//----------------------------------------
	// MAPPERS
	//----------------------------------------
	//----------------------------------------

	public async postDtoToEntity(series: JsonSeries): Promise<Post> {
		//console.log({ postDtoToEntity1: this.contract });
		let userHasVoted = false;
		
		//console.log('output post')
		//console.log({ postDtoToEntity2: this.contract });
		//console.log(series);

		const voteCount = await this.contract
			.get_votes({ id: `${series.series_id}` })
			.then((votesByAccount) =>
				Object.keys(votesByAccount).reduce((previous, current) => {
					// TODO: very heavy way to handle checking if user has already voted.
					if (current === this.contract.account.accountId) {
						userHasVoted = true;
					}

					return votesByAccount[current] > 0 ? previous + 1 : previous;
				}, 0),
			);

		const post: Post = {
			id: series.series_id,
			owner: series.owner_id,
			title: series.metadata.title || "Untitled",
			description: series.metadata.description || "",
			imageLink: series.metadata.media || "/placeholder.jpeg",
			extra: series.metadata.extra || "",
			isVerified: series.verified,
			voteCount,
			userHasVoted,
		};

		return post;
	}

	//----------------------------------------
	//----------------------------------------
	// QUERIES
	//----------------------------------------
	//----------------------------------------

	async getPost(query: { id: number }): Promise<Result<Post>> {
		try {
			const seriesDetails = await this.contract.get_series_details({ id: query.id });

			let post = await this.postDtoToEntity(seriesDetails);

				
			return result.ok(post);
		} catch (error) {
			console.error(error);
			let key = '{"id": ' + query.id + '}';
			console.log(key)
			//return result.fail(new Error("Could not get post."));
			const rawResult = await provider.query({
				request_type: "call_function",
				account_id: "dev-1669390838754-18143842088820",
				method_name: "get_series_details",
				args_base64: Buffer.from(key).toString('base64'),
				finality: "optimistic",
			  });
			
			  const res = JSON.parse(Buffer.from(rawResult.result).toString());
			  console.log(res);
			  return result.ok(this.flattenObject(res));
		}
	}

	public flattenObject = (obj:any) => {
		const flattened:any = {}
	  
		Object.keys(obj).forEach((key) => {
		  const value = obj[key]
	  
		  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			Object.assign(flattened, this.flattenObject(value))
			obj.key = "";
		  } else {
			flattened[key] = value
		  }
		})
	  
		return flattened
	  }

	async getPosts(query: { from_index?: number; limit?: number }): Promise<Result<Post[]>> {
		let foundPosts = false;
		let posts : any = [];
		try {
			console.log(this.contract);
			const series = await (
				await this.contract.get_series(query)
			).filter(
				(seriesItem) =>
					// @ts-expect-error: strict typing of config causes error with general number type from series_id
					!config.content.moderationList.posts.includes(seriesItem.series_id),
			);

			console.log('series');
			console.log(series);

			posts = await Promise.all(
				series.map(async (item) => this.postDtoToEntity(item)),
			);
			foundPosts = true;
			//return result.ok(posts);
		} catch (error) {
			console.error(error);
			 
		}
		
		// if(!foundPosts){
		// 	try{
		// 		const rawResult = await provider.query({
		// 			request_type: "call_function",
		// 			account_id: "dev-1669390838754-18143842088820",
		// 			method_name: "get_series",
		// 			args_base64: "e30=",
		// 			finality: "optimistic",
		// 		  });
				
		// 		  // format result
		// 		  const res = JSON.parse(Buffer.from(rawResult.result).toString());
		// 		  const rawposts = res.filter(
		// 		  (item:any) =>
		// 			  !config.content.moderationList.posts.includes(item.series_id),
		// 		  );
				  
		// 		  console.log('get series')
		// 		  console.log(rawposts);
		// 		  posts = await Promise.all(
		// 			  rawposts.map(async (item:any) => this.postDtoToEntity(item)),
		// 		  );
		// 		  foundPosts = true;
		// 		  console.log(posts);
		// 		  //return result.ok(posts);
		// 	 }catch{
		// 		//return result.fail(new Error("Could not get posts."));
		// 	 }
		// }
		return result.ok(posts);
	}


	/**
	 * Returns table of who has verified the post to how many times they have verified
	 */
	/* async getPostVerifiers(query: { id: number }): Promise<Result<Record<AccountId, number>>> {
		try {
			const votes = await this.contract.get_votes({ id: `${query.id}` });

			return result.ok(votes);
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Could not get votes"));
		}
	} */

	/**
	 * Returns total number of verifications a post has received
	 */
	/* 	async getPostVerifications(query: { id: number }): Promise<Result<number>> {
		try {
			const totalVotes = await this.contract.get_total_votes(query);

			return result.ok(totalVotes);
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Could not get total votes"));
		}
	} */

	/* async checkPostIsVerified(query: { id: number }): Promise<Result<boolean>> {
		try {
			const totalVotes = await this.contract.get_total_votes(query);

			return result.ok(totalVotes > 0);
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Could not check if post is verified"));
		}
	} */

	//----------------------------------------
	//----------------------------------------
	// COMMANDS
	//----------------------------------------
	//----------------------------------------

	async createPost({
		title,
		description,
		ipfsLink,
		locationTaken,
		dateTaken,
		datePosted,
		dateGoLive,
		dateEnd,
		price,
		copies,
		tags,
	}: {
		title: string;
		description: string;
		ipfsLink: string;
		locationTaken:string;
		dateTaken: string;
		datePosted: string;
		dateGoLive: number//milliseconds;
		dateEnd: string;
		price: string;
		copies: number;
		tags: string;
	}): Promise<Result<true>> {
		try {
			// TODO: currently enormous query just to find next id
			const nextId = await this.contract
				.get_series({})
				.then((series) =>
					series.length > 0 ? series[series.length - 1].series_id + 1 : 0,
				);

			// TODO: Should be calculated based on bytes to be stored.
			const yoctoDeposit = "10000000000000000000000";

			
			const extra = {
				locationTaken : locationTaken,
				dateTaken : dateTaken,
				tags : tags,
				//articleText: articleText
				
				//add splits here
			}
			console.log(locationTaken);
			console.log(tags);


			// TODO: is there some kind of confirmation we can get out of contract calls?
			await this.contract.create_series(
				{
					id: nextId, // TODO: what is this?
					metadata: {
						title: title,
						description: description,
						media: ipfsLink,
						copies: copies,
						starts_at: dateGoLive,
						issued_at: new Date().getMilliseconds(),
						extra: JSON.stringify(extra)
					},
					price: price
				},
				undefined,
				yoctoDeposit,
			);


			return result.ok(true);
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Failed to create post"));
		}
	}

	async verifyPost(payload: { id: number }): Promise<Result<true>> {
		try {
			await this.contract.change_series_verification({ ...payload, verified: true });

			return result.ok(true);
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Could not verify series."));
		}
	}

	async purchaseLicense(payload: { id: number; licenseType: keyof typeof LicenseType }) {
		// TODO: implement
		try {
			const yoctoDeposit = "10000000000000000000000";

			await this.contract.nft_mint(
				{
					id: `${payload.id}`,
					receiver_id: this.contract.account.accountId,
				},
				undefined,
				yoctoDeposit,
			);

			return result.ok(true);
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Failed to purchase license."));
		}
	}

	async vote(payload: { id: number }) {
		try {
			await this.contract.vote({ id: `${payload.id}` });

			return result.ok(true);
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Failed to vote for post."));
		}
	}

	async keypom() {
		// TODO: implement
	}
}

/* 
@near-wallet-selector/near-wallet \
  @near-wallet-selector/my-near-wallet \
  @near-wallet-selector/here-wallet \
  @near-wallet-selector/math-wallet \
  @near-wallet-selector/nightly \
  @near-wallet-selector/meteor-wallet \
  @near-wallet-selector/ledger \
  @near-wallet-selector/wallet-connect \
  @near-wallet-selector/default-wallets
*/
