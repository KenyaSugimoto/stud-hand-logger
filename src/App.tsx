// App.tsx
import "./App.css";
import { GameTypeSelect } from "./components/GameTypeSelect";
import { MobileInputView } from "./components/mobile/MobileInputView";
import { PlayersSelect } from "./components/PlayersSelect";
import { Razz } from "./components/Razz";
import { ResetButton } from "./components/ResetButton";
import { SettingsSection } from "./components/SettingsSection";
import { Stud8 } from "./components/Stud8";
import { StudHi } from "./components/StudHi";
import { useIsMobile } from "./hooks/useIsMobile";
import { useTableStore } from "./hooks/useTableStore";
import { StudGameType } from "./types";

export default function App() {
	const { gameType } = useTableStore();

	const isMobile = useIsMobile();

	if (isMobile) {
		// 📱 モバイル：テーブルなし・入力ビューのみ
		return (
			<div className="w-full min-h-screen flex flex-col bg-white">
				<div className="w-full flex-shrink-0 flex items-center pt-2 border-b border-gray-200">
					<GameTypeSelect />
				</div>

				<div className="flex flex-col pt-2 m-2">
					<div className="flex justify-start mb-2">
						<PlayersSelect />
					</div>
					<div className="mt-2 flex justify-end mb-0">
						<ResetButton />
					</div>
				</div>

				<div className="flex-1 overflow-y-auto">
					<MobileInputView />
				</div>

				<div className="border-t border-gray-200 p-3 mb-5">
					<SettingsSection />
				</div>
			</div>
		);
	}

	// 💻 PC：これまでのレイアウトそのまま
	return (
		<div className="w-full h-screen flex flex-col overflow-hidden bg-white">
			{/* 上部 tabs */}
			<div className="w-full flex-shrink-0 flex items-center pt-2 border-b border-gray-200">
				<GameTypeSelect />
			</div>

			{/* 下部：2カラム */}
			<div className="flex flex-1 overflow-hidden">
				{/* 左：PokerTable */}
				<div className="flex-1 flex items-center justify-center overflow-hidden">
					{gameType === StudGameType.StudHi && <StudHi.Left />}
					{gameType === StudGameType.Razz && <Razz.Left />}
					{gameType === StudGameType.Stud8 && <Stud8.Left />}
				</div>

				{/* 右パネル */}
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

				<SettingsSection />
			</div>
		</div>
	);
}
