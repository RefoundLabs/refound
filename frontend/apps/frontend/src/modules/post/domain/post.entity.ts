type AccountId = string;

export type Post = {
	id: number;
	owner: AccountId;
	title: string;
	description: string;
	imageLink: string;
	articleText: string;
	locationTaken: string;
	dateTaken: string;
	datePosted: string;
	price: number;
	tags: string;
	dateGoLive: string;
	dateEnd: string;
	isVerified: boolean;
	userHasVoted: boolean;
	voteCount: number;
};

export enum LicenseType {
	Outright = "Outright",
	Web3License="Web3License",
	WebLicense = "WebLicense",
	PrintLicense = "PrintLicense",
	SingleUse = "SingleUse",
}
