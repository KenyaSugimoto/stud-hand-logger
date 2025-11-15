import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { INITIAL_ALIVE, INITIAL_PLAYERS, MAX_PLAYERS, NEXT_STREET_MAP, STREETS } from "../consts";
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

			// unknown カード
			if (card.kind === "unknown") {
				updated = {
					...updated,
					cardsById: { ...updated.cardsById, [card.id]: card },
				};
			}

			updated = assignCard(updated, card.id, currentGame.currentSlot);

			const nextIndex = Math.min(currentGame.currentSlot.slotIndex + 1, 6) as SlotIndex;
			updated = {
				...updated,
				currentSlot: { ...currentGame.currentSlot, slotIndex: nextIndex },
			};

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

			// --- actions を deep immutable に更新 ---
			const newActions = {
				...g.actions,
				[street]: [...g.actions[street], action],
			};

			let updated: TableState = {
				...g,
				actions: newActions,
			};

			// bri の特殊処理
			if (street === "3rd" && action.type === "bri") {
				const filtered = g.actions["3rd"].filter((a) => a.type !== "bri");
				updated = {
					...updated,
					actions: {
						...updated.actions,
						["3rd" as Street]: [{ playerId: action.playerId, type: "bri" }, ...filtered],
					},
					bringInPlayer: action.playerId,
					bringInCandidate: null,
				};

				return set({
					games: { ...games, [gameType]: updated },
				});
			}

			// fold → alive false
			if (action.type === "f") {
				updated = {
					...updated,
					alive: {
						...updated.alive,
						[action.playerId]: false,
					},
				};
			}

			// --- ストリート自動遷移 ---
			const alivePlayers = getPlayers(updated.playersCount).filter((pid) => updated.alive[pid]);
			const streetActions = updated.actions[street];

			if (shouldEndStreet(streetActions, alivePlayers)) {
				const next = NEXT_STREET_MAP[street];
				if (next) {
					updated = {
						...updated,
						currentStreet: next,
					};
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

			const oldList = current.actions[street];
			if (oldList.length === 0) return;

			const removed = oldList[oldList.length - 1];
			const newList = oldList.slice(0, -1);

			let newState: TableState = {
				...current,
				actions: {
					...current.actions,
					[street]: newList,
				},
			};

			// fold を戻す
			if (removed?.type === "f") {
				newState = {
					...newState,
					alive: { ...newState.alive, [removed.playerId]: true },
				};
			}

			// bri を戻す
			if (street === "3rd" && removed?.type === "bri") {
				newState = {
					...newState,
					bringInPlayer: null,
				};
			}

			set({
				games: {
					...games,
					[gameType]: newState,
				},
			});
		},

		clearStreetActions: (street) => {
			const { gameType, games } = get();
			const current = games[gameType];

			const newActions = {
				...current.actions,
				[street]: [],
			};

			// このストリート開始時までに既にfoldしていたプレイヤーのリスト
			const foldedPlayersAtStartStreet = getPlayers(MAX_PLAYERS).filter((pid) => {
				if (street === "3rd") return false; // 3rd開始時は必ず生存

				const idx = STREETS.indexOf(street);
				const relevant = STREETS.slice(0, idx); // 4th:1, ...

				for (const st of relevant) {
					if (current.actions[st].some((a) => a.playerId === pid && a.type === "f")) {
						return true;
					}
				}
				return false;
			});

			const newAlive: Record<PlayerId, boolean> = { ...INITIAL_ALIVE };
			foldedPlayersAtStartStreet.forEach((pid) => {
				newAlive[pid] = false;
			});

			const newState: TableState = {
				...current,
				actions: newActions,
				bringInPlayer: street === "3rd" ? null : current.bringInPlayer,
				alive: newAlive,
			};

			set({
				games: {
					...games,
					[gameType]: newState,
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
