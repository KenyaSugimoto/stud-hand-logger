import { useSwipeBottomSheet } from "../../hooks/useSwipeBottomSheet";
import { MobileCardSelect } from "./MobileCardSelect";

type Props = {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const MobileCardSelectPanel = ({ open, setOpen }: Props) => {
	const maxHeight = 200;
	const swipe = useSwipeBottomSheet(maxHeight, open, setOpen);

	return (
		<div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
			<div
				ref={swipe.sheetRef}
				className="
					bg-white shadow-2xl border-t rounded-t-xl pointer-events-auto
					transition-transform
					w-full
				"
				style={{
					height: maxHeight + 40, // 中身 + ヘッダー
					transform: `translateY(${maxHeight}px)`,
				}}
				onTouchStart={swipe.onTouchStart}
				onTouchMove={swipe.onTouchMove}
				onTouchEnd={swipe.onTouchEnd}
			>
				{/* ハンドル */}
				<button
					type="button"
					onClick={swipe.toggle}
					className="w-full py-2 flex justify-center items-center text-gray-600 active:opacity-60"
				>
					<div className="w-12 h-2 rounded-full bg-gray-400" />
				</button>

				{/* Content */}
				<div className="flex justify-center py-4 overflow-y-auto">
					<MobileCardSelect />
				</div>
			</div>
		</div>
	);
};
