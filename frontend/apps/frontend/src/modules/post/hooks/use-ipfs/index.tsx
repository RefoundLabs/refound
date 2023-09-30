import { config } from "@config/config";
import { useAccount } from "@modules/account/hooks/use-account";
import { result } from "@utils/monads";
import { toast } from "@services/toast/toast";
import { createClient } from "@supabase/supabase-js";
import type { Result } from "@utils/monads";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Web3Storage } from "web3.storage";
import { commands as ipfsCommands } from "./ipfs.repo";
import { jsonFileFromObject } from "./json-file-from-object";
import type { Nullable } from "@utils/helper-types";

type State =
	| {
		ipfsReady: true;
		uploadFile: (payload: { postImage: File; title: string; postAudio?: File; }) => Promise<Result<string>>;
	  }
	| {
		ipfsReady: false;
		uploadFile?: (payload: { postImage: File; title: string; postAudio: File; }) => Promise<Result<string>>;
	  };

const initialState: State = {
	ipfsReady: false,
	uploadFile: async () => result.fail(new Error("Must be signed in to upload files.")),
};

const IpfsContext = createContext<State>(initialState);
export const useIpfs = () => useContext(IpfsContext);

export const IpfsContextProvider = ({ children }: { children: ReactNode }) => {
	const [client, setClient] = useState<Nullable<Web3Storage>>();
	const [ipfsReady, setIpfsReady] = useState<State["ipfsReady"]>(initialState.ipfsReady);
	const { accountId } = useAccount();

	useEffect(() => {
		const ipfsClient = new Web3Storage({ token: config.web3storage.token });

		if (!ipfsClient) {
			setIpfsReady(false);
		}

		setClient(ipfsClient);
		setIpfsReady(true);
	}, []);

	const uploadFile = useCallback(
		async ({
			postImage,
			postAudio,
			title,
		}: {
			postImage: File;
			postAudio: File;
			title: string;
		}): Promise<Result<string>> => {
			try {

				console.log(postImage, postAudio);
				
				if (!client) {
					throw new Error("Unable to connect to IPFS");
				}

				if (!accountId) {
					throw new Error("Must be signed in to upload files.");
				}

				const tagName = `${accountId}-${title}`;

				const { cid, path } = (
					await ipfsCommands.uploadFile(
						client,
						postImage,
						postAudio,
						tagName,
						(cid) => {
							toast.message(`Uploading file with CID: ${cid}`, "upload-cid");
						},
						(combinedSize) => (chunkSize) => {
							toast.success(
								`Upload ${Math.ceil(chunkSize / combinedSize)}% complete`,
							);
						},
					)
				).unwrapOrElse((error) => {
					throw error;
				});

				const ipfsLink = `https://${cid}.ipfs.w3s.link/`;

				return result.ok(ipfsLink);
			} catch (error) {
				const errorMessage = (error as Error).message;
				return result.fail(new Error(errorMessage));
			}
		},
		[client, accountId],
	);

	const value = {
		ipfsReady,
		uploadFile,
	};

	return <IpfsContext.Provider value={value}>{children}</IpfsContext.Provider>;
};
