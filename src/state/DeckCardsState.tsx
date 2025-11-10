import { create } from "zustand";
import type { Card } from "../types/Card";
import { generateAllCards } from "../utils/card";

type DeckCardsStateType = {
	deckCards: Card[];
	setDeckCards: (cards: Card[]) => void;
	unknownCards: number;
	setUnknownCards: (count: number) => void;
};

export const useDeckCardsState = create<DeckCardsStateType>()((set) => ({
	deckCards: generateAllCards(),
	setDeckCards: (cards: Card[]) => set(() => ({ deckCards: cards })),
	unknownCards: 0,
	setUnknownCards: (count: number) => set(() => ({ unknownCards: count })),
}));
