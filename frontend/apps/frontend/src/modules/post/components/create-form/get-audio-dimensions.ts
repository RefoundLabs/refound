export const getAudioDimensions = (file: File): Promise<{ duration:number }> =>
	new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);

		const audio = new Audio();
		console.log(audio)
		
		audio.addEventListener("loadedmetadata", () => {
			 // Now you can reliably access the audio duration
			 const duration = audio.duration;
			 console.log(duration);
			 resolve({ duration });
		});

		audio.addEventListener("error", (event) => {
			console.error(event.message);
			reject();
		});

		audio.src = url;
	});
