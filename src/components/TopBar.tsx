import React from 'react';
import { Coins, Volume2, VolumeX } from 'lucide-react';
import { GameScreen } from '../types/game';

interface TopBarProps {
  currentScreen: GameScreen;
  coins: number;
  soundEnabled: boolean;
  onNavigate: (screen: GameScreen) => void;
  onToggleSound: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentScreen,
  coins,
  soundEnabled,
  onNavigate,
  onToggleSound,
}) => {
  const navItems: { id: GameScreen; label: string }[] = [
    { id: 'HOME_HUB', label: 'المراحل' },
    { id: 'CASH_MINIGAME', label: 'تحدي المال' },
    { id: 'TOOL_SHOP', label: 'متجر الأدوات' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F6F4EF]/95 backdrop-blur-sm border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('HOME_HUB')}
          className="font-display text-xl font-extrabold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-teal-700 transition-colors cursor-pointer"
        >
          بيتي النظيف
        </button>

        {/* Zone 2: Clean Text Navigation */}
        <nav className="flex items-center gap-4 sm:gap-7 text-sm font-medium">
          {navItems.map((item) => {
            const isActive =
              currentScreen === item.id ||
              (item.id === 'HOME_HUB' && currentScreen === 'CLEANING_STAGE');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-teal-700 font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-teal-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Wallet & Sound Control */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-1.5 shadow-xs"
            title="رصيدك من العملات"
          >
            <Coins className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-num text-sm font-bold text-stone-900 tabular-nums whitespace-nowrap">
              {coins.toLocaleString('en-US')}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
            className="p-2 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
