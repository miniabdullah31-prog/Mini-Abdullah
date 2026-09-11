import React from "react";
import { GameId } from "../../data/gameRegistry";
import WordSearchGame from "../quiz/WordSearchGame";
import MatchGame from "../quiz/MatchGame";
import MeaningGame from "../quiz/MeaningGame";
import TrueFalseGame from "../quiz/TrueFalseGame";
import WuduMissionGame from "../quiz/WuduMissionGame";

type Props = {
  gameId: GameId;
  onExitToHub: () => void;
};

/**
 * Maps registry game id → screen component.
 * Nayi game: yahan ek line add karo.
 */
const GAME_SCREENS: Record<
  GameId,
  React.ComponentType<{ onExitToHub: () => void }>
> = {
  wordsearch: WordSearchGame,
  match: MatchGame,
  meaning: MeaningGame,
  truefalse: TrueFalseGame,
  wudumission: WuduMissionGame,
};

const GameLauncher: React.FC<Props> = ({ gameId, onExitToHub }) => {
  const Screen = GAME_SCREENS[gameId];
  if (!Screen) {
    return null;
  }
  return <Screen onExitToHub={onExitToHub} />;
};

export default GameLauncher;
