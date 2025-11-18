import { describe, expect, test, vi } from "vitest";
import type { TableState } from "../../hooks/useTableStore";
import type { Action, ActionType, PlayerId } from "../../types";
import { generateDeck } from "../deck";
import { findEmptySlotForStreet, getNextCurrentSlot, shouldEndStreet, suitGlyph, updateCurrentSlot } from "../utils";

const A = (playerId: PlayerId, type: ActionType): Action => ({ playerId, type });

describe("shouldEndStreet", () => {
	//
	// ---- 1. アクションが無い ----
	//
	test("no actions → false", () => {
		expect(shouldEndStreet([], ["P1", "P2", "P3"])).toBe(false);
	});

	//
	// ---- 2. 全員チェック（ノーベット） ----
	//
	test("no bet actions & alive 全員アクション済み → true", () => {
		const actions = [A("P1", "x"), A("P2", "x"), A("P3", "x")];
		expect(shouldEndStreet(actions, ["P1", "P2", "P3"])).toBe(true);
	});

	test("no bet actions but 未行動者あり → false", () => {
		const actions = [A("P1", "x"), A("P3", "x")]; // P2 が未行動
		expect(shouldEndStreet(actions, ["P1", "P2", "P3"])).toBe(false);
	});

	//
	// ---- 3. ベットあり → 全員が c/f 済みで終了 ----
	//
	test("bet → 全員が c/f 済み → true", () => {
		const actions = [
			A("P1", "b"), // aggressor
			A("P2", "c"),
			A("P3", "f"),
		];
		expect(shouldEndStreet(actions, ["P1", "P2", "P3"])).toBe(true);
	});

	test("bet → 1人がまだアクションしていない → false", () => {
		const actions = [
			A("P1", "b"),
			A("P2", "c"),
			// P3 が未行動
		];
		expect(shouldEndStreet(actions, ["P1", "P2", "P3"])).toBe(false);
	});

	test("bet → 1人の最後のアクションが c/f ではない → false", () => {
		const actions = [
			A("P1", "b"),
			A("P2", "c"),
			A("P3", "x"), // x は TERMINAL_ACTION ではない → 継続中
		];
		expect(shouldEndStreet(actions, ["P1", "P2", "P3"])).toBe(false);
	});

	//
	// ---- 4. 途中で再レイズ発生 → 新しい aggressor が必要 ----
	//
	test("raise 発生 → その後に全員が c/f すれば終了", () => {
		// P1: bet → P2: raise → P3: fold → P1: call
		const actions = [
			A("P1", "b"), // bet
			A("P2", "r"), // raise (new aggressor = P2)
			A("P3", "f"),
			A("P1", "c"), // 対レイズの call
		];

		expect(shouldEndStreet(actions, ["P1", "P2", "P3"])).toBe(true);
	});

	test("raise → まだ対応してないプレイヤーがいる → false", () => {
		// P1 bet → P2 raise → P3 fold → P1 未行動
		const actions = [
			A("P1", "b"),
			A("P2", "r"),
			A("P3", "f"),
			// P1 の対レイズアクションが無い
		];

		expect(shouldEndStreet(actions, ["P1", "P2", "P3"])).toBe(false);
	});

	//
	// ---- 5. bring-in/complete が aggressor として扱われる ----
	//
	test("bring-in → 全員が c/f → true", () => {
		const actions = [A("P2", "bri"), A("P1", "c"), A("P3", "f")];

		expect(shouldEndStreet(actions, ["P1", "P2", "P3"])).toBe(true);
	});

	test("complete → 未行動者あり → false", () => {
		const actions = [
			A("P3", "comp"),
			// P1, P2 がまだ応答していない
		];

		expect(shouldEndStreet(actions, ["P1", "P2", "P3"])).toBe(false);
	});

	//
	// ---- 6. alivePlayers の方が少ない（fold者が出ている）ケース ----
	//
	test("alivePlayers が 2名 → 未行動の生存者がいれば false", () => {
		const actions = [
			A("P1", "b"),
			A("P3", "c"),
			// alive は P1, P3 のみ
		];

		expect(shouldEndStreet(actions, ["P1", "P3"])).toBe(true);
	});

	test("alivePlayers 2名 → 一方が未行動 → false", () => {
		const actions = [
			A("P1", "b"),
			// P3 が未行動
		];

		expect(shouldEndStreet(actions, ["P1", "P3"])).toBe(false);
	});
});

//
// ---- suitGlyph ----
//
describe("suitGlyph", () => {
	test("returns correct glyph", () => {
		expect(suitGlyph("s")).toBe("♠");
		expect(suitGlyph("h")).toBe("♥");
		expect(suitGlyph("d")).toBe("♦");
		expect(suitGlyph("c")).toBe("♣");
	});
});

// ---------------------------------------------------------
// 📌 共通の初期 TableState
// ---------------------------------------------------------
const makeState = (): TableState => ({
	seats: {
		P1: Array(7).fill(null),
		P2: Array(7).fill(null),
		P3: Array(7).fill(null),
		P4: Array(7).fill(null),
	},
	cardsById: generateDeck(),
	currentStreet: "3rd",
	playersCount: 4,
	alive: { P1: true, P2: true, P3: true, P4: true },
	actions: {
		"3rd": [],
		"4th": [],
		"5th": [],
		"6th": [],
		"7th": [],
	},
	currentSlot: null,
	bringInPlayer: null,
	bringInCandidate: null,
});

// ----------------------------------------------
// ✨ findEmptySlotForStreet
// ----------------------------------------------
describe("findEmptySlotForStreet", () => {
	test("最初の空 slot を返す（3rd）", () => {
		const state = makeState();
		// 全員 slot0 は空 → P1 slot0 を返す
		const res = findEmptySlotForStreet(state, "3rd");

		expect(res).toEqual({ playerId: "P1", slotIndex: 0 });
	});

	test("P1 の 3rd が埋まっている場合 → 次の P1 の空 slot を返す", () => {
		const state = makeState();
		state.seats.P1[0] = "As";

		const res = findEmptySlotForStreet(state, "3rd");
		expect(res).toEqual({ playerId: "P1", slotIndex: 1 });
	});

	test("P1 の 3rd すべて埋まっている → P2 slot0 を返す", () => {
		const state = makeState();
		state.seats.P1[0] = "As";
		state.seats.P1[1] = "Ks";
		state.seats.P1[2] = "Qs";

		const res = findEmptySlotForStreet(state, "3rd");
		expect(res).toEqual({ playerId: "P2", slotIndex: 0 });
	});

	test("alive=false のプレイヤーはスキップされる", () => {
		const state = makeState();
		state.alive.P1 = false;

		const res = findEmptySlotForStreet(state, "3rd");
		expect(res).toEqual({ playerId: "P2", slotIndex: 0 });
	});

	test("誰も空 slot が無い場合 → null", () => {
		const state = makeState();
		// 3rd の visibleCount=3 を全部埋める
		for (const pid of ["P1", "P2", "P3", "P4"] as PlayerId[]) {
			state.seats[pid][0] = "As";
			state.seats[pid][1] = "Ks";
			state.seats[pid][2] = "Qs";
		}

		const res = findEmptySlotForStreet(state, "3rd");
		expect(res).toBeNull();
	});
});

// ----------------------------------------------
// ✨ getNextCurrentSlot
// ----------------------------------------------
describe("getNextCurrentSlot", () => {
	test("現ストリートで空 slot があればそれを返す", () => {
		const state = makeState();
		state.currentStreet = "3rd";

		const res = getNextCurrentSlot(state);
		expect(res).toEqual({ playerId: "P1", slotIndex: 0 });
	});

	test("現ストリートが埋まっている → 次ストリートの slot を返す", () => {
		const state = makeState();
		state.currentStreet = "3rd";

		// 3rd を全員埋める
		for (const pid of ["P1", "P2", "P3", "P4"] as PlayerId[]) {
			state.seats[pid][0] = "As";
			state.seats[pid][1] = "Ks";
			state.seats[pid][2] = "Qs";
		}

		const res = getNextCurrentSlot(state);
		// 次は 4th: slotIndex=3
		expect(res).toEqual({ playerId: "P1", slotIndex: 3 });
	});

	test("全ストリートが埋まっている → null", () => {
		const state = makeState();

		for (let s = 0; s < 7; s++) {
			for (const pid of ["P1", "P2", "P3", "P4"] as PlayerId[]) {
				state.seats[pid][s] = "As"; // 適当に埋める
			}
		}

		const res = getNextCurrentSlot(state);
		expect(res).toBeNull();
	});
});

// ----------------------------------------------
// ✨ updateCurrentSlot
// ----------------------------------------------
describe("updateCurrentSlot", () => {
	test("setCurrentSlot に nextSlot を渡す", () => {
		const state = makeState();

		const mockFn = vi.fn();

		updateCurrentSlot(state, mockFn);

		expect(mockFn).toHaveBeenCalledWith({ playerId: "P1", slotIndex: 0 });
	});

	test("全て埋まっている場合 → setCurrentSlot(null)", () => {
		const state = makeState();

		for (let i = 0; i < 7; i++) {
			state.seats.P1[i] = "As";
			state.seats.P2[i] = "As";
			state.seats.P3[i] = "As";
			state.seats.P4[i] = "As";
		}

		const mockFn = vi.fn();

		updateCurrentSlot(state, mockFn);

		expect(mockFn).toHaveBeenCalledWith(null);
	});
});
