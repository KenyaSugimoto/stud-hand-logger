import { useTableStore } from "../hooks/useTableStore";

export const ResetButton = () => {
	const { resetGame, gameType } = useTableStore();

	return (
		<div>
			<button
				type="button"
				className="
					px-3 py-0.5 border text-sm rounded-lg text-white
					bg-gradient-to-b from-red-400 to-red-600
					hover:from-red-500 hover:to-red-700 shadow-md hover:shadow-lg
					active:scale-95 transition-all"
				onClick={() => resetGame(gameType)}
			>
				Reset
			</button>
		</div>
	);
};
