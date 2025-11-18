import { useEffect, useMemo, useRef, useState } from "react";
import { CARD_ASPECT_RATIO, RANKS, SUITS } from "../../consts";
import { useTableStore } from "../../hooks/useTableStore";
import type { Card, RealCardId } from "../../types";
import { newUnknown, takenRealIds } from "../../utils/deck";
import { getSuitColorClass } from "../../utils/style";
import { suitGlyph } from "../../utils/utils";

export const MobileCardSelect = () => {
	const { placeCard, suitColorMode, games, gameType } = useTableStore();
	const state = games[gameType];

	const disableSet = useMemo(() => takenRealIds(state), [state]);

	// 🔵 container の幅を取得するための ref
	const containerRef = useRef<HTMLDivElement>(null);

	// 🔵 計算後のカードサイズ
	const [cardW, setCardW] = useState(25);
	const cardH = Math.round(cardW * CARD_ASPECT_RATIO);

	const MIN_CARD_W = 20;
	const MAX_CARD_W = 40;

	useEffect(() => {
		const calc = () => {
			if (!containerRef.current) return;

			const width = containerRef.current.offsetWidth;

			// SUITS の 1 行の横幅計算
			// gap: 1.5 = 約 6px (Tailwind)
			const GAP = 6;
			const padding = 0;

			const totalGap = GAP * (RANKS.length - 1);
			const available = width - padding - totalGap;

			const w = Math.floor(available / RANKS.length);

			setCardW(Math.max(MIN_CARD_W, Math.min(w, MAX_CARD_W)));
		};

		calc();
		window.addEventListener("resize", calc);
		return () => window.removeEventListener("resize", calc);
	}, []);

	return (
		<div ref={containerRef} className="w-full flex flex-col gap-2 items-start">
			<div className="flex flex-col gap-1.5 w-full px-1">
				{SUITS.map((s) => (
					<div key={s} className="flex flex-row gap-1.5 w-full">
						{RANKS.map((r) => {
							const id = `${r}${s}` as RealCardId;
							const disabled = disableSet.has(id);

							return (
								<button
									type="button"
									key={id}
									disabled={disabled}
									onClick={() =>
										placeCard({
											kind: "real",
											id,
											rank: r,
											suit: s,
											assignedTo: null,
										})
									}
									className={`
										border rounded-md font-mono text-sm flex items-center justify-center
										${disabled ? "bg-gray-200 text-gray-400" : "bg-white active:scale-95"}
									`}
									style={{ width: cardW, height: cardH, fontSize: cardW * 0.55 }}
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
				<div className="flex justify-start pt-1">
					<button
						type="button"
						onClick={() => placeCard(newUnknown())}
						className="border rounded-md bg-gray-100 hover:bg-gray-200 font-semibold flex items-center justify-center text-xs px-2 py-1"
					>
						Unknown
					</button>
				</div>
			</div>
		</div>
	);
};
