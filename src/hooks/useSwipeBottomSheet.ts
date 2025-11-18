// hooks/useSwipeBottomSheet.ts

import { useRef } from "react";

export const useSwipeBottomSheet = (
	maxHeight: number,
	open: boolean,
	setOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	const startY = useRef(0);
	const currentY = useRef(0);
	const dragging = useRef(false);

	const sheetRef = useRef<HTMLDivElement>(null);

	// 開閉切り替え
	const toggle = () => setOpen((o) => !o);

	// ---- Touch Start ----
	const onTouchStart = (e: React.TouchEvent) => {
		dragging.current = true;
		startY.current = e.touches[0].clientY;
	};

	// ---- Touch Move ----
	const onTouchMove = (e: React.TouchEvent) => {
		if (!dragging.current) return;

		currentY.current = e.touches[0].clientY;
		const delta = currentY.current - startY.current;

		let translateY = open ? delta : maxHeight + delta;

		// 限界を超えない
		translateY = Math.max(0, Math.min(maxHeight, translateY));

		if (sheetRef.current) {
			sheetRef.current.style.transform = `translateY(${translateY}px)`;
		}
	};

	// ---- Touch End ----
	const onTouchEnd = () => {
		dragging.current = false;

		const delta = currentY.current - startY.current;

		// 判定：引いた距離が高さの25%超 → 閉じる
		const shouldClose = delta > maxHeight * 0.25;

		setOpen(!shouldClose);

		// アニメーションで最終位置へ
		if (sheetRef.current) {
			sheetRef.current.style.transition = "transform 0.25s ease-out";
			sheetRef.current.style.transform = open && !shouldClose ? "translateY(0)" : `translateY(${maxHeight}px)`;
			setTimeout(() => {
				if (sheetRef.current) sheetRef.current.style.transition = "";
			}, 300);
		}
	};

	return {
		open,
		toggle,
		sheetRef,
		onTouchStart,
		onTouchMove,
		onTouchEnd,
	};
};
