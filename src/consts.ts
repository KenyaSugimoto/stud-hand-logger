import type { ActionType, CardTheme, PlayerId, Rank, Street, StudGameType, Suit, SuitColorMode } from "./types";

// 最大・最小プレイヤー数
export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;

// 初期プレイヤー数を6に設定
export const INITIAL_PLAYERS = 3;

// 各ストリートで可能なアクション
export const ACTIONS_3RD: ActionType[] = ["f", "c", "comp", "bri", "r"];
export const ACTIONS_LATER: ActionType[] = ["f", "x", "c", "b", "r"];

// ストリート一覧
export const STREETS: Street[] = ["3rd", "4th", "5th", "6th", "7th"];

// 全プレイヤーがアクティブな初期状態
export const INITIAL_ALIVE: Record<PlayerId, boolean> = Object.fromEntries(
	Array.from({ length: MAX_PLAYERS }, (_, i) => [`P${i + 1}` as PlayerId, true]),
);

// カードのランク・スート一覧
export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
export const SUITS = ["s", "h", "d", "c"] as const;

// カードランク・スートの順序付け
export const RANK_STUD_HI: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
export const RANK_RAZZ: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];

export const SUIT_RANK_STUD_HI = { c: 1, d: 2, h: 3, s: 4 };
export const SUIT_RANK_RAZZ = { c: 4, d: 3, h: 2, s: 1 };

export const NEXT_STREET_MAP: Record<Street, Street | null> = {
	"3rd": "4th",
	"4th": "5th",
	"5th": "6th",
	"6th": "7th",
	"7th": null,
};

// Rank / Suit の強さ
export const RANK_VALUE_HI: Record<Exclude<Rank, "X">, number> = {
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	T: 10,
	J: 11,
	Q: 12,
	K: 13,
	A: 14,
};

export const RANK_VALUE_RAZZ: Record<Exclude<Rank, "X">, number> = {
	A: 1,
	"2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	T: 10,
	J: 11,
	Q: 12,
	K: 13,
};

export const SUIT_VALUE: Record<Suit, number> = {
	c: 0,
	d: 1,
	h: 2,
	s: 3, // spade が一番強い想定
};

export const SUIT_VALUE_RAZZ: Record<Suit, number> = {
	c: 3,
	d: 2,
	h: 1,
	s: 0, // spade が一番弱い想定
};

// カードテーマ・スートカラーモードの選択肢
export const CARD_THEME_VALUES: CardTheme[] = ["light", "dark"];
export const SUIT_COLOR_MODE_VALUES: SuitColorMode[] = ["two", "four"];

// カードのアスペクト比
export const CARD_ASPECT_RATIO = 1.4;

// ゲームタイプのラベル
export const GAME_TYPE_LABELS: Record<StudGameType, string> = {
	STUD_HI: "Stud Hi",
	RAZZ: "Razz",
	STUD_8: "Stud 8",
};

export const STREET_TO_VISIBLE_CARD_COUNT: Record<Street, number> = {
	"3rd": 3, // down2 + up1
	"4th": 4,
	"5th": 5,
	"6th": 6,
	"7th": 7,
};

export const GAME_COLORS = {
	STUD_HI: {
		accent: "bg-blue-600 text-white ring-2 ring-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.7)]",
		normal: "bg-blue-300 text-black hover:bg-blue-400 shadow-inner",
	},
	RAZZ: {
		accent: "bg-orange-600 text-white ring-2 ring-orange-300 shadow-[0_0_10px_rgba(251,146,60,0.7)]",
		normal: "bg-orange-300 text-black hover:bg-orange-400 shadow-inner",
	},
	STUD_8: {
		accent: "bg-green-600 text-white ring-2 ring-lime-300 shadow-[0_0_10px_rgba(190,242,100,0.7)]",
		normal: "bg-green-300 text-black hover:bg-green-400 shadow-inner",
	},
};
