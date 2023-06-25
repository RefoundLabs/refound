type AccountId = string;

export type Post = {
	id: number;
	owner: AccountId;
	title: string;
	description: string;
	imageLink: string;
	extra:string;
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
