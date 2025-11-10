import { useSelectedGameTypeState } from "../state/SelectedGameTypeState";
import { StudGameType } from "../types/StudGameType";

export const GameTypeSelect = () => {
	const { selectedGameType, setSelectedGameType } = useSelectedGameTypeState();

	return (
		<div className="flex justify-center gap-2 mb-4">
			{Object.values(StudGameType).map((gameType) => (
				<button
					type="button"
					key={gameType}
					onClick={() => setSelectedGameType(gameType)}
					className={`
            px-4 py-2 rounded-lg border text-sm font-medium transition
            ${
							selectedGameType === gameType
								? "bg-blue-600 text-white border-blue-600 shadow-md"
								: "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
						}
          `}
				>
					{gameType}
				</button>
			))}
		</div>
	);
};
