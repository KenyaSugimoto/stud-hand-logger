import type { TableState } from "../../hooks/useTableStore"; // or export TableState from hook
import { getPlayers, useTableStore } from "../../hooks/useTableStore";
import type { PlayerId, Street } from "../../types";
import { isAliveAtStartStreet } from "../../utils/getFirstActor";
import { MobilePlayerRow } from "./MobilePlayerRow";

type Props = {
	street: Street;
	state: TableState;
};

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

export const MobileStreetBlock = ({ street, state }: Props) => {
	const { setCurrentSlot, gameType } = useTableStore();

	const players: PlayerId[] = getPlayers(state.playersCount);

	// 🔍 各ストリート開始時点で生存しているプレイヤーのみ
	const visiblePlayers = players.filter((pid) => isAliveAtStartStreet(state, pid, street));

	const styles = STYLE[gameType];

	return (
		<details open className={`rounded-lg text-white ${styles.bg}`}>
			<summary
				className={`flex items-center justify-between px-3 py-2 cursor-pointer select-none ${styles.summaryBg} rounded-t-lg`}
			>
				<span className="font-semibold text-sm">{street} Actions</span>
				<span className="text-xs text-white">{visiblePlayers.length} players</span>
			</summary>

			<div className="px-2 pb-2 flex flex-col gap-1.5 pt-2">
				{visiblePlayers.map((pid) => (
					<MobilePlayerRow
						key={pid}
						street={street}
						playerId={pid}
						seatIds={state.seats[pid]}
						cardsById={state.cardsById}
						currentSlot={state.currentSlot}
						onPickSlot={(slotIndex) => setCurrentSlot(pid, slotIndex)}
						alive={state.alive[pid]}
					/>
				))}
			</div>
		</details>
	);
};
