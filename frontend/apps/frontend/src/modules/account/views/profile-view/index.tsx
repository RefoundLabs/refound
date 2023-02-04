import { useAccount } from "@modules/account/hooks/use-account";

export const ProfileView = () => {
	const { account } = useAccount();

	return (
		<section>
			<h1>Account</h1>
			<div>
				<h2>Address:</h2>
				<p>{account?.accountId || "n/a"}</p>
			</div>
		</section>
	);
};
