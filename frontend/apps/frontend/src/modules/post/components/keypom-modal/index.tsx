export const KeypomModal = () => {
	return (
		<>
			<label htmlFor="my-modal" className="btn">
				Claim with Keypom
			</label>
			<input type="checkbox" id="my-modal" className="modal-toggle" />
			<div className="modal">
				<div className="modal-box">
					<h3 className="text-lg font-bold">Claim via Keypom</h3>
					<p className="py-4">Paste the key you were provided in the space below.</p>

					<label className="flex flex-col gap-1">
						<span className="text-xs font-bold">Key</span>
						<input name="keypomKey" type="text" placeholder="key" />
					</label>

					<div className="modal-action">
						<label htmlFor="my-modal" className="btn">
							Submit
						</label>
					</div>
				</div>
			</div>
		</>
	);
};
