import NextLink from "next/link";

export const NotFoundPage = () => (
	<div className="fixed top-0 bottom-0 left-0 right-0 flex flex-col items-center justify-center w-full h-screen gap-8 bg-background ">
		<h2 className="text-4xl font-bold text-primary-lesser">Not Found</h2>
		<NextLink href="/discover">
			<a className="text-sm font-bold underline hover:opacity-60">Discover Other Posts</a>
		</NextLink>
	</div>
);
