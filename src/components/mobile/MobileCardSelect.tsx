import { useMemo } from "react";
import { CARD_ASPECT_RATIO, RANKS, SUITS } from "../../consts";
import { useTableStore } from "../../hooks/useTableStore";
import type { Card, RealCard, RealCardId } from "../../types";
import { newUnknown, takenRealIds } from "../../utils/deck";
import { getSuitColorClass } from "../../utils/style";
import { suitGlyph } from "../../utils/utils";

export const MobileCardSelect = () => {
	const { placeCard, suitColorMode, games, gameType } = useTableStore();
	const state = games[gameType];

	const disableSet = useMemo(() => takenRealIds(state), [state]);

	// 縦長カードの寸法
	const CARD_W = 25;
	const CARD_H = Math.round(CARD_W * CARD_ASPECT_RATIO);

	return (
		<div className="flex gap-4 items-start">
			<div className="grid grid-rows-5 gap-1.5">
				{SUITS.map((s) => (
					<div key={s} className="flex flex-row gap-1.5">
						{RANKS.map((r) => {
							const id = `${r}${s}` as RealCardId;
							const disabled = disableSet.has(id);
							return (
								<button
									type="button"
									key={id}
									disabled={disabled}
									onClick={() => {
										const targetCard: RealCard = { kind: "real", id, rank: r, suit: s, assignedTo: null };
										placeCard(targetCard);
									}}
									className={`border rounded-md font-mono text-sm flex items-center justify-center
										${
											disabled
												? "bg-gray-200 text-gray-400 cursor-not-allowed"
												: "bg-white hover:bg-gray-50 active:scale-[0.98]"
										}`}
									title={id}
									style={{ width: CARD_W, height: CARD_H }}
								>
									<span className={getSuitColorClass({ rank: r, suit: s } as Card, false, suitColorMode)}>
										{r}
										{suitGlyph(s)}
									</span>
								</button>
							);
						})}
					</div>
				))}
				{/* Unknown */}
				<div className="flex justify-start">
					<button
						type="button"
						onClick={() => placeCard(newUnknown())}
						className="border rounded-md bg-gray-100 hover:bg-gray-200 font-semibold flex items-center justify-center text-xs px-2"
					>
						Unknown
					</button>
				</div>
			</div>
		</div>
	);
};
