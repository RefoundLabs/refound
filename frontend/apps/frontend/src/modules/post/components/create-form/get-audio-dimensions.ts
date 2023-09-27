export const getAudioDimensions = (file: File): Promise<{ duration:number }> =>
	new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);

		const audio = new Audio();
		console.log(audio.duration);
		
		audio.addEventListener("load", () => {
			resolve({ duration: 0 });//todo
		});

		audio.addEventListener("error", (event) => {
			console.error(event.message);
			reject();
		});

		audio.src = url;
	});
