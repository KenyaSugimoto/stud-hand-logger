import { describe, expect, test } from "vitest";
import type { Rank, RealCard, Suit, UnknownCard } from "../types";
import { getStyleByCardTheme, getSuitColorClass } from "./style"; // パスは調整

const makeCard = (suit: Suit, rank: Exclude<Rank, "X"> = "A"): RealCard =>
	({
		id: `${rank}${suit}`,
		suit,
		rank,
		kind: "real",
	}) as RealCard;

describe("getSuitColorClass", () => {
	// ---- nullカード / unknownカード ----
	test("null card → gray", () => {
		expect(getSuitColorClass(null, false, "two")).toBe("text-gray-700");
		expect(getSuitColorClass(null, true, "two")).toBe("text-gray-200");
	});

	test("unknown card → gray", () => {
		const unknown: UnknownCard = {
			id: "X-unknown",
			kind: "unknown",
			suit: null,
			rank: "X",
			assignedTo: null,
		};
		expect(getSuitColorClass(unknown, false, "two")).toBe("text-gray-700");
		expect(getSuitColorClass(unknown, true, "two")).toBe("text-gray-200");
	});

	// ---- 4色デッキ ----
	describe("four-color deck", () => {
		test("♠ spade", () => {
			expect(getSuitColorClass(makeCard("s"), false, "four")).toBe("text-black");
			expect(getSuitColorClass(makeCard("s"), true, "four")).toBe("text-white");
		});

		test("♥ heart", () => {
			expect(getSuitColorClass(makeCard("h"), false, "four")).toBe("text-red-600");
			expect(getSuitColorClass(makeCard("h"), true, "four")).toBe("text-red-400");
		});

		test("♦ diamond", () => {
			expect(getSuitColorClass(makeCard("d"), false, "four")).toBe("text-blue-500");
			expect(getSuitColorClass(makeCard("d"), true, "four")).toBe("text-blue-500");
		});

		test("♣ club", () => {
			expect(getSuitColorClass(makeCard("c"), false, "four")).toBe("text-green-500");
			expect(getSuitColorClass(makeCard("c"), true, "four")).toBe("text-green-500");
		});
	});

	// ---- 2色デッキ ----
	describe("two-color deck", () => {
		test("red suits", () => {
			expect(getSuitColorClass(makeCard("h"), false, "two")).toBe("text-red-600");
			expect(getSuitColorClass(makeCard("d"), false, "two")).toBe("text-red-600");
			expect(getSuitColorClass(makeCard("h"), true, "two")).toBe("text-red-400");
			expect(getSuitColorClass(makeCard("d"), true, "two")).toBe("text-red-400");
		});

		test("black suits", () => {
			expect(getSuitColorClass(makeCard("s"), false, "two")).toBe("text-black");
			expect(getSuitColorClass(makeCard("c"), false, "two")).toBe("text-black");
			expect(getSuitColorClass(makeCard("s"), true, "two")).toBe("text-white");
			expect(getSuitColorClass(makeCard("c"), true, "two")).toBe("text-white");
		});
	});
});

describe("getStyleByCardTheme", () => {
	test("light theme", () => {
		const res = getStyleByCardTheme("light");
		expect(res.normal).toBe("bg-gray-200 border-gray-300 text-gray-800");
		expect(res.selected).toBe("bg-white border-blue-500 ring-2 ring-blue-400");
	});

	test("dark theme", () => {
		const res = getStyleByCardTheme("dark");
		expect(res.normal).toBe("bg-[#2b2b2b] border-gray-600 text-gray-200");
		expect(res.selected).toBe("bg-white text-black border-black ring-2 ring-blue-400");
	});
});
