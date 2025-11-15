import type { Card, SuitColorMode } from "../types";

// ---- スートカラーのClassを決定する関数 ----
export const getSuitColorClass = (card: Card | null, isDark: boolean, mode: SuitColorMode) => {
	if (!card) return isDark ? "text-gray-200" : "text-gray-700";
	if (card.kind === "unknown") {
		return isDark ? "text-gray-200" : "text-gray-700";
	}

	// ---- 4色デッキ ----
	if (mode === "four") {
		switch (card.suit) {
			case "s":
				return isDark ? "text-white" : "text-black"; // ♠ black
			case "h":
				return "text-red-500"; // ♥ red
			case "d":
				return "text-blue-500"; // ♦ blue
			case "c":
				return "text-green-500"; // ♣ green
		}
	}

	// ---- 2色デッキ ----
	const isRed = card.suit === "h" || card.suit === "d";
	// darkの時は赤系は薄くして、黒系は白にする
	if (isDark) {
		// dark の通常時
		return isRed ? "text-red-400" : "text-white";
	} else {
		// dark以外 の通常時
		return isRed ? "text-red-600" : "text-black";
	}
};
