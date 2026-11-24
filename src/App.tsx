import { useCallback, useEffect, useState } from 'react';
import { CashMiniGame } from './components/CashMiniGame';
import { CleaningStage } from './components/CleaningStage';
import { HomeHub } from './components/HomeHub';
import { ToolShop } from './components/ToolShop';
import { TopBar } from './components/TopBar';
import {
  MAX_TOOL_LEVEL,
  STAGES,
  getToolUpgradeCost,
  loadSaveState,
  persistSaveState,
} from './data/gameData';
import { GameScreen, SaveState, StageConfig, ToolId } from './types/game';
import { sound } from './utils/sound';

export function App() {
  const [saveState, setSaveState] = useState<SaveState>(() => loadSaveState());
  const [screen, setScreen] = useState<GameScreen>('HOME_HUB');
  const [activeStage, setActiveStage] = useState<StageConfig>(STAGES[0]);

  useEffect(() => {
    sound.enabled = saveState.soundEnabled;
    persistSaveState(saveState);
  }, [saveState]);

  const handleToggleSound = useCallback(() => {
    setSaveState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  const handleAddCoins = useCallback((amount: number) => {
    if (amount <= 0) return;
    setSaveState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      totalEarned: prev.totalEarned + amount,
    }));
  }, []);

  const handleStartStage = useCallback((stage: StageConfig) => {
    setActiveStage(stage);
    setScreen('CLEANING_STAGE');
  }, []);

  const handleStageWin = useCallback(
    ({
      stageId,
      stars,
      totalCoinsEarned,
    }: {
      stageId: number;
      stars: number;
      totalCoinsEarned: number;
      elapsedSeconds: number;
    }) => {
      setSaveState((prev) => {
        const nextUnlocked = Math.min(STAGES.length, Math.max(prev.unlockedStage, stageId + 1));
        const prevBestStars = prev.stageStars[stageId] || 0;
        return {
          ...prev,
          coins: prev.coins + totalCoinsEarned,
          totalEarned: prev.totalEarned + totalCoinsEarned,
          unlockedStage: nextUnlocked,
          roomsCleanedCount: prev.roomsCleanedCount + 1,
          stageStars: {
            ...prev.stageStars,
            [stageId]: Math.max(prevBestStars, stars),
          },
        };
      });
    },
    []
  );

  const handleUpgradeTool = useCallback((toolId: ToolId) => {
    setSaveState((prev) => {
      const currentLevel = prev.toolLevels[toolId] || 1;
      if (currentLevel >= MAX_TOOL_LEVEL) return prev;
      const cost = getToolUpgradeCost(toolId, currentLevel);
      if (prev.coins < cost) return prev;

      sound.playUpgrade();

      return {
        ...prev,
        coins: prev.coins - cost,
        toolLevels: {
          ...prev.toolLevels,
          [toolId]: currentLevel + 1,
        },
      };
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4EF] text-[#1C1917]">
      <TopBar
        currentScreen={screen}
        coins={saveState.coins}
        soundEnabled={saveState.soundEnabled}
        onNavigate={setScreen}
        onToggleSound={handleToggleSound}
      />

      <div className="flex-1">
        {screen === 'HOME_HUB' && (
          <HomeHub
            saveState={saveState}
            onStartStage={handleStartStage}
            onOpenCashGame={() => setScreen('CASH_MINIGAME')}
            onOpenShop={() => setScreen('TOOL_SHOP')}
          />
        )}

        {screen === 'CLEANING_STAGE' && (
          <CleaningStage
            stage={activeStage}
            saveState={saveState}
            onStageWin={handleStageWin}
            onInstantCoinEarned={handleAddCoins}
            onExitToHub={() => setScreen('HOME_HUB')}
            onGoToNextStage={(nextStage) => setActiveStage(nextStage)}
            onOpenCashGame={() => setScreen('CASH_MINIGAME')}
            onOpenShop={() => setScreen('TOOL_SHOP')}
          />
        )}

        {screen === 'CASH_MINIGAME' && (
          <CashMiniGame
            onAddCoins={handleAddCoins}
            onBackHome={() => setScreen('HOME_HUB')}
            onOpenShop={() => setScreen('TOOL_SHOP')}
          />
        )}

        {screen === 'TOOL_SHOP' && (
          <ToolShop
            saveState={saveState}
            onUpgradeTool={handleUpgradeTool}
            onBackHome={() => setScreen('HOME_HUB')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
