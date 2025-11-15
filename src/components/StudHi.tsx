import { ActionLogPanel } from "./ActionLogPanel";
import { ActionSection } from "./ActionSection";
import { CardSelect } from "./CardSelect";
import { PlayersSelect } from "./PlayersSelect";
import { PokerTable } from "./PokerTable";
import { ResetButton } from "./ResetButton";

export const StudHi = {
	Left: () => {
		return (
			<div
				className="
					w-full h-full flex flex-col
					px-3 md:px-6
					pt-3 md:pt-4
					gap-3 md:gap-4
					overflow-visible md:overflow-hidden
				"
			>
				<div>
					<PlayersSelect />
				</div>

				<div className="flex-1 flex items-center justify-center overflow-visible md:overflow-hidden max-h-[75vh]">
					<PokerTable />
				</div>
			</div>
		);
	},

	Right: () => {
		return (
			<div className="flex flex-col gap-4">
				<ResetButton />
				<CardSelect />
				<ActionSection />
				<ActionLogPanel />
			</div>
		);
	},
};
