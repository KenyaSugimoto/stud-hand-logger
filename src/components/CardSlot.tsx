import { useTableStore } from "../hooks/useTableStore";
import type { Card, SuitColorMode } from "../types";
import { getStyleByCardTheme, getSuitColorClass } from "../utils/style";
import { suitGlyph } from "../utils/utils";

type Props = {
	card: Card | null;
	selected: boolean;
	onSelect: () => void;
	scale: number;
	isMobile?: boolean;
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

	const glyph = suitGlyph(card.suit);

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
export const CardSlot = ({ card, selected, onSelect, scale, isMobile = false }: Props) => {
	const { cardTheme, suitColorMode } = useTableStore();
	const isDark = cardTheme === "dark";

	const styles = getStyleByCardTheme(cardTheme);

	// 📱 モバイルなら固定サイズで表示
	const width = isMobile ? 20 : 35 * scale;
	const height = isMobile ? 28 : 48 * scale;
	const fontSize = isMobile ? 13 : 16 * scale;

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`flex items-center justify-center rounded-md border shadow-sm transition-all
        ${selected ? styles.selected : styles.normal}`}
			style={{
				width,
				height,
				fontSize,
				flexShrink: 0,
			}}
		>
			<View card={card} isDark={isDark} suitColorMode={suitColorMode} />
		</button>
	);
};
