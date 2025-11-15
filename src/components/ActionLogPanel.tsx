import { useMemo } from "react";
import { GAME_TYPE_LABELS, STREETS } from "../consts";
import { getPlayers, useTableStore } from "../hooks/useTableStore";
import type { Action, Card, CardId, PlayerId, Seat, Street } from "../types";
import { getFirstActorForStreet } from "../utils/getFirstActor";
import { suitGlyph } from "../utils/utils";

/* 🂠 カード → テキスト変換 */
function cardToStr(card: Card | null): string {
	if (!card) return "";
	if (card.kind === "unknown") return "Xx";

	const glyph = suitGlyph(card.suit);
	return `${card.rank}${glyph}`;
}

/** 指定ストリート開始時より前に fold していないかチェック */
const makeIsAliveAtStartStreet = (actions: Record<Street, Action[]>) => {
	return (pid: PlayerId, street: Street): boolean => {
		if (street === "3rd") return true; // 3rd(開始時)は必ず生存

		const idx = STREETS.indexOf(street);
		const relevant = STREETS.slice(0, idx); // 4th:1, ...

		for (const st of relevant) {
			if (actions[st].some((a) => a.playerId === pid && a.type === "f")) {
				return false;
			}
		}
		return true;
	};
};

/** プレイヤーのストリート時点のカードを表示用文字列にする */
const buildPlayerCards = (
	seats: Record<PlayerId, Seat>,
	cardsById: Record<CardId, Card>,
	pid: PlayerId,
	street: Street,
): string => {
	const seat = seats[pid];

	// slotIndex → 0〜6 のカードデータ取得
	const get = (i: number) => {
		const id = seat[i];
		return id ? cardToStr(cardsById[id]) : "Xx";
	};

	// --- street ごとの表示 ---
	if (street === "3rd") {
		// down2 / up1
		return `${get(0)}${get(1)}/${get(2)}`;
	}

	if (street === "4th") {
		// down2 / up2
		return `${get(0)}${get(1)}/${get(2)}${get(3)}`;
	}

	if (street === "5th") {
		// down2 / up3
		return `${get(0)}${get(1)}/${get(2)}${get(3)}${get(4)}`;
	}

	if (street === "6th") {
		// down2 / up4
		return `${get(0)}${get(1)}/${get(2)}${get(3)}${get(4)}${get(5)}`;
	}

	// --- ★ 7th street: down2 / up4 / down1 ---
	// 7th の最後のカード(get(6))は伏せ札なので、別スラッシュ区切り
	if (street === "7th") {
		return `${get(0)}${get(1)}/${get(2)}${get(3)}${get(4)}${get(5)}/${get(6)}`;
	}

	return "";
};

export const ActionLogPanel = () => {
	const { games, gameType } = useTableStore();
	const state = games[gameType];

	const { seats, cardsById, actions, playersCount, bringInPlayer, bringInCandidate } = state;

	const players: PlayerId[] = useMemo(() => getPlayers(playersCount), [playersCount]);

	const isAliveAtStreet = makeIsAliveAtStartStreet(actions);

	/** ★ 4th 以降の first-to-act を計算 */
	const firstActorPerStreet: Record<Street, PlayerId | null> = {
		"3rd": null,
		"4th": null,
		"5th": null,
		"6th": null,
		"7th": null,
	};

	for (const st of ["4th", "5th", "6th", "7th"] as Street[]) {
		firstActorPerStreet[st] = getFirstActorForStreet(state, gameType, st);
	}

	/** メイン：ストリートごとのログ生成 */
	const buildStreetLog = (street: Street): string | null => {
		const streetActions = actions[street];
		if (!streetActions.length) return null;

		const lines: string[] = [`${GAME_TYPE_LABELS[gameType]}`];
		lines.push(`< ${street} >`);

		// この street 時点で alive のプレイヤーだけを出す
		const alivePlayers = players.filter((pid) => isAliveAtStreet(pid, street));

		for (const pid of alivePlayers) {
			const cards = buildPlayerCards(seats, cardsById, pid, street);
			const acts = streetActions
				.filter((a) => a.playerId === pid)
				.map((a) => a.type)
				.join("/");

			let firstIcon = " "; // デフォルト空白

			if (street === "3rd") {
				if (pid === bringInPlayer)
					firstIcon = "↓"; // 確定 bring-in（オレンジ扱い）
				else if (pid === bringInCandidate) firstIcon = "↓"; // 候補（青）
			} else {
				const first = firstActorPerStreet[street];
				if (first === pid) firstIcon = "↓";
			}

			lines.push(`P${pid.slice(1)}: ${firstIcon} ${cards}  ${acts}`);
		}

		return lines.join("\n");
	};

	/** 全ストリート分をまとめる */
	const fullText = STREETS.map((st) => buildStreetLog(st))
		.filter(Boolean)
		.join("\n\n");

	/** クリップボードコピー */
	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(fullText);
			alert("Copied!");
		} catch {
			alert("Copy failed");
		}
	};

	return (
		<div className="border rounded-lg p-4 bg-gray-50">
			<div className="flex justify-between items-center mb-2">
				<h3 className="font-semibold text-gray-700">Action Log</h3>

				<button
					type="button"
					onClick={onCopy}
					className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
				>
					Copy
				</button>
			</div>

			<pre className="text-sm whitespace-pre-wrap leading-6">{fullText}</pre>
		</div>
	);
};
