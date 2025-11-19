import { GAME_COLORS, MAX_PLAYERS, MIN_PLAYERS } from "../consts";
import { useTableStore } from "../hooks/useTableStore";

export const PlayersSelect = () => {
	const { games, setPlayersCount, gameType } = useTableStore();

	const playersCount = games[gameType].playersCount;
	const counts = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS);

	const color = GAME_COLORS[gameType];

	return (
		<div className="flex flex-col px-1 gap-2 items-start">
			<p
				className={`text-sm font-bold tracking-wide ${
					gameType === "STUD_HI" ? "text-blue-600" : gameType === "RAZZ" ? "text-orange-600" : "text-green-600"
				}`}
			>
				SEAT COUNT
			</p>

			<div className="flex flex-wrap gap-2">
				{counts.map((count) => {
					const selected = count === playersCount;

					return (
						<button
							type="button"
							key={count}
							onClick={() => setPlayersCount(gameType, count)}
							className={[
								"w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-150",
								selected ? color.accent : color.normal,
							].join(" ")}
						>
							{count}
						</button>
					);
				})}
			</div>
		</div>
	);
};
