export const StudGameType = {
	StudHi: "STUD_HI",
	Razz: "RAZZ",
	Stud8: "STUD_8",
} as const;

export type StudGameType = (typeof StudGameType)[keyof typeof StudGameType];

export type Suit = "s" | "h" | "d" | "c";
export type Rank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2" | "X";

export type SlotIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 7枚固定
export type Street = "3rd" | "4th" | "5th" | "6th" | "7th";
export type SlotGroup = "down" | "up" | "down7"; // 12 / 3456 / 7

export const SLOT_TO_STREET: Record<SlotIndex, Street> = {
	0: "3rd",
	1: "3rd",
	2: "3rd",
	3: "4th",
	4: "5th",
	5: "6th",
	6: "7th",
};

export const SLOT_TO_GROUP: Record<SlotIndex, SlotGroup> = {
	0: "down",
	1: "down",
	2: "up",
	3: "up",
	4: "up",
	5: "up",
	6: "down7",
};

export type PlayerId = `P${number}`;

// どのプレイヤーの何枚目のカードに割り当てられたかを示す
export interface Slot {
	playerId: PlayerId; // どのプレイヤーのカードか (例: "P1")
	slotIndex: SlotIndex; // 何枚目のカードか (0~6)
}
type BaseCard = {
	id: string;
	assignedTo: Slot | null; // nullなら未選択
};
export type CardId = Card["id"];
export type RealCardId = RealCard["id"];

export type RealCard = BaseCard & {
	kind: "real";
	rank: Exclude<Rank, "X">;
	suit: Suit;
	id: `${Exclude<Rank, "X">}${Suit}`; // 例: "Ah"
};

export type UnknownCard = BaseCard & {
	kind: "unknown";
	rank: "X";
	suit: null;
	id: `X-${string}`; // 例: "X-abc1"
};

export type Card = RealCard | UnknownCard;

export type Seat = (CardId | null)[]; // 7スロット

export type ActionType = "f" | "c" | "b" | "r" | "x" | "bri" | "comp";
// fold, call, bet, raise, check, bring-in, complete

export interface Action {
	playerId: PlayerId;
	type: ActionType;
}
