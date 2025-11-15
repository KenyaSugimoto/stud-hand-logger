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
};

export const MobilePlayerRow = (props: Props) => {
	const { street, playerId, seatIds, cardsById, currentSlot, onPickSlot, alive } = props;
	const { games, gameType } = useTableStore();
	const state = games[gameType];
	const { bringInPlayer, bringInCandidate } = state;

	// bring-in 情報
	const is3rd = street === "3rd";

	const isBringInPlayer = bringInPlayer === playerId;
	const isBringInCandidate = bringInCandidate === playerId;

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

	return (
		<div
			className={`flex items-center gap-2 py-1 px-1 rounded-md bg-white border border-gray-200 ${
				alive ? "" : "opacity-40 pointer-events-none"
			}`}
		>
			{/* Player */}
			<div className="w-6 text-[11px] font-semibold text-gray-700">{playerId}</div>

			{/* bring-in / first actor */}
			<div className="w-3 text-center text-[12px]">
				{isBringInCandidate && <span className="text-blue-500 font-bold">↓</span>}
				{isBringInPlayer && is3rd && <span className="text-orange-500 font-bold">↓</span>}
				{isFirstActor && !is3rd && <span className="text-orange-500 font-bold">↓</span>}
			</div>

			{/* カード（12 / 3456 / 7） */}
			<div className="flex-1 flex items-center gap-1">
				{/* down2 */}
				{down2.map((id, idx) => (
					<CardSlot
						key={`d-${id}-${playerId}`}
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
							key={`u-${id}-${playerId}`}
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
							key={`r-${id}-${playerId}`}
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
			<div className="text-[10px] text-black font-semibold font-mono w-14 text-left">{historyText}</div>

			{/* アクション */}
			<MobileActionButtons street={street} playerId={playerId} />
		</div>
	);
};
