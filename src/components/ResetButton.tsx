import { useTableStore } from "../hooks/useTableStore";
import type { StudGameType } from "../types";

type Props = {
	gameType: StudGameType;
};

export const ResetButton = (props: Props) => {
	const { gameType } = props;

	const { resetGame } = useTableStore();

	return (
		<div>
			<button
				type="button"
				className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
				onClick={() => resetGame(gameType)}
			>
				リセット
			</button>
		</div>
	);
};
