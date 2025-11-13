import { useTableStore } from "../hooks/useTableStore";
import { StudGameType } from "../types";

export const GameTypeSelect = () => {
	const { gameType, setGameType } = useTableStore();

	return (
		<div className="flex justify-center gap-2 mb-4">
			{Object.values(StudGameType).map((gt) => (
				<button
					type="button"
					key={gt}
					onClick={() => setGameType(gt)}
					className={`
            px-4 py-2 rounded-lg border text-sm font-medium transition
            ${
							gameType === gt
								? "bg-blue-600 text-white border-blue-600 shadow-md"
								: "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
						}
          `}
				>
					{gt}
				</button>
			))}
		</div>
	);
};
