import { useRazzDeckCardsState, useStud8DeckCardsState, useStudHiDeckCardsState } from "../state/DeckCardsState";
import { type CardId, type PlayerId, type SlotIndex, StudGameType } from "../types";

const useDeckCardsStateByGameType = (gameType: StudGameType) => {
	const studHi = useStudHiDeckCardsState();
	const razz = useRazzDeckCardsState();
	const stud8 = useStud8DeckCardsState();

	switch (gameType) {
		case StudGameType.StudHi:
			return studHi;
		case StudGameType.Razz:
			return razz;
		default:
			return stud8;
	}
};

export const useDeckCards = (gameType: StudGameType) => {
	const { deckCards, setDeckCards, unknownCards, setUnknownCards } = useDeckCardsStateByGameType(gameType);

	const assignCard = (cardId: CardId, playerId: PlayerId, cardIndex: SlotIndex) => {
		setDeckCards(
			deckCards.map((card) => (card.id === cardId ? { ...card, assignedTo: { playerId, cardIndex } } : card)),
		);
	};

	const unassignCard = (cardId: CardId) => {
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
