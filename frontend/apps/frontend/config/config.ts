import { contractConfig } from "@repo/common/refound-contracts/contract-config";

export const config = {
	celo: {
		rpcEndpoint: process.env.CELO_NODE_RPC_ENDPOINT as string,
		websocketEndpoint: process.env.CELO_NODE_WEBSOCKET_ENDPOINT as string,
		chainId: 44787,
	},
	contracts: contractConfig,
	web3storage: {
		token: process.env.NEXT_PUBLIC_WEB3_STORAGE_API_TOKEN as string,
		maxRetries: 5,
	},
	supabase: {
		publicToken: process.env.NEXT_PUBLIC_SUPABASE_ANON_PUBLIC as string,
		url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
	},
	site: {
		content: {
			defaultResultCount: 10,
		},
		host:
			process.env.NODE_ENV === "production"
				? process.env.NEXT_PUBLIC_SITE_HOST_PROD
				: process.env.NEXT_PUBLIC_SITE_HOST_DEV,
	},
	content: {
		moderationList: {
			posts: [3, 8],
		},
	},
	keypom: {
		trials: {
			user: "https://testnet.mynearwallet.com/linkdrop/v1.keypom.testnet/49e2pkjCZM1CRMhfWoKQiVgC45wqa2ADJrRDmFSwz7q3TA3c8PywH177CuWKwNvCJxbjAYx35XMcVU7Qr4Y3kbWX",
			ngo: "https://testnet.mynearwallet.com/linkdrop/v1.keypom.testnet/3NFWNmfVzmkowrCECrf64A6DYV9kQLAQpCsHXdkrV2EArdckjXgZEEH3WKkodP7GY6RZsfmC5RN4pyfifg9SCmiD",
		},
	},
} as const;
