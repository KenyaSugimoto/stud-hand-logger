import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { INITIAL_PLAYERS, MAX_PLAYERS } from "../consts";
import type { Card, CardId, PlayerId, Seat, SlotIndex, StudGameType, TableState } from "../types";
import { StudGameType as StudGame } from "../types";
import { assignCard, generateDeck, unassignCard } from "../utils/deck";

interface TableStore {
	gameType: StudGameType;
	games: Record<StudGameType, TableState>;

	// --- 操作 ---
	setGameType: (type: StudGameType) => void;
	setCurrent: (playerId: PlayerId, slotIndex: SlotIndex) => void;
	placeCard: (card: Card) => void;
	removeCard: (cardId: CardId) => void;
	resetGame: (type: StudGameType) => void;
	setPlayersCount: (type: StudGameType, count: number) => void;
}

// 共通の初期状態生成関数
const createInitialSlice = (): TableState => {
	const players = Array.from({ length: MAX_PLAYERS }, (_, i) => `P${i + 1}` as PlayerId);
	const seats: Record<PlayerId, Seat> = Object.fromEntries(players.map((p) => [p, Array(MAX_PLAYERS).fill(null)]));

	return {
		seats,
		cardsById: generateDeck(),
		current: { playerId: "P1", slotIndex: 0 },
		playersCount: INITIAL_PLAYERS,
	};
};

// Zustand store
export const useTableStore = create<TableStore>()(
	// TODO: 永続化
	// persist(
	devtools((set, get) => ({
		gameType: StudGame.StudHi,
		games: {
			[StudGame.StudHi]: createInitialSlice(),
			[StudGame.Stud8]: createInitialSlice(),
			[StudGame.Razz]: createInitialSlice(),
		},

		setGameType: (type) => set({ gameType: type }),

		// 現在の操作対象を設定
		setCurrent: (playerId, slotIndex) => {
			const { gameType, games } = get();
			const currentGame = games[gameType];

			set({
				games: {
					...games,
					[gameType]: { ...currentGame, current: { playerId, slotIndex } },
				},
			});
		},

		// カード配置処理
		placeCard: (card) => {
			const { gameType, games } = get();
			const currentGame = games[gameType];

			if (!currentGame.current) return;

			let updated = { ...currentGame };
			if (card.kind === "unknown") {
				updated.cardsById[card.id] = card;
			}
			updated = assignCard(updated, card.id, currentGame.current);
			const nextIndex = Math.min(currentGame.current.slotIndex + 1, 6) as SlotIndex;
			updated.current = { ...currentGame.current, slotIndex: nextIndex };

			set({
				games: { ...games, [gameType]: updated },
			});
		},

		removeCard: (cardId) => {
			const { gameType, games } = get();
			const updated = unassignCard(games[gameType], cardId);
			set({
				games: { ...games, [gameType]: updated },
			});
		},

		resetGame: (type) => {
			set((state) => ({
				games: {
					...state.games,
					[type]: createInitialSlice(),
				},
			}));
		},

		setPlayersCount: (type, count) => {
			set((state) => ({
				games: {
					...state.games,
					[type]: {
						...state.games[type],
						playersCount: count,
					},
				},
			}));
		},
	})),
	// { name: "stud-table-store" },
	// ),
);
