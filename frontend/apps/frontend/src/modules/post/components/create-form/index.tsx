// import { useRefoundContracts } from "@modules/refound/hooks/use-refound-contracts";
// import type { ImagePostCreationProps } from "@modules/refound/models/post.dto";
import { toast } from "@services/toast/toast";
// import { isString } from "@utils/data-helpers/is-string";
import type { Result } from "@utils/monads";
import { result } from "@utils/monads";
import { useRouter } from "next/router";
import { MouseEventHandler, useEffect } from "react";
import { useState } from "react";
import { useReducer } from "react";
import Router from "next/router";
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
import axios from "axios";
import AxiosResponse from "axios";
import PlacesAutocomplete from 'react-places-autocomplete';
import {
	geocodeByAddress,
	geocodeByPlaceId,
	getLatLng,
  } from 'react-places-autocomplete';

type FormData = {
	title?: string;
	image?: File;
	width?: number;
	height?: number;
	description?: string;
	articleText: string;
	locationTaken: string;
	dateTaken: string;
	datePosted: string;
	price: number;
	tags: string;
	dateGoLive: string;
	dateEnd: string;
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
	articleText: "", 
	locationTaken: "",
	dateTaken: "",
	datePosted: "",
	price: 0,
	tags: "",
	dateGoLive: "",
	dateEnd: "",
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
	| { type: "SET_LOCATIONTAKEN"; payload: FormData["locationTaken"] }
	| { type: "SET_ARTICLETEXT"; payload: FormData["articleText"] }
	| { type: "SET_DATETAKEN"; payload: FormData["dateTaken"] }
	| { type: "SET_DATEPOSTED"; payload: FormData["datePosted"] }
	| { type: "SET_PRICE"; payload: FormData["price"] }
	| { type: "SET_TAGS"; payload: FormData["tags"] }
	| { type: "SET_DATEGOLIVE"; payload: FormData["dateGoLive"] }
	| { type: "SET_DATEEND"; payload: FormData["dateEnd"] }
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
		case "SET_LOCATIONTAKEN":
			return {
				...state,
				locationTaken: action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SET_ARTICLETEXT":
			return {
				...state,
				articleText: action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SET_TAGS":
			return {
				...state,
				tags: action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SET_PRICE":
			return {
				...state,
				price: action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SET_DATETAKEN":
			return {
				...state,
				dateTaken: action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SET_DATEPOSTED":
			return {
				...state,
				datePosted: action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SET_DATEGOLIVE":
			return {
				...state,
				dateGoLive: action.payload,
				validationStatus: "IDLE",
				submissionStatus: "IDLE",
			};
		case "SET_DATEEND":
			return {
				...state,
				dateEnd: action.payload,
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



type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }


export const CreateForm = () => {
	
	const router = useRouter();
	const [state, dispatch] = useReducer(reducer, initialReducerState);
	const { adapter } = usePostContracts();
	const { isSignedIn } = useAccount();
	const [userInWaitlist, setUserInWailist] = useState(false);
	const [captureModalOpen, setCaptureModalOpen] = useState(false);
	const [editorState, setEditorState] = useState("");
	const { uploadFile, ipfsReady } = useIpfs();
	const { account } = useAccount();

	const modules = {
		toolbar: [
		  [{ 'header': [1, 2, false] }],
		  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
		  [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
		  ['link', 'image'],
		  ['clean']
		],
	}
   
	const  formats = [
		'header',
		'bold', 'italic', 'underline', 'strike', 'blockquote',
		'list', 'bullet', 'indent',
		'link', 'image'
	  ]

	useEffect (() => {
		getUser();
	}, [])

	useEffect(() => {
		if(userInWaitlist){
			console.log(userInWaitlist)
		}
		
	})

	const getUser = async() => {
		console.log(account?.accountId)
		if(account?.accountId){
			console.log(account?.accountId);
			const res = await axios
			.get(
				"/api/getUser?walletAddress="+account?.accountId,
				{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				}
				}
			)
			.then(async (response) => {
				console.log(response);
				setUserInWailist(true);
			})
			.catch((error) => {
				console.log(error);
				setUserInWailist(false);
			});
			//console.log(res);
		}
	  }

	const validateForm = async (): Promise<
		Result<{ image: File; metadata: PostCreationProps}>
	> => {
		dispatch({ type: "VALIDATION_START" });
		try {
			const { title, image, description, articleText, 
				locationTaken,
				dateTaken,
				datePosted,
				price,
				tags,
				dateGoLive,
				dateEnd } = state;

			if (!title?.trim() || !isString(title)) throw new Error("Title is missing.");
			if(!tags.includes(",")) throw new Error("Please separate the tags by commas.");
			if (title.length < 10) throw new Error("Title is too short.");

			if (!image?.name || image.size === 0) throw new Error("File is missing.");

			if (!description) throw new Error("Description is missing.");

			const creationProps = {
				image,
				metadata: {
					title: title.trim(),
					description: description,
					ipfsLink: "",
					locationTaken: locationTaken,
					dateTaken: dateTaken,
					datePosted: datePosted,
					dateGoLive:dateGoLive,
					dateEnd:dateEnd,
					price:price,
					tags:tags,
					articleText: articleText, 
				},
			};
				//console.log(creationProps)
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

			if (!userInWaitlist) {
				toast.error("Please sign up in the waitlist to create a post", "not-waitlist");
				return result.fail(new Error("Please sign up in the waitlist before creating post."));
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
					locationTaken: creationProps.metadata.locationTaken,
					dateTaken: new Date(creationProps.metadata.dateTaken).toLocaleDateString(),
					datePosted: new Date().toLocaleDateString(),
					dateGoLive: creationProps.metadata.dateGoLive,
					dateEnd: creationProps.metadata.dateEnd,
					price: creationProps.metadata.price,
					tags: creationProps.metadata.tags,
					articleText: creationProps.metadata.articleText,
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
		getUser();
		createPost().then((confirmation) =>
			confirmation.match({
				ok: () => {
					toast.success("Post created!");
					router.push('/profile');
				},
				fail: () => {
					toast.error("Failed to create post.");
					router.push('/profile');
				},
			}),
		);
		
	};

// 	const handleSelect = (address:any) => {
// 		geocodeByAddress(address)
// 		  .then(results => getLatLng(results[0]))
// 		  .then(latLng => console.log('Success', latLng))
// 		  .catch(error => console.error('Error', error));
// 	  };
  
  
//   const handleChange = (value:any) => {
//     setEditorState(value.toString());
// 	//dispatch({ type: "SET_ARTICLETEXET", payload: value.toString(); });
//   }


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

				<label className={S.fieldLabel}>
					<span className={S.fieldLabelText}>Location</span>
					<input
						className={S.fieldInput}
						name="locationTaken"
						type="text"
						placeholder="Please add exact location information (city/state or province, and country or region)"
						onChange={(e) => {
							dispatch({ type: "SET_LOCATIONTAKEN", payload: e.target.value });
						}}
					/>
				</label>

				<label className={S.fieldLabel}>
					<span className={S.fieldLabelText}>Date Taken</span>
					<input
						className={S.fieldInput}
						name="dateTaken"
						type="date"
						placeholder="Date Taken"
						onChange={(e) => {
							dispatch({ type: "SET_DATETAKEN", payload: e.target.value });
						}}
					/>
				</label>

				{/* <label className={S.fieldLabel}>
					<span className={S.fieldLabelText}>Go Live Date</span>
					<input
						className={S.fieldInput}
						name="dateGoLive"
						type="date"
						placeholder="Go Live Date"
						onChange={(e) => {
							dispatch({ type: "SET_DATEGOLIVE", payload: e.target.value });
						}}
					/>
				</label>

				<label className={S.fieldLabel}>
					<span className={S.fieldLabelText}>End Date</span>
					<input
						className={S.fieldInput}
						name="dateEnd"
						type="date"
						placeholder="End Date"
						onChange={(e) => {
							dispatch({ type: "SET_DATEEND", payload: e.target.value });
						}}
					/>
				</label>

				<label className={S.fieldLabel}>
					<span className={S.fieldLabelText}>Price</span>
					<input
						className={S.fieldInput}
						name="price"
						type="number"
						placeholder="Price in NEAR"
						onChange={(e) => {
							dispatch({ type: "SET_PRICE", payload: parseInt(e.target.value) });
						}}
					/>
				</label> */}

				<label className={S.fieldLabel}>
					<span className={S.fieldLabelText}>Tags</span>
					<input
						className={S.fieldInput}
						name="tags"
						type="text"
						placeholder="relevant tags, separated by commas"
						onChange={(e) => {
							dispatch({ type: "SET_TAGS", payload: e.target.value });
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
						style={{marginTop:"20px", marginBottom:"20px"}}
						className="btn btn-block"
						onClick={(e) => {
							e.preventDefault();

							setCaptureModalOpen(true);
						}}
					>
						Take a Photo
					</button>

					{/* <ReactQuill value={editorState}
					modules={modules}
					formats={formats}
					onChange={handleChange} style={{width:"100%"}} /> */}
    
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
