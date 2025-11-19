import { describe, expect, test } from "vitest";
import type { TableState } from "../../hooks/useTableStore";
import {
	type Action,
	type ActionType,
	type Card,
	type CardId,
	type PlayerId,
	type Seat,
	type SlotIndex,
	StudGameType,
} from "../../types";
import { generateDeck } from "../deck";
import {
	getBringInCandidate,
	getCurrentActor,
	getFirstActor,
	getFirstActorForStreet,
	getThirdStreetUpCard,
	isAliveAtStartStreet,
} from "../getFirstActor";

// ---------------------------------------------------------
// テスト用の共通ヘルパー
// ---------------------------------------------------------

const makeBaseState = (): TableState => ({
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

// プレイヤーにカードを割り当てる（座席のみ。assignedTo は使われていないので省略でもOK）
const give = (state: TableState, pid: PlayerId, slotIndex: SlotIndex, cardId: CardId) => {
	state.seats[pid][slotIndex] = cardId;
};

// ---------------------------------------------------------
// getThirdStreetUpCard
// ---------------------------------------------------------

describe("getThirdStreetUpCard", () => {
	test("3rd の up カード(スロット2) が real のとき、そのカードを返す", () => {
		const deck = generateDeck();
		const seat: Seat = Array(7).fill(null);
		seat[2] = "As"; // SLOT_TO_GROUP=up & SLOT_TO_STREET=3rd

		const card = getThirdStreetUpCard(seat, deck);
		expect(card).not.toBeNull();
		expect(card?.id).toBe("As");
	});

	test("3rd の up カードが unknown の場合は null を返す", () => {
		const seat: Seat = Array(7).fill(null);
		seat[2] = "X-test";

		const deck = generateDeck();
		const cardsById = {
			...deck,
			"X-test": {
				id: "X-test",
				kind: "unknown",
				rank: "X",
				suit: null,
				assignedTo: null,
			},
		};

		const card = getThirdStreetUpCard(seat, cardsById as Record<CardId, Card>);
		expect(card).toBeNull();
	});

	test("3rd の up カードがセットされていない場合は null を返す", () => {
		const deck = generateDeck();
		const seat: Seat = Array(7).fill(null);
		// seat[2] は null のまま

		const card = getThirdStreetUpCard(seat, deck);
		expect(card).toBeNull();
	});
});

// ---------------------------------------------------------
// getBringInCandidate
// ---------------------------------------------------------

describe("getBringInCandidate (Stud Hi / Stud8)", () => {
	test("StudHi: 一番弱い up カード(ランクが低い)のプレイヤーが bring-in 候補になる", () => {
		const state = makeBaseState();

		// P1: As, P2: 2s, P3/P4: 何もなし
		give(state, "P1", 2, "As");
		give(state, "P2", 2, "2s");

		const pid = getBringInCandidate(StudGameType.StudHi, state);
		expect(pid).toBe("P2"); // 2s が最弱 → bring-in
	});

	test("Stud8: ロジックは StudHi と同じ（最弱 up カード）", () => {
		const state = makeBaseState();

		give(state, "P1", 2, "Kc");
		give(state, "P2", 2, "3d");

		const pid = getBringInCandidate(StudGameType.Stud8, state);
		expect(pid).toBe("P2"); // 3d の方が弱い想定
	});

	test("alive=false のプレイヤーは対象外になる", () => {
		const state = makeBaseState();

		give(state, "P1", 2, "As");
		give(state, "P2", 2, "2s");

		state.alive.P2 = false;

		const pid = getBringInCandidate(StudGameType.StudHi, state);
		expect(pid).toBe("P1");
	});
});

describe("getBringInCandidate (Razz)", () => {
	test("Razz: 一番弱い up カード(ランクが高い)のプレイヤーが bring-in 候補になる", () => {
		const state = makeBaseState();

		// Razz: K は A より弱い（＝bring-in に近い）
		give(state, "P1", 2, "As"); // 良いカード
		give(state, "P2", 2, "Kc"); // 悪いカード → bring-in

		const pid = getBringInCandidate(StudGameType.Razz, state);
		expect(pid).toBe("P2");
	});
});

// ---------------------------------------------------------
// isAliveAtStartStreet
// ---------------------------------------------------------

describe("isAliveAtStartStreet", () => {
	test("3rd ストリート開始時は常に true", () => {
		const state = makeBaseState();

		state.actions["3rd"].push({ playerId: "P1", type: "f" } as Action);

		expect(isAliveAtStartStreet(state, "P1", "3rd")).toBe(true);
	});

	test("3rd で fold したプレイヤーは 4th 以降は false になる", () => {
		const state = makeBaseState();

		state.actions["3rd"].push({ playerId: "P1", type: "f" } as Action);

		expect(isAliveAtStartStreet(state, "P1", "4th")).toBe(false);
		expect(isAliveAtStartStreet(state, "P1", "5th")).toBe(false);
	});

	test("4th で fold したプレイヤーは 5th 以降は false になる", () => {
		const state = makeBaseState();

		state.actions["4th"].push({ playerId: "P2", type: "f" } as Action);

		expect(isAliveAtStartStreet(state, "P2", "4th")).toBe(true);
		expect(isAliveAtStartStreet(state, "P2", "5th")).toBe(false);
	});
});

// ---------------------------------------------------------
// getFirstActorForStreet
// ---------------------------------------------------------

describe("getFirstActorForStreet", () => {
	test("StudHi: 4th 以降は最も強い board を持つプレイヤーが first actor になる", () => {
		const state = makeBaseState();

		// P1: As (強い), P2: Kc (やや弱い)
		give(state, "P1", 2, "As"); // 3rd up
		give(state, "P2", 2, "Kc");

		const pid = getFirstActorForStreet(state, StudGameType.StudHi, "4th");
		expect(pid).toBe("P1");
	});

	test("Razz: 4th 以降は最も良いロー(board)のプレイヤーが first actor になる", () => {
		const state = makeBaseState();

		// Razz: A が最も良い / K が悪い
		give(state, "P1", 2, "As"); // 良い(=強いスコア)
		give(state, "P2", 2, "Kc"); // 悪い

		const pid = getFirstActorForStreet(state, StudGameType.Razz, "4th");
		expect(pid).toBe("P1");
	});

	test("fold 済みプレイヤーは除外される", () => {
		const state = makeBaseState();

		give(state, "P1", 2, "As");
		give(state, "P2", 2, "Kc");

		// P1 は 3rd で fold 済み
		state.actions["3rd"].push({ playerId: "P1", type: "f" } as Action);

		const pid = getFirstActorForStreet(state, StudGameType.StudHi, "4th");
		expect(pid).toBe("P2");
	});
});

// ---------------------------------------------------------
// getFirstActor
// ---------------------------------------------------------

describe("getFirstActor", () => {
	test("3rd ストリートは bringInPlayer をそのまま返す", () => {
		const state = makeBaseState();
		state.currentStreet = "3rd";
		state.bringInPlayer = "P3";

		const pid = getFirstActor(state, StudGameType.StudHi);
		expect(pid).toBe("P3");
	});

	test("3rd で bringInPlayer がいなければ null", () => {
		const state = makeBaseState();
		state.currentStreet = "3rd";
		state.bringInPlayer = null;

		const pid = getFirstActor(state, StudGameType.StudHi);
		expect(pid).toBeNull();
	});

	test("4th 以降: alive なプレイヤーの中で最強 board が first actor になる", () => {
		const state = makeBaseState();
		state.currentStreet = "4th";

		give(state, "P1", 2, "As");
		give(state, "P2", 2, "Kc");

		const pid = getFirstActor(state, StudGameType.StudHi);
		expect(pid).toBe("P1");
	});

	test("4th 以降: alive=false のプレイヤーは除外される", () => {
		const state = makeBaseState();
		state.currentStreet = "4th";

		give(state, "P1", 2, "As");
		give(state, "P2", 2, "Kc");

		state.alive.P1 = false;

		const pid = getFirstActor(state, StudGameType.StudHi);
		expect(pid).toBe("P2");
	});
});

const A = (p: PlayerId, t: ActionType): Action => ({ playerId: p, type: t });
// ---------------------------------------------------------
// 🎯 1) alivePlayers length = 0 の場合
// ---------------------------------------------------------
describe("getCurrentActor - alive player 0", () => {
	test("alivePlayers が 0 → null", () => {
		const state = makeBaseState();
		state.alive = { P1: false, P2: false, P3: false, P4: false };

		const result = getCurrentActor(state, StudGameType.StudHi);
		expect(result).toBeNull();
	});
});

// ---------------------------------------------------------
// 🎯 2) 3rd Street ロジック
// ---------------------------------------------------------
describe("getCurrentActor - 3rd street", () => {
	test("bring-in 未確定 → bringInCandidate を返す", () => {
		const state = makeBaseState();
		state.currentStreet = "3rd";
		state.bringInCandidate = "P2";

		const result = getCurrentActor(state, StudGameType.StudHi);
		expect(result).toBe("P2");
	});

	test("bring-in も候補も無い → null", () => {
		const state = makeBaseState();
		state.currentStreet = "3rd";

		expect(getCurrentActor(state, StudGameType.StudHi)).toBeNull();
	});

	test("bring-in 確定後 → 最後のアクターの次の alive", () => {
		const state = makeBaseState();
		state.currentStreet = "3rd";
		state.bringInPlayer = "P2";

		// P2 が bring-in → P3 fold
		state.actions["3rd"] = [A("P2", "bri"), A("P3", "f")];

		const result = getCurrentActor(state, StudGameType.StudHi);
		// alive = P1,P2,P3,P4 / lastActor = P3 → next = P4
		expect(result).toBe("P4");
	});

	test("ストリート終了なら null", () => {
		const state = makeBaseState();
		state.currentStreet = "3rd";
		state.actions["3rd"] = [A("P2", "bri"), A("P1", "c"), A("P3", "c")];

		expect(getCurrentActor(state, StudGameType.StudHi)).toBeNull();
	});
});

// ---------------------------------------------------------
// 🎯 3) 4th〜7th Street ロジック
// ---------------------------------------------------------
describe("getCurrentActor - 4th+ streets", () => {
	test("アクション無し → firstActor を返す", () => {
		const state = makeBaseState();
		state.currentStreet = "4th";

		// P1 が最強の upCard
		state.seats.P1[2] = "As";
		state.seats.P2[2] = "Kc";

		const result = getCurrentActor(state, StudGameType.StudHi);
		expect(result).toBe("P1");
	});

	test("最後のアクターの次の alive を返す", () => {
		const state = makeBaseState();
		state.currentStreet = "4th";
		state.seats.P1[2] = "As";
		state.seats.P2[2] = "Kd";

		state.actions["4th"] = [A("P1", "x")];

		expect(getCurrentActor(state, StudGameType.StudHi)).toBe("P2");
	});

	test("alive=false のプレイヤーはスキップされる", () => {
		const state = makeBaseState();
		state.currentStreet = "4th";

		state.seats.P1[2] = "As";
		state.seats.P2[2] = "Kd";

		// P2 死亡
		state.alive.P2 = false;

		state.actions["4th"] = [A("P1", "x")];

		// alive = P1,P3,P4 / last = P1 → next = P3
		expect(getCurrentActor(state, StudGameType.StudHi)).toBe("P3");
	});

	test("ストリート終了なら null", () => {
		const state = makeBaseState();
		state.currentStreet = "4th";

		state.seats.P1[2] = "As";
		state.seats.P2[2] = "Kd";
		state.seats.P3[2] = "9h";
		state.seats.P4[2] = "8d";

		// bet → 全員call → ストリート終了
		state.actions["4th"] = [A("P1", "b"), A("P2", "c"), A("P3", "c"), A("P4", "c")];

		expect(getCurrentActor(state, StudGameType.StudHi)).toBeNull();
	});
});
