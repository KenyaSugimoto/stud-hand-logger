import { NEXT_STREET_MAP, STREET_TO_VISIBLE_CARD_COUNT } from "../consts";
import type { TableState } from "../hooks/useTableStore";
import type { Action, ActionType, PlayerId, Slot, SlotIndex, Street, Suit } from "../types";

// ストリート終了を判定する関数
export const shouldEndStreet = (streetActions: Action[], alivePlayers: PlayerId[]): boolean => {
	// ベット系アクションの定義
	const BET_ACTIONS: ActionType[] = ["bri", "comp", "b", "r"];
	const TERMINAL_ACTIONS_VS_BET: ActionType[] = ["c", "f"];

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

// スート記号を返す関数
export const suitGlyph = (s: Suit) => ({ h: "♥", d: "♦", c: "♣", s: "♠" })[s];

// TODO: ↓ ここより下の関数 単体テスト未実装

// 特定ストリートで最初の空スロットを返す共通関数
export const findEmptySlotForStreet = (state: TableState, street: Street): Slot | null => {
	const { seats, playersCount, alive } = state;

	const visibleCount = STREET_TO_VISIBLE_CARD_COUNT[street];

	for (let i = 0; i < playersCount; i++) {
		const pid = `P${i + 1}` as PlayerId;

		if (!alive[pid]) continue; // fold したプレイヤーは対象外

		const seat = seats[pid];

		for (let slotIndex = 0; slotIndex < visibleCount; slotIndex++) {
			if (seat[slotIndex] === null) {
				return { playerId: pid, slotIndex: slotIndex as SlotIndex };
			}
		}
	}

	return null;
};

// 次に設定するCurrentSlotを取得する関数
export const getNextCurrentSlot = (state: TableState): Slot | null => {
	const { currentStreet } = state;

	// 1. 現ストリートで探す
	const found = findEmptySlotForStreet(state, currentStreet);
	if (found) return found;

	// 2. 次ストリートで探す
	const nextStreet = NEXT_STREET_MAP[currentStreet];
	if (nextStreet) {
		return findEmptySlotForStreet(state, nextStreet);
	}

	// 3. 次のストリートが無ければ null を返す
	return null;
};

export const updateCurrentSlot = (newState: TableState, setCurrentSlot: (slot: Slot | null) => void) => {
	const nextSlot = getNextCurrentSlot(newState);

	setCurrentSlot(nextSlot);
};
