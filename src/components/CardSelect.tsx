// import { useDeckCards } from "../hooks/useDeckCards";
import { useTableStore } from "../hooks/useTableStore";
import type { Card, CardId, RealCard, RealCardId } from "../types";
import { newUnknown } from "../utils/deck";
import { getSuitColorClass } from "../utils/style";

type CardSelectProps = {
	disableTaken: Set<CardId>; // 既に使用中の実カード
};

export const CardSelect = (props: CardSelectProps) => {
	const { disableTaken } = props;

	const { placeCard, suitColorMode } = useTableStore();

	const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
	const SUITS = ["s", "h", "d", "c"] as const;
	const suitGlyph = (s: string) => ({ h: "♥", d: "♦", c: "♣", s: "♠" })[s as "h" | "d" | "c" | "s"];

	// 🔵 縦長カードの寸法（標準 44px × 62px）
	const CARD_W = 44;
	const CARD_H = Math.round(CARD_W * 1.4); // ≒ 62px

	return (
		<div className="flex gap-4 items-start">
			<div className="grid grid-rows-4 gap-2">
				{SUITS.map((s) => (
					<div key={s} className="flex flex-row gap-2">
						{RANKS.map((r) => {
							const id = `${r}${s}` as RealCardId;
							const disabled = disableTaken.has(id);
							return (
								<button
									type="button"
									key={id}
									disabled={disabled}
									onClick={() => {
										const targetCard: RealCard = { kind: "real", id, rank: r, suit: s, assignedTo: null };
										placeCard(targetCard);
									}}
									className={`border rounded-md font-mono text-lg flex items-center justify-center
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
						{/* 🔵 Unknown カードを同じ行の最後に統合 */}
						{s === "c" && (
							<button
								type="button"
								onClick={() => placeCard(newUnknown())}
								className="border rounded-md bg-gray-100 hover:bg-gray-200 font-semibold flex items-center justify-center text-xs"
								style={{ width: CARD_H, height: CARD_H }}
							>
								Unknown
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	);
};
