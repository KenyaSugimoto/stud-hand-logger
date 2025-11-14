import { useMemo } from "react";
import { useTableStore } from "../hooks/useTableStore";
import { StudGameType } from "../types";
import { takenRealIds } from "../utils/deck";
import { ActionSection } from "./ActionSection";
import { CardSelect } from "./CardSelect";
import { PlayersSelect } from "./PlayersSelect";
import { PokerTable } from "./PokerTable";
import { ResetButton } from "./ResetButton";

export const StudHi = () => {
	const studHi = StudGameType.StudHi;

	const { games } = useTableStore();

	const gameState = games[studHi];

	// 既に使用中の実カードIDセットを取得
	const disableSet = useMemo(() => takenRealIds(gameState), [gameState]);

	return (
		<>
			<ResetButton gameType={studHi} />
			<PlayersSelect gameType={studHi} />
			<CardSelect disableTaken={disableSet} />
			<PokerTable gameType={studHi} />
			<br />
			<ActionSection />
		</>
	);
};
