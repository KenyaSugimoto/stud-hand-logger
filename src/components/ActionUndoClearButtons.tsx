import { useTableStore } from "../hooks/useTableStore";

export const ActionUndoClearButtons = () => {
	const { games, gameType, removeLastAction, clearStreetActions } = useTableStore();
	const { currentStreet } = games[gameType];

	return (
		<div className="flex gap-2 m-1 justify-end">
			<button
				type="button"
				onClick={() => removeLastAction(currentStreet)}
				disabled={games[gameType].actions[currentStreet].length === 0}
				className="text-xs px-2 py-1 rounded bg-yellow-600 hover:bg-yellow-500 transition-colors text-white disabled:bg-gray-300"
			>
				Undo
			</button>
			<button
				type="button"
				onClick={() => clearStreetActions(currentStreet)}
				disabled={games[gameType].actions[currentStreet].length === 0}
				className="text-xs px-2 py-1 rounded bg-red-700 hover:bg-red-600 transition-colors text-white disabled:bg-gray-300"
			>
				Clear
			</button>
		</div>
	);
};
