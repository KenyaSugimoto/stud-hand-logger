import { describe, expect, test } from "vitest";
import type { TableState } from "../../hooks/useTableStore";
import type { Action, CardId, SlotIndex } from "../../types";
import { generateDeck } from "../../utils/deck";
import { canActMobile } from "../mobile";

// ---------------------------
// テスト用共通 state
// ---------------------------
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

// 座席にカード配置
const give = (state: TableState, pid: "P1" | "P2" | "P3" | "P4", slot: SlotIndex, cardId: CardId) => {
	state.seats[pid][slot] = cardId;
};

describe("canActMobile", () => {
	// ----------------------------
	// fold
	// ----------------------------
	test("fold: bring-in 候補は fold できない", () => {
		const state = makeState();
		state.bringInCandidate = "P1";

		expect(canActMobile(state, "3rd", "P1", "f")).toBe(false);
	});

	test("fold: alive なら fold 可能", () => {
		const state = makeState();
		expect(canActMobile(state, "3rd", "P2", "f")).toBe(true);
	});

	// ----------------------------
	// bring-in
	// ----------------------------
	test("bri: 3rd 以外はできない", () => {
		const state = makeState();
		state.currentStreet = "4th";

		expect(canActMobile(state, "4th", "P1", "bri")).toBe(false);
	});

	test("bri: bringInPlayer 本人は実行不可", () => {
		const state = makeState();
		state.bringInPlayer = "P1";

		expect(canActMobile(state, "3rd", "P1", "bri")).toBe(false);
	});

	test("bri: bringInCandidate は可能", () => {
		const state = makeState();
		state.bringInCandidate = "P2";

		expect(canActMobile(state, "3rd", "P2", "bri")).toBe(true);
	});

	test("bri: 候補と同ランクの upCard なら可能", () => {
		const state = makeState();
		state.bringInCandidate = "P1";

		// P1: 2s, P3: 2h → 同ランクなので bring-in 可
		give(state, "P1", 2, "2s");
		give(state, "P3", 2, "2h");

		expect(canActMobile(state, "3rd", "P3", "bri")).toBe(true);
	});

	test("bri: 最初のアクション（誰も行動していない）なら bring-in 可", () => {
		const state = makeState();
		expect(canActMobile(state, "3rd", "P4", "bri")).toBe(true);
	});

	test("bri: それ以外は不可", () => {
		const state = makeState();
		state.actions["3rd"].push({ playerId: "P2", type: "x" });

		expect(canActMobile(state, "3rd", "P4", "bri")).toBe(false);
	});

	// ----------------------------
	// complete
	// ----------------------------
	test("comp: 3rd のみ可能", () => {
		const state = makeState();
		expect(canActMobile(state, "3rd", "P1", "comp")).toBe(true);
		expect(canActMobile(state, "4th", "P1", "comp")).toBe(false);
	});

	test("comp: すでに complete があるなら不可", () => {
		const state = makeState();
		state.actions["3rd"].push({ playerId: "P2", type: "comp" } as Action);

		expect(canActMobile(state, "3rd", "P1", "comp")).toBe(false);
	});

	test("comp: bringInPlayer 本人は不可", () => {
		const state = makeState();
		state.bringInPlayer = "P1";

		expect(canActMobile(state, "3rd", "P1", "comp")).toBe(false);
	});

	// ----------------------------
	// check
	// ----------------------------
	test("x: まだ bet / raise / comp が無ければ check 可能", () => {
		const state = makeState();
		expect(canActMobile(state, "4th", "P1", "x")).toBe(true);
	});

	test("x: bet or raise が既にある → check 不可", () => {
		const state = makeState();
		state.actions["4th"].push({ playerId: "P3", type: "b" } as Action);
		expect(canActMobile(state, "4th", "P1", "x")).toBe(false);
	});

	// ----------------------------
	// call
	// ----------------------------
	test("c: bet/raise があるなら call できる", () => {
		const state = makeState();
		state.actions["4th"].push({ playerId: "P1", type: "b" } as Action);
		expect(canActMobile(state, "4th", "P2", "c")).toBe(true);
	});

	test("c: 3rd で bring-in があるなら call 可能", () => {
		const state = makeState();
		state.actions["3rd"].push({ playerId: "P2", type: "bri" } as Action);

		expect(canActMobile(state, "3rd", "P3", "c")).toBe(true);
	});

	test("c: 3rd で bring-in も bet も無いなら call 不可", () => {
		const state = makeState();
		expect(canActMobile(state, "3rd", "P3", "c")).toBe(false);
	});

	// ----------------------------
	// bet
	// ----------------------------
	test("b: 3rd では bet 不可", () => {
		const state = makeState();
		expect(canActMobile(state, "3rd", "P1", "b")).toBe(false);
	});

	test("b: 4th 以降、bet/raise がまだ無ければ bet 可能", () => {
		const state = makeState();
		expect(canActMobile(state, "4th", "P1", "b")).toBe(true);
	});

	test("b: 4th 以降でも、bet/raise が既にあると bet 不可", () => {
		const state = makeState();
		state.actions["4th"].push({ playerId: "P2", type: "b" } as Action);
		expect(canActMobile(state, "4th", "P1", "b")).toBe(false);
	});

	// ----------------------------
	// raise
	// ----------------------------
	test("r: bet/raise が無いと raise 不可", () => {
		const state = makeState();
		expect(canActMobile(state, "4th", "P1", "r")).toBe(false);
	});

	test("r: bet/raise があると raise 可能", () => {
		const state = makeState();
		state.actions["4th"].push({ playerId: "P2", type: "b" } as Action);

		expect(canActMobile(state, "4th", "P1", "r")).toBe(true);
	});

	// ----------------------------
	// alive
	// ----------------------------
	test("alive=false プレイヤーは何もできない", () => {
		const state = makeState();
		state.alive.P1 = false;

		expect(canActMobile(state, "4th", "P1", "x")).toBe(false);
		expect(canActMobile(state, "4th", "P1", "c")).toBe(false);
		expect(canActMobile(state, "4th", "P1", "b")).toBe(false);
	});
});
