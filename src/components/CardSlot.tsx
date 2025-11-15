import type { Card } from "../types";

type Props = {
	card: Card | null;
	selected: boolean;
	onSelect: () => void;
	size: number;
};

const View = ({ card }: { card: Card | null }) => {
	if (!card) return <span className="opacity-60"> </span>;
	if (card.kind === "unknown") return <span className="font-semibold">X</span>;
	const glyph = { h: "♥", d: "♦", c: "♣", s: "♠" }[card.suit];
	const cls = card.suit === "h" || card.suit === "d" ? "text-red-600" : "text-gray-100";
	return (
		<span className={`font-mono ${cls}`}>
			{card.rank}
			{glyph}
		</span>
	);
};

export const CardSlot = (props: Props) => {
	const { card, selected, onSelect, size } = props;
	return (
		<button
			type="button"
			onClick={onSelect}
			className={`w-10 h-14 rounded-md border flex items-center justify-center shadow
        ${selected ? "border-white ring-2 ring-white shadow-[0_0_10px_white] bg-white/10" : "border-white bg-blue-900"}`}
			style={{
				width: 35 * size,
				height: 48 * size,
				fontSize: `${16 * size}px`,
			}}
		>
			<View card={card} />
		</button>
	);
};
