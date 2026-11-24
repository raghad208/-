import React from 'react';
import { ArrowRight, Check, Coins, TrendingUp } from 'lucide-react';
import {
  MAX_TOOL_LEVEL,
  TOOLS,
  getToolCoinBonusMultiplier,
  getToolPower,
  getToolUpgradeCost,
} from '../data/gameData';
import { SaveState, ToolId } from '../types/game';
import { ToolIcon } from './ToolIcon';

interface ToolShopProps {
  saveState: SaveState;
  onUpgradeTool: (toolId: ToolId) => void;
  onBackHome: () => void;
}

export const ToolShop: React.FC<ToolShopProps> = ({
  saveState,
  onUpgradeTool,
  onBackHome,
}) => {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-extrabold text-stone-900">
            متجر ترقية أدوات التنظيف
          </h1>
          <p className="text-stone-600 text-sm sm:text-base">
            استثمر أموالك لتسريع التنظيف ومضاعفة العملات المكتسبة من كل بقعة وقطعة قمامة.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:border-stone-300 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمراحل</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOOLS.map((tool) => {
          const level = saveState.toolLevels[tool.id];
          const isMax = level >= MAX_TOOL_LEVEL;
          const cost = isMax ? 0 : getToolUpgradeCost(tool.id, level);
          const canAfford = !isMax && saveState.coins >= cost;
          const currentPower = Math.round(getToolPower(level) * 100);
          const nextPower = isMax ? currentPower : Math.round(getToolPower(level + 1) * 100);
          const currentBonus = Math.round((getToolCoinBonusMultiplier(level) - 1) * 100);
          const nextBonus = isMax
            ? currentBonus
            : Math.round((getToolCoinBonusMultiplier(level + 1) - 1) * 100);

          return (
            <div
              key={tool.id}
              className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0">
                  <ToolIcon toolId={tool.id} className="w-10 h-10" />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-bold text-stone-900">
                      {tool.name}
                    </h2>
                    <span className="font-num text-xs font-bold text-teal-700">
                      المستوى {level} / {MAX_TOOL_LEVEL}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{tool.shortDesc}</p>
                  <p className="text-xs text-stone-500">مخصصة لـ: {tool.targetsLabel}</p>
                </div>
              </div>

              {/* Level Progress Segments */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-colors ${
                        step <= level ? 'bg-teal-600' : 'bg-stone-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 bg-stone-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                    <span>سرعة التنظيف:</span>
                    <span className="font-num font-bold text-stone-900">{currentPower}%</span>
                    {!isMax && (
                      <span className="font-num text-teal-700 font-semibold">← {nextPower}%</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>مكافأة المال:</span>
                    <span className="font-num font-bold text-stone-900">+{currentBonus}%</span>
                    {!isMax && (
                      <span className="font-num text-amber-700 font-semibold">← +{nextBonus}%</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between gap-4 pt-1">
                {isMax ? (
                  <div className="w-full py-3 rounded-xl bg-teal-50 text-teal-800 font-bold text-sm flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>تم الوصول للحد الأقصى</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => onUpgradeTool(tool.id)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                      canAfford
                        ? 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <span>ترقية للمستوى {level + 1}</span>
                    <span aria-hidden="true">·</span>
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="font-num">{cost.toLocaleString('en-US')}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
