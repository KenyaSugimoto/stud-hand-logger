// import { useDeckCards } from "../hooks/useDeckCards";
import { useTableStore } from "../hooks/useTableStore";
import type { CardId, RealCard, RealCardId } from "../types";
import { newUnknown } from "../utils/deck";

type CardSelectProps = {
	disableTaken: Set<CardId>; // 既に使用中の実カード
};

export const CardSelect = (props: CardSelectProps) => {
	const { disableTaken } = props;

	const { placeCard } = useTableStore();

	const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
	const SUITS = ["s", "h", "d", "c"] as const;
	const suitGlyph = (s: string) => ({ h: "♥", d: "♦", c: "♣", s: "♠" })[s as "h" | "d" | "c" | "s"];
	const suitCls = (s: string) => (s === "h" || s === "d" ? "text-red-600" : "text-gray-800");

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
									className={`w-14 h-10 border rounded-md font-mono text-sm flex items-center justify-center
                    ${
											disabled
												? "bg-gray-200 text-gray-400 cursor-not-allowed"
												: "bg-white hover:bg-gray-50 active:scale-[0.98]"
										}`}
									title={id}
								>
									<span className={suitCls(s)}>
										{r}
										{suitGlyph(s)}
									</span>
								</button>
							);
						})}
					</div>
				))}
			</div>

			<div className="flex flex-col gap-2">
				<div className="text-xs text-gray-500">Unknown</div>
				<button
					type="button"
					onClick={() => placeCard(newUnknown())}
					className="w-20 h-10 border rounded-md bg-gray-100 hover:bg-gray-200 font-semibold"
				>
					X
				</button>
			</div>
		</div>
	);
};
