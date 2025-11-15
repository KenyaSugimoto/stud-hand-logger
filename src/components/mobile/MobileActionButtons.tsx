import { ACTIONS_3RD, ACTIONS_LATER } from "../../consts";
import { useTableStore } from "../../hooks/useTableStore";
import type { ActionType, PlayerId, Street } from "../../types";
import { canActMobile } from "../../utils/mobile";

type Props = {
	street: Street;
	playerId: PlayerId;
};

export const MobileActionButtons = ({ street, playerId }: Props) => {
	const { games, gameType, addAction } = useTableStore();
	const state = games[gameType];

	const actions = street === "3rd" ? ACTIONS_3RD : ACTIONS_LATER;

	const onClick = (t: ActionType) => {
		addAction(street, { playerId, type: t });
	};

	return (
		<div className="flex gap-1">
			{actions.map((t) => {
				const can = canActMobile(state, street, playerId, t);

				return (
					<button
						key={t}
						type="button"
						onClick={() => can && onClick(t)}
						disabled={!can}
						className={`text-[10px] px-1.5 py-1 rounded border text-white
							${!can ? "bg-gray-400 opacity-40" : "bg-gray-700"}
						`}
					>
						{t}
					</button>
				);
			})}
		</div>
	);
};
