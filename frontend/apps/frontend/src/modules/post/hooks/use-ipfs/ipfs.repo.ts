import type { Result } from "@utils/monads";
import { result } from "@utils/monads";
import axios from "axios";
import { config } from "config/config";
import type { Web3Storage } from "web3.storage";
// import type { PostStorageSchema } from "../models/post.dto";
// import { createGatewayUrl } from "./utils/create-gateway-url";

/* 
--------------------
QUERIES
--------------------
*/
const getPostMetadata = async (
	cid: string,
	filePath: string,
): Promise<Result<PostStorageSchema>> => {
	try {
		const url = createGatewayUrl(cid, filePath);
		const data = await axios
			.get<PostStorageSchema>(url)
			.then((response) => response.data)
			.catch((err: Error) => {
				throw err;
			});

		return result.ok(data);
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
	tagName: string,
	onRootCidReady?: (cid: string) => void,
	onStoredChunk?: (totalSize: number) => (chunkSize: number) => void,
): Promise<Result<{ cid: string; path: string }>> => {
	try {
		const path = file.name;
		const combinedFileSize = [file].reduce((last, current) => last + current.size, 0);

		const cid = await client.put([file], {
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

export const queries = {
	getPostMetadata,
};
export const commands = {
	uploadFile,
};
