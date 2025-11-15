import { ACTIONS_3RD, ACTIONS_LATER } from "../consts";
import { useTableStore } from "../hooks/useTableStore";
import type { ActionType, Card, CardId, PlayerId, Rank } from "../types";
import { getThirdStreetUpCard } from "../utils/getFirstActor";
import { CardMini } from "./CardMini";

type Props = {
	playerId: PlayerId;
	seatIds: (CardId | null)[];
	cardsById: Record<CardId, Card>;
	onAction: (playerId: PlayerId, type: ActionType) => void;
	bringInCandidate: PlayerId | null;
	history: ActionType[];
	streetActions: ActionType[];
	bringInRank: Rank | null;
	alive: boolean;
	isFirstActor: boolean;
};

const STREET_TO_VISIBLE_CARD_COUNT = {
	"3rd": 3, // down2 + up1
	"4th": 4,
	"5th": 5,
	"6th": 6,
	"7th": 7,
};

export const PlayerRow = (props: Props) => {
	const {
		playerId,
		seatIds,
		cardsById,
		onAction,
		bringInCandidate,
		history,
		streetActions,
		bringInRank,
		alive,
		isFirstActor,
	} = props;

	const { games, gameType, suitColorMode, cardTheme } = useTableStore();
	const currentGame = games[gameType];
	const { bringInPlayer, currentStreet, seats } = currentGame;

	const visibleCount = STREET_TO_VISIBLE_CARD_COUNT[currentStreet];
	const visibleSeatIds = seatIds.slice(0, visibleCount);

	const is3rdStreet = currentStreet === "3rd";
	const actions = is3rdStreet ? ACTIONS_3RD : ACTIONS_LATER;

	// 12 / 3456 / 7 に分割
	const down2 = visibleSeatIds.slice(0, 2);
	const up4 = visibleSeatIds.slice(2, 6);
	const down7 = currentStreet === "7th" ? (visibleSeatIds[6] ? [visibleSeatIds[6]] : ["X-unknown" as CardId]) : [];

	// bring-inプレイヤーかどうか
	const isBringInPlayer = bringInPlayer === playerId;
	// bring-in候補かどうか
	const isBringInCandidate = bringInCandidate === playerId;

	// foldしたプレイヤーの行は不活性化
	const rowClass = alive
		? "flex items-center gap-3 py-1 border-b border-gray-800"
		: "flex items-center gap-3 py-1 border-b border-gray-800 opacity-40 pointer-events-none";

	// 履歴テキスト
	const historyText = history.length > 0 ? history.join(" / ") : "";

	const self3rdUpCard = getThirdStreetUpCard(seats[playerId], cardsById);

	// そのアクションが可能かどうかを判定する関数
	const canAct = (action: ActionType): boolean => {
		if (!alive) return false;

		// betやraiseがされたかどうか
		const hasBetOrRaise = streetActions.some((h) => h === "b" || h === "r" || h === "comp");

		// --- fold は常に可能 ---
		if (action === "f") {
			// bring-inプレイヤーはfoldできない
			if (isBringInCandidate) return false;
			return true;
		}

		// --- bri (bring-in) ---
		if (action === "bri") {
			if (!is3rdStreet) return false;
			if (isBringInPlayer) return false;

			// bring-in 候補本人
			if (isBringInCandidate) return true;

			// bring-in 候補と同じランクのアップカードを持つ人
			if (bringInRank && self3rdUpCard && self3rdUpCard.rank === bringInRank) {
				return true;
			}

			// 誰もまだアクションしていない場合
			if (streetActions.length === 0) {
				return true;
			}

			// それ以外は押せない
			return false;
		}

		// --- comp (complete) ---
		if (action === "comp") {
			const hasComplete = streetActions.includes("comp");
			return is3rdStreet && !isBringInPlayer && !hasComplete;
		}

		// --- check (x) ---
		if (action === "x") {
			// そのストリートで誰も bet / raise していない
			return !hasBetOrRaise;
		}

		// --- call (c) ---
		if (action === "c") {
			const hasBringIn = streetActions.includes("bri");
			return hasBetOrRaise || (is3rdStreet && hasBringIn);
		}

		// --- bet (b) ---
		if (action === "b") {
			// 3rd では bet は存在しない
			if (is3rdStreet) return false;

			// 誰も bet/raise していないときのみ
			return !hasBetOrRaise;
		}

		// --- raise (r) ---
		if (action === "r") {
			// bet or raise が存在するときのみ
			return hasBetOrRaise;
		}

		return true;
	};

	return (
		<div className={rowClass}>
			{/* プレイヤーID */}
			<div className="w-8 text-right text-gray-300 font-mono">{playerId}</div>

			<div className="w-4">
				{/* 候補の場合にだけマーク */}
				{isBringInCandidate && <span className="text-blue-400 font-bold">↓</span>}
				{/* 3rdの場合、実際のbring-inプレイヤーの場合にだけマーク */}
				{isBringInPlayer && is3rdStreet && <span className="text-orange-400 font-bold">↓</span>}
				{/* 4th以降で最初にアクションするプレイヤーの場合にだけマーク */}
				{isFirstActor && !is3rdStreet && <span className="text-orange-400 font-bold">↓</span>}
			</div>

			{/* 1行カード表示 */}
			<div className="flex items-center gap-2">
				{/* 12 */}
				<div className="flex gap-1">
					{down2.map((id) => (
						<CardMini
							key={`d-${id}-${Math.random().toString(36).slice(2, 6)}`}
							card={id ? cardsById[id] : null}
							suitColorMode={suitColorMode}
							cardTheme={cardTheme}
						/>
					))}
				</div>

				{/* / */}
				{up4.length > 0 && <span className="text-black-500 text-lg font-bold">/</span>}

				{/* 3456 */}
				<div className="flex gap-1">
					{up4.map((id) => (
						<CardMini
							key={`u-${id}-${Math.random().toString(36).slice(2, 6)}`}
							card={id ? cardsById[id] : null}
							suitColorMode={suitColorMode}
							cardTheme={cardTheme}
						/>
					))}
				</div>

				{/* / */}
				{down7.length > 0 && <span className="text-black-500 text-lg font-bold">/</span>}

				{/* 7 */}
				<div className="flex gap-1">
					{down7.map((id) => (
						<CardMini
							key={`r-${id}-${Math.random().toString(36).slice(2, 6)}`}
							card={id ? cardsById[id] : null}
							suitColorMode={suitColorMode}
							cardTheme={cardTheme}
						/>
					))}
				</div>
			</div>

			{/* 履歴表示 */}
			<div className="flex-1 text-sm text-white font-mono">{historyText}</div>

			{/* アクションボタン群 */}
			<div className="flex gap-1 ml-auto">
				{actions.map((a) => {
					// bri を押すべき候補なら強調表示
					const isHighlighted = a === "bri" && isBringInCandidate;

					return (
						<button
							type="button"
							key={a}
							onClick={() => onAction(playerId, a)}
							disabled={!canAct(a)}
							className={[
								"w-10 h-7 rounded text-xs font-semibold text-white transition-all",
								!canAct(a)
									? "bg-gray-500 opacity-40 cursor-not-allowed"
									: isHighlighted
										? "bg-blue-500 animate-pulse shadow-lg"
										: "bg-gray-700 hover:bg-blue-500",
							].join(" ")}
						>
							{a}
						</button>
					);
				})}
			</div>
		</div>
	);
};
