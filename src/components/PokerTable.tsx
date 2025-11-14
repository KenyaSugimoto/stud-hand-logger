import { useTableStore } from "../hooks/useTableStore";
import type { Card, CardId, PlayerId, Seat, Slot, StudGameType } from "../types";
import { PlayerSeat } from "./PlayerSeat";

type Props = {
	gameType: StudGameType;
};

export const PokerTable = (props: Props) => {
	const { gameType } = props;

	const { games, setCurrentSlot } = useTableStore();
	const state = games[gameType];

	const { seats, currentSlot, cardsById, playersCount, alive } = state;

	const players = Array.from({ length: playersCount }, (_, i) => `P${i + 1}` as PlayerId);

	const W = 1000,
		H = 800,
		rx = 400,
		ry = 250;

	const pos = (i: number) => {
		const ang = (i / players.length) * Math.PI * 2 - Math.PI / 2;
		return { left: Math.cos(ang) * rx + W / 2, top: Math.sin(ang) * ry + H / 2 };
	};

	return (
		<div className="relative mx-auto" style={{ width: W, height: H }}>
			<div className="absolute inset-0 rounded-full bg-green-900 border-4 border-gray-700 shadow-inner" />
			<div className="absolute inset-8 rounded-full bg-green-800/40" />
			{players.map((pid, i) => {
				const p = pos(i);
				return (
					<div key={pid} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.left, top: p.top }}>
						<PlayerSeat
							playerId={pid}
							seatIds={seats[pid] as Seat}
							cardsById={cardsById as Record<CardId, Card>}
							currentSlot={currentSlot as Slot | null}
							focused={currentSlot?.playerId === pid}
							onPickSlot={(idx) => setCurrentSlot(pid, idx)}
							alive={alive[pid]}
						/>
					</div>
				);
			})}
		</div>
	);
};
