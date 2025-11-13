import "./App.css";
import { GameTypeSelect } from "./components/GameTypeSelect";
import { Razz } from "./components/Razz";
import { Stud8 } from "./components/Stud8";
import { StudHi } from "./components/StudHi";
import { useTableStore } from "./hooks/useTableStore";
import { StudGameType } from "./types";

function App() {
	const { gameType } = useTableStore();
	return (
		<>
			<GameTypeSelect />
			{gameType === StudGameType.StudHi && <StudHi />}
			{gameType === StudGameType.Razz && <Razz />}
			{gameType === StudGameType.Stud8 && <Stud8 />}
		</>
	);
}
export default App;
