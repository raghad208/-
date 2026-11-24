import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  RotateCcw,
  Sparkles,
  Star,
  Timer,
  Wand2,
} from 'lucide-react';
import {
  STAGES,
  TOOL_MAP,
  TOOLS,
  generateStageMess,
  getToolCoinBonusMultiplier,
  getToolPower,
} from '../data/gameData';
import {
  BonusCoin,
  FloatingEffect,
  MessItem,
  SaveState,
  StageConfig,
  ToolId,
} from '../types/game';
import { sound } from '../utils/sound';
import { MessVisual } from './MessVisual';
import { ToolIcon } from './ToolIcon';

interface CleaningStageProps {
  stage: StageConfig;
  saveState: SaveState;
  onStageWin: (payload: {
    stageId: number;
    stars: number;
    totalCoinsEarned: number;
    elapsedSeconds: number;
  }) => void;
  onInstantCoinEarned: (amount: number) => void;
  onExitToHub: () => void;
  onGoToNextStage: (nextStage: StageConfig) => void;
  onOpenCashGame: () => void;
  onOpenShop: () => void;
}

export const CleaningStage: React.FC<CleaningStageProps> = ({
  stage,
  saveState,
  onStageWin,
  onInstantCoinEarned,
  onExitToHub,
  onGoToNextStage,
  onOpenCashGame,
  onOpenShop,
}) => {
  const [messItems, setMessItems] = useState<MessItem[]>(() => generateStageMess(stage));
  const [initialTotalCount, setInitialTotalCount] = useState<number>(() => messItems.length);
  const [selectedTool, setSelectedTool] = useState<ToolId>('broom');
  const [autoTool, setAutoTool] = useState<boolean>(false);
  const [suggestedTool, setSuggestedTool] = useState<ToolId | null>(null);
  const [bonusCoins, setBonusCoins] = useState<BonusCoin[]>([]);
  const [effects, setEffects] = useState<FloatingEffect[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [stageCoinsEarned, setStageCoinsEarned] = useState<number>(0);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 50,
    y: 50,
    visible: false,
  });
  const [completedSummary, setCompletedSummary] = useState<{
    stars: number;
    itemsCash: number;
    completionBonus: number;
    speedBonus: number;
    total: number;
  } | null>(null);

  const stageAreaRef = useRef<HTMLDivElement | null>(null);
  const messItemsRef = useRef<MessItem[]>(messItems);
  const lastScrubTickRef = useRef<Record<string, number>>({});
  const comboRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });
  const stageCoinsRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);

  // Reset stage when stage prop changes
  useEffect(() => {
    const freshMess = generateStageMess(stage);
    messItemsRef.current = freshMess;
    setMessItems(freshMess);
    setInitialTotalCount(freshMess.length);
    setBonusCoins([]);
    setEffects([]);
    setElapsedSeconds(0);
    setStageCoinsEarned(0);
    stageCoinsRef.current = 0;
    completedRef.current = false;
    setCompletedSummary(null);
    setSuggestedTool(null);
  }, [stage]);

  // Timer
  useEffect(() => {
    if (completedSummary) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [completedSummary]);

  // Expire uncollected bonus coins cleanly
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setBonusCoins((prev) => prev.filter((c) => c.expiresAt > now));
    }, 500);
    return () => window.clearInterval(interval);
  }, []);

  // Keyboard shortcuts 1-4 for tools
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '1') setSelectedTool('broom');
      if (e.key === '2') setSelectedTool('sponge');
      if (e.key === '3') setSelectedTool('mop');
      if (e.key === '4') setSelectedTool('duster');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Release pointer globally
  useEffect(() => {
    const handleUp = () => setIsPointerDown(false);
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, []);

  const addEffect = useCallback(
    (x: number, y: number, type: FloatingEffect['type'], text?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setEffects((prev) => [...prev.slice(-18), { id, x, y, type, text }]);
      window.setTimeout(() => {
        setEffects((prev) => prev.filter((ef) => ef.id !== id));
      }, 900);
    },
    []
  );

  const cleanlinessPercent = useMemo(() => {
    if (initialTotalCount === 0) return 100;
    const totalHpRemaining = messItems.reduce((sum, m) => sum + m.hp / m.maxHp, 0);
    const ratio = 1 - totalHpRemaining / initialTotalCount;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  }, [messItems, initialTotalCount]);

  // Handle completing the stage once all mess is gone
  const finishStage = useCallback(
    (finalElapsed: number, finalItemsCash: number) => {
      if (completedRef.current) return;
      completedRef.current = true;

      let stars = 1;
      if (finalElapsed <= stage.parTimeSeconds) stars = 3;
      else if (finalElapsed <= stage.parTimeSeconds * 1.45) stars = 2;

      const completionBonus = stage.baseReward;
      const speedBonus =
        stars === 3
          ? Math.round(stage.baseReward * 0.4)
          : stars === 2
          ? Math.round(stage.baseReward * 0.15)
          : 0;
      const bonusTotal = completionBonus + speedBonus;

      sound.playStageVictory();

      onStageWin({
        stageId: stage.id,
        stars,
        totalCoinsEarned: bonusTotal,
        elapsedSeconds: finalElapsed,
      });

      setCompletedSummary({
        stars,
        itemsCash: finalItemsCash,
        completionBonus,
        speedBonus,
        total: finalItemsCash + bonusTotal,
      });
    },
    [onStageWin, stage]
  );

  const interactWithMess = useCallback(
    (item: MessItem, isClick: boolean) => {
      if (completedRef.current) return;

      const now = Date.now();
      // Throttle continuous scrubbing ticks to every 95ms per item
      if (!isClick && now - (lastScrubTickRef.current[item.id] || 0) < 95) {
        return;
      }
      lastScrubTickRef.current[item.id] = now;

      let activeTool = selectedTool;
      if (autoTool && activeTool !== item.requiredTool) {
        activeTool = item.requiredTool;
        setSelectedTool(item.requiredTool);
      }

      if (activeTool !== item.requiredTool) {
        if (isClick) {
          sound.playWrongTool();
          setSuggestedTool(item.requiredTool);
          addEffect(item.x, item.y - 4, 'hint', `استخدم ${TOOL_MAP[item.requiredTool].name}!`);
          window.setTimeout(() => {
            setSuggestedTool((curr) => (curr === item.requiredTool ? null : curr));
          }, 1200);
        }
        return;
      }

      const currentItem = messItemsRef.current.find((m) => m.id === item.id);
      if (!currentItem) return;

      const toolLevel = saveState.toolLevels[activeTool] || 1;
      const power = getToolPower(toolLevel);
      const damage = isClick ? power * 1.15 : power * 0.72;

      const nextHp = currentItem.hp - damage;
      const isCleaned = nextHp <= 0.05;

      const nextList = isCleaned
        ? messItemsRef.current.filter((m) => m.id !== item.id)
        : messItemsRef.current.map((m) => (m.id === item.id ? { ...m, hp: nextHp } : m));

      messItemsRef.current = nextList;
      setMessItems(nextList);

      if (isCleaned) {
        // Combo check
        if (now - comboRef.current.lastTime < 2200) {
          comboRef.current.count += 1;
        } else {
          comboRef.current.count = 1;
        }
        comboRef.current.lastTime = now;

        const comboBonus = comboRef.current.count >= 3 ? 4 : 0;
        const coinMult = getToolCoinBonusMultiplier(toolLevel);
        const earned = Math.round(currentItem.reward * coinMult) + comboBonus;

        stageCoinsRef.current += earned;
        setStageCoinsEarned(stageCoinsRef.current);
        onInstantCoinEarned(earned);

        if (currentItem.kind === 'trash') {
          sound.playPop();
        } else {
          sound.playCoin();
        }

        addEffect(
          currentItem.x,
          currentItem.y,
          'coin',
          comboBonus > 0 ? `+${earned} (سلسلة!)` : `+${earned}`
        );
        addEffect(currentItem.x, currentItem.y, 'sparkle');

        // Reveal hidden bonus coin if present
        if (currentItem.hasBonusCoin) {
          const bonusId = `bonus-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          setBonusCoins((prev) => [
            ...prev,
            {
              id: bonusId,
              x: Math.max(10, Math.min(90, currentItem.x + (Math.random() - 0.5) * 6)),
              y: Math.max(14, Math.min(88, currentItem.y)),
              value: 25 + stage.id * 5,
              expiresAt: Date.now() + 7000,
            },
          ]);
        }

        if (nextList.length === 0 && !completedRef.current) {
          window.setTimeout(() => {
            finishStage(elapsedSeconds, stageCoinsRef.current);
          }, 320);
        }
      } else {
        // Still scrubbing
        if (currentItem.kind === 'stain' || currentItem.kind === 'puddle') {
          sound.playScrub();
          addEffect(currentItem.x + (Math.random() - 0.5) * 4, currentItem.y, 'bubble');
        } else {
          sound.playPop();
        }
      }
    },
    [
      addEffect,
      autoTool,
      elapsedSeconds,
      finishStage,
      onInstantCoinEarned,
      saveState.toolLevels,
      selectedTool,
      stage.id,
    ]
  );

  const collectBonusCoin = (coin: BonusCoin) => {
    sound.playGem();
    setBonusCoins((prev) => prev.filter((c) => c.id !== coin.id));
    stageCoinsRef.current += coin.value;
    setStageCoinsEarned(stageCoinsRef.current);
    onInstantCoinEarned(coin.value);
    addEffect(coin.x, coin.y, 'coin', `+${coin.value} ذهبية!`);
    addEffect(coin.x, coin.y, 'sparkle');
  };

  const handleRestartStage = () => {
    const freshMess = generateStageMess(stage);
    messItemsRef.current = freshMess;
    setMessItems(freshMess);
    setInitialTotalCount(freshMess.length);
    setBonusCoins([]);
    setEffects([]);
    setElapsedSeconds(0);
    setStageCoinsEarned(0);
    stageCoinsRef.current = 0;
    completedRef.current = false;
    setCompletedSummary(null);
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageAreaRef.current) return;
    const rect = stageAreaRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPos({ x: xPct, y: yPct, visible: e.pointerType === 'mouse' });
  };

  const nextStageObj = STAGES.find((s) => s.id === stage.id + 1);
  const dirtOpacity = Math.max(0, (100 - cleanlinessPercent) / 100);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-4">
      {/* Top HUD Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitToHub}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>خروج</span>
          </button>

          <div>
            <div className="text-xs text-stone-500">
              المرحلة {stage.id} <span aria-hidden="true">·</span> {stage.roomName}
            </div>
            <h1 className="font-display text-lg font-bold text-stone-900 leading-snug">
              {stage.title}
            </h1>
          </div>
        </div>

        {/* Cleanliness Progress Meter */}
        <div className="flex-1 min-w-[200px] max-w-md space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-stone-700">نسبة نظافة الغرفة</span>
            <span className="font-num text-teal-700 font-bold">
              {cleanlinessPercent}% · متبقي {messItems.length}
            </span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200/70">
            <div
              className="h-full bg-teal-600 transition-all duration-200 rounded-full"
              style={{ width: `${cleanlinessPercent}%` }}
            />
          </div>
        </div>

        {/* Timer, Stage Earnings & Auto-Tool */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
            <Timer className="w-4 h-4 text-stone-500" />
            <span className="font-num font-semibold">{elapsedSeconds}ث</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="font-num font-bold">+{stageCoinsEarned}</span>
          </div>

          <button
            type="button"
            onClick={() => setAutoTool((v) => !v)}
            title="تبديل الأداة تلقائياً عند لمس أي اتساخ"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
              autoTool
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>تبديل تلقائي</span>
          </button>
        </div>
      </div>

      {/* Interactive Room Canvas */}
      <div
        ref={stageAreaRef}
        onPointerDown={() => setIsPointerDown(true)}
        onPointerMove={handleStagePointerMove}
        onPointerLeave={() => setCursorPos((p) => ({ ...p, visible: false }))}
        className="relative w-full aspect-[16/9] max-h-[64vh] mx-auto rounded-2xl overflow-hidden border border-stone-300 bg-stone-200 shadow-sm select-none touch-none"
      >
        {/* Clean Room Illustration */}
        <img
          src={stage.image}
          alt={stage.roomName}
          draggable={false}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover pointer-events-none transition-[filter] duration-500"
          style={{
            filter: `sepia(${dirtOpacity * 0.38}) saturate(${1 - dirtOpacity * 0.25}) brightness(${
              1 - dirtOpacity * 0.14
            })`,
          }}
        />

        {/* Atmospheric Grime / Dust Vignette Overlay (fades away as room gets clean) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: dirtOpacity * 0.65,
            background:
              'radial-gradient(circle at 50% 50%, rgba(120, 90, 50, 0.08) 25%, rgba(68, 52, 34, 0.42) 100%)',
          }}
        />

        {/* Interactive Mess Items */}
        {messItems.map((item) => {
          const hpRatio = Math.max(0.2, item.hp / item.maxHp);
          const scale = item.kind === 'trash' ? 1 : 0.68 + hpRatio * 0.34;
          const matchesSelected = autoTool || selectedTool === item.requiredTool;

          return (
            <button
              key={item.id}
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                setIsPointerDown(true);
                interactWithMess(item, true);
              }}
              onPointerEnter={() => {
                if (isPointerDown) {
                  interactWithMess(item, false);
                }
              }}
              onPointerMove={() => {
                if (isPointerDown) {
                  interactWithMess(item, false);
                }
              }}
              aria-label={`اتساخ يحتاج إلى ${TOOL_MAP[item.requiredTool].name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-transform duration-100 focus:outline-none ${
                matchesSelected ? 'cursor-pointer hover:scale-110' : 'cursor-pointer'
              }`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${item.size}px`,
                height: `${item.size}px`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${scale})`,
              }}
            >
              <MessVisual variant={item.variant} hpRatio={hpRatio} />

              {/* Subtle scrub progress ring for multi-hit stains/puddles */}
              {item.hp < item.maxHp && (
                <span className="absolute -bottom-2 inset-x-2 h-1.5 bg-black/25 rounded-full overflow-hidden pointer-events-none">
                  <span
                    className="block h-full bg-teal-400 rounded-full"
                    style={{ width: `${Math.max(8, (item.hp / item.maxHp) * 100)}%` }}
                  />
                </span>
              )}
            </button>
          );
        })}

        {/* Hidden Golden Bonus Coins */}
        {bonusCoins.map((coin) => (
          <button
            key={coin.id}
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              collectBonusCoin(coin);
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-amber-400 border-2 border-amber-100 shadow-lg flex items-center justify-center text-amber-950 font-num font-extrabold text-xs animate-bounce cursor-pointer z-20"
            style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
            title="اضغط لجمع المكافأة الذهبية!"
          >
            +{coin.value}
          </button>
        ))}

        {/* Floating Particles & Effects */}
        {effects.map((ef) => (
          <div
            key={ef.id}
            className="absolute pointer-events-none z-30"
            style={{ left: `${ef.x}%`, top: `${ef.y}%` }}
          >
            {ef.type === 'coin' && (
              <div className="animate-float-up bg-amber-500 text-stone-950 font-num font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md whitespace-nowrap">
                {ef.text}
              </div>
            )}
            {ef.type === 'hint' && (
              <div className="animate-float-up bg-stone-900/90 text-white font-semibold text-xs px-3 py-1 rounded-lg shadow-md whitespace-nowrap">
                {ef.text}
              </div>
            )}
            {ef.type === 'bubble' && (
              <div className="animate-bubble-pop w-6 h-6 rounded-full bg-teal-100/80 border border-teal-400" />
            )}
            {ef.type === 'sparkle' && (
              <div className="animate-sparkle-burst text-amber-300">
                <Sparkles className="w-8 h-8 fill-amber-300 drop-shadow" />
              </div>
            )}
          </div>
        ))}

        {/* Custom Tool Pointer Follower (Desktop mouse) */}
        {cursorPos.visible && !completedSummary && (
          <div
            className="absolute pointer-events-none z-40 transition-transform duration-75"
            style={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              transform: `translate(-25%, -75%) rotate(${isPointerDown ? '-18deg' : '0deg'}) scale(${
                isPointerDown ? 1.12 : 1
              })`,
            }}
          >
            <div className="w-11 h-11 rounded-full bg-white/85 backdrop-blur-xs border border-stone-300 shadow-md flex items-center justify-center">
              <ToolIcon toolId={selectedTool} className="w-7 h-7" />
            </div>
          </div>
        )}

        {/* Stage Completion Overlay */}
        {completedSummary && (
          <div className="absolute inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 text-center shadow-2xl">
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={`w-9 h-9 ${
                      n <= completedSummary.stars
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-teal-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم تنظيف الغرفة بالكامل!</span>
                </div>
                <h2 className="font-display text-2xl font-extrabold text-stone-900">
                  {stage.roomName} تلمع بالنظافة
                </h2>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>أرباح التنظيف المباشرة</span>
                  <span className="font-num font-bold text-stone-900">
                    +{completedSummary.itemsCash}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>مكافأة إتمام المرحلة</span>
                  <span className="font-num font-bold text-stone-900">
                    +{completedSummary.completionBonus}
                  </span>
                </div>
                {completedSummary.speedBonus > 0 && (
                  <div className="flex justify-between text-teal-700 font-medium">
                    <span>مكافأة السرعة</span>
                    <span className="font-num font-bold">+{completedSummary.speedBonus}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-base text-amber-700">
                  <span>إجمالي المال المكتسب</span>
                  <span className="font-num">+{completedSummary.total} عملة</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {nextStageObj ? (
                  <button
                    type="button"
                    onClick={() => onGoToNextStage(nextStageObj)}
                    className="col-span-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    المرحلة التالية: {nextStageObj.roomName}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRestartStage}
                    className="col-span-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    أعد اللعب لربح المزيد
                  </button>
                )}

                <button
                  type="button"
                  onClick={onOpenCashGame}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  تحدي جمع المال
                </button>

                <button
                  type="button"
                  onClick={onOpenShop}
                  className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  متجر الأدوات
                </button>

                <button
                  type="button"
                  onClick={handleRestartStage}
                  className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة</span>
                </button>

                <button
                  type="button"
                  onClick={onExitToHub}
                  className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  قائمة المراحل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tool Dock */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOOLS.map((tool) => {
            const isSelected = selectedTool === tool.id;
            const isSuggested = suggestedTool === tool.id;
            const level = saveState.toolLevels[tool.id] || 1;
            const remainingForTool = messItems.filter((m) => m.requiredTool === tool.id).length;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setSelectedTool(tool.id);
                  setSuggestedTool(null);
                }}
                className={`relative flex items-center gap-3 p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-600 shadow-xs'
                    : isSuggested
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/50'
                    : 'bg-stone-50/70 border-stone-200 hover:border-stone-300 hover:bg-stone-100/70'
                }`}
              >
                <div className="w-11 h-11 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0">
                  <ToolIcon toolId={tool.id} className="w-7 h-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-display font-bold text-sm text-stone-900 truncate">
                      {tool.name}
                    </span>
                    <span className="font-num text-[11px] font-semibold text-stone-400">
                      [{tool.hotkey}]
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 truncate">{tool.targetsLabel}</div>
                  <div className="text-[11px] font-num font-semibold text-teal-700 mt-0.5">
                    م. {level} · متبقي {remainingForTool}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
};
