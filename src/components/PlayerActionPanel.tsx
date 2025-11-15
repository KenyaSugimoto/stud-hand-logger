import { useTableStore } from "../hooks/useTableStore";
import type { Action, ActionType, Card, CardId, PlayerId, Rank } from "../types";
import { getBringInCandidate, getFirstActor, getThirdStreetUpCard } from "../utils/getFirstActor";
import { PlayerRow } from "./PlayerRow";

type Props = {
	players: PlayerId[];
	seats: Record<PlayerId, (CardId | null)[]>;
	cardsById: Record<CardId, Card>;
	currentStreetActions: Action[];
	onAction: (playerId: PlayerId, type: ActionType) => void;
};

export const PlayerActionPanel = (props: Props) => {
	const { players, seats, cardsById, currentStreetActions, onAction } = props;

	const { games, gameType, removeLastAction, clearStreetActions } = useTableStore();
	const currentGame = games[gameType];

	const { alive, currentStreet, bringInPlayer } = currentGame;

	const firstToAct = getFirstActor(currentGame, gameType);

	const filteredPlayers = players.filter((pid) => currentStreet === "3rd" || alive[pid]);

	// bring-in 候補（bring-inのプレイヤーが未確定 かつ 3rdの時だけ計算）
	const bringInCandidate =
		!bringInPlayer && currentStreet === "3rd" ? getBringInCandidate(gameType, currentGame) : null;

	// 候補のランクを取得（ランク比較用）
	let bringInRank: Rank | null = null;

	if (bringInCandidate) {
		const upCard = getThirdStreetUpCard(seats[bringInCandidate], cardsById);
		bringInRank = upCard?.rank ?? null;
	}

	return (
		<div className="bg-neutral-500 rounded-lg p-3 mt-2">
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
					// そのプレイヤーのアクション履歴
					history={currentStreetActions.filter((a) => a.playerId === pid).map((a) => a.type)}
					// ストリート全体のアクション履歴（canAct 用）
					streetActions={currentStreetActions.map((a) => a.type)}
					bringInRank={bringInRank}
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
