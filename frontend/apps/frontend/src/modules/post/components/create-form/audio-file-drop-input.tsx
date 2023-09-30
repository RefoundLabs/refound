import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import { useCallback } from "react";
import { useState, useEffect } from "react";
import { useReducer, useRef } from "react";
import NextImage from "next/image";
import { getAudioDimensions } from "./get-audio-dimensions";
import { PolyButton } from "@modules/common/components/poly-button";
import { toast } from "@services/toast/toast";

const ALLOWED_FILE_EXTENSIONS = [".mp3", ".wav"];

type ReducerState = {
	dropDepth: number;
	inDropZone: boolean;
	file?: File;
	duration?: number;
};

const initialReducerState: ReducerState = {
	dropDepth: 0,
	inDropZone: false,
	file: undefined,
	duration: 0,
};

type ReducerAction =
	| { type: "SET_DROP_DEPTH"; payload: ReducerState["dropDepth"] }
	| { type: "SET_IN_DROP_ZONE"; payload: ReducerState["inDropZone"] }
	| {
			type: "SET_AUDIO_FILE";
			payload: { file: ReducerState["file"]; duration: ReducerState["duration"]  };
	  }
	| { type: "RESET" };

const reducer = (state: ReducerState, action: ReducerAction) => {
	switch (action.type) {
		case "SET_DROP_DEPTH":
			return { ...state, dropDepth: action.payload };
		case "SET_IN_DROP_ZONE":
			return { ...state, inDropZone: action.payload };
		case "SET_AUDIO_FILE":
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

	return ALLOWED_FILE_EXTENSIONS.includes(fileExtension.toLowerCase());
};

export const AudioFileDropInput = ({
	setProps,
	uploadedAudio
}: {
	setProps: (props: { audio?: File; duration?: number; }) => void;
	uploadedAudio?: {audio: File;  duration?: number;};
}) => {
	const [state, dispatch] = useReducer(reducer, initialReducerState);
	
	const inputRef = useRef(null);

	useEffect(() => {
		setProps({ audio: state.file, duration: state.duration});
	}, [state.file, state.duration]);


	useEffect(() => {
		if (uploadedAudio) {
			const newFileData = {
				file: uploadedAudio.audio,
				duration: uploadedAudio.duration,
			};
			dispatch({
				type: "SET_AUDIO_FILE",
				payload: newFileData
			});
			dispatch({ type: "SET_DROP_DEPTH", payload: state.dropDepth + 1 });
			dispatch({ type: "SET_IN_DROP_ZONE", payload: true });
		}
		
	}, [uploadedAudio]);

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
		e.preventDefault();
		e.stopPropagation();

		const files = [...e.dataTransfer.files];
		//console.log(files);

		if (!files || files.length === 0) {
			return;
		}

		const file = files[0];

		if (!isAcceptableFile(file)) {
			dispatch({ type: "RESET" });
			toast.error(
				`File must have have one of the following extensions: ${ALLOWED_FILE_EXTENSIONS.join(
					", ",
				)}`,
				"invalid-audio-extension",
			);
			return;
		}

		getAudioDimensions(file).then((dimensions) => {
			dispatch({
				type: "SET_AUDIO_FILE",
				payload: {
					file: files[0],
					duration: dimensions.duration
				},
			});
			dispatch({ type: "SET_DROP_DEPTH", payload: 0 });
			dispatch({ type: "SET_IN_DROP_ZONE", payload: true });
		});
	};

	const handleClick = (e: MouseEvent<HTMLElement>) => {
		/* @ts-expect-error: ts hates this for some reason */
		inputRef.current?.click();
	};

	const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const files = [...(e.target.files || [])];
		//console.log('input change')
		//console.log(files);
		if (files.length > 0) {
			const file = files[0];

			if (!isAcceptableFile(file)) {
				dispatch({ type: "RESET" });
				console.log('not accepted');
				return;
			}

			getAudioDimensions(file).then((dimensions) => {
				dispatch({
					type: "SET_AUDIO_FILE",
					payload: {
						file: files[0],
						duration: dimensions.duration},
				});
				console.log('audio file dimensions:')
				console.log(dimensions);
				dispatch({ type: "SET_DROP_DEPTH", payload: 0 });
				dispatch({ type: "SET_IN_DROP_ZONE", payload: true });
			});

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
				className={`relative flex flex-col items-center justify-center w-full h-50 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden ${
					state.inDropZone ? "bg-green-200" : ""
				}`}
			>
				<div className="flex flex-col items-center justify-center pt-5 pb-6">
					<div className="flex flex-col items-center justify-center w-full">
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16"> <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/> <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/> </svg>
					<br></br>
					<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
						<span className="font-semibold">Click to upload</span> or drag and drop
					</p>
						{/* <p className="text-xs text-gray-500 dark:text-gray-400">PNG or JPG</p> */}
					</div>
				</div>
				<input
					ref={inputRef}
					id="dropzone-audio-file"
					type="file"
					className="hidden"
					onChange={handleInputChange}
					onClick={(e) => {
						e.stopPropagation();
					}}
					accept={ALLOWED_FILE_EXTENSIONS.join(",")}
				/>
			
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
