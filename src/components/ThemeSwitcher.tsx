import { useTableStore } from "../hooks/useTableStore";
import { CARD_THEME_VALUES } from "../types";

export const ThemeSwitcher = () => {
	const { cardTheme, suitColorMode, setCardTheme, setCardSuitColor } = useTableStore();

	return (
		<div className="p-3 border rounded-lg bg-gray-50 shadow-sm flex flex-col gap-3">
			{/* Card Theme */}
			<div className="flex flex-col gap-1">
				<p className="text-sm font-semibold text-gray-700">Card Theme</p>
				<div className="flex gap-2">
					{CARD_THEME_VALUES.map((t) => (
						<button
							type="button"
							key={t}
							onClick={() => setCardTheme(t)}
							className={`
                px-3 py-1 rounded-md border text-sm
                ${
									cardTheme === t
										? "bg-blue-600 text-white border-blue-600 shadow"
										: "bg-white border-gray-300 hover:bg-gray-100"
								}
              `}
						>
							{t}
						</button>
					))}
				</div>
			</div>

			{/* Suit Color Mode */}
			<div className="flex flex-col gap-1">
				<p className="text-sm font-semibold text-gray-700">Suit Colors</p>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setCardSuitColor("two")}
						className={`
              px-3 py-1 rounded-md border text-sm
              ${
								suitColorMode === "two"
									? "bg-blue-600 text-white border-blue-600 shadow"
									: "bg-white border-gray-300 hover:bg-gray-100"
							}
            `}
					>
						2-color
					</button>

					<button
						type="button"
						onClick={() => setCardSuitColor("four")}
						className={`
              px-3 py-1 rounded-md border text-sm
              ${
								suitColorMode === "four"
									? "bg-blue-600 text-white border-blue-600 shadow"
									: "bg-white border-gray-300 hover:bg-gray-100"
							}
            `}
					>
						4-color
					</button>
				</div>
			</div>
		</div>
	);
};
