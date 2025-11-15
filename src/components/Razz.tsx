import { ActionLogPanel } from "./ActionLogPanel";
import { ActionSection } from "./ActionSection";
import { CardSelect } from "./CardSelect";
import { PlayersSelect } from "./PlayersSelect";
import { PokerTable } from "./PokerTable";
import { ResetButton } from "./ResetButton";

export const Razz = {
	Left: () => {
		return (
			<div className="w-full h-full flex flex-col overflow-hidden px-6 pt-4 gap-4">
				{/* 🔵 Seat Count（左寄せ） */}
				<div className="">
					<PlayersSelect />
				</div>

				{/* 🔵 Poker Table（中心寄せ + スケール + 最大高さ） */}
				<div className="flex-1 flex items-center justify-center overflow-hidden max-h-[75vh]">
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
