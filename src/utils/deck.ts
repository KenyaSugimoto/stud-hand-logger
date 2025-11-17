import { RANKS, SUITS } from "../consts";
import type { TableState } from "../hooks/useTableStore";
import type { CardId, RealCard, RealCardId, Slot, UnknownCard } from "../types";

// TODO: utils.tsにまとめる

export function generateDeck(): Record<RealCardId, RealCard> {
	const out = {} as Record<RealCardId, RealCard>;
	for (const s of SUITS)
		for (const r of RANKS) {
			const id = `${r}${s}` as RealCardId;
			out[id] = { kind: "real", id, rank: r, suit: s, assignedTo: null };
		}
	return out;
}

export function newUnknown(): UnknownCard {
	return {
		kind: "unknown",
		id: `X-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
		rank: "X",
		suit: null,
		assignedTo: null,
	};
}

export const assignCard = (state: TableState, cardId: CardId, slot: Slot): TableState => {
	const card = state.cardsById[cardId];
	if (!card) return state;

	// deep clone
	const newSeats = { ...state.seats };
	newSeats[slot.playerId] = [...state.seats[slot.playerId]];

	const newCards = { ...state.cardsById };

	// assign
	newSeats[slot.playerId][slot.slotIndex] = cardId;
	newCards[cardId] = { ...card, assignedTo: { ...slot } };

	return {
		...state,
		seats: newSeats,
		cardsById: newCards,
	};
};

export const unassignCard = (state: TableState, cardId: CardId): TableState => {
	const c = state.cardsById[cardId];
	if (!c || !c.assignedTo) return state;

	// deep clone
	const newSeats = { ...state.seats };
	newSeats[c.assignedTo.playerId] = [...state.seats[c.assignedTo.playerId]];

	const newCards = { ...state.cardsById };

	// unassign
	newSeats[c.assignedTo.playerId][c.assignedTo.slotIndex] = null;
	newCards[cardId] = { ...c, assignedTo: null };

	return {
		...state,
		seats: newSeats,
		cardsById: newCards,
	};
};

// 現在テーブルに配置されている実カードID一覧を取得
export const takenRealIds = (state: TableState): Set<CardId> => {
	const s = new Set<CardId>();
	Object.values(state.seats).forEach((seat) => {
		seat.forEach((id) => {
			if (!id) return;
			const c = state.cardsById[id];
			if (c?.kind === "real") s.add(id);
		});
	});
	return s;
};
