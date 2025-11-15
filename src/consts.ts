import type { ActionType, PlayerId, Rank, Street, Suit } from "./types";

// 最大・最小プレイヤー数
export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;

// 初期プレイヤー数を6に設定
export const INITIAL_PLAYERS = 6;

// 各ストリートで可能なアクション
export const ACTIONS_3RD: ActionType[] = ["f", "c", "comp", "bri", "r"];
export const ACTIONS_LATER: ActionType[] = ["f", "x", "c", "b", "r"];

// ストリート一覧
export const STREETS: Street[] = ["3rd", "4th", "5th", "6th", "7th"];

// 全プレイヤーがアクティブな初期状態
export const INITIAL_ALIVE: Record<PlayerId, boolean> = Object.fromEntries(
	Array.from({ length: MAX_PLAYERS }, (_, i) => [`P${i + 1}` as PlayerId, true]),
);

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

export const CARD_THEME_VALUES = ["white", "dark"] as const;
export const SUIT_COLOR_MODE_VALUES = ["two", "four"] as const;
