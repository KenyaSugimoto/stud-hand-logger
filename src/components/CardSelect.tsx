import { useDeckCards } from "../hooks/useDeckCards";
import { suitSymbol } from "../utils/display";

export const CardSelect = () => {
	const { deckCards, assignCard, unassignCard, unknownCards, addUnknownCard } = useDeckCards();

	return (
		<>
			<div className="grid grid-cols-13 gap-2 mb-4">
				{deckCards.map((card) => (
					<button
						type="button"
						key={card.id}
						className={`border rounded p-2 ${card.assignedTo ? "bg-blue-500 text-white" : "bg-gray-100"}`}
						onClick={() => {
							if (card.assignedTo) {
								unassignCard(card.id);
							} else {
								// TODO: プレイヤーIDとカードインデックスを動的に指定できるようにする
								// とりあえずP1の1枚目に割り当てる
								assignCard(card.id, "P1", 1);
							}
						}}
					>
						{card.rank}
						{/* TODO: 2色デック or 4色デックの選択ができるようにする */}
						<span className={card.suit === "h" || card.suit === "d" ? "text-red-500" : "text-black"}>
							{suitSymbol(card.suit)}
						</span>
					</button>
				))}
			</div>

			{/* 不明カードボタン */}
			<div className="flex items-center gap-2">
				<button type="button" className="border rounded p-2 bg-gray-200 hover:bg-gray-300" onClick={addUnknownCard}>
					X（不明カード追加）
				</button>
				{/* TODO: 後で消す */}
				{unknownCards > 0 && <span className="text-sm text-gray-600">選択中: X{unknownCards}</span>}
			</div>
		</>
	);
};
