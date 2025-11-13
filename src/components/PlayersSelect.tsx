import { MAX_PLAYERS, MIN_PLAYERS } from "../consts";
import { useTableStore } from "../hooks/useTableStore";
import type { StudGameType } from "../types";

type PlayersSelectProps = {
	gameType: StudGameType;
};

export const PlayersSelect = (props: PlayersSelectProps) => {
	const { gameType } = props;

	const { games, setPlayersCount } = useTableStore();

	const gameState = games[gameType];
	const playersCount = gameState.playersCount;

	return (
		<div className="flex flex-col gap-2 items-start">
			<p className="text-sm font-medium text-gray-700">プレイヤー人数を選択</p>

			<select
				className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
				value={playersCount}
				onChange={(e) => setPlayersCount(gameType, Number(e.target.value))}
			>
				{Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS).map((count) => (
					<option key={count} value={count}>
						{count} 人
					</option>
				))}
			</select>
		</div>
	);
};
