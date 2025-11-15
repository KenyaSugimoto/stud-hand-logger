import { GAME_TYPE_LABELS } from "../consts";
import { useTableStore } from "../hooks/useTableStore";
import { StudGameType } from "../types";

const ACTIVE_TAB: Record<StudGameType, string> = {
	STUD_HI: "bg-blue-600 text-white border-blue-500",
	RAZZ: "bg-orange-600 text-white border-orange-500",
	STUD_8: "bg-green-600 text-white border-green-500",
};

const INACTIVE_TAB: Record<StudGameType, string> = {
	STUD_HI: "bg-blue-100 text-blue-700 hover:bg-blue-200",
	RAZZ: "bg-orange-100 text-orange-700 hover:bg-orange-200",
	STUD_8: "bg-green-100 text-green-700 hover:bg-green-200",
};

export const GameTypeSelect = () => {
	const { gameType, setGameType } = useTableStore();

	return (
		<div className="flex">
			<div className="flex gap-1 items-end">
				{Object.values(StudGameType).map((gt) => {
					const active = gameType === gt;

					return (
						<button
							key={gt}
							type="button"
							onClick={() => setGameType(gt)}
							className={`
							px-4 py-2 text-sm font-semibold transition-all
							border border-b-0 rounded-t-md
							${active ? `${ACTIVE_TAB[gt]} shadow-md -mb-[1px]` : `${INACTIVE_TAB[gt]} border-gray-300`}
							`}
						>
							{GAME_TYPE_LABELS[gt]}
						</button>
					);
				})}
			</div>
		</div>
	);
};
