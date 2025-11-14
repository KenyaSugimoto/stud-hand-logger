import type { TableState } from "../hooks/useTableStore";
import type { CardId, RealCard, RealCardId, Slot, Suit, UnknownCard } from "../types";

// TODO: utils.tsにまとめる

export function generateDeck(): Record<RealCardId, RealCard> {
	const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
	const suits: Suit[] = ["s", "h", "d", "c"];
	const out = {} as Record<RealCardId, RealCard>;
	for (const s of suits)
		for (const r of ranks) {
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

export function assignCard(state: TableState, cardId: CardId, slot: Slot): TableState {
	const card = state.cardsById[cardId];

	if (!card) return state;

	// 目的スロットへ配置（上書きOK）
	state.seats[slot.playerId][slot.slotIndex] = cardId;
	state.cardsById[cardId] = { ...card, assignedTo: { ...slot } };
	return { ...state, seats: { ...state.seats }, cardsById: { ...state.cardsById } };
}

export function unassignCard(state: TableState, cardId: CardId): TableState {
	const c = state.cardsById[cardId];
	if (!c || !c.assignedTo) return state;
	const { playerId, slotIndex } = c.assignedTo;
	state.seats[playerId][slotIndex] = null;
	state.cardsById[cardId] = { ...c, assignedTo: null };
	return { ...state, seats: { ...state.seats }, cardsById: { ...state.cardsById } };
}

// 現在テーブルに配置されている実カードID一覧を取得
export function takenRealIds(state: TableState): Set<CardId> {
	const s = new Set<CardId>();
	Object.values(state.seats).forEach((seat) => {
		seat.forEach((id) => {
			if (!id) return;
			const c = state.cardsById[id];
			if (c?.kind === "real") s.add(id);
		});
	});
	return s;
}
