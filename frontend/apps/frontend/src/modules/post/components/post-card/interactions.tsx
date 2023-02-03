import { UpArrowIcon } from "@modules/ui/icons/menu-icons";

export const InteractionsBadge = ({ voteCount }: { voteCount: number }) => {
	return (
		<div className="flex flex-row gap-2 text-sm">
			<div className="flex flex-row items-center">
				<UpArrowIcon filled className="w-[1em] h-[1em]" />
				<span className="font-mono">{voteCount}</span>
			</div>
		</div>
	);
};
