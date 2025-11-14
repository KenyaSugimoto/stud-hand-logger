import { STREETS } from "../consts";
import { useTableStore } from "../hooks/useTableStore";
import type { PlayerId } from "../types";
import { getBringInCandidate } from "../utils/getFirstActor";
import { PlayerActionPanel } from "./PlayerActionPanel";

export const ActionSection = () => {
	const { games, gameType, addAction, setCurrentStreet } = useTableStore();

	const game = games[gameType];
	const { playersCount, seats, cardsById, actions, bringInPlayer, currentStreet } = game;
	const visiblePlayers: PlayerId[] = Array.from({ length: playersCount }, (_, i) => `P${i + 1}` as PlayerId);

	// bring-in 候補（bring-inのプレイヤーが未確定 かつ 3rdの時だけ計算）
	const bringInCandidate = !bringInPlayer && currentStreet === "3rd" ? getBringInCandidate(gameType, game) : null;

	return (
		<div className="mt-4">
			{/* ストリート切替 */}
			<div className="flex gap-2 mb-3">
				{STREETS.map((s) => (
					<button
						type="button"
						key={s}
						onClick={() => setCurrentStreet(s)}
						className={`px-3 py-1 rounded text-sm font-medium ${
							currentStreet === s ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"
						}`}
					>
						{s}
					</button>
				))}
			</div>

			<PlayerActionPanel
				players={visiblePlayers}
				seats={seats}
				cardsById={cardsById}
				currentStreetActions={actions[currentStreet]}
				onAction={(playerId, type) => addAction(currentStreet, { playerId, type })}
				bringInCandidate={bringInCandidate}
			/>
		</div>
	);
};
