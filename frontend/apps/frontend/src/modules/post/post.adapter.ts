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
import { useIpfs } from "./hooks/use-ipfs";
//network config (replace testnet with mainnet or betanet)
const { providers } = require("near-api-js");
const provider = new providers.JsonRpcProvider(
  "https://rpc.testnet.near.org"
);

import getLinks from './hooks/use-ipfs/ipfs.repo';

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


export class PostContractAdapter {
	private static contractAddress = process.env.NEXT_PUBLIC_CONTRACT_SERIES_ADDRESS as string; // TODO: from .env
	
	private account?: Account;
	
	//private contract: SeriesContract;
	
	// private constructor({
	// 	account,
	// 	//contract,
	// }: {
	// 	account?: Account;
	// 	//contract: SeriesContract;
	// }) {
	// 	//this.account = account;
	// 	//this.contract = contract;
	// }

	static async init(){
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
			return result.ok(new PostContractAdapter());

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
				account_id: PostContractAdapter.contractAddress,
				method_name: "get_votes",
				args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
				finality: "optimistic",
			  }).then((votesByAccount:any) =>
			  Object.keys(votesByAccount).reduce((previous, current) => {
				  // TODO: very heavy way to handle checking if user has already voted.
				  if (this.account && current === this.account.accountId) {
					console.log('user has voted');
					  userHasVoted = true;
				  }

				  return votesByAccount[current] > 0 ? previous + 1 : previous;
			  }, 0),
		);
			if(series.metadata.media){
				getLinks(series.metadata.media);
				
			}
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

		//console.log('post');
		//console.log(post);

		return post;
	}

	//----------------------------------------
	//----------------------------------------
	// QUERIES
	//----------------------------------------
	//----------------------------------------

	async getPost(query: { id: number }): Promise<Result<Post>> {
		try {
			//const seriesDetails = await this.contract.get_series_details({ id: query.id });

			let key = '{"id": ' + query.id + '}';
			//console.log(key)
			//return result.fail(new Error("Could not get post."));
			const rawResult = await provider.query({
				request_type: "call_function",
				account_id: PostContractAdapter.contractAddress,
				method_name: "get_series_details",
				args_base64: Buffer.from(key).toString('base64'),
				finality: "optimistic",
			  });
			
			const res = JSON.parse(Buffer.from(rawResult.result).toString());
			//console.log(res);
			
			let post = await this.postDtoToEntity(res);
			//console.log('get post hook')
			//console.log(post);
				
			return result.ok(post);
		} catch (error) {
			console.error(error);
			return result.fail(new Error("Could not get post."));
		}
	}

	

	async getPosts(query: { from_index?: number; limit?: number }): Promise<Result<Post[]>> {
		let foundPosts = false;
		let posts : any = [];
		try {
			
			console.log('get posts');
			let res = await provider.query({
				request_type: 'call_function',
				account_id: PostContractAdapter.contractAddress,
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
