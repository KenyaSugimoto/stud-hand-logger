import { RANK_RAZZ, RANK_STUD_HI, SUIT_RANK_RAZZ, SUIT_RANK_STUD_HI } from "../consts";
import { type Action, type ActionType, type Card, type CardId, type PlayerId, type Seat, StudGameType } from "../types";

export const getBringInCandidate = (
	gameType: StudGameType,
	playerIds: PlayerId[],
	seats: Record<`P${number}`, Seat>,
	cardsById: Record<CardId, Card>,
): PlayerId | null => {
	let target: { playerId: PlayerId; score: number } | null = null;
	const rankOrder = gameType === StudGameType.Razz ? RANK_RAZZ : RANK_STUD_HI;
	const suitRank = gameType === StudGameType.Razz ? SUIT_RANK_RAZZ : SUIT_RANK_STUD_HI;

	for (const pid of playerIds) {
		// 各プレイヤーの3rdカードを取得
		const cardId = seats[pid][2];
		if (!cardId) continue;

		const card = cardsById[cardId];
		// もし未知のカード(X)ならスキップ
		if (!card || card.rank === "X") continue;

		const rankIndex: number = rankOrder.indexOf(card.rank);
		const suitIndex: number = suitRank[card.suit];

		const score: number = rankIndex * 10 + suitIndex;

		// scoreが最も大きいものを bring-in 候補とする
		const isBetter = target === null || score > target.score;
		if (isBetter) {
			target = { playerId: pid, score };
		}
	}

	// 見つからなければnullを返す
	return target?.playerId ?? null;
};

const BET_ACTIONS: ActionType[] = ["bri", "comp", "b", "r"];
const TERMINAL_ACTIONS_VS_BET: ActionType[] = ["c", "f"];

export const shouldEndStreet = (streetActions: Action[], alivePlayers: PlayerId[]): boolean => {
	if (streetActions.length === 0) return false;

	// 最後の「ベット系」アクションのインデックスを探す
	let lastBetIndex = -1;
	for (let i = streetActions.length - 1; i >= 0; i -= 1) {
		if (BET_ACTIONS.includes(streetActions[i].type)) {
			lastBetIndex = i;
			break;
		}
	}

	// ベットが一度も出てこないケース（全員チェック など）
	if (lastBetIndex === -1) {
		// alive な全員が一度はアクションしたら OK
		const actedSet = new Set(streetActions.map((a) => a.playerId));
		return alivePlayers.every((pid) => actedSet.has(pid));
	}

	// ここから「ベット or レイズ or complete / bri がある」ケース

	const lastAggressor = streetActions[lastBetIndex].playerId;

	// 最後のベット以降のアクションを見て、
	// 「アグレッサー以外の alive プレイヤーが、c か f で完了しているか」
	const afterBet = streetActions.slice(lastBetIndex + 1);

	for (const pid of alivePlayers) {
		if (pid === lastAggressor) continue; // アグレッサー本人は対象外

		const actionsOfPlayer = afterBet.filter((a) => a.playerId === pid);
		if (actionsOfPlayer.length === 0) {
			// まだこの額に対するアクションをしていない
			return false;
		}

		const lastAction = actionsOfPlayer[actionsOfPlayer.length - 1];
		if (!TERMINAL_ACTIONS_VS_BET.includes(lastAction.type)) {
			// c か f になっていない（まだアクション継続中）
			return false;
		}
	}

	// 全ての alive プレイヤーが最後のベットに対して c か f 済み
	return true;
};
