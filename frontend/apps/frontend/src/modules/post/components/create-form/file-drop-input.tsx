import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { useReducer, useRef, useState } from "react";
import NextImage from "next/image";
import { getImageDimensions } from "./get-image-dimensions";
import { PolyButton } from "@modules/common/components/poly-button";
import { toast } from "@services/toast/toast";
// Modern Node.js can import CommonJS
import exifr from 'exifr' // => exifr/dist/full.umd.cjs

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg",]; //".png", ".mp3", ".wav", "audio/*"];

type ReducerState = {
	dropDepth: number;
	inDropZone: boolean;
	file?: File;
	fileWidth?: number;
	fileHeight?: number;
	fileLength?: number;
	latitude?:string; 
	longitude?:string; 
	dateTimeOriginal? :string;
};

const initialReducerState: ReducerState = {
	dropDepth: 0,
	inDropZone: false,
	file: undefined,
	fileWidth: 0,
	fileHeight: 0,
	fileLength: 0,
	latitude:"",
	longitude:"",
	dateTimeOriginal:""
};

type ReducerAction =
	| { type: "SET_DROP_DEPTH"; payload: ReducerState["dropDepth"] }
	| { type: "SET_IN_DROP_ZONE"; payload: ReducerState["inDropZone"] }
	| {
			type: "SET_FILE";
			payload: { file: ReducerState["file"]; fileWidth: number; fileHeight: number; latitude?:string; longitude?:string; dateTimeOriginal? :string; };
	  }
	| { type: "RESET" };

const reducer = (state: ReducerState, action: ReducerAction) => {
	switch (action.type) {
		case "SET_DROP_DEPTH":
			return { ...state, dropDepth: action.payload };
		case "SET_IN_DROP_ZONE":
			return { ...state, inDropZone: action.payload };
		case "SET_FILE":
			return { ...state, ...action.payload };
		case "RESET":
			return { ...initialReducerState };
		default:
			return state;
	}
};

const isAcceptableFile = (file: File): boolean => {
	const splitFileName = file.name.split(".");
	if (splitFileName.length === 0) return false;

	const fileExtension = `.${splitFileName[splitFileName.length - 1]}`;

	return ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension.toLowerCase());
};

export const FileDropInput = ({
	setProps,
	uploadedImage
}: {
	setProps: (props: { image?: File; width?: number; height?: number; latitude?:string; longitude?:string; dateTimeOriginal?:string; }) => void;
	uploadedImage?: { image: File; width: number; height: number; latitude?:string; longitude?:string; dateTimeOriginal?:string;};
}) => {
	const [state, dispatch] = useReducer(reducer, initialReducerState);
	const [parsed, setParsed] = useState<Boolean>();
	const inputRef = useRef(null);

	useEffect(() => {
		setProps({ image: state.file, width: state.fileWidth, height: state.fileHeight, latitude: uploadedImage?.latitude, longitude: uploadedImage?.longitude, dateTimeOriginal: uploadedImage?.dateTimeOriginal});
	}, [state.file, state.fileWidth, state.fileHeight, state.latitude, state.longitude, state.dateTimeOriginal]);

	useEffect(() => {
		if (uploadedImage && !parsed){
			console.log('use effect');
			console.log(uploadedImage);
			parseEXIF(uploadedImage.image);

		}


		if(uploadedImage && parsed){
			console.log('parsed image');
			console.log(uploadedImage);
		}
	}, [uploadedImage]);

	const parseEXIF = async (file: File) => {
		try {
		  const output = await exifr.parse(file);
		  console.log(output.latitude);
			if(uploadedImage){
				console.log('set new file');
				const newFileData = {
					file: file,
					fileWidth: uploadedImage.width,
					fileHeight: uploadedImage.height,
					latitude: output?.latitude,
					longitude: output?.longitude,
					dateTimeOriginal: output?.DateTimeOriginal,
				};
			
				dispatch({
					type: "SET_FILE",
					payload: newFileData,
				});
			
				setParsed(true);

			}		
		} catch (error) {
		  console.error('parseEXIF: Error parsing EXIF data:', error);
		}
	  };
	  
	const handleDragEnter = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();

		dispatch({ type: "SET_DROP_DEPTH", payload: state.dropDepth + 1 });
	};
	const handleDragLeave = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();

		dispatch({ type: "SET_DROP_DEPTH", payload: state.dropDepth - 1 });
		if (state.dropDepth > 0) return;
		dispatch({ type: "SET_IN_DROP_ZONE", payload: false });
	};
	const handleDragOver = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();

		e.dataTransfer.dropEffect = "copy";
		dispatch({ type: "SET_IN_DROP_ZONE", payload: true });
	};
	const handleDrop = (e: DragEvent<HTMLElement>) => {
		console.log('handle file drop');
		e.preventDefault();
		e.stopPropagation();


		const files = [...e.dataTransfer.files];

		if (!files || files.length === 0) {
			return;
		}

		const file = files[0];
		console.log(file);

		if (!isAcceptableFile(file)) {
			dispatch({ type: "RESET" });
			
			toast.error(
				`Image must have have one of the following extensions: ${ALLOWED_IMAGE_EXTENSIONS.join(
					", ",
				)}`,
				"invalid-image-extension",
			);
			return;
		}

		getImageDimensions(file).then((dimensions) => {
			
			dispatch({
				type: "SET_FILE",
				payload: {
					file: files[0],
					fileWidth: dimensions.width,
					fileHeight: dimensions.height, 
				},
			});
			dispatch({ type: "SET_DROP_DEPTH", payload: 0 });
			dispatch({ type: "SET_IN_DROP_ZONE", payload: false })
		});

		parseEXIF(file);
	};

	const handleClick = (e: MouseEvent<HTMLElement>) => {
		/* @ts-expect-error: ts hates this for some reason */
		inputRef.current?.click();
	};

	const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {

		const files = [...(e.target.files || [])];
		if (files.length > 0) {
			const file = files[0];
			console.log(file);

			if (!isAcceptableFile(file)) {
				dispatch({ type: "RESET" });
				return;
			}

			getImageDimensions(file).then((dimensions) => {
				dispatch({
					type: "SET_FILE",
					payload: {
						file: files[0],
						fileWidth: dimensions.width,
						fileHeight: dimensions.height,
					},
				});
				dispatch({ type: "SET_DROP_DEPTH", payload: 0 });
				dispatch({ type: "SET_IN_DROP_ZONE", payload: false });
			});
			parseEXIF(file);
		}
	}, []);

	return (
		<>
			<div
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onClick={handleClick}
				className={`relative flex flex-col items-center justify-center w-full h-60 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden ${
					state.inDropZone ? "bg-green-200" : ""
				}`}
			>
				<div className="flex flex-col items-center justify-center pt-5 pb-6">
					<div className="flex flex-col items-center justify-center w-full">
						<svg
							aria-hidden="true"
							className="w-10 h-5 mb-3 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							></path>
						</svg>
						<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
							<span className="font-semibold">Click to upload</span> or drag and drop
						</p>
						{/* <p className="text-xs text-gray-500 dark:text-gray-400">PNG or JPG</p> */}
					</div>
				</div>
				<input
					ref={inputRef}
					id="dropzone-file"
					type="file"
					className="hidden"
					onChange={handleInputChange}
					onClick={(e) => {
						e.stopPropagation();
					}}
					accept={ALLOWED_IMAGE_EXTENSIONS.join(",")}
				/>
				{state.file && (
					<figure className="absolute w-full h-full bg-white">
						<NextImage
							src={URL.createObjectURL(state.file)}
							width={state.fileWidth}
							height={state.fileHeight}
							layout="fill"
							objectFit="contain"
							alt="image preview"
						/>
					</figure>
				)}
				{state.file && (
					<PolyButton
						label="Clear"
						className="absolute top-2 right-2"
						as="button"
						style="solid"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							dispatch({ type: "RESET" });
						}}
					/>
				)}
			</div>
		</>
	);
};
