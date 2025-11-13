import { useRazzPlayersCountState, useStud8PlayersCountState, useStudHiPlayersCountState } from "../state/PlayersState";
import { StudGameType } from "../types";

const useSelectedPlayersStateByGameType = (gameType: StudGameType) => {
	const studHi = useStudHiPlayersCountState();
	const razz = useRazzPlayersCountState();
	const stud8 = useStud8PlayersCountState();

	switch (gameType) {
		case StudGameType.StudHi:
			return studHi;
		case StudGameType.Razz:
			return razz;
		default:
			return stud8;
	}
};

export const usePlayers = (gameType: StudGameType) => {
	const { playersCount, setPlayersCount } = useSelectedPlayersStateByGameType(gameType);

	return {
		playersCount,
		setPlayersCount,
	};
};
