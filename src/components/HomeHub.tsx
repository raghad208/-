import React from 'react';
import { Coins, Lock, Play, Star, Wrench, ArrowLeft } from 'lucide-react';
import { STAGES } from '../data/gameData';
import { SaveState, StageConfig } from '../types/game';

interface HomeHubProps {
  saveState: SaveState;
  onStartStage: (stage: StageConfig) => void;
  onOpenCashGame: () => void;
  onOpenShop: () => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({
  saveState,
  onStartStage,
  onOpenCashGame,
  onOpenShop,
}) => {
  const totalStars = Object.values(saveState.stageStars).reduce((sum, s) => sum + s, 0);
  const maxStars = STAGES.length * 3;
  const nextStage =
    STAGES.find((s) => s.id === saveState.unlockedStage) || STAGES[STAGES.length - 1];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      {/* Hero / Primary Callout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <span>{saveState.roomsCleanedCount} غرف تم تنظيفها</span>
              <span aria-hidden="true">·</span>
              <span className="font-num">{totalStars}/{maxStars} نجوم</span>
              <span aria-hidden="true">·</span>
              <span className="font-num">{saveState.totalEarned.toLocaleString('en-US')} إجمالي الأرباح</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
              حوّل المنزل المتسخ إلى بيتٍ يلمع واكسب المال
            </h1>
            <p className="text-stone-600 text-base leading-relaxed max-w-xl">
              اختر المرحلة المناسبة، استخدم أدوات التنظيف الأربع لإزالة القمامة والبقع والغبار، ثم طوّر معداتك أو ادخل تحدي جمع المال لمضاعفة ثروتك.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onStartStage(nextStage)}
              className="inline-flex items-center gap-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ابدأ المرحلة {nextStage.id}: {nextStage.roomName}</span>
            </button>

            <button
              type="button"
              onClick={onOpenShop}
              className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold px-5 py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <Wrench className="w-4 h-4" />
              <span>ترقية الأدوات</span>
            </button>
          </div>
        </div>

        {/* Dedicated Cash Mini-Game Spotlight Card */}
        <div className="lg:col-span-5 bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
              <span>لعبة جانبية سريعة</span>
              <span aria-hidden="true">·</span>
              <span>25 ثانية</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              تحدي جمع المال
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              تحتاج عملات إضافية لشراء ممسحة أو إسفنجة أقوى؟ التقط العملات الذهبية والحزم النقدية والجواهر قبل سقوطها وتجنّب أكياس القمامة.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-stone-800">
            <div className="flex items-center gap-2 text-sm text-stone-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>مكافآت فورية لرصيدك</span>
            </div>
            <button
              type="button"
              onClick={onOpenCashGame}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>العب لجمع المال</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Stages Grid */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-stone-900">
            مراحل تنظيف المنزل
          </h2>
          <span className="text-sm text-stone-500">
            {saveState.unlockedStage} من {STAGES.length} مراحل مفتوحة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STAGES.map((stage) => {
            const isUnlocked = stage.id <= saveState.unlockedStage;
            const stars = saveState.stageStars[stage.id] || 0;
            const totalMess =
              stage.messCount.trash +
              stage.messCount.stain +
              stage.messCount.puddle +
              stage.messCount.cobweb;

            return (
              <div
                key={stage.id}
                className={`group bg-white border rounded-2xl overflow-hidden flex flex-col transition-all ${
                  isUnlocked
                    ? 'border-stone-200 hover:border-teal-600/60 hover:shadow-md'
                    : 'border-stone-200/70 opacity-75'
                }`}
              >
                {/* Room Thumbnail */}
                <div className="relative aspect-[16/9] bg-stone-200 overflow-hidden">
                  <img
                    src={stage.image}
                    alt={stage.roomName}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isUnlocked ? 'group-hover:scale-103' : 'grayscale-[65%] brightness-75'
                    }`}
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-stone-950/45 flex flex-col items-center justify-center gap-1.5 text-white">
                      <Lock className="w-6 h-6" />
                      <span className="text-xs font-semibold">أكمل المرحلة {stage.id - 1} للفتح</span>
                    </div>
                  )}
                </div>

                {/* Stage Details */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <span>المرحلة {stage.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{stage.difficulty}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-num">{totalMess} مهمة</span>
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-0.5" aria-label={`${stars} من 3 نجوم`}>
                        {[1, 2, 3].map((n) => (
                          <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${
                              n <= stars ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-bold text-stone-900">
                      {stage.title}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                      {stage.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
                      <Coins className="w-4 h-4 text-amber-600" />
                      <span className="font-num">+{stage.baseReward}</span>
                      <span className="text-xs font-normal text-stone-500">مكافأة</span>
                    </div>

                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => onStartStage(stage)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                        isUnlocked
                          ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {stars > 0 ? 'إعادة التنظيف' : 'نظّف الغرفة'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
