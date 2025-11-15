import type { Card, CardId, PlayerId, Seat, Slot, SlotIndex } from "../types";
import { CardSlot } from "./CardSlot";

type Props = {
	playerId: PlayerId;
	seatIds: Seat; // CardId|null の配列
	cardsById: Record<CardId, Card>;
	currentSlot?: Slot | null;
	focused: boolean;
	onPickSlot: (idx: SlotIndex) => void;
	alive: boolean;
	scale: number;
	isMobile: boolean;
};

export const PlayerSeat = (props: Props) => {
	const { playerId, seatIds, cardsById, focused, currentSlot, onPickSlot, alive, scale, isMobile } = props;
	const disabledStyle = !alive ? "opacity-40 grayscale pointer-events-none" : "";

	const get = (i: SlotIndex) => (seatIds[i] ? cardsById[seatIds[i] as CardId] : null);
	const isSel = (i: SlotIndex) => currentSlot?.playerId === playerId && currentSlot.slotIndex === i;

	const onSelect = (i: SlotIndex) => {
		seatIds[i] = null; // クリックされた時点でカードを外す
		onPickSlot(i);
	};

	// PC / Mobile で Slash サイズを切り替え
	const Slash = <span className={isMobile ? "text-xl self-center" : "text-4xl self-center"}>/</span>;

	// スケール調整 (スマホだと更に小さくする)
	const scaleValue = isMobile ? scale * 0.5 : scale;

	return (
		<div
			className={`
				flex flex-col items-center
				${isMobile ? "p-1 gap-0.5" : "p-2 gap-1"}
				rounded-xl bg-white/20
				${focused ? "ring-2 ring-white shadow-[0_0_10px_white]" : ""}
				${disabledStyle}
			`}
			style={{
				transform: `scale(${scale})`,
				transformOrigin: "center",
			}}
		>
			<div className={isMobile ? "text-[10px] text-gray-100 mb-0.5" : "text-xs text-gray-100 mb-1"}>{playerId}</div>

			{/* 3rd */}
			<div className={`flex ${isMobile ? "gap-0.5 mb-0.5" : "gap-1 mb-1"}`}>
				{/* ハンド2枚 */}
				{[0, 1].map((i) => (
					<CardSlot
						key={`${playerId}-h-${i}`}
						card={get(i as 0 | 1)}
						selected={isSel(i as 0 | 1)}
						onSelect={() => onSelect(i as 0 | 1)}
						scale={scaleValue}
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
						scale={scaleValue}
					/>
				))}
			</div>
			{/* 4th ~ 7th */}
			<div className={`flex ${isMobile ? "gap-0.5 mb-0.5" : "gap-1 mb-1"}`}>
				{[3, 4, 5].map((i) => (
					<CardSlot
						key={`${playerId}-u-${i}`}
						card={get(i as 3 | 4 | 5)}
						selected={isSel(i as 3 | 4 | 5)}
						onSelect={() => onSelect(i as 3 | 4 | 5)}
						scale={scaleValue}
					/>
				))}
				{Slash}
				{[6].map((i) => (
					<CardSlot
						key={`${playerId}-u-${i}`}
						card={get(i as 6)}
						selected={isSel(i as 6)}
						onSelect={() => onSelect(i as 6)}
						scale={scaleValue}
					/>
				))}
			</div>
		</div>
	);
};
