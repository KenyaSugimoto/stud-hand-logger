import { describe, expect, test } from "vitest";
import type { TableState } from "../hooks/useTableStore";
import { assignCard, generateDeck, newUnknown, takenRealIds, unassignCard } from "./deck"; // ← パスは調整

//
// ---- テスト用の最小 TableState を作るヘルパー ----
//
const makeState = (): TableState => {
	const deck = generateDeck();
	return {
		seats: {
			P1: Array(7).fill(null),
			P2: Array(7).fill(null),
			P3: Array(7).fill(null),
		},
		cardsById: deck,
		currentSlot: null,
		playersCount: 3,
		actions: { "3rd": [], "4th": [], "5th": [], "6th": [], "7th": [] },
		alive: { P1: true, P2: true, P3: true },
		bringInCandidate: null,
		bringInPlayer: null,
		currentStreet: "3rd",
	};
};

describe("generateDeck", () => {
	test("52 枚のデッキが生成される", () => {
		const deck = generateDeck();
		expect(Object.keys(deck).length).toBe(52);
	});

	test("全カードが real & assignedTo=null", () => {
		const deck = generateDeck();
		for (const c of Object.values(deck)) {
			expect(c.kind).toBe("real");
			expect(c.assignedTo).toBeNull();
		}
	});

	test("全スート・ランクの組み合わせが存在する", () => {
		const deck = generateDeck();
		expect(deck["As"]).toBeDefined();
		expect(deck["Kh"]).toBeDefined();
		expect(deck["2c"]).toBeDefined();
		expect(deck["Td"]).toBeDefined();
	});
});

describe("newUnknown", () => {
	test("unknown カードが生成される", () => {
		const u = newUnknown();
		expect(u.kind).toBe("unknown");
		expect(u.rank).toBe("X");
		expect(u.suit).toBeNull();
		expect(u.id).toMatch(/^X-/);
	});

	test("毎回 ID が異なる", () => {
		const a = newUnknown().id;
		const b = newUnknown().id;
		expect(a).not.toBe(b);
	});
});

describe("assignCard", () => {
	test("カードが指定スロットに割り当てられる", () => {
		let state = makeState();
		state = assignCard(state, "As", { playerId: "P1", slotIndex: 0 });

		expect(state.seats.P1[0]).toBe("As");
		expect(state.cardsById["As"].assignedTo).toEqual({ playerId: "P1", slotIndex: 0 });
	});

	test("元の state を破壊しない（deep clone）", () => {
		const state = makeState();
		const cloned = assignCard(state, "Ks", { playerId: "P2", slotIndex: 1 });

		expect(state).not.toBe(cloned);
		expect(state.seats.P2).not.toBe(cloned.seats.P2);
	});
});

describe("unassignCard", () => {
	test("assignedTo が null になる ＆ seats から消える", () => {
		let state = makeState();

		// まず割り当てる
		state = assignCard(state, "Qs", { playerId: "P3", slotIndex: 2 });

		// 次に解除
		state = unassignCard(state, "Qs");

		expect(state.seats.P3[2]).toBeNull();
		expect(state.cardsById["Qs"].assignedTo).toBeNull();
	});

	test("割り当てられていないカードなら state を変更しない", () => {
		const state = makeState();
		const result = unassignCard(state, "Ah"); // まだ assignedTo=null のカード
		expect(result).toBe(state); // 参照が変わらない
	});
});

describe("takenRealIds", () => {
	test("使用済み real カードだけを取得する", () => {
		let state = makeState();

		state = assignCard(state, "As", { playerId: "P1", slotIndex: 0 });
		state = assignCard(state, "Kh", { playerId: "P2", slotIndex: 1 });

		const taken = takenRealIds(state);

		expect(taken.has("As")).toBe(true);
		expect(taken.has("Kh")).toBe(true);

		// 未使用カード
		expect(taken.has("2c")).toBe(false);
	});

	test("unknown カードは含まれない", () => {
		let state = makeState();
		const unknown = newUnknown();
		state.cardsById[unknown.id] = unknown;

		state = assignCard(state, unknown.id, { playerId: "P1", slotIndex: 3 });

		const taken = takenRealIds(state);

		expect(taken.has(unknown.id)).toBe(false); // real only
	});
});
