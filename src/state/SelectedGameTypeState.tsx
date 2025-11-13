// TODO: 後で消す

import { create } from "zustand";
import type { StudGameType } from "../types"; // 型としてインポート
import { StudGameType as StudGame } from "../types"; // 値としてインポート

type SelectedGameTypeStateType = {
	selectedGameType: StudGameType;
	setSelectedGameType: (gameType: StudGameType) => void;
};

export const useSelectedGameTypeState = create<SelectedGameTypeStateType>()((set) => ({
	selectedGameType: StudGame.StudHi,
	setSelectedGameType: (gameType) => set({ selectedGameType: gameType }),
}));

