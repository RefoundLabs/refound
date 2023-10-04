import type { Result } from "@utils/monads";
import { result } from "@utils/monads";
import axios from "axios";
import { config } from "config/config";
import type { Web3Storage } from "web3.storage";
// import type { PostStorageSchema } from "../models/post.dto";
// import { createGatewayUrl } from "./utils/create-gateway-url";
import { create } from 'ipfs-http-client';

/* 
--------------------
QUERIES
--------------------
*/
const getLinks = async (
	cid: string,
): Promise<Result<any>> => {
	try {
		//const url = createGatewayUrl(cid, filePath);
		console.log('get image and audio');
		const ipfsPath = cid.replace(".ipfs.w3s.link", "");
		const url = 'https://dweb.link/api/v0';
		const ipfs = create({ url });
		
		const data = await axios
			.get("https://dweb.link/api/v0/ls?arg=" + ipfsPath)
			.then((response) => response.data)
			.catch((err: Error) => {
				throw err;
			});
			console.log(data);
		return result.ok(data);
		// const links = [];
		// for await (const link of ipfs.ls(ipfsPath)) {
		// 	links.push(link);
		// 	console.log(link);
		// }
		// console.log(links);
		// return result.ok(links);
	} catch (err) {
		return result.fail(err as Error);
	}
};

/* 
--------------------
COMMANDS
--------------------
*/
const uploadFile = async (
	client: Web3Storage,
	file: File,
	audioFile: File,
	tagName: string,
	onRootCidReady?: (cid: string) => void,
	onStoredChunk?: (totalSize: number) => (chunkSize: number) => void,
): Promise<Result<{ cid: string; path: string }>> => {
	try {
		const path = file.name;
		const combinedFileSize = [file, audioFile].reduce((last, current) => last + current.size, 0);

		const cid = await client.put([file, audioFile], {
			name: tagName,
			maxRetries: config.web3storage.maxRetries,
			...(onRootCidReady && { onRootCidReady: onRootCidReady }),
			...(onStoredChunk && { onStoredChunk: onStoredChunk(combinedFileSize) }),
		});

		if (!cid) return result.fail(new Error("Upload did not produce a CID"));

		return result.ok({ cid, path });
	} catch (err) {
		return result.fail(err as Error);
	}
};

// export const queries = {
// 	getPostMetadata,
// };
export const commands = {
	uploadFile
};

export default getLinks;