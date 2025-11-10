export const suitSymbol = (suit: string | null): string => {
	switch (suit) {
		case "h":
			return "♥";
		case "d":
			return "♦";
		case "c":
			return "♣";
		case "s":
			return "♠";
		default:
			return "";
	}
};
