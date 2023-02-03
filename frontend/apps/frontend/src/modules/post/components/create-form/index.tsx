// import { useRefoundContracts } from "@modules/refound/hooks/use-refound-contracts";
// import type { ImagePostCreationProps } from "@modules/refound/models/post.dto";
import { toast } from "@services/toast/toast";
// import { isString } from "@utils/data-helpers/is-string";
import type { Result } from "@utils/monads";
import { result } from "@utils/monads";
import { useRouter } from "next/router";
import type { MouseEventHandler } from "react";
import { useState } from "react";
import { useReducer } from "react";

import S from "./create-form.module.css";
import { CaptureModal } from "./capture-modal";
import { usePostContracts } from "@modules/post/hooks/use-post-contracts";
import { cloin } from "@utils/styling/cloin";
import { isString } from "@utils/validation";
import type { PostContractAdapter } from "@modules/post/post.adapter";
import { useIpfs } from "@modules/post/hooks/use-ipfs";
import { FileDropInput } from "./file-drop-input";
import { AlertBar } from "@modules/common/components/alert-bar/alert-bar";
import { useAccount } from "@modules/account/hooks/use-account";
import NextLink from "next/link";

type FormData = {
	title?: string;
	image?: File;
	width?: number;
	height?: number;
	description?: string;
};

type ReducerState = {
	validationStatus: "IDLE" | "VALIDATING" | "SUCCESS" | "FAIL";
	submissionStatus: "IDLE" | "SUBMITTING" | "SUCCESS" | "FAIL";
	validationErrors: string[];
} & FormData;

const initialReducerState: ReducerState = {
	title: "",
	image: undefined,
	width: 0,
	height: 0,
	description: "",
	validationStatus: "IDLE",
	submissionStatus: "IDLE",
	validationErrors: [],
};

type ReducerActions =
	| { type: "SET_TITLE"; payload: FormData["title"] }
	| {
			type: "SET_IMAGE";
			payload: {
				image?: FormData["image"];
				width?: FormData["width"];
				height?: FormData["height"];
			};
	  }
	| { type: "SET_DESCRIPTION"; payload: FormData["description"] }
	| { type: "SUBMIT_START" }
	| { type: "VALIDATION_START" }
	| { type: "VALIDATION_PASS" }
	| { type: "VALIDATION_FAIL"; payload: string[] }
	| { type: "SUBMIT_SUCCESS" }
	| { type: "SUBMIT_FAIL" }
	| { type: "RESET" };

type PostCreationProps = Parameters<PostContractAdapter["createPost"]>[0];

const reducer = (state: ReducerState, action: ReducerActions): ReducerState => {
	switch (action.type) {
		case "SET_TITLE":
			return {
				...state,
				title: action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SET_IMAGE":
			return {
				...state,
				...action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SET_DESCRIPTION":
			return {
				...state,
				description: action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SUBMIT_START":
			return {
				...state,
				submissionStatus: "SUBMITTING",
				validationStatus: "IDLE",
				validationErrors: [],
			};
		case "VALIDATION_START":
			return { ...state, validationStatus: "VALIDATING", validationErrors: [] };
		case "SUBMIT_FAIL":
			return { ...state, submissionStatus: "FAIL" };
		case "SUBMIT_SUCCESS":
			return { ...state, submissionStatus: "SUCCESS", validationErrors: [] };
		case "VALIDATION_PASS":
			return { ...state, validationStatus: "SUCCESS", validationErrors: [] };
		case "VALIDATION_FAIL":
			return {
				...state,
				submissionStatus: "FAIL",
				validationStatus: "FAIL",
				validationErrors: action.payload,
			};
		case "RESET":
			return initialReducerState;
		default:
			return state;
	}
};

export const CreateForm = () => {
	const router = useRouter();
	const [state, dispatch] = useReducer(reducer, initialReducerState);
	const { adapter } = usePostContracts();
	const { isSignedIn } = useAccount();
	const [captureModalOpen, setCaptureModalOpen] = useState(false);
	const { uploadFile, ipfsReady } = useIpfs();

	const validateForm = async (): Promise<
		Result<{ image: File; metadata: Omit<PostCreationProps, "ipfsLink"> }>
	> => {
		dispatch({ type: "VALIDATION_START" });
		try {
			const { title, image, description } = state;

			if (!title?.trim() || !isString(title)) throw new Error("Title is missing.");
			if (title.length < 10) throw new Error("Title is too short.");

			if (!image?.name || image.size === 0) throw new Error("File is missing.");

			if (!description) throw new Error("Description is missing.");

			const creationProps = {
				image,
				metadata: {
					title: title.trim(),
					description,
				},
			};

			dispatch({ type: "VALIDATION_PASS" });
			return result.ok(creationProps);
		} catch (err) {
			dispatch({ type: "VALIDATION_FAIL", payload: [(err as Error).message] });
			return result.fail(err as Error);
		}
	};

	const createPost = async (): Promise<Result<true>> => {
		try {
			if (!adapter) {
				toast.error("Please sign in to create a post", "not-signed-create");
				return result.fail(new Error("Please sign in before creating post."));
			}

			if (!ipfsReady) {
				toast.error("Failed to initialize IPFS service");
				return result.fail(new Error("Failed to initialize IPFS service."));
			}

			dispatch({ type: "SUBMIT_START" });

			const creationProps = (await validateForm()).unwrapOrElse((err) => {
				throw err;
			});

			const ipfsImageLink = (
				await uploadFile({
					title: creationProps.metadata.title,
					postImage: creationProps.image,
				})
			).unwrapOrElse((error) => {
				throw error;
			});

			const success = (
				await adapter.createPost({
					title: creationProps.metadata.title,
					description: creationProps.metadata.description,
					ipfsLink: ipfsImageLink,
				})
			).unwrapOrElse((error) => {
				throw error;
			});

			dispatch({ type: "SUBMIT_SUCCESS" });
			return result.ok(true);
		} catch (err) {
			console.error(err);
			dispatch({ type: "SUBMIT_FAIL" });
			return result.fail(new Error("Failed to create post."));
		}
	};

	const onSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();

		createPost().then((confirmation) =>
			confirmation.match({
				ok: () => {
					toast.success("Post created!");
					router.push("/account");
				},
				fail: () => {
					toast.error("Failed to create post.");
				},
			}),
		);
	};

	return (
		<>
			<div className="w-full py-8 prose text-center">
				<h1>Create Post</h1>
			</div>
			<form className={S.formRoot}>
				<label className={S.fieldLabel}>
					<span className={S.fieldLabelText}>Title*</span>
					<input
						className={S.fieldInput}
						name="title"
						type="text"
						placeholder="Title"
						onChange={(e) => {
							dispatch({ type: "SET_TITLE", payload: e.target.value });
						}}
					/>
				</label>

				<label className={S.fieldLabel}>
					<span className={S.fieldLabelText}>Description</span>
					<input
						className={S.fieldInput}
						name="description"
						type="text"
						placeholder="A brief description"
						onChange={(e) => {
							dispatch({ type: "SET_DESCRIPTION", payload: e.target.value });
						}}
					/>
				</label>

				<label className={`${S.fieldLabel} items-start`}>
					<span className={S.fieldLabelText}>Image*</span>

					<FileDropInput
						setProps={(imageData) => {
							dispatch({ type: "SET_IMAGE", payload: imageData });
						}}
						uploadedImage={
							state.image && state.width && state.height
								? { image: state.image, width: state.width, height: state.height }
								: undefined
						}
					/>

					<button
						type="button"
						className="btn btn-block"
						onClick={(e) => {
							e.preventDefault();

							setCaptureModalOpen(true);
						}}
					>
						Take a Photo
					</button>
				</label>

				{!isSignedIn && (
					<AlertBar kind="warning">
						Please{" "}
						<NextLink href="/sign-in">
							<a className="link">sign in</a>
						</NextLink>{" "}
						to create a post.
					</AlertBar>
				)}

				<button
					className={cloin(
						"btn w-full justify-start",
						state.submissionStatus === "SUBMITTING" && "loading pointer-events-none",
						state.submissionStatus === "SUCCESS" && "pointer-events-none btn-success",
						state.submissionStatus === "FAIL" && "pointer-events-none btn-error",
					)}
					disabled={!isSignedIn || state.submissionStatus !== "IDLE"}
					onClick={onSubmit}
				>
					{state.submissionStatus === "IDLE" && "Submit"}
					{state.submissionStatus === "SUBMITTING" && "Uploading..."}
					{state.submissionStatus === "FAIL" && "Error"}
					{state.submissionStatus === "SUCCESS" && "Success!"}
				</button>

				{state.validationErrors.length > 0 && (
					<div className="flex flex-col gap-2 text-sm text-red-900">
						{" "}
						{state.validationErrors.map((errorText) => (
							<p key={errorText}>{errorText}</p>
						))}
					</div>
				)}

				{state.submissionStatus === "SUBMITTING" && (
					<div className="absolute w-full h-full p-sitepad bg-background/60">
						<div className="flex flex-col items-center justify-center w-full py-12 border-2 border-solid rounded-md px-sitepad bg-background border-primary">
							<p className="text-lg font-bold">Uploading Post</p>
						</div>
					</div>
				)}
			</form>
			{captureModalOpen && (
				<CaptureModal
					setIsOpen={setCaptureModalOpen}
					onPhotoTaken={(imageFile, width, height) => {
						dispatch({
							type: "SET_IMAGE",
							payload: { image: imageFile, width, height },
						});
						setCaptureModalOpen(false);
					}}
				/>
			)}
		</>
	);
};
