import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Coins, Play, RotateCcw, Sparkles, Timer } from 'lucide-react';
import { sound } from '../utils/sound';

interface CashMiniGameProps {
  onAddCoins: (amount: number) => void;
  onBackHome: () => void;
  onOpenShop: () => void;
}

type FallingKind = 'coin' | 'bill' | 'gem' | 'bomb';

interface FallingItem {
  id: number;
  kind: FallingKind;
  x: number; // 8 - 92%
  y: number; // -8 - 105%
  speed: number; // % per second
  value: number;
  rotation: number;
}

interface PopMessage {
  id: number;
  x: number;
  y: number;
  text: string;
  positive: boolean;
}

const ROUND_DURATION = 25;

export const CashMiniGame: React.FC<CashMiniGameProps> = ({
  onAddCoins,
  onBackHome,
  onOpenShop,
}) => {
  const [phase, setPhase] = useState<'READY' | 'PLAYING' | 'FINISHED'>('READY');
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_DURATION);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [bagX, setBagX] = useState<number>(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [pops, setPops] = useState<PopMessage[]>([]);

  const arenaRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const bagXRef = useRef<number>(50);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(1);
  const nextIdRef = useRef<number>(1);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const payoutDoneRef = useRef<boolean>(false);

  const spawnPop = useCallback((x: number, y: number, text: string, positive: boolean) => {
    const id = nextIdRef.current++;
    setPops((prev) => [...prev.slice(-12), { id, x, y, text, positive }]);
    window.setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== id));
    }, 750);
  }, []);

  const collectItem = useCallback(
    (item: FallingItem) => {
      itemsRef.current = itemsRef.current.filter((it) => it.id !== item.id);
      setItems([...itemsRef.current]);

      if (item.kind === 'bomb') {
        sound.playWrongTool();
        comboRef.current = 1;
        setCombo(1);
        scoreRef.current = Math.max(0, scoreRef.current - 25);
        setScore(scoreRef.current);
        spawnPop(item.x, item.y, '-25 قمامة!', false);
        return;
      }

      if (item.kind === 'gem') {
        sound.playGem();
      } else {
        sound.playCoin();
      }

      const gained = item.value * comboRef.current;
      scoreRef.current += gained;
      setScore(scoreRef.current);

      const nextCombo = Math.min(4, comboRef.current + 1);
      comboRef.current = nextCombo;
      setCombo(nextCombo);

      spawnPop(
        item.x,
        item.y,
        comboRef.current > 1 ? `+${gained}` : `+${gained}`,
        true
      );
    },
    [spawnPop]
  );

  const startRound = () => {
    itemsRef.current = [];
    setItems([]);
    setPops([]);
    scoreRef.current = 0;
    comboRef.current = 1;
    payoutDoneRef.current = false;
    setScore(0);
    setCombo(1);
    setTimeLeft(ROUND_DURATION);
    setPhase('PLAYING');
  };

  // Keyboard controls for bag movement
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase('FINISHED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Pay out coins when round finishes
  useEffect(() => {
    if (phase === 'FINISHED' && !payoutDoneRef.current) {
      payoutDoneRef.current = true;
      if (scoreRef.current > 0) {
        onAddCoins(scoreRef.current);
        sound.playStageVictory();
      }
    }
  }, [phase, onAddCoins]);

  // Main 60fps simulation loop
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    let animId = 0;
    let lastTime = performance.now();
    let spawnAccumulator = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Keyboard bag movement (Note: in RTL, ArrowLeft visually moves left, so decrease X)
      if (keysRef.current.left) {
        bagXRef.current = Math.max(8, bagXRef.current - 68 * dt);
        setBagX(bagXRef.current);
      }
      if (keysRef.current.right) {
        bagXRef.current = Math.min(92, bagXRef.current + 68 * dt);
        setBagX(bagXRef.current);
      }

      // Spawn falling objects
      spawnAccumulator += dt;
      if (spawnAccumulator >= 0.42) {
        spawnAccumulator = 0;
        const roll = Math.random();
        let kind: FallingKind = 'coin';
        let value = 15;
        let speed = 34 + Math.random() * 14;

        if (roll < 0.16) {
          kind = 'bomb';
          value = -25;
          speed = 38 + Math.random() * 16;
        } else if (roll < 0.28) {
          kind = 'gem';
          value = 60;
          speed = 46 + Math.random() * 12;
        } else if (roll < 0.52) {
          kind = 'bill';
          value = 30;
          speed = 36 + Math.random() * 12;
        }

        itemsRef.current.push({
          id: nextIdRef.current++,
          kind,
          x: 8 + Math.random() * 84,
          y: -6,
          speed,
          value,
          rotation: Math.round((Math.random() - 0.5) * 26),
        });
      }

      // Move items and check collector bag collision
      const surviving: FallingItem[] = [];
      for (const item of itemsRef.current) {
        const nextY = item.y + item.speed * dt;
        const caughtByBag =
          nextY >= 81 && nextY <= 94 && Math.abs(item.x - bagXRef.current) <= 10.5;

        if (caughtByBag) {
          if (item.kind === 'bomb') {
            sound.playWrongTool();
            comboRef.current = 1;
            setCombo(1);
            scoreRef.current = Math.max(0, scoreRef.current - 25);
            setScore(scoreRef.current);
            spawnPop(item.x, 82, '-25', false);
          } else {
            if (item.kind === 'gem') sound.playGem();
            else sound.playCoin();
            const gained = item.value * comboRef.current;
            scoreRef.current += gained;
            setScore(scoreRef.current);
            const nextC = Math.min(4, comboRef.current + 1);
            comboRef.current = nextC;
            setCombo(nextC);
            spawnPop(item.x, 80, `+${gained}`, true);
          }
          continue;
        }

        if (nextY < 104) {
          surviving.push({ ...item, y: nextY });
        }
      }

      itemsRef.current = surviving;
      setItems(surviving);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [phase, spawnPop]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'PLAYING' || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const xPct = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
    bagXRef.current = xPct;
    setBagX(xPct);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Top HUD */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>المراحل</span>
          </button>

          <div>
            <h1 className="font-display text-lg font-bold text-stone-900">
              تحدي جمع المال
            </h1>
            <p className="text-xs text-stone-500">
              حرّك الحقيبة أو اضغط مباشرة على النقود لالتقاطها وتجنّب القمامة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl px-3.5 py-2 text-sm font-bold text-stone-800">
            <Timer className="w-4 h-4 text-stone-600" />
            <span className="font-num">{timeLeft}ث</span>
          </div>

          <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-xl px-3.5 py-2 text-sm font-bold text-teal-800">
            <span>المضاعف</span>
            <span className="font-num">x{combo}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm font-bold text-amber-800">
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="font-num">+{score.toLocaleString('en-US')}</span>
          </div>
        </div>
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        className="relative w-full h-[540px] max-h-[68vh] rounded-2xl overflow-hidden border border-stone-300 bg-gradient-to-b from-[#1C2A39] via-[#243B4A] to-[#1B2A34] select-none touch-none shadow-sm"
      >
        {/* Subtle decorative floor line */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-stone-900/50 border-t border-white/10 pointer-events-none" />

        {/* Falling Items */}
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (phase === 'PLAYING') collectItem(item);
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center cursor-pointer focus:outline-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
            }}
            aria-label={item.kind}
          >
            {item.kind === 'coin' && (
              <svg viewBox="0 0 44 44" className="w-11 h-11 drop-shadow-md">
                <circle cx="22" cy="22" r="18" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
                <circle cx="22" cy="22" r="13" fill="none" stroke="#FEF08A" strokeWidth="1.8" />
                <text x="22" y="27" textAnchor="middle" fill="#78350F" fontWeight="bold" fontSize="15">
                  $
                </text>
              </svg>
            )}
            {item.kind === 'bill' && (
              <svg viewBox="0 0 52 34" className="w-12 h-9 drop-shadow-md">
                <rect x="2" y="3" width="48" height="28" rx="4" fill="#10B981" stroke="#065F46" strokeWidth="2" />
                <rect x="7" y="8" width="38" height="18" rx="2" fill="none" stroke="#A7F3D0" strokeWidth="1.4" />
                <circle cx="26" cy="17" r="6" fill="#047857" />
                <text x="26" y="21" textAnchor="middle" fill="#ECFDF5" fontWeight="bold" fontSize="11">
                  $
                </text>
              </svg>
            )}
            {item.kind === 'gem' && (
              <svg viewBox="0 0 44 44" className="w-11 h-11 drop-shadow-md">
                <polygon
                  points="22,4 38,16 32,38 12,38 6,16"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="2.2"
                />
                <polygon points="22,4 30,16 22,38 14,16" fill="#BAE6FD" opacity="0.6" />
              </svg>
            )}
            {item.kind === 'bomb' && (
              <svg viewBox="0 0 44 44" className="w-11 h-11 drop-shadow-md">
                <path
                  d="M15 14L29 14L34 32C35 36 32 39 28 39H16C12 39 9 36 10 32L15 14Z"
                  fill="#44403C"
                  stroke="#1C1917"
                  strokeWidth="2"
                />
                <path d="M18 14L15 7L22 10L28 7L26 14" fill="#57534E" stroke="#1C1917" strokeWidth="1.6" />
                <path d="M17 22L27 32M27 22L17 32" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        ))}

        {/* Floating Score Popups */}
        {pops.map((pop) => (
          <div
            key={pop.id}
            className={`absolute pointer-events-none animate-float-up font-num font-extrabold text-sm px-2.5 py-0.5 rounded-full shadow ${
              pop.positive ? 'bg-amber-400 text-stone-950' : 'bg-red-600 text-white'
            }`}
            style={{ left: `${pop.x}%`, top: `${pop.y}%` }}
          >
            {pop.text}
          </div>
        ))}

        {/* Collector Cash Bag */}
        <div
          className="absolute bottom-3 -translate-x-1/2 pointer-events-none transition-[left] duration-75"
          style={{ left: `${bagX}%` }}
        >
          <div className="w-24 h-12 rounded-2xl bg-amber-500 border-2 border-amber-200 shadow-lg flex items-center justify-center gap-1.5 text-stone-950 font-bold text-xs">
            <Coins className="w-5 h-5" />
            <span>حقيبة المال</span>
          </div>
        </div>

        {/* Ready Overlay */}
        {phase === 'READY' && (
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-7 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Coins className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-extrabold text-stone-900">
                  جاهز لجمع المال؟
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed">
                  لديك 25 ثانية لجمع أكبر قدر من العملات الذهبية والحزم النقدية والجواهر. تجنّب أكياس القمامة لأنها تخصم 25 عملة وتعيد المضاعف.
                </p>
              </div>
              <button
                type="button"
                onClick={startRound}
                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>ابدأ التحدي الآن</span>
              </button>
            </div>
          </div>
        )}

        {/* Finished Overlay */}
        {phase === 'FINISHED' && (
          <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-7 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-extrabold text-stone-900">
                  انتهى الوقت!
                </h2>
                <p className="text-sm text-stone-600">
                  تمت إضافة الأرباح مباشرة إلى رصيدك
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl py-4 px-6">
                <div className="text-xs text-amber-800 font-semibold mb-1">المال المكتسب</div>
                <div className="font-num text-3xl font-extrabold text-amber-700">
                  +{score.toLocaleString('en-US')} عملة
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={startRound}
                  className="col-span-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>العب مرة أخرى</span>
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
                  onClick={onBackHome}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  العودة للمراحل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
