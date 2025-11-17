import { STREET_TO_VISIBLE_CARD_COUNT } from "../../consts";
import { useTableStore } from "../../hooks/useTableStore";
import type { Card, CardId, PlayerId, Seat, Slot, SlotIndex, Street } from "../../types";
import { getFirstActor } from "../../utils/getFirstActor";
import { CardSlot } from "../CardSlot";
import { MobileActionButtons } from "./MobileActionButtons";

type Props = {
	street: Street;
	playerId: PlayerId;
	seatIds: Seat;
	cardsById: Record<CardId, Card>;
	currentSlot: Slot | null;
	onPickSlot: (idx: SlotIndex) => void;
	alive: boolean;
	bringInCandidate: PlayerId | null;
};

export const MobilePlayerRow = (props: Props) => {
	const { street, playerId, seatIds, cardsById, currentSlot, onPickSlot, alive, bringInCandidate } = props;
	const { games, gameType } = useTableStore();
	const state = games[gameType];
	const { bringInPlayer } = state;

	// bring-in 情報
	const is3rd = street === "3rd";

	// first actor
	const isFirstActor = getFirstActor(state, gameType) === playerId;

	const streetActions = state.actions[street];

	// visible cards
	const visible = STREET_TO_VISIBLE_CARD_COUNT[street];
	const visibleIds = seatIds.slice(0, visible);

	// groups: 12 / 3456 / 7
	const down2 = visibleIds.slice(0, 2);
	const up4 = visibleIds.slice(2, 6);
	const down7 = visibleIds.slice(6, 7); // 7th のみ1枚

	const get = (i: number) => (visibleIds[i] ? cardsById[visibleIds[i] as CardId] : null);

	const isSel = (i: SlotIndex) => currentSlot?.playerId === playerId && currentSlot.slotIndex === i;

	const onSelect = (i: SlotIndex) => {
		onPickSlot(i);
	};

	// history
	const history = streetActions.filter((a) => a.playerId === playerId).map((a) => a.type);

	const historyText = history.length > 0 ? history.join(" / ") : "";

	const FirstActorMark = () => {
		const isBringInCandidate = bringInCandidate === playerId;
		if (is3rd && isBringInCandidate) {
			return <span className="text-blue-500 font-bold">↓</span>;
		}

		const isBringInPlayer = bringInPlayer === playerId;
		if (is3rd && isBringInPlayer) {
			return <span className="text-orange-500 font-bold">↓</span>;
		}

		return isFirstActor ? <span className="text-orange-500 font-bold">↓</span> : <span>$ </span>;
	};

	return (
		<div
			className={`flex items-center gap-2 py-1 px-1 rounded-md bg-white border border-gray-200 ${
				alive ? "" : "opacity-40 pointer-events-none"
			}`}
		>
			{/* Player */}
			<div className="w-2 text-[11px] font-semibold text-gray-700">{playerId}</div>

			{/* bring-in / first actor */}
			<div className="w-2 text-center text-[16px] font-mono">
				<FirstActorMark />
			</div>

			{/* カード（12 / 3456 / 7） */}
			<div className="flex items-center gap-1">
				{/* down2 */}
				{down2.map((id, idx) => (
					<CardSlot
						key={`d-${id}-${Math.random().toString(36).slice(2, 6)}`}
						card={get(idx)}
						selected={isSel(idx as SlotIndex)}
						onSelect={() => onSelect(idx as SlotIndex)}
						isMobile={true}
						scale={1}
					/>
				))}

				{/* slash */}
				{up4.length > 0 && <span className="text-xs text-gray-400">/</span>}

				{/* up4 */}
				{up4.map((id, idx) => {
					const realIndex = idx + 2;
					return (
						<CardSlot
							key={`u-${id}-${Math.random().toString(36).slice(2, 6)}`}
							card={get(realIndex)}
							selected={isSel(realIndex as SlotIndex)}
							onSelect={() => onSelect(realIndex as SlotIndex)}
							isMobile={true}
							scale={1}
						/>
					);
				})}

				{/* slash */}
				{down7.length > 0 && <span className="text-xs text-gray-400">/</span>}

				{/* 7th */}
				{down7.map((id, idx) => {
					const realIndex = idx + 6; // always index 6
					return (
						<CardSlot
							key={`r-${id}-${Math.random().toString(36).slice(2, 6)}`}
							card={get(realIndex)}
							selected={isSel(realIndex as SlotIndex)}
							onSelect={() => onSelect(realIndex as SlotIndex)}
							isMobile={true}
							scale={1}
						/>
					);
				})}
			</div>

			{/* 履歴 */}
			<div className="w-64 text-[10px] text-black font-semibold font-mono text-left">{historyText}</div>

			{/* アクション */}
			<MobileActionButtons street={street} playerId={playerId} isBringInCandidate={bringInCandidate === playerId} />
		</div>
	);
};
