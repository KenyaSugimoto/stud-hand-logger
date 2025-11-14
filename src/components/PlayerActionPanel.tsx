import { useTableStore } from "../hooks/useTableStore";
import type { Action, ActionType, Card, CardId, PlayerId } from "../types";
import { getFirstActor } from "../utils/getFirstActor";
import { PlayerRow } from "./PlayerRow";

type Props = {
	players: PlayerId[];
	seats: Record<PlayerId, (CardId | null)[]>;
	cardsById: Record<CardId, Card>;
	currentStreetActions: Action[];
	onAction: (playerId: PlayerId, type: ActionType) => void;
	bringInCandidate: PlayerId | null;
};

export const PlayerActionPanel = (props: Props) => {
	const { players, seats, cardsById, currentStreetActions, onAction, bringInCandidate } = props;

	const { games, gameType, removeLastAction, clearStreetActions } = useTableStore();
	const currentGame = games[gameType];

	const { alive, currentStreet } = currentGame;

	const firstToAct = getFirstActor(currentGame, gameType);

	const filteredPlayers = players.filter((pid) => currentStreet === "3rd" || alive[pid]);

	return (
		<div className="bg-neutral-800 rounded-lg p-3 mt-2">
			<h3 className="text-sm font-semibold text-gray-200 mb-2">{currentStreet.toUpperCase()} Actions</h3>

			{/* 各プレイヤー行 */}
			{filteredPlayers.map((pid) => (
				<PlayerRow
					key={pid}
					playerId={pid}
					seatIds={seats[pid]}
					cardsById={cardsById}
					onAction={onAction}
					bringInCandidate={bringInCandidate}
					history={currentStreetActions.filter((a) => a.playerId === pid).map((a) => a.type)}
					alive={alive[pid]}
					isFirstActor={pid === firstToAct}
				/>
			))}

			{/* アクション履歴操作ボタン */}
			<div className="flex gap-2 mt-3 justify-end">
				<button
					type="button"
					onClick={() => removeLastAction(currentStreet)}
					className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-yellow-600 transition-colors text-white"
				>
					Undo
				</button>
				<button
					type="button"
					onClick={() => clearStreetActions(currentStreet)}
					className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-red-600 transition-colors text-white"
				>
					Clear
				</button>
			</div>
		</div>
	);
};
