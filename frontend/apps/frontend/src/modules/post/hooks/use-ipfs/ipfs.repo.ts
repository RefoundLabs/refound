import type { Result } from "@utils/monads";
import { result } from "@utils/monads";
import axios from "axios";
import { config } from "config/config";
import type { Web3Storage } from "web3.storage";
// import type { PostStorageSchema } from "../models/post.dto";
// import { createGatewayUrl } from "./utils/create-gateway-url";
// import { create } from 'ipfs-http-client';
// import IPFS from 'ipfs-http-client';

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
		//console.log('get image and audio');
		//console.log(cid);
		const ipfsPath = cid.replace(".ipfs.w3s.link", "").replace("https://", "").split("/")[0];
		//console.log(ipfsPath);
		 let links = ["http://ipfs.io/ipfs/" + ipfsPath + "/image.png"];
		// axios.get("http://ipfs.io/ipfs/" + ipfsPath + "/image.png")
		// .then((response) => {
		// 	console.log(response);
		//  	links.push();
		// })
		// .catch((error) => {
		//   //console.error('Error fetching data:', error);
		// });

		axios.get("http://ipfs.io/ipfs/" + ipfsPath + "/audio.mp3")
		.then((response) => {
			console.log(response);
		 	links.push("http://ipfs.io/ipfs/" + ipfsPath + "/audio.mp3");
		})
		.catch((error) => {
		  //console.error('Error fetching data:', error);
		});

		// axios.get("http://ipfs.io/ipfs/" + ipfsPath + "/article.png")
		// .then((response) => {
		// 	console.log(response);
		//  	links.push();
		// })
		// .catch((error) => {
		//   //console.error('Error fetching data:', error);
		// });

		return result.ok(links);
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
): Promise<Result<{ cid: string; path: string}>> => {
	try {
		
		const path = file.name;

		if(audioFile){
			const combinedFileSize = [file, audioFile].reduce((last, current) => last + current.size, 0);

			const cid = await client.put([file, audioFile], {
				name: tagName,
				maxRetries: config.web3storage.maxRetries,
				...(onRootCidReady && { onRootCidReady: onRootCidReady }),
				...(onStoredChunk && { onStoredChunk: onStoredChunk(combinedFileSize) }),
			});

			if (!cid) return result.fail(new Error("Upload did not produce a CID"));

			return result.ok({cid, path});
		}else{
			const fileSize = [file].reduce((last, current) => last + current.size, 0);

			const cid = await client.put([file], {
				name: tagName,
				maxRetries: config.web3storage.maxRetries,
				...(onRootCidReady && { onRootCidReady: onRootCidReady }),
				...(onStoredChunk && { onStoredChunk: onStoredChunk(fileSize) }),
			});

			if (!cid) return result.fail(new Error("Upload did not produce a CID"));
			return result.ok({cid, path});
		}
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