import { useEffect, useRef, useState } from "react";
import { useTableStore } from "../hooks/useTableStore";
import type { PlayerId, Seat, StudGameType } from "../types";
import { PlayerSeat } from "./PlayerSeat";

type Props = {
	gameType: StudGameType;
};

const TABLE_COLORS = {
	STUD_HI: {
		outer: "bg-blue-900 border-blue-700",
		inner: "bg-blue-800/40",
	},
	RAZZ: {
		outer: "bg-orange-900 border-orange-700",
		inner: "bg-orange-800/40",
	},
	STUD_8: {
		outer: "bg-green-900 border-green-700",
		inner: "bg-green-800/40",
	},
} as const;

// 🎛️ いじっていいパラメータ（席配置調整はここだけ）
const BASE_TABLE = {
	width: 900,
	height: 520, // テーブルの縦サイズ
	padding: 12, // outer → inner
	seatRadiusX: 340, // 横方向の半径
	seatRadiusY: 180, // 縦方向の半径
};

export const PokerTable = ({ gameType }: Props) => {
	const { games, setCurrentSlot } = useTableStore();
	const state = games[gameType];

	const { seats, currentSlot, cardsById, playersCount, alive } = state;

	const players = Array.from({ length: playersCount }, (_, i) => `P${i + 1}` as PlayerId);

	// scale 計算用
	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);

	// scale の最小・最大値
	const MIN_SCALE = 0.45;
	const MAX_SCALE = 1;

	useEffect(() => {
		const resize = () => {
			if (!containerRef.current) return;
			const w = containerRef.current.offsetWidth;

			let s = w / BASE_TABLE.width;
			if (s > MAX_SCALE) s = MAX_SCALE;
			if (s < MIN_SCALE) s = MIN_SCALE;

			setScale(s);
		};

		resize();
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, []);

	// 🎯 座標計算（見た目と完全一致）
	const cx = (BASE_TABLE.width * scale) / 2;
	const cy = (BASE_TABLE.height * scale) / 2;

	const pos = (i: number) => {
		const ang = (i / players.length) * Math.PI * 2 - Math.PI / 2;
		return {
			left: Math.cos(ang) * (BASE_TABLE.seatRadiusX * scale) + cx,
			top: Math.sin(ang) * (BASE_TABLE.seatRadiusY * scale) + cy,
		};
	};

	const color = TABLE_COLORS[gameType];

	return (
		<div ref={containerRef} className="relative w-full h-full flex justify-center items-center overflow-hidden">
			<div
				className="relative"
				style={{
					width: BASE_TABLE.width,
					height: BASE_TABLE.height,
					transform: `scale(${scale})`,
					transformOrigin: "center",
				}}
			>
				{/* outer */}
				<div className={`absolute inset-0 rounded-full border-4 shadow-inner ${color.outer}`} />

				{/* inner */}
				<div className={`absolute inset-${BASE_TABLE.padding} rounded-full ${color.inner}`} />

				{/* players */}
				{players.map((pid, i) => {
					const p = pos(i);
					return (
						<div key={pid} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.left, top: p.top }}>
							<PlayerSeat
								playerId={pid}
								seatIds={seats[pid] as Seat}
								cardsById={cardsById}
								currentSlot={currentSlot}
								focused={currentSlot?.playerId === pid}
								onPickSlot={(idx) => setCurrentSlot(pid, idx)}
								alive={alive[pid]}
								scale={scale}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};
