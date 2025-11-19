// components/mobile/MobileCardSelectPanel.tsx

import { MobileCardSelect } from "./MobileCardSelect";

type Props = {
	open: boolean;
	toggle: () => void;
};

export const MobileCardSelectPanel = ({ open, toggle }: Props) => {
	const MAX_H_CLASS = "max-h-[420px]";
	return (
		<div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
			<div
				className={`
					bg-white shadow-[0_0_15px_rgba(0,0,0,0.25)] border-t rounded-t-xl
					transition-all duration-300 overflow-hidden pointer-events-auto
					${open ? MAX_H_CLASS : "max-h-10"}
				`}
			>
				<button type="button" onClick={toggle} className="w-full py-2 flex justify-center items-center text-gray-600">
					<div className="w-12 h-2 rounded-full bg-gray-400" />
				</button>

				{/* Content */}
				<div className={open ? "opacity-100" : "opacity-0"}>
					{open && (
						<div className="flex justify-center py-4">
							<MobileCardSelect />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
