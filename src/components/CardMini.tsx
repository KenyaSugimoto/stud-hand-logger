import type { Card } from "../types";

type Props = {
	card: Card | null;
};

export const CardMini = (props: Props) => {
	const { card } = props;

	if (!card) return <div className="w-5 h-7 bg-gray-600 rounded-sm" />;
	if (card.kind === "unknown")
		return <div className="w-5 h-7 bg-gray-600 rounded-sm flex items-center justify-center text-xs text-white">X</div>;

	const glyph = { h: "♥", d: "♦", c: "♣", s: "♠" }[card.suit];
	const color = card.suit === "h" || card.suit === "d" ? "text-red-500" : "text-gray-100";

	return (
		<div
			className={`w-5 h-7 bg-blue-900 border border-gray-500 rounded-sm flex items-center justify-center text-[10px] font-mono ${color}`}
		>
			{card.rank}
			{glyph}
		</div>
	);
};
