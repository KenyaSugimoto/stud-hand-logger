import { STREETS } from "../../consts";
import { useTableStore } from "../../hooks/useTableStore";
import type { Street } from "../../types";
import { ActionLogPanel } from "../ActionLogPanel";
import { MobileCardSelect } from "./MobileCardSelect";
import { MobileStreetBlock } from "./MobileStreetBlock";

export const MobileInputView = () => {
	const { games, gameType } = useTableStore();
	const state = games[gameType];

	return (
		<div className="w-full px-2 pb-3 flex flex-col gap-4">
			{/* Street ごとのアコーディオン */}
			{STREETS.map((street) => (
				<MobileStreetBlock key={street} street={street as Street} state={state} />
			))}

			{/* カード選択 & アクションログ（PCと同じコンポーネントを流用） */}
			<div className="mt-2">
				<MobileCardSelect />
			</div>

			<div className="mt-2">
				<ActionLogPanel />
			</div>
		</div>
	);
};
