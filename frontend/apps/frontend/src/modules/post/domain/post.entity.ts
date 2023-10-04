type AccountId = string;

export type Post = {
	id: number;
	series_id:number;
	owner: AccountId;
	owner_id: AccountId;
	title: string;
	description: string;
	imageLink: string;
	audioLink: string;
	media:string;
	extra:string;
	tags:string;
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
