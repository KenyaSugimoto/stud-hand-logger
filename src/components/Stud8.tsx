import { useMemo } from "react";
import { useTableStore } from "../hooks/useTableStore";
import { StudGameType } from "../types";
import { takenRealIds } from "../utils/deck";
import { ActionSection } from "./ActionSection";
import { CardSelect } from "./CardSelect";
import { PlayersSelect } from "./PlayersSelect";
import { PokerTable } from "./PokerTable";
import { ResetButton } from "./ResetButton";

export const Stud8 = () => {
	const stud8 = StudGameType.Stud8;

	const { games } = useTableStore();

	const gameState = games[stud8];

	// 既に使用中の実カードIDセットを取得
	const disableSet = useMemo(() => takenRealIds(gameState), [gameState]);
	return (
		<>
			<ResetButton gameType={stud8} />
			<PlayersSelect gameType={stud8} />
			<CardSelect disableTaken={disableSet} />
			<PokerTable gameType={stud8} />
			<br />
			<ActionSection />
		</>
	);
};
