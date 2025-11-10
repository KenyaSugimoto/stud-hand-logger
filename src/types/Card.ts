export type Suit = "s" | "h" | "d" | "c";
export type Rank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2" | "X";

export interface Card {
	rank: Rank;
	suit: Suit | null; // Xはnull
	id: string; // "As", "Td", "X1" など
	assignedTo: AssignedSlot | null; // nullなら未選択
}

export interface AssignedSlot {
	playerId: string; // どのプレイヤーのカードか (例: "P1")
	cardIndex: number; // 何枚目のカードか (1~7まで)
}
