import { CARD_ASPECT_RATIO } from "../consts";
import type { Card, CardTheme, SuitColorMode } from "../types";
import { getStyleByCardTheme, getSuitColorClass } from "../utils/style";
import { suitGlyph } from "../utils/utils";

type Props = {
	card: Card | null;
	suitColorMode: SuitColorMode;
	cardTheme: CardTheme;
};

export const CardMini = (props: Props) => {
	const { card, suitColorMode, cardTheme } = props;

	const CARD_WIDTH = 28;
	const CARD_HEIGHT = Math.round(CARD_WIDTH * CARD_ASPECT_RATIO); // 縦横比 1:1.4

	const styles = getStyleByCardTheme(cardTheme);

	if (!card)
		return <div className={`rounded-sm ${styles.normal}`} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }} />;
	if (card.kind === "unknown")
		return (
			<div
				className={`rounded-sm flex items-center justify-center text-xs font-mono ${styles.normal}`}
				style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
			>
				X
			</div>
		);

	const glyph = suitGlyph(card.suit);
	const color = getSuitColorClass(card, cardTheme === "dark", suitColorMode);

	return (
		<div
			className={`rounded-sm flex items-center justify-center text-sm font-mono ${color} ${styles.normal}`}
			style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
		>
			{card.rank}
			{glyph}
		</div>
	);
};
