type AccountId = string;

export type Post = {
	id: number;
	owner: AccountId;
	title: string;
	description: string;
	imageLink: string;
	isVerified: boolean;
	userHasVoted: boolean;
	voteCount: number;
};

export enum LicenseType {
	Outright = "Outright",
	WebLicense = "WebLicense",
	PrintLicense = "PrintLicense",
	SingleUse = "SingleUse",
}
