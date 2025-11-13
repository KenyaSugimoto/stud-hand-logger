import { useMemo } from "react";
import { useTableStore } from "../hooks/useTableStore";
import { StudGameType } from "../types";
import { takenRealIds } from "../utils/deck";
import { CardSelect } from "./CardSelect";
import { PlayersSelect } from "./PlayersSelect";
import { PokerTable } from "./PokerTable";
import { ResetButton } from "./ResetButton";

export const Razz = () => {
	const razz = StudGameType.Razz;

	const { games } = useTableStore();

	const gameState = games[razz];

	// 既に使用中の実カードIDセットを取得
	const disableSet = useMemo(() => takenRealIds(gameState), [gameState]);

	return (
		<>
			<ResetButton gameType={razz} />
			<PlayersSelect gameType={razz} />
			<CardSelect disableTaken={disableSet} />
			<PokerTable gameType={razz} />
		</>
	);
};
