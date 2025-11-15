import { useTableStore } from "../hooks/useTableStore";
import type { Card, SuitColorMode } from "../types";
import { getStyleByCardTheme, getSuitColorClass } from "../utils/style";

type Props = {
	card: Card | null;
	selected: boolean;
	onSelect: () => void;
	size: number;
};

//
// カード内の表示
//
const View = ({
	card,
	isDark,
	suitColorMode,
}: {
	card: Card | null;
	isDark: boolean;
	suitColorMode: SuitColorMode;
}) => {
	if (!card) return <span className="opacity-40"> </span>;
	if (card.kind === "unknown") return <span>X</span>;

	const glyph = { h: "♥", d: "♦", c: "♣", s: "♠" }[card.suit];

	const color = getSuitColorClass(card, isDark, suitColorMode);

	return (
		<span className={`font-mono ${color}`}>
			{card.rank}
			{glyph}
		</span>
	);
};

//
// ---- Main ----
//
export const CardSlot = ({ card, selected, onSelect, size }: Props) => {
	const { cardTheme, suitColorMode } = useTableStore();
	const isDark = cardTheme === "dark";

	const styles = getStyleByCardTheme(cardTheme);

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`flex items-center justify-center rounded-md border shadow-sm transition-all
        ${selected ? styles.selected : styles.normal}`}
			style={{
				width: 35 * size,
				height: 48 * size,
				fontSize: `${16 * size}px`,
			}}
		>
			<View card={card} isDark={isDark} suitColorMode={suitColorMode} />
		</button>
	);
};
