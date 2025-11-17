import { getPlayers, useTableStore } from "../../hooks/useTableStore";
import type { PlayerId } from "../../types";
import { getBringInCandidate, isAliveAtStartStreet } from "../../utils/getFirstActor";
import { ActionUndoClearButtons } from "../ActionUndoClearButtons";
import { MobilePlayerRow } from "./MobilePlayerRow";

const STYLE = {
	STUD_HI: {
		bg: "bg-blue-100",
		summaryBg: "bg-blue-600",
	},
	RAZZ: {
		bg: "bg-orange-100",
		summaryBg: "bg-orange-600",
	},
	STUD_8: {
		bg: "bg-green-100",
		summaryBg: "bg-green-600",
	},
};

export const MobileStreetBlock = () => {
	const { setCurrentSlot, gameType, games } = useTableStore();
	const state = games[gameType];
	const { currentStreet, bringInPlayer } = state;

	const players: PlayerId[] = getPlayers(state.playersCount);

	// ストリート開始時点で生存しているプレイヤーのみ抽出
	const visiblePlayers = players.filter((pid) => isAliveAtStartStreet(state, pid, currentStreet));

	// bring-in 候補（bring-inのプレイヤーが未確定 かつ 3rdの時だけ計算）
	const bringInCandidate = !bringInPlayer && currentStreet === "3rd" ? getBringInCandidate(gameType, state) : null;

	const styles = STYLE[gameType];

	return (
		<details open className={`rounded-lg text-white ${styles.bg}`}>
			<summary
				className={`flex items-center justify-between px-3 py-2 cursor-pointer select-none ${styles.summaryBg} rounded-t-lg`}
			>
				<span className="font-semibold text-sm">{currentStreet} Actions</span>
				<span className="text-xs text-white">{visiblePlayers.length} players</span>
			</summary>

			{/* 各プレイヤーのアクション入力列 */}
			<div className="px-2 flex flex-col gap-1.5 pt-2">
				{visiblePlayers.map((pid) => (
					<MobilePlayerRow
						key={pid}
						street={currentStreet}
						playerId={pid}
						seatIds={state.seats[pid]}
						cardsById={state.cardsById}
						currentSlot={state.currentSlot}
						onPickSlot={(slotIndex) => setCurrentSlot({ playerId: pid, slotIndex })}
						alive={state.alive[pid]}
						bringInCandidate={bringInCandidate}
					/>
				))}
			</div>

			{/* undo, clear buttons */}
			<div className="flex justify-end p-1">
				<ActionUndoClearButtons />
			</div>
		</details>
	);
};
