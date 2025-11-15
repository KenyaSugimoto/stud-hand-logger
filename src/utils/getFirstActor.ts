import { RANK_VALUE_HI, RANK_VALUE_RAZZ, STREETS, SUIT_VALUE, SUIT_VALUE_RAZZ } from "../consts";
import { getPlayers, type TableState } from "../hooks/useTableStore";
import {
	type Card,
	type CardId,
	type PlayerId,
	type Rank,
	type RealCard,
	type Seat,
	SLOT_TO_GROUP,
	SLOT_TO_STREET,
	type SlotIndex,
	type Street,
	StudGameType,
} from "../types";

// 役のカテゴリ(看板カードは4枚までなので、5枚役は存在しない)
type BoardCategory = 0 | 1 | 2 | 3 | 4; // high / 1pair / 2pair / trips / quads

interface BoardScore {
	category: BoardCategory;
	mainRanks: number[]; // ペア・トリップスのランクなどを強い順に並べる
	allKeys: number[]; // 最後のタイブレーク用
}

// 看板カードの強さをスコア化する関数 (Stud Hi, Stud8 用)
const getBoardScoreHi = (cards: RealCard[]): BoardScore => {
	// rank ごとの枚数を数える
	const countByRank: Partial<Record<Exclude<Rank, "X">, number>> = {};

	for (const c of cards) {
		countByRank[c.rank] = (countByRank[c.rank] ?? 0) + 1;
	}

	const entries = Object.entries(countByRank) as [Exclude<Rank, "X">, number][];

	// 枚数 → ランクの順にソート（枚数が多い / ランクが高いほど先頭）
	entries.sort((a, b) => {
		if (b[1] !== a[1]) return b[1] - a[1];
		return RANK_VALUE_HI[b[0]] - RANK_VALUE_HI[a[0]];
	});

	// 枚数の配列を取得
	const counts = entries.map(([, cnt]) => cnt);

	// カテゴリを判定
	let category: BoardCategory = 0;
	if (counts[0] === 4) category = 4;
	else if (counts[0] === 3) category = 3;
	else if (counts[0] === 2 && counts[1] === 2) category = 2;
	else if (counts[0] === 2) category = 1;
	// 0はハイカード

	const mainRanks = entries.map(([rank]) => RANK_VALUE_HI[rank]);

	const allKeys = [...cards].map((c) => RANK_VALUE_HI[c.rank] * 4 + SUIT_VALUE[c.suit]).sort((a, b) => b - a);

	return { category, mainRanks, allKeys };
};

// Razz 用: 低いランクほど gameValue が大きいように変換
// A(1) → 19, 2 → 18, ..., K(13) → 7 というイメージ
const toRazzGameValue = (rank: Exclude<Rank, "X">): number => {
	const v = RANK_VALUE_RAZZ[rank]; // 1〜13
	return 20 - v; // 19〜7
};

// 看板カードの強さをスコア化する関数 (Razz 用)
const getBoardScoreRazz = (cards: RealCard[]): BoardScore => {
	const countByRank: Partial<Record<Exclude<Rank, "X">, number>> = {};
	for (const c of cards) {
		countByRank[c.rank] = (countByRank[c.rank] ?? 0) + 1;
	}

	const entries = Object.entries(countByRank) as [Exclude<Rank, "X">, number][];

	const numPairs = entries.filter(([, cnt]) => cnt === 2).length;
	const hasTrips = entries.some(([, cnt]) => cnt === 3);
	const hasQuads = entries.some(([, cnt]) => cnt === 4);

	let category: BoardCategory;
	if (!hasTrips && !hasQuads && numPairs === 0) {
		category = 2; // ベスト: ノーペア
	} else if (!hasTrips && !hasQuads && numPairs === 1) {
		category = 1; // 次点: ワンペア
	} else {
		category = 0; // それ以外
	}

	let mainRanks: number[];

	if (category === 2) {
		// ノーペア: いわゆる Razz 的なロー比較
		// ランク値(1〜13)を昇順に並べ → 逆順にして「高いカードから」見ていく
		const uniqVals = entries.map(([r]) => RANK_VALUE_RAZZ[r]);
		uniqVals.sort((a, b) => a - b); // 小さい = 良い
		const reversed = uniqVals.slice().reverse(); // 一番「高いカード」が先頭

		mainRanks = reversed.map((v) => 20 - v); // 小さいランクほど大きい値に
	} else {
		// ペア / トリップス など: とりあえず count 多い順 + ローとして強い順
		entries.sort((a, b) => {
			if (b[1] !== a[1]) return b[1] - a[1]; // 枚数
			return toRazzGameValue(a[0]) - toRazzGameValue(b[0]);
		});
		mainRanks = entries.map(([rank]) => toRazzGameValue(rank));
	}

	const allKeys = cards
		.map((c) => {
			const gv = toRazzGameValue(c.rank);
			return gv * 4 + SUIT_VALUE_RAZZ[c.suit];
		})
		.sort((a, b) => b - a);

	return { category, mainRanks, allKeys };
};

const getBoardScoreByGame = (gameType: StudGameType, cards: RealCard[]): BoardScore => {
	switch (gameType) {
		case StudGameType.StudHi:
		case StudGameType.Stud8:
			return getBoardScoreHi(cards);
		case StudGameType.Razz:
			return getBoardScoreRazz(cards);
		default:
			// 型的には来ないはずだが fallback
			return getBoardScoreHi(cards);
	}
};

const compareBoardScore = (a: BoardScore, b: BoardScore): number => {
	// category が大きいほど強い
	if (a.category !== b.category) return a.category - b.category;

	// category が大きいほど強い
	const len = Math.max(a.mainRanks.length, b.mainRanks.length);
	for (let i = 0; i < len; i++) {
		const av = a.mainRanks[i] ?? 0;
		const bv = b.mainRanks[i] ?? 0;
		if (av !== bv) return av - bv;
	}

	// 最後に allKeys で比較
	const len2 = Math.max(a.allKeys.length, b.allKeys.length);
	for (let i = 0; i < len2; i++) {
		const av = a.allKeys[i] ?? 0;
		const bv = b.allKeys[i] ?? 0;
		if (av !== bv) return av - bv;
	}

	return 0;
};

// 指定ストリートまでの看板カードを取得する関数
const getUpCardsOnStreet = (
	playerId: PlayerId,
	street: Street,
	seats: Record<PlayerId, Seat>,
	cardsById: Record<CardId, Card>,
): RealCard[] => {
	const STREET_ORDER: Record<Street, number> = {
		"3rd": 0,
		"4th": 1,
		"5th": 2,
		"6th": 3,
		"7th": 4,
	};
	const seat = seats[playerId];
	const limit = STREET_ORDER[street];
	const result: RealCard[] = [];

	seat.forEach((cardId, idx) => {
		if (!cardId) return;

		const slotIndex = idx as SlotIndex;

		// 看板のみ
		if (SLOT_TO_GROUP[slotIndex] !== "up") return;

		// まだ配られていないストリートのカードは除外
		const cardStreet = SLOT_TO_STREET[slotIndex];
		if (STREET_ORDER[cardStreet] > limit) return;

		const card = cardsById[cardId];
		if (card.kind === "real") {
			result.push(card);
		}
	});

	return result;
};

export const getFirstActor = (state: TableState, gameType: StudGameType): PlayerId | null => {
	const { currentStreet, seats, cardsById, alive, playersCount } = state;

	// 3rdストリートはbring-inプレイヤーを返す (bring-in候補の判定は別関数で行う)
	if (currentStreet === "3rd") {
		return state.bringInPlayer || null;
	}

	const activePlayers = getPlayers(playersCount).filter((pid) => alive[pid]);

	let best: { pid: PlayerId; score: BoardScore } | null = null;

	for (const pid of activePlayers) {
		const upCards = getUpCardsOnStreet(pid, currentStreet, seats, cardsById);
		if (!upCards.length) continue;

		const score = getBoardScoreByGame(gameType, upCards);

		if (!best || compareBoardScore(score, best.score) > 0) {
			best = { pid, score };
		}
	}

	return best?.pid ?? null;
};

// 指定ストリート開始時点での生存判定関数
export const isAliveAtStartStreet = (state: TableState, pid: PlayerId, street: Street): boolean => {
	const { actions } = state;

	// 3rdストリートは全員アクティブ
	if (street === "3rd") {
		return true;
	}

	const idx = STREETS.indexOf(street);
	const relevant = STREETS.slice(0, idx); // 4th:1, ...

	for (const st of relevant) {
		if (actions[st].some((a) => a.playerId === pid && a.type === "f")) {
			return false;
		}
	}
	return true;
};

// 指定ストリート(4th以降)の firstActor を取得する関数
export const getFirstActorForStreet = (state: TableState, gameType: StudGameType, street: Street): PlayerId | null => {
	const { seats, cardsById, playersCount } = state;

	const activePlayers = getPlayers(playersCount).filter((pid) => isAliveAtStartStreet(state, pid, street));

	let best: { pid: PlayerId; score: BoardScore } | null = null;

	for (const pid of activePlayers) {
		const upCards = getUpCardsOnStreet(pid, street, seats, cardsById);
		if (!upCards.length) continue;

		const score = getBoardScoreByGame(gameType, upCards);

		if (!best || compareBoardScore(score, best.score) > 0) {
			best = { pid, score };
		}
	}

	return best?.pid ?? null;
};

export const getThirdStreetUpCard = (seat: Seat, cardsById: Record<CardId, Card>): RealCard | null => {
	for (let idx = 0; idx < seat.length; idx++) {
		const cardId = seat[idx];
		if (!cardId) continue;

		if (SLOT_TO_GROUP[idx as SlotIndex] !== "up") continue;
		if (SLOT_TO_STREET[idx as SlotIndex] !== "3rd") continue;

		const card = cardsById[cardId];
		if (card.kind === "real") {
			return card;
		}
	}
	return null;
};

// ---------------------------------------------------------
// bring-in 判定ロジック（大きいほどbring-inに近づくように score をつける）
// ---------------------------------------------------------

const getBringInScoreHi = (card: RealCard): number => {
	// 弱い = ランクが低い → スートが弱い
	// HI の「弱いカードほど score が大きい」にする
	const r = RANK_VALUE_HI[card.rank]; // 2〜14
	const s = SUIT_VALUE[card.suit]; // 0〜3
	return (14 - r) * 4 + (3 - s);
};

const getBringInScoreRazz = (card: RealCard): number => {
	// Razz: 高いカードが bring-in → ランクが高いほど弱い
	const r = RANK_VALUE_RAZZ[card.rank]; // 1〜13
	const s = SUIT_VALUE_RAZZ[card.suit]; // 0〜3
	// Razz 的に弱い (ランクが高い) ほど score が大きくなる
	return r * 4 + (3 - s);
};

const getBringInScore = (gameType: StudGameType, card: RealCard): number => {
	switch (gameType) {
		case StudGameType.StudHi:
		case StudGameType.Stud8:
			return getBringInScoreHi(card);
		case StudGameType.Razz:
			return getBringInScoreRazz(card);
		default:
			// 型的には来ないはずだが fallback
			return getBringInScoreHi(card);
	}
};

// ---------------------------------------------------------
// 🎯 getBringInCandidate 実装
// ---------------------------------------------------------

export const getBringInCandidate = (gameType: StudGameType, state: TableState): PlayerId | null => {
	const { seats, cardsById, alive, playersCount } = state;

	const activePlayers = getPlayers(playersCount).filter((pid) => alive[pid]);

	let worst: { pid: PlayerId; score: number } | null = null;

	for (const pid of activePlayers) {
		const upCard = getThirdStreetUpCard(seats[pid], cardsById);

		if (!upCard) continue;

		const score = getBringInScore(gameType, upCard);

		// score が大きい = 最弱 → bring-in
		if (!worst || score > worst.score) {
			worst = { pid, score };
		}
	}

	return worst?.pid ?? null;
};
