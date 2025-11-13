import { create } from "zustand";

type selectedPlayersStateType = {
	playersCount: number;
	setPlayersCount: (count: number) => void;
};

// 初期プレイヤー数を6に設定
const INITIAL_PLAYERS = 6;

export const useStudHiPlayersCountState = create<selectedPlayersStateType>()((set) => ({
	playersCount: INITIAL_PLAYERS,
	setPlayersCount: (count: number) => set(() => ({ playersCount: count })),
}));

export const useRazzPlayersCountState = create<selectedPlayersStateType>()((set) => ({
	playersCount: INITIAL_PLAYERS,
	setPlayersCount: (count: number) => set(() => ({ playersCount: count })),
}));

export const useStud8PlayersCountState = create<selectedPlayersStateType>()((set) => ({
	playersCount: INITIAL_PLAYERS,
	setPlayersCount: (count: number) => set(() => ({ playersCount: count })),
}));
