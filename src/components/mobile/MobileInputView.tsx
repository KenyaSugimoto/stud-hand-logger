import { GAME_COLORS, STREETS } from "../../consts";
import { useSlidePanel } from "../../hooks/useSlidePanel";
import { useTableStore } from "../../hooks/useTableStore";
import { ActionLogPanel } from "../ActionLogPanel";
import { MobileCardSelectPanel } from "./MobileCardSelectPanel";
import { MobileStreetBlock } from "./MobileStreetBlock";

export const MobileInputView = () => {
	const { games, gameType, setCurrentStreet } = useTableStore();
	const state = games[gameType];
	const { currentStreet } = state;

	const color = GAME_COLORS[gameType];

	const slide = useSlidePanel();

	return (
		<div className={`relative px-2 flex flex-col gap-2 ${slide.open ? "pb-[280px]" : "pb-10"}`}>
			{/* ストリート切替ボタン */}
			<div className="flex gap-x-1.5">
				{STREETS.map((st) => {
					const isActive = currentStreet === st;
					return (
						<button
							type="button"
							key={st}
							onClick={() => setCurrentStreet(st)}
							className={`
								shrink-0 px-4 py-1 rounded-md font-semibold text-sm
								${isActive ? color.accent : color.normal}
							`}
						>
							{st}
						</button>
					);
				})}
			</div>

			{/* 🔵 選択中のストリートだけ表示 */}
			<MobileStreetBlock />

			{/* アクション履歴 パネル */}
			<div className="mt-2">
				<ActionLogPanel />
			</div>

			{/* カード選択パネル */}
			<div className="">
				<MobileCardSelectPanel open={slide.open} setOpen={slide.setOpen} />
			</div>
		</div>
	);
};
