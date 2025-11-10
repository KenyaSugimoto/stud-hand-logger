import "./App.css";
import { CardSelect } from "./components/CardSelect";
import { GameTypeSelect } from "./components/GameTypeSelect";
import { useSelectedGameTypeState } from "./state/SelectedGameTypeState";
import { StudGameType } from "./types/StudGameType";

function App() {
	const { selectedGameType } = useSelectedGameTypeState();
	return (
		<>
			<GameTypeSelect />
			{selectedGameType === StudGameType.StudHi && <div>Stud Hi Component Placeholder</div>}
			{selectedGameType === StudGameType.Razz && <div>Razz Component Placeholder</div>}
			{selectedGameType === StudGameType.Stud8 && <div>Stud8 Component Placeholder</div>}
			<CardSelect />
		</>
	);
}
export default App;
