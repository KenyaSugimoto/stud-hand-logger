import { create } from "zustand";
import type { Card, Rank, Suit } from "../types";

const generateAllCards = (): Card[] => {
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

type DeckCardsStateType = {
	deckCards: Card[];
	setDeckCards: (cards: Card[]) => void;
	unknownCards: number;
	setUnknownCards: (count: number) => void;
};

export const useStudHiDeckCardsState = create<DeckCardsStateType>()((set) => ({
	deckCards: generateAllCards(),
	setDeckCards: (cards: Card[]) => set(() => ({ deckCards: cards })),
	unknownCards: 0,
	setUnknownCards: (count: number) => set(() => ({ unknownCards: count })),
}));

export const useRazzDeckCardsState = create<DeckCardsStateType>()((set) => ({
	deckCards: generateAllCards(),
	setDeckCards: (cards: Card[]) => set(() => ({ deckCards: cards })),
	unknownCards: 0,
	setUnknownCards: (count: number) => set(() => ({ unknownCards: count })),
}));

export const useStud8DeckCardsState = create<DeckCardsStateType>()((set) => ({
	deckCards: generateAllCards(),
	setDeckCards: (cards: Card[]) => set(() => ({ deckCards: cards })),
	unknownCards: 0,
	setUnknownCards: (count: number) => set(() => ({ unknownCards: count })),
}));
