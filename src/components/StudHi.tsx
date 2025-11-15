import { useMemo } from "react";
import { useTableStore } from "../hooks/useTableStore";
import { StudGameType } from "../types";
import { takenRealIds } from "../utils/deck";
import { ActionLogPanel } from "./ActionLogPanel";
import { ActionSection } from "./ActionSection";
import { CardSelect } from "./CardSelect";
import { PlayersSelect } from "./PlayersSelect";
import { PokerTable } from "./PokerTable";
import { ResetButton } from "./ResetButton";

const GAME_TYPE = StudGameType.StudHi;

export const StudHi = {
	Left: () => {
		return (
			<div className="w-full h-full flex flex-col overflow-hidden px-6 pt-4 gap-4">
				{/* 🔵 Seat Count（左寄せ） */}
				<div className="">
					<PlayersSelect gameType={GAME_TYPE} />
				</div>

				{/* 🔵 Poker Table（中心寄せ + スケール + 最大高さ） */}
				<div className="flex-1 flex items-center justify-center overflow-hidden max-h-[75vh]">
					<PokerTable gameType={GAME_TYPE} />
				</div>
			</div>
		);
	},

	Right: () => {
		const { games } = useTableStore();
		const state = games[GAME_TYPE];
		const disableSet = useMemo(() => takenRealIds(state), [state]);

		return (
			<div className="flex flex-col gap-4">
				<ResetButton gameType={GAME_TYPE} />

				<CardSelect disableTaken={disableSet} />

				<ActionSection />
				<ActionLogPanel />
			</div>
		);
	},
};
