import type { Card, Rank, Suit } from "../types/Card";

export const generateAllCards = (): Card[] => {
	const suits: Suit[] = ["s", "h", "d", "c"];
	const ranks: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
	const cards: Card[] = [];

	for (const suit of suits) {
		for (const rank of ranks) {
			cards.push({
				rank,
				suit,
				id: `${rank}${suit}`,
				assignedTo: null,
			});
		}
	}

	return cards;
};
