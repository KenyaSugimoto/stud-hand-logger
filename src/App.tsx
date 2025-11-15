import "./App.css";
import { GameTypeSelect } from "./components/GameTypeSelect";
import { Razz } from "./components/Razz";
import { SettingsSection } from "./components/SettingsSection";
import { Stud8 } from "./components/Stud8";
import { StudHi } from "./components/StudHi";
import { useTableStore } from "./hooks/useTableStore";
import { StudGameType } from "./types";

export default function App() {
	const { gameType } = useTableStore();

	return (
		<div className="w-full h-screen flex flex-col overflow-hidden bg-white">
			{/* 🔵 上部（左寄せ） tabs */}
			<div className="w-full flex-shrink-0 flex items-center pt-2 border-b border-gray-200">
				<GameTypeSelect />
			</div>

			{/* 🔵 下部：2カラムレイアウト */}
			<div className="flex flex-1 overflow-hidden">
				{/* 🔵 左カラム：PokerTable */}
				<div className="flex-1 flex items-center justify-center overflow-hidden">
					{gameType === StudGameType.StudHi && <StudHi.Left />}
					{gameType === StudGameType.Razz && <Razz.Left />}
					{gameType === StudGameType.Stud8 && <Stud8.Left />}
				</div>

				{/* 🔵 右パネル（スクロール / 最低幅確保） */}
				<div
					className="
          min-w-[800px]
          max-w-[1200px]
          flex-shrink-0
          overflow-y-auto
          overflow-x-hidden
          border-l border-gray-300
          p-4
        "
				>
					{gameType === StudGameType.StudHi && <StudHi.Right />}
					{gameType === StudGameType.Razz && <Razz.Right />}
					{gameType === StudGameType.Stud8 && <Stud8.Right />}
				</div>

				{/* 🔵 設定 */}
				<SettingsSection />
			</div>
		</div>
	);
}
