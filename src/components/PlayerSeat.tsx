import type { Card, CardId, PlayerId, Seat, Slot, SlotIndex } from "../types";
import { CardSlot } from "./CardSlot";

type Props = {
	playerId: PlayerId;
	seatIds: Seat; // CardId|null の配列
	cardsById: Record<CardId, Card>;
	current?: Slot | null;
	focused: boolean;
	onPickSlot: (idx: SlotIndex) => void;
};

export const PlayerSeat = (props: Props) => {
	const { playerId, seatIds, cardsById, focused, current, onPickSlot } = props;

	const get = (i: SlotIndex) => (seatIds[i] ? cardsById[seatIds[i] as CardId] : null);
	const isSel = (i: SlotIndex) => current?.playerId === playerId && current.slotIndex === i;

	const onSelect = (i: SlotIndex) => {
		seatIds[i] = null; // クリックされた時点でカードを外す
		onPickSlot(i);
	};

	const Slash = <span className="text-black-500 self-center text-4xl">/</span>;

	return (
		<div className={`flex flex-col items-center gap-1 p-2 rounded-xl ${focused ? "ring-2 ring-blue-400" : ""}`}>
			<div className="text-xs text-gray-100 mb-1">{playerId}</div>

			{/* 3rd */}
			<div className="flex gap-1 mb-1">
				{/* ハンド2枚 */}
				{[0, 1].map((i) => (
					<CardSlot
						key={`${playerId}-h-${i}`}
						card={get(i as 0 | 1)}
						selected={isSel(i as 0 | 1)}
						onSelect={() => onSelect(i as 0 | 1)}
					/>
				))}
				{Slash}
				{/* 看板1枚 */}
				{[2].map((i) => (
					<CardSlot
						key={`${playerId}-h-${i}`}
						card={get(i as 2)}
						selected={isSel(i as 2)}
						onSelect={() => onSelect(i as 2)}
					/>
				))}
			</div>
			{/* 4th ~ 7th */}
			<div className="flex gap-1 mb-1">
				{[3, 4, 5].map((i) => (
					<CardSlot
						key={`${playerId}-u-${i}`}
						card={get(i as 3 | 4 | 5)}
						selected={isSel(i as 3 | 4 | 5)}
						onSelect={() => onSelect(i as 3 | 4 | 5)}
					/>
				))}
				{Slash}
				{[6].map((i) => (
					<CardSlot
						key={`${playerId}-u-${i}`}
						card={get(i as 6)}
						selected={isSel(i as 6)}
						onSelect={() => onSelect(i as 6)}
					/>
				))}
			</div>
		</div>
	);
};
