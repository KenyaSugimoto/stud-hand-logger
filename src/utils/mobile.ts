// utils/canActMobile.ts

import type { TableState } from "../hooks/useTableStore";
import type { ActionType, PlayerId, Rank, Street } from "../types";
import { getThirdStreetUpCard } from "./getFirstActor";

export const canActMobile = (state: TableState, street: Street, playerId: PlayerId, action: ActionType): boolean => {
	const { actions, seats, cardsById } = state;

	const streetActions = actions[street];

	const is3rd = street === "3rd";

	const bringInPlayer = state.bringInPlayer;
	const bringInCandidate = state.bringInCandidate;

	// 候補のランクを取得（ランク比較用）
	let bringInRank: Rank | null = null;

	if (bringInCandidate) {
		const upCard = getThirdStreetUpCard(seats[bringInCandidate], cardsById);
		bringInRank = upCard?.rank ?? null;
	}

	const self3rdUpCard = getThirdStreetUpCard(seats[playerId], cardsById);

	const alive = state.alive[playerId];
	if (!alive) return false;

	// bet or raise が存在するか
	const hasBetOrRaise = streetActions.some((a) => a.type === "b" || a.type === "r" || a.type === "comp");

	// ---- fold ----
	if (action === "f") {
		if (bringInCandidate === playerId) return false;
		return true;
	}

	// ---- bring-in ----
	if (action === "bri") {
		if (!is3rd) return false;
		if (bringInPlayer === playerId) return false;

		// bring-in 候補なら可能
		if (bringInCandidate === playerId) return true;

		// bring-in 候補と同じランクのアップカードを持つ人
		if (bringInRank && self3rdUpCard && self3rdUpCard.rank === bringInRank) {
			return true;
		}

		// 誰もアクションしていない
		if (streetActions.length === 0) return true;

		return false;
	}

	// ---- complete ----
	if (action === "comp") {
		const hasComp = streetActions.some((a) => a.type === "comp");
		return is3rd && !hasComp && bringInPlayer !== playerId;
	}

	// ---- check ----
	if (action === "x") return !hasBetOrRaise;

	// ---- call ----
	if (action === "c") {
		const hasBringIn = streetActions.some((a) => a.type === "bri");
		return hasBetOrRaise || (is3rd && hasBringIn);
	}

	// ---- bet ----
	if (action === "b") {
		if (is3rd) return false;
		return !hasBetOrRaise;
	}

	// ---- raise ----
	if (action === "r") return hasBetOrRaise;

	return true;
};
