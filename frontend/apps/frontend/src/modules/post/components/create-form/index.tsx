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
import type { PostWriteContractAdapter } from "@modules/post/postwrite.adapter";
import { useIpfs } from "@modules/post/hooks/use-ipfs";
import { FileDropInput } from "./file-drop-input";
import { AudioFileDropInput } from "./audio-file-drop-input";
import { AlertBar } from "@modules/common/components/alert-bar/alert-bar";
import { useAccount } from "@modules/account/hooks/use-account";
import NextLink from "next/link";
import axios from "axios";
import moment from 'moment';
import AxiosResponse from "axios";
import PlacesAutocomplete from 'react-places-autocomplete';
import {
	geocodeByAddress,
	geocodeByPlaceId,
	getLatLng,
  } from 'react-places-autocomplete';
  import {
    createStyles,
    Menu,
    Center,
    Header,
    Container,
    Group,
    Burger,
    Grid, Input, 
    Card,
    Button, Text, Box, Alert
  } from '@mantine/core';
import { copyFileSync } from "fs";
import { useRef } from "react";
import { AudioRecorder } from 'react-audio-voice-recorder';
import exifr from 'exifr' // => exifr/dist/full.umd.cjs
import Geocode from "react-geocode";
import BubbleMenu from '@tiptap/extension-bubble-menu'
import { useWritePostContracts } from "@modules/post/hooks/use-post-write-contracts";

type FormData = {
	title?: string;
	image?: File;
	audio?: File;
	duration?: number;
	width?: number;
	height?: number;
	description?: string;
	articleText: string;
	latitude: string;
	longitude:string;
	dateTimeOriginal:string;
	locationTaken: string;
	dateTaken: string;
	datePosted: string;
	price: number;
	copies: number;
	tags?: string;
	dateGoLive?: number;
	dateEnd?: number;
};

type ReducerState = {
	validationStatus: "IDLE" | "VALIDATING" | "SUCCESS" | "FAIL";
	submissionStatus: "IDLE" | "SUBMITTING" | "SUCCESS" | "FAIL";
	validationErrors: string[];
} & FormData;

const initialReducerState: ReducerState = {
	title: "",
	image: undefined,
	audio: undefined,
	width: 0,
	height: 0,
	description: "",
	articleText: "", 
	latitude: "",
	longitude:"",
	dateTimeOriginal:"",
	locationTaken: "",
	dateTaken: "",
	datePosted: "",
	price: 0,
	copies: 0,
	tags: "",
	dateGoLive: 0,
	dateEnd: 0,
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
	| {
		type: "SET_AUDIO";
		payload: {
			audio?: FormData["audio"];
			duration?: FormData["duration"];
		};
	}
	| { type: "SET_DESCRIPTION"; payload: FormData["description"] }
	| { type: "SET_LOCATIONTAKEN"; payload: FormData["locationTaken"] }
	| { type: "SET_ARTICLETEXT"; payload: FormData["articleText"] }
	| { type: "SET_DATETAKEN"; payload: FormData["dateTaken"] }
	| { type: "SET_DATEPOSTED"; payload: FormData["datePosted"] }
	| { type: "SET_PRICE"; payload: FormData["price"] }
	| { type: "SET_COPIES"; payload: FormData["copies"] }
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

type PostCreationProps = Parameters<PostWriteContractAdapter["createPost"]>[0];

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
		case "SET_AUDIO":
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
	const { writeAdapter } = useWritePostContracts();
	const [userInWaitlist, setUserInWailist] = useState(false);
	const [captureModalOpen, setCaptureModalOpen] = useState(false);
	const [editorState, setEditorState] = useState("");
	const { uploadFile, ipfsReady } = useIpfs();
	const { account, isSignedIn } = useAccount();
	const [editor, setEditor] = useState<any>();
	const [record, setRecord] = useState(false);

	Geocode.setApiKey(process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY as string);
	// set location_type filter . Its optional.
	// google geocoder returns more that one address for given lat/lng.
	// In some case we need one address as response for which google itself provides a location_type filter.
	// So we can easily parse the result for fetching address components
	// ROOFTOP, RANGE_INTERPOLATED, GEOMETRIC_CENTER, APPROXIMATE are the accepted values.
	// And according to the below google docs in description, ROOFTOP param returns the most accurate result.
	Geocode.setLocationType("APPROXIMATE");

	// Enable or disable logs. Its optional.
	Geocode.enableDebug();


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

	var options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0,
	  };

	useEffect(() => {

		if(account){
			getUserInWaitlist();
		}

		if (navigator.geolocation) {
			navigator.permissions
			.query({ name: "geolocation" })
			.then(function (result) {
				console.log(result);
				if (result.state === "granted") {
				//If granted then you can directly call your function here
				navigator.geolocation.getCurrentPosition(success, errors, options);
				} else if (result.state === "prompt") {
				//If prompt then the user will be asked to give permission
				navigator.geolocation.getCurrentPosition(success, errors, options);
				} else if (result.state === "denied") {
				//If denied then you have to show instructions to enable location
				}
			});
		} else {
			console.log("Geolocation is not supported by this browser.");
		}
	}, []);

	function errors(err:any) {
		console.warn(`ERROR(${err.code}): ${err.message}`);
	  }

	function success(pos:any) {
		var crd = pos.coords;
		console.log("Your current position is:");
		console.log(`Latitude : ${crd.latitude}`);
		console.log(`Longitude: ${crd.longitude}`);
		console.log(`More or less ${crd.accuracy} meters.`);
		parseAndSetLocation(crd.latitude, crd.longitude);
	  }

	useEffect(() => {
		if(userInWaitlist){
			console.log(userInWaitlist)
		}
		
		if(state){
			console.log('state');
			console.log(state);
		}

	}, [ editor, editorState, account])

	const getUserInWaitlist = async() => {
		console.log('account');

		console.log(account);
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
				console.log('user in waitlist');
				setUserInWailist(true);
			})
			.catch((error) => {
				console.log(error);
				setUserInWailist(false);
				console.log('user not in waitlist')
			});
			//console.log(res);
		}
	  }

	  const parseAndSetLocation = (latitude:string, longitude:string) => {
		Geocode.fromLatLng(latitude, longitude).then(
			(response:any) => {
				const address = response.results[0].formatted_address;
				console.log(address);
				let city, state, country;
					for (let i = 0; i < response.results[0].address_components.length; i++) {
					for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
						switch (response.results[0].address_components[i].types[j]) {
						case "locality":
							city = response.results[0].address_components[i].long_name;
							break;
						case "administrative_area_level_1":
							state = response.results[0].address_components[i].long_name;
							break;
						case "country":
							country = response.results[0].address_components[i].long_name;
							break;
						}
					}
				}
				dispatch({
					type: "SET_LOCATIONTAKEN",
					payload: city + ", " + state + ", " + country,
				});
					var el = document.getElementById("locationTakenInput") as HTMLInputElement;
				el.value = city + ", " + state + ", " + country;
			},
			(error:any) => {
				console.error(error);
			}
		);
	  }

	  const parseEXIF = async (file: File) => {
		try {
		  const output = await exifr.parse(file);
		  console.log('parse exif');
		  console.log(output);
			
			if(output?.longitude && output?.latitude){
				console.log('set location');
			
				//convert to city with react/google api
				// Get address from latitude & longitude.
				parseAndSetLocation(output.latitude, output.longitude)

			}	

			if(output?.DateTimeOriginal){
				
				dispatch({
					type: "SET_DATETAKEN",
					payload: output.DateTimeOriginal,
				});

				var el = document.getElementById("dateTakenInput") as HTMLInputElement;
				let date = moment(new Date(output.DateTimeOriginal)).format('YYYY-MM-DD');
				el.value = date;
				console.log(date);
			}	

		} catch (error) {
		  console.error('parseEXIF: Error parsing EXIF data:', error);
		}
	  };

	const validateForm = async (): Promise<
		Result<{ image: File; audio: File; metadata: PostCreationProps}>
	> => {
		dispatch({ type: "VALIDATION_START" });
		try {
			const { 
				title, 
				image, 
				audio, 
				description, 
				articleText, 
				locationTaken,
				dateTaken,
				datePosted,
				price, 
				copies,
				tags,
				dateGoLive,
				dateEnd 
			} = state;

			if (!title?.trim() || !isString(title)) throw new Error("Title is missing.");
			if( tags && tags.includes(" ") && !tags.includes(",")) throw new Error("Please separate the tags by commas.");
			if (title.length < 10) throw new Error("Title is too short.");

			if (!image?.name || image.size === 0) throw new Error("File is missing.");
			//if (!audio?.name || audio.size === 0) throw new Error("File is missing.");
			
			if (!description) throw new Error("Description is missing.");
			console.log(image);
			console.log(audio);
			const creationProps = {
				image,
				audio,
				metadata: {
					title: title.trim(),
					description: description,
					ipfsLink: "",
					locationTaken: locationTaken,
					dateTaken: dateTaken,
					datePosted: datePosted,
					dateGoLive: dateGoLive,
					dateEnd:dateEnd,
					price:price.toString(),
					copies: copies.toString(),
					tags:tags,
					articleText: articleText, 
				},
			};
			console.log('creation props');
			console.log(creationProps)

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
			if (!writeAdapter) {
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

			//console.log('creation props audio')
			//console.log(creationProps.audio);

			const ipfsMediaLink = (
				await uploadFile({
					title: creationProps.metadata.title,
					postImage: creationProps.image,
					postAudio: creationProps.audio,
				})
			).unwrapOrElse((error) => {
				console.log('error ipfs upload')
				throw error;
			});

			//console.log('ipfs link');
			//console.log(ipfsMediaLink);

			const success = (
				await writeAdapter.createPost({
					title: creationProps.metadata.title,
					description: creationProps.metadata.description,
					ipfsLink: ipfsMediaLink,
					locationTaken: creationProps.metadata.locationTaken,
					dateTaken: new Date(creationProps.metadata.dateTaken).toLocaleDateString(),
					datePosted: new Date().toLocaleDateString(),
					dateGoLive: creationProps.metadata.dateGoLive,
					dateEnd: creationProps.metadata.dateEnd,
					price: creationProps.metadata.price,
					copies: creationProps.metadata.copies,
					tags: creationProps.metadata.tags
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
		// console.log('state audioFile')
		// console.log(state.audio);
		// console.log(state.duration);
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

const addAudioElement = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
	console.log(audio);
    //state.audio = audio;
  };

	return (
		<>
			<div className="w-full py-12 prose text-center">
				<h1>Create Post</h1>
			</div>
			<form className={S.formRoot}>
				<Grid>
					<Grid.Col sm={6}>
					<label className={`${S.fieldLabel} items-start`}>
				
					<span className={S.fieldLabelText}>Image*</span>


					<FileDropInput 
						setProps={(imageData) => {
							console.log('image data');
							console.log(imageData);
							dispatch({ type: "SET_IMAGE", payload: imageData });
							if(imageData.image){
								parseEXIF(imageData.image);
							}
						}}
						
						uploadedImage={
							state.image && state.width && state.height 
								? { image: state.image, width: state.width, height: state.height }
								: undefined
						}
					/>

					<button
						type="button"
						style={{marginTop:"20px", marginBottom:"20px", borderRadius:"10px"}}
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
    
					<span className={S.fieldLabelText}>Audio* <span style={{fontSize:"0.7em"}}>(max. 30 seconds)</span></span>
					<AudioFileDropInput 
						setProps={(audio) => {
							dispatch({ type: "SET_AUDIO", payload: audio });
						}}
						
						
						uploadedAudio={
							(state.audio && state.duration)
								? { audio: state.audio, duration: state.duration }
								: undefined
						}
					/> 
					<br></br>
					<div>
						<span>Record Live Audio</span>
						<AudioRecorder
							onRecordingComplete={addAudioElement}
							audioTrackConstraints={{
							noiseSuppression: true,
							echoCancellation: true,
							// autoGainControl,
							// channelCount,
							// deviceId,
							// groupId,
							// sampleRate,
							// sampleSize,
							}}
							onNotAllowedOrFound={(err) => console.table(err)}
							downloadOnSavePress={true}
							downloadFileExtension="webm"
							mediaRecorderOptions={{
							audioBitsPerSecond: 128000,
							}}
							showVisualizer={true}
						/>
					<br />
					</div>

				</label>
			</Grid.Col>
			<Grid.Col sm={6}>
					<span className={S.title}>Metadata Details</span>
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
						placeholder="brief description/caption"
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
						type="text" id="locationTakenInput"
						placeholder="Please add district/city/country"
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
						type="date" id="dateTakenInput"
						placeholder="Date Taken"
						onChange={(e) => {
							dispatch({ type: "SET_DATETAKEN", payload: e.target.value });
						}}
					/>
				</label>

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

				<br></br>
				<span className={S.title}>Pricing Details</span>
				<br></br>
				<div>
					<label className={S.fieldLabel} style={{display:"inline", marginRight:"20px"}}>
						<span className={S.fieldLabelText}>Outright Buy</span>
					</label>
					<input
							className={S.fieldInput}
							name="price"
							type="number"
							placeholder="Price in NEAR" 
							style={{width:"50%", margin:"10px 0"}}
							onChange={(e) => {
								dispatch({ type: "SET_PRICE", payload: parseInt(e.target.value) });
								console.log(parseInt(e.target.value));
							}}
						/>
						<br></br>

					<label className={S.fieldLabel} style={{display:"inline", marginRight:"20px"}}>
						<span className={S.fieldLabelText}>Web License</span>
					</label>
					<input
							className={S.fieldInput}
							name="price"
							type="number"
							placeholder="Price in NEAR" 
							style={{width:"50%", margin:"10px 0"}}
							onChange={(e) => {
								dispatch({ type: "SET_PRICE", payload: parseInt(e.target.value) });
								console.log(parseInt(e.target.value));
							}}
						/>
					<br></br>

					<label className={S.fieldLabel} style={{display:"inline", marginRight:"20px"}}>
						<span className={S.fieldLabelText}>Print License</span>
					</label>
					<input
							className={S.fieldInput}
							name="price"
							type="number"
							placeholder="Price in NEAR" 
							style={{width:"50%", margin:"10px 0"}}
							onChange={(e) => {
								dispatch({ type: "SET_PRICE", payload: parseInt(e.target.value) });
								console.log(parseInt(e.target.value));
							}}
						/>

					<br></br>
					<label className={S.fieldLabel} style={{display:"inline", marginRight:"20px"}}>
						<span className={S.fieldLabelText}>Web3 License</span>
					</label>
					<input
							className={S.fieldInput}
							name="price"
							type="number"
							placeholder="Price in NEAR" 
							style={{width:"50%", margin:"10px 0"}}
							onChange={(e) => {
								dispatch({ type: "SET_PRICE", payload: parseInt(e.target.value) });
								console.log(parseInt(e.target.value));
							}}
						/>			

					<br></br>
					<label className={S.fieldLabel} style={{display:"inline", marginRight:"20px"}}>
						<span className={S.fieldLabelText}>Single Use</span>
					</label>
					<input
							className={S.fieldInput}
							name="price"
							type="number"
							placeholder="Price in NEAR" 
							style={{width:"50%", margin:"10px 0"}}
							onChange={(e) => {
								dispatch({ type: "SET_PRICE", payload: parseInt(e.target.value) });
								console.log(parseInt(e.target.value));
							}}
						/>

				</div>

				{/* <label className={S.fieldLabel}>
					<span className={S.fieldLabelText}># of Editions</span>
					<input
						className={S.fieldInput}
						name="copies"
						type="number"
						placeholder="# of Editions"
						onChange={(e) => {
							dispatch({ type: "SET_COPIES", payload: parseInt(e.target.value) });
						}}
					/>
				</label> */}

				
			</Grid.Col>
			{/* <div style={{width:'100%', marginTop:"5%"}}>
				<span className={S.title}>Write An Article</span>
				<>
					{editor && <BubbleMenu id='.menu' editor={editor} tippyOptions={{ duration: 100 }}>
						<button
						onClick={() => editor.chain().focus().toggleBold().run()}
						className={editor.isActive('bold') ? 'is-active' : ''}
						>
						bold
						</button>
						<button
						onClick={() => editor.chain().focus().toggleItalic().run()}
						className={editor.isActive('italic') ? 'is-active' : ''}
						>
						italic
						</button>
						<button
						onClick={() => editor.chain().focus().toggleStrike().run()}
						className={editor.isActive('strike') ? 'is-active' : ''}
						>
						strike
						</button>
					</BubbleMenu>}
					<EditorContent editor={editor} />
					</>
			</div>		 */}

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
				</Grid>
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
