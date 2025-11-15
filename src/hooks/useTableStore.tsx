import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { INITIAL_ALIVE, INITIAL_PLAYERS, MAX_PLAYERS, NEXT_STREET_MAP } from "../consts";
import type {
	Action,
	Card,
	CardId,
	CardTheme,
	PlayerId,
	Seat,
	Slot,
	SlotIndex,
	Street,
	StudGameType,
	SuitColorMode,
} from "../types";
import { StudGameType as StudGame } from "../types";
import { assignCard, generateDeck, unassignCard } from "../utils/deck";
import { shouldEndStreet } from "../utils/utils";

export interface TableState {
	seats: Record<PlayerId, Seat>; // 各プレイヤーの7枠
	cardsById: Record<CardId, Card>; // 全カード実体
	playersCount: number; // 現在の参加プレイヤー数
	currentSlot: Slot | null; // 現在操作中のスロット
	actions: Record<Street, Action[]>; // 3rd〜7thごとの履歴
	alive: Record<PlayerId, boolean>; // アクティブなプレイヤーかどうかを管理
	bringInCandidate: PlayerId | null; // bring-inの候補プレイヤー
	bringInPlayer: PlayerId | null; // 実際にbring-inを行ったプレイヤー
	currentStreet: Street; // 現在のストリート
}

interface TableStore {
	gameType: StudGameType;
	games: Record<StudGameType, TableState>;

	// --- 操作 ---
	setGameType: (type: StudGameType) => void;
	setCurrentSlot: (playerId: PlayerId, slotIndex: SlotIndex) => void;
	placeCard: (card: Card) => void;
	removeCard: (cardId: CardId) => void;
	resetGame: (type: StudGameType) => void;
	setPlayersCount: (type: StudGameType, count: number) => void;
	addAction: (street: Street, action: Action) => void;
	removeLastAction: (street: Street) => void;
	clearStreetActions: (street: Street) => void;
	setCurrentStreet: (street: Street) => void;

	// -- カードの見た目設定 --
	cardTheme: CardTheme;
	suitColorMode: SuitColorMode;

	setCardTheme: (theme: CardTheme) => void;
	setCardSuitColor: (mode: SuitColorMode) => void;
}

// 各ストリートの初期アクション履歴
const createInitialActions = (): Record<Street, Action[]> => ({
	"3rd": [],
	"4th": [],
	"5th": [],
	"6th": [],
	"7th": [],
});

export const getPlayers = (playersCount: number): PlayerId[] => {
	return Array.from({ length: playersCount }, (_, i) => `P${i + 1}` as PlayerId);
};

// 共通の初期状態生成関数
const createInitialSlice = (): TableState => {
	const players = getPlayers(MAX_PLAYERS);
	const seats: Record<PlayerId, Seat> = Object.fromEntries(players.map((p) => [p, Array(MAX_PLAYERS).fill(null)]));

	return {
		seats,
		cardsById: generateDeck(),
		currentSlot: { playerId: "P1", slotIndex: 0 },
		playersCount: INITIAL_PLAYERS,
		actions: createInitialActions(),
		alive: { ...INITIAL_ALIVE },
		bringInCandidate: null,
		bringInPlayer: null,
		currentStreet: "3rd",
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
		setCurrentSlot: (playerId, slotIndex) => {
			const { gameType, games } = get();
			const currentGame = games[gameType];

			set({
				games: {
					...games,
					[gameType]: { ...currentGame, currentSlot: { playerId, slotIndex } },
				},
			});
		},

		// カード配置処理
		placeCard: (card) => {
			const { gameType, games } = get();
			const currentGame = games[gameType];

			if (!currentGame.currentSlot) return;

			let updated = { ...currentGame };
			if (card.kind === "unknown") {
				updated.cardsById[card.id] = card;
			}
			updated = assignCard(updated, card.id, currentGame.currentSlot);
			const nextIndex = Math.min(currentGame.currentSlot.slotIndex + 1, 6) as SlotIndex;
			updated.currentSlot = { ...currentGame.currentSlot, slotIndex: nextIndex };

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
					// playerCount は維持
					[type]: { ...createInitialSlice(), playersCount: state.games[type].playersCount },
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

		// アクション追加処理
		addAction: (street, action) => {
			const { gameType, games } = get();
			const g = games[gameType];
			const updated = { ...g };

			// bri が押された時の処理
			if (street === "3rd" && action.type === "bri") {
				updated.bringInPlayer = action.playerId;

				// bri アクションを先頭に追加し、既存の bri は削除
				updated.actions["3rd"] = [
					{ playerId: action.playerId, type: "bri" },
					...g.actions["3rd"].filter((a) => a.type !== "bri"),
				];

				// bring-in候補リセット
				updated.bringInCandidate = null;

				set({
					games: {
						...games,
						[gameType]: updated,
					},
				});

				return;
			}

			// 通常アクション追加
			updated.actions[street] = [...g.actions[street], action];

			// fold → alive false
			if (action.type === "f") {
				updated.alive = { ...g.alive, [action.playerId]: false };
			}

			// ★ 自動ストリート進行 -----------------------------
			// このストリートで alive な人数
			const alivePlayers = getPlayers(updated.playersCount).filter((pid) => updated.alive[pid]);

			const streetActions = updated.actions[street];

			if (shouldEndStreet(streetActions, alivePlayers)) {
				const next = NEXT_STREET_MAP[street]; // さっきの Record<Street, Street | null>
				if (next) {
					updated.currentStreet = next;
				}
			}

			set({
				games: {
					...games,
					[gameType]: updated,
				},
			});
		},

		removeLastAction: (street) => {
			const { gameType, games } = get();
			const current = games[gameType];
			const list = [...current.actions[street]];
			const removed = list.pop();

			const updatedAlive = { ...current.alive };
			if (removed?.type === "f") {
				updatedAlive[removed.playerId] = true;
			}

			set({
				games: {
					...games,
					[gameType]: {
						...current,
						actions: { ...current.actions, [street]: list },
						alive: updatedAlive,
						// 3rdでbriを取り消した場合、bring-inもリセット
						bringInPlayer: street === "3rd" && removed?.type === "bri" ? null : current.bringInPlayer,
					},
				},
			});
		},

		clearStreetActions: (street) => {
			const { gameType, games } = get();
			const currentGame = games[gameType];
			const updated: Record<Street, Action[]> = { ...currentGame.actions, [street]: [] };
			set({
				games: {
					...games,
					[gameType]: {
						...currentGame,
						actions: updated,
						// 3rdでクリアした場合、bring-inもリセット
						bringInPlayer: street === "3rd" ? null : currentGame.bringInPlayer,
					},
				},
			});
		},

		setCurrentStreet: (street) => {
			const state = get();
			const game = state.games[state.gameType];

			set({
				games: {
					...state.games,
					[state.gameType]: {
						...game,
						currentStreet: street,
					},
				},
			});
		},

		// カードの見た目設定
		cardTheme: "light",
		suitColorMode: "two",
		setCardTheme: (theme) => set({ cardTheme: theme }),
		setCardSuitColor: (mode) => set({ suitColorMode: mode }),
	})),
	// { name: "stud-table-store" },
	// ),
);
