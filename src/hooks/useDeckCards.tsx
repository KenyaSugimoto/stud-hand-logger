import { useDeckCardsState } from "../state/DeckCardsState";

export const useDeckCards = () => {
	const { deckCards, setDeckCards, unknownCards, setUnknownCards } = useDeckCardsState();

	// カードを特定のプレイヤーに割り当てる
	const assignCard = (cardId: string, playerId: string, cardIndex: number) => {
		setDeckCards(
			deckCards.map((card) => (card.id === cardId ? { ...card, assignedTo: { playerId, cardIndex } } : card)),
		);
	};

	// カードの割り当てを解除
	const unassignCard = (cardId: string) => {
		setDeckCards(deckCards.map((card) => (card.id === cardId ? { ...card, assignedTo: null } : card)));
	};

	const addUnknownCard = () => {
		setUnknownCards(unknownCards + 1);
	};

	return {
		deckCards,
		assignCard,
		unassignCard,
		unknownCards,
		addUnknownCard,
	};
};
