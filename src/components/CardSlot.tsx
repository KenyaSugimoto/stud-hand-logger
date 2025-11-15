import { useTableStore } from "../hooks/useTableStore";
import type { Card, SuitColorMode } from "../types";
import { getSuitColorClass } from "../utils/style";

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
// ---- テーマの背景・枠色設定 ----
const WHITE_NORMAL = "bg-gray-100 border-gray-300 text-gray-800";
const WHITE_SELECTED = "bg-white border-blue-500 ring-2 ring-blue-400";

const NIGHT_NORMAL = "bg-[#2b2b2b] border-gray-600 text-gray-200";
const NIGHT_SELECTED = "bg-white text-black border-black ring-2 ring-blue-400";

//
// ---- Main ----
//
export const CardSlot = ({ card, selected, onSelect, size }: Props) => {
	const { cardTheme, suitColorMode } = useTableStore();
	const isDark = cardTheme === "dark";

	let baseClass = "";
	let selectedClass = "";

	switch (cardTheme) {
		case "white":
			baseClass = WHITE_NORMAL;
			selectedClass = WHITE_SELECTED;
			break;

		case "dark":
			baseClass = NIGHT_NORMAL;
			selectedClass = NIGHT_SELECTED;
			break;
	}

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`flex items-center justify-center rounded-md border shadow-sm transition-all
        ${selected ? selectedClass : baseClass}`}
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
