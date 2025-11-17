import { describe, expect, test } from "vitest";
import type { Action, ActionType, PlayerId } from "../types";
import { shouldEndStreet, suitGlyph } from "./utils";

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
