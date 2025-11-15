import { MAX_PLAYERS, MIN_PLAYERS } from "../consts";
import { useTableStore } from "../hooks/useTableStore";

const GAME_COLORS = {
	STUD_HI: {
		accent: "bg-blue-600 text-white ring-2 ring-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.7)]",
		normal: "bg-blue-300 text-black hover:bg-blue-400 shadow-inner",
	},
	RAZZ: {
		accent: "bg-orange-600 text-white ring-2 ring-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.7)]",
		normal: "bg-orange-300 text-black hover:bg-orange-400 shadow-inner",
	},
	STUD_8: {
		accent: "bg-green-600 text-white ring-2 ring-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.7)]",
		normal: "bg-green-300 text-black hover:bg-green-400 shadow-inner",
	},
} as const;

export const PlayersSelect = () => {
	const { games, setPlayersCount, gameType } = useTableStore();

	const playersCount = games[gameType].playersCount;
	const counts = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS);

	const color = GAME_COLORS[gameType];

	return (
		<div className="flex flex-col gap-2 items-start">
			<p
				className={`text-sm font-bold tracking-wide ${
					gameType === "STUD_HI" ? "text-blue-300" : gameType === "RAZZ" ? "text-orange-300" : "text-green-300"
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
