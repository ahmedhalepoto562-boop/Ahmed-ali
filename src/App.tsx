/**
 * Blade Fruit: Dojo Slicer
 * Main Application Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, GameStatus, GameStats, FruitVariety } from './game/types';
import { loadGameStats, updateStatsAfterGame, saveGameStats } from './game/storage';
import { audio } from './game/audio';
import { FruitGameCanvas } from './game/FruitGameCanvas';
import { Header } from './components/Header';
import { TitleScreen } from './components/TitleScreen';
import { InGameHUD } from './components/InGameHUD';
import { GameOverModal } from './components/GameOverModal';
import { ArmoryModal } from './components/ArmoryModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('TITLE_MENU');
  const [mode, setMode] = useState<GameMode>('CLASSIC');
  const [score, setScore] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(mode === 'ZEN' ? 90 : 60);
  const [stats, setStats] = useState<GameStats>(() => loadGameStats());
  const [isArmoryOpen, setIsArmoryOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getMuted());

  // Round summary state for GameOver modal
  const [roundSummary, setRoundSummary] = useState<{
    score: number;
    highScore: number;
    isNewHighScore: boolean;
    fruitsCut: number;
    highestCombo: number;
    bombsDodged: number;
    newlyUnlockedBlades: string[];
  }>({
    score: 0,
    highScore: 0,
    isNewHighScore: false,
    fruitsCut: 0,
    highestCombo: 0,
    bombsDodged: 0,
    newlyUnlockedBlades: [],
  });

  // Keyboard shortcut for pausing (Esc or P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (status === 'PLAYING') {
          setStatus('PAUSED');
        } else if (status === 'PAUSED') {
          setStatus('PLAYING');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  const handleStartGame = useCallback(() => {
    setScore(0);
    setStrikes(0);
    setTimeLeft(mode === 'ZEN' ? 90 : 60);
    setStatus('PLAYING');
  }, [mode]);

  const handleGameOver = useCallback(
    (finalScore: number, fruitsCut: number, maxCombo: number, bombsDodged: number) => {
      const prevHighScore =
        mode === 'CLASSIC'
          ? stats.classicHighScore
          : mode === 'ZEN'
          ? stats.zenHighScore
          : stats.arcadeHighScore;

      const isNewHigh = finalScore > prevHighScore;

      const { updatedStats, newlyUnlocked } = updateStatsAfterGame(
        stats,
        mode,
        finalScore,
        fruitsCut,
        maxCombo,
        bombsDodged
      );

      setStats(updatedStats);

      setRoundSummary({
        score: finalScore,
        highScore: Math.max(prevHighScore, finalScore),
        isNewHighScore: isNewHigh,
        fruitsCut,
        highestCombo: maxCombo,
        bombsDodged,
        newlyUnlockedBlades: newlyUnlocked,
      });

      setStatus('GAME_OVER');
    },
    [stats, mode]
  );

  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    setTimeLeft(newMode === 'ZEN' ? 90 : 60);
  };

  const handleToggleMute = () => {
    const nextMuted = audio.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSelectBlade = (bladeId: string) => {
    const updated = { ...stats, selectedBlade: bladeId };
    setStats(updated);
    saveGameStats(updated);
  };

  const handleSelectDojo = (dojoId: string) => {
    const updated = { ...stats, selectedDojo: dojoId };
    setStats(updated);
    saveGameStats(updated);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 select-none">
      {/* 1. Header (visible on title screen & game over) */}
      <Header
        status={status}
        mode={mode}
        onSelectMode={handleSelectMode}
        onOpenArmory={() => setIsArmoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onStartGame={handleStartGame}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* 2. Central Full-Screen Interactive Game Canvas */}
      <FruitGameCanvas
        status={status}
        mode={mode}
        selectedBlade={stats.selectedBlade}
        selectedDojo={stats.selectedDojo}
        onScoreChange={setScore}
        onStrikesChange={setStrikes}
        onTimeChange={setTimeLeft}
        onFruitSliced={(_variety: FruitVariety) => {}}
        onCombo={(_count: number) => {}}
        onBombDodged={() => {}}
        onGameOver={handleGameOver}
        onStartGame={handleStartGame}
      />

      {/* 3. Title Screen Overlay */}
      {status === 'TITLE_MENU' && (
        <TitleScreen
          mode={mode}
          onSelectMode={handleSelectMode}
          stats={stats}
          onStartGame={handleStartGame}
          onOpenArmory={() => setIsArmoryOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* 4. In-Game HUD (Score, Strikes, Timer, Pause modal) */}
      {(status === 'PLAYING' || status === 'PAUSED') && (
        <InGameHUD
          score={score}
          strikes={strikes}
          timeLeft={timeLeft}
          mode={mode}
          isPaused={status === 'PAUSED'}
          isMuted={isMuted}
          onTogglePause={() => setStatus(status === 'PAUSED' ? 'PLAYING' : 'PAUSED')}
          onRestart={handleStartGame}
          onQuitToMenu={() => setStatus('TITLE_MENU')}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 5. Game Over / Victory Modal */}
      {status === 'GAME_OVER' && (
        <GameOverModal
          score={roundSummary.score}
          highScore={roundSummary.highScore}
          isNewHighScore={roundSummary.isNewHighScore}
          fruitsCut={roundSummary.fruitsCut}
          highestCombo={roundSummary.highestCombo}
          bombsDodged={roundSummary.bombsDodged}
          mode={mode}
          newlyUnlockedBlades={roundSummary.newlyUnlockedBlades}
          onPlayAgain={handleStartGame}
          onBackToMenu={() => setStatus('TITLE_MENU')}
        />
      )}

      {/* 6. Armory Modal (Blades & Dojos) */}
      <ArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        selectedBlade={stats.selectedBlade}
        onSelectBlade={handleSelectBlade}
        selectedDojo={stats.selectedDojo}
        onSelectDojo={handleSelectDojo}
        unlockedBlades={stats.unlockedBlades}
        totalFruitsCut={stats.totalFruitsCut}
        highestCombo={stats.highestCombo}
      />

      {/* 7. Help & Rules Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
