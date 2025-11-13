import { useTableStore } from "../hooks/useTableStore";
import type { Card, CardId, PlayerId, Seat, Slot, StudGameType, TableState } from "../types";
import { PlayerSeat } from "./PlayerSeat";

type Props = {
	gameType: StudGameType;
};

export const PokerTable = (props: Props) => {
	const { gameType } = props;

	const { games, setCurrent } = useTableStore();
	const state = games[gameType] as TableState;

	const { seats, current, cardsById, playersCount } = state;

	const players = Array.from({ length: playersCount }, (_, i) => `P${i + 1}` as PlayerId);

	const W = 1000,
		H = 800,
		rx = 400,
		ry = 250;

	const pos = (i: number) => {
		const ang = (i / players.length) * Math.PI * 2 - Math.PI / 2;
		return { left: Math.cos(ang) * rx + W / 2, top: Math.sin(ang) * ry + H / 2 };
	};

	// TODO: ゲームの種類によってテーブルの色を変える (stud hi: 青, razz: オレンジ, stud8: 緑)
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
							current={current as Slot | null}
							focused={current?.playerId === pid}
							onPickSlot={(idx) => setCurrent(pid, idx)}
						/>
					</div>
				);
			})}
		</div>
	);
};
