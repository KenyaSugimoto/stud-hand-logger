import { useEffect, useRef, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";

export const SettingsSection = () => {
	// Theme Switcher 用の state
	const [open, setOpen] = useState(false);

	const panelRef = useRef<HTMLDivElement>(null);

	// 🔵 ESCキー & 外側クリックで閉じる処理
	useEffect(() => {
		if (!open) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};

		const onClick = (e: MouseEvent) => {
			if (!panelRef.current) return;
			if (!panelRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};

		document.addEventListener("keydown", onKey);
		document.addEventListener("mousedown", onClick);

		// クリーンアップ
		return () => {
			document.removeEventListener("keydown", onKey);
			document.removeEventListener("mousedown", onClick);
		};
	}, [open]);

	return (
		<>
			{/* ⚙ Floating Action Button (FAB) */}
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="
						absolute bottom-4 left-4
						w-12 h-12
						rounded-full shadow-lg
						bg-white hover:bg-gray-100
						text-gray-500 text-2xl
						flex items-center justify-center
						transition-all
					"
			>
				<svg
					className="h-8 w-8 text-gray-500"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" />
					<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<circle cx="12" cy="12" r="3" />
					<title>Settings</title>
				</svg>
			</button>

			{/* ポップオーバー設定パネル */}
			{open && (
				<div
					ref={panelRef}
					className="
							absolute bottom-20 left-4
							w-72 p-4
							bg-white shadow-2xl rounded-xl border
							animate-popIn
						"
				>
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-sm font-semibold text-gray-800">Settings</h3>
						<button type="button" onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
							✕
						</button>
					</div>

					<ThemeSwitcher />
				</div>
			)}
		</>
	);
};
