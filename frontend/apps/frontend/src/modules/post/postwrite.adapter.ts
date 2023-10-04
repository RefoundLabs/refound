import type { Result } from "@utils/monads";
import { result } from "@utils/monads";
//import { WalletConnection } from "near-api-js";
import type {Wallet, Account} from "@near-wallet-selector/core";
//import { Contract as NearContract } from "near-api-js";
import { config } from "@config/config";
import type { LicenseType, Post } from "./domain/post.entity";
//import type { Account, ConnectConfig, Near } from "near-api-js";
import {decode as base64_decode, encode as base64_encode} from 'base-64';
import { useNear } from "../account/hooks/use-near";
import { useState } from "react";
import { toast } from "@services/toast/toast";
//network config (replace testnet with mainnet or betanet)
const { providers } = require("near-api-js");
const provider = new providers.JsonRpcProvider(
  "https://rpc.testnet.near.org"
);


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

//type SeriesContract = NearContract & SeriesCommands & SeriesQueries;


export class PostWriteContractAdapter {
	private static contractAddress = process.env.NEXT_PUBLIC_CONTRACT_SERIES_ADDRESS as string; 
	
	private account: Account;
	private wallet: Wallet;
	//private contract: SeriesContract;
	
	private constructor({
		account,
		wallet
		//contract,
	}: {
		account: Account;
		wallet: Wallet;
		//contract: SeriesContract;
	}) {
		this.account = account;
		this.wallet = wallet;
		//this.contract = contract;
	}

	static async init({
		account,
		wallet
	}: {
		account: Account;
		wallet: Wallet;
	}){
		try {
			// const account = walletConnection.account();
			// const contract = (await new NearContract(
			// 	account,
			// 	this.contractAddress,
			// 	{
			// 		viewMethods: queries,
			// 		changeMethods: commands,
			// 	},
			// )) as SeriesContract;
			// console.log(contract);

			
			console.log('init post contract adapter');
			return result.ok(new PostWriteContractAdapter({account, wallet}));

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
		let userHasVoted = false;

		const args = {
			id: series.series_id.toString()
		}

			const voteCount = await provider.query({
				request_type: "call_function",
				account_id: PostWriteContractAdapter.contractAddress,
				method_name: "get_votes",
				args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
				finality: "optimistic",
			  }).then((votesByAccount:any) =>
			  Object.keys(votesByAccount).reduce((previous, current) => {
				  // TODO: very heavy way to handle checking if user has already voted.
				  if (current === this.account.accountId) {
					console.log('user has voted');
					  userHasVoted = true;
				  }

				  return votesByAccount[current] > 0 ? previous + 1 : previous;
			  }, 0),
		);

		const post: Post = {
			id: series.series_id,
			series_id: series.series_id,
			tags: "",
			owner_id: series.owner_id,
			owner: series.owner_id,
			title: series.metadata.title || "Untitled",
			description: series.metadata.description || "",
			media: series.metadata.media || "/placeholder.jpeg",
			extra: series.metadata.extra || "",
			isVerified: series.verified,
			voteCount,
			userHasVoted,
		};

		console.log('post');
		console.log(post);

		return post;
	}

	//----------------------------------------
	//----------------------------------------
	// QUERIES
	//----------------------------------------
	//----------------------------------------


	async getPosts(query: { from_index?: number; limit?: number }): Promise<Result<Post[]>> {
		let foundPosts = false;
		let posts : any = [];
		try {
			
			console.log('get posts');
			let res = await provider.query({
				request_type: 'call_function',
				account_id: PostWriteContractAdapter.contractAddress,
				method_name: "get_series",
				args_base64: "e30=",
				finality: 'optimistic',
			  });

			if(res){
			  	const parsedRes = JSON.parse(Buffer.from(res.result).toString()).filter(
					(seriesItem:JsonSeries) =>
					// @ts-expect-error: strict typing of config causes error with general number type from series_id
					!config.content.moderationList.posts.includes(seriesItem.series_id),
				);

				//console.log('parsed posts result');
				//console.log(parsedRes);

				posts = await Promise.all(
					parsedRes.map(async (item:JsonSeries) => this.postDtoToEntity(item)),
				);
				
				foundPosts = true;
				//console.log(posts);
			}

				return result.ok(posts);

			  //return JSON.parse(Buffer.from(res.result).toString());

		} catch (error) {
			console.error(error);
			 
		}
		
		return result.ok(posts);
	}

	//----------------------------------------
	//----------------------------------------
	// COMMANDS
	//----------------------------------------
	//----------------------------------------

	async callMethod(method:string, args = {}) {
		// Sign a transaction with the "FunctionCall" action
		const yoctoDeposit = "10000000000000000000000";
		const THIRTY_TGAS = '3000000000000';
		console.log('call method');

		//const parsedArgs = Buffer.from(JSON.stringify(args)).toString('base64');

		const outcome = await this.wallet.signAndSendTransaction({
		  signerId: this.account.accountId,
		  receiverId: PostWriteContractAdapter.contractAddress,
		  actions: [
			{
			  type: 'FunctionCall',
			  params: {
				methodName: method,
				args,
				gas: THIRTY_TGAS,
				deposit: yoctoDeposit,
			  },
			},
		  ],
		});
	
		return providers.getTransactionLastResult(outcome)
	  }

	  async callMethodNoDeposit(method:string, args = {}) {
		// Sign a transaction with the "FunctionCall" action
		const yoctoDeposit = "10000000000000000000000";
		const THIRTY_TGAS = '30000000000000';
		console.log('call method');

		//const parsedArgs = Buffer.from(JSON.stringify(args)).toString('base64');

		const outcome = await this.wallet.signAndSendTransaction({
		  signerId: this.account.accountId,
		  receiverId: PostWriteContractAdapter.contractAddress,
		  actions: [
			{
			  type: 'FunctionCall',
			  params: {
				methodName: method,
				args,
				gas: THIRTY_TGAS,
				deposit: "",
			  },
			},
		  ],
		});
	
		return providers.getTransactionLastResult(outcome)
	  }

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
			const posts = await this.getPosts({}).then((result) =>
				result?.match({
					ok: (posts) => {return posts},
					fail: (error) => {
						toast.error(error.message, "no-posts");
					},
				}),
			);
			if(posts?.length){
				const nextId = posts.length > 0 ? posts[posts.length - 1].series_id + 1 : 0;

				const extra = {
					locationTaken : locationTaken,
					dateTaken : dateTaken,
					tags : tags,
					//articleText: articleText
					
					//add splits here
				}
				console.log('create post');
				const args = {
					series_id:nextId.toString(),
					metadata: {
						title: title,
						description: description,
						media: ipfsLink,
						copies: null,//copies,
						starts_at: null,//dateGoLive,
						issued_at: null, //new Date().getMilliseconds(),
						extra: JSON.stringify(extra)
					},
					price: price
				};

				await this.callMethod("create_series", args);

				return result.ok(true);
			}
			return result.fail(new Error("Failed to get index"));
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Failed to create post"));
		}
	}

	async verifyPost(payload: { id: number }): Promise<Result<true>> {
		try {
			//await this.contract.change_series_verification({ ...payload, verified: true });

			const args = { ...payload, verified: true }
			await this.callMethodNoDeposit("change_series_verification", args)

			return result.ok(true);
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Could not verify series."));
		}
	}

	async purchaseLicense(payload: { id: number; licenseType: keyof typeof LicenseType }) {
		try {
			const yoctoDeposit = "10000000000000000000000";

			// await this.contract.nft_mint(
			// 	{
			// 		id: `${payload.id}`,
			// 		receiver_id: this.contract.account.accountId,
			// 	},
			// 	undefined,
			// 	yoctoDeposit,
			// );

			const args = {
				id: `${payload.id}`,
				receiver_id: this.account.accountId,
			};
			console.log('purchase license');
			await this.callMethod("nft_mint", args)

			return result.ok(true);
		} catch (error) {
			console.error(error);

			return result.fail(new Error("Failed to purchase license."));
		}
	}

	async vote(payload: { id: number }) {
		try {
			//await this.contract.vote({ id: `${payload.id}` });

			const args = {
				id: `${payload.id}`
			};

			await this.callMethodNoDeposit("vote", args)

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
