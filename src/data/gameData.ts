import { MessItem, MessKind, MessVariant, SaveState, StageConfig, ToolId, ToolInfo } from '../types/game';

export const TOOLS: ToolInfo[] = [
  {
    id: 'broom',
    name: 'المكنسة',
    shortDesc: 'تجمع القمامة والأوراق المبعثرة من الأرضيات والأسطح.',
    targetsLabel: 'القمامة والأوراق',
    baseCost: 120,
    hotkey: '1',
    accentHex: '#D97706',
  },
  {
    id: 'sponge',
    name: 'الإسفنجة',
    shortDesc: 'تفرك البقع العنيدة والطين والدهون برغوة الصابون.',
    targetsLabel: 'البقع والدهون',
    baseCost: 150,
    hotkey: '2',
    accentHex: '#0D9488',
  },
  {
    id: 'mop',
    name: 'الممسحة',
    shortDesc: 'تجفف برك الماء وانسكابات العصير والقهوة بسرعة.',
    targetsLabel: 'السوائل والبرك',
    baseCost: 180,
    hotkey: '3',
    accentHex: '#0284C7',
  },
  {
    id: 'duster',
    name: 'المنفضة',
    shortDesc: 'تزيل خيوط العنكبوت وسحب الغبار عن الجدران والنوافذ.',
    targetsLabel: 'الغبار والعنكبوت',
    baseCost: 160,
    hotkey: '4',
    accentHex: '#7C3AED',
  },
];

export const TOOL_MAP: Record<ToolId, ToolInfo> = TOOLS.reduce((acc, tool) => {
  acc[tool.id] = tool;
  return acc;
}, {} as Record<ToolId, ToolInfo>);

export const MAX_TOOL_LEVEL = 4;

export function getToolUpgradeCost(toolId: ToolId, currentLevel: number): number {
  const base = TOOL_MAP[toolId].baseCost;
  return Math.round(base * Math.pow(1.75, currentLevel - 1));
}

export function getToolPower(level: number): number {
  return 1 + (level - 1) * 0.65;
}

export function getToolCoinBonusMultiplier(level: number): number {
  return 1 + (level - 1) * 0.25;
}

export const STAGES: StageConfig[] = [
  {
    id: 1,
    title: 'تنظيف الصالة الصباحي',
    roomName: 'غرفة المعيشة',
    subtitle: 'رتّب الأوراق المبعثرة وامسح البقع الخفيفة لتستعيد الغرفة إشراقتها.',
    image: '/src/assets/images/room_living_clean_1795544382954.jpg',
    difficulty: 'سهل',
    baseReward: 160,
    parTimeSeconds: 45,
    messCount: { trash: 5, stain: 3, puddle: 2, cobweb: 3 },
  },
  {
    id: 2,
    title: 'مطبخ بعد الإفطار',
    roomName: 'المطبخ الحديث',
    subtitle: 'دهون على الرخام وانسكابات على البلاط تحتاج إلى إسفنجة وممسحة سريعة.',
    image: '/src/assets/images/room_kitchen_clean_1795544384567.jpg',
    difficulty: 'سهل',
    baseReward: 260,
    parTimeSeconds: 55,
    messCount: { trash: 5, stain: 5, puddle: 4, cobweb: 3 },
  },
  {
    id: 3,
    title: 'غرفة النوم المتربة',
    roomName: 'غرفة النوم',
    subtitle: 'تراكم الغبار وخيوط العنكبوت حول النوافذ والخزانة مع بعض الفوضى.',
    image: '/src/assets/images/room_bedroom_clean_1795544383096.jpg',
    difficulty: 'متوسط',
    baseReward: 380,
    parTimeSeconds: 65,
    messCount: { trash: 6, stain: 5, puddle: 4, cobweb: 6 },
  },
  {
    id: 4,
    title: 'تلميع الحمّام الهادئ',
    roomName: 'الحمّام الفاخر',
    subtitle: 'رغوة متناثرة وبرك ماء حول حوض الاستحمام وبقع على المرآة.',
    image: '/src/assets/images/room_bathroom_clean_1795544384432.jpg',
    difficulty: 'متوسط',
    baseReward: 520,
    parTimeSeconds: 70,
    messCount: { trash: 5, stain: 6, puddle: 7, cobweb: 4 },
  },
  {
    id: 5,
    title: 'فوضى ما بعد الحفلة',
    roomName: 'غرفة المعيشة الكبرى',
    subtitle: 'عبوات فارغة وبقع عصير كثيرة بعد سهرة الأصدقاء. مكافأة مالية مضاعفة.',
    image: '/src/assets/images/room_living_clean_1795544382954.jpg',
    difficulty: 'صعب',
    baseReward: 760,
    parTimeSeconds: 80,
    messCount: { trash: 9, stain: 7, puddle: 6, cobweb: 5 },
  },
  {
    id: 6,
    title: 'التحدي الكبير في المطبخ',
    roomName: 'المطبخ الملكي',
    subtitle: 'أقصى درجات الفوضى! طوّر أدواتك واكسب أعلى عائد مالي في اللعبة.',
    image: '/src/assets/images/room_kitchen_clean_1795544384567.jpg',
    difficulty: 'خبير',
    baseReward: 1150,
    parTimeSeconds: 90,
    messCount: { trash: 9, stain: 9, puddle: 7, cobweb: 6 },
  },
];

// Zone anchors per room so trash/puddles land on floors/counters, and cobwebs/dust on upper walls/windows
interface AnchorPoint {
  x: number;
  y: number;
}

const FLOOR_ZONES: AnchorPoint[] = [
  { x: 16, y: 84 },
  { x: 28, y: 88 },
  { x: 41, y: 83 },
  { x: 54, y: 89 },
  { x: 67, y: 85 },
  { x: 79, y: 87 },
  { x: 88, y: 82 },
  { x: 22, y: 76 },
  { x: 48, y: 77 },
  { x: 73, y: 76 },
  { x: 35, y: 92 },
  { x: 61, y: 92 },
];

const SURFACE_ZONES: AnchorPoint[] = [
  { x: 22, y: 58 },
  { x: 34, y: 63 },
  { x: 47, y: 66 },
  { x: 58, y: 62 },
  { x: 70, y: 59 },
  { x: 18, y: 68 },
  { x: 42, y: 54 },
  { x: 64, y: 52 },
  { x: 82, y: 66 },
  { x: 51, y: 72 },
  { x: 29, y: 72 },
  { x: 76, y: 71 },
];

const HIGH_ZONES: AnchorPoint[] = [
  { x: 11, y: 16 },
  { x: 26, y: 22 },
  { x: 44, y: 18 },
  { x: 60, y: 20 },
  { x: 78, y: 15 },
  { x: 90, y: 21 },
  { x: 16, y: 34 },
  { x: 38, y: 31 },
  { x: 67, y: 32 },
  { x: 85, y: 36 },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jitterPoint(pt: AnchorPoint, amount = 4.5): AnchorPoint {
  return {
    x: Math.max(8, Math.min(92, pt.x + (Math.random() - 0.5) * amount * 2)),
    y: Math.max(12, Math.min(92, pt.y + (Math.random() - 0.5) * amount * 1.4)),
  };
}

export function generateStageMess(stage: StageConfig): MessItem[] {
  const items: MessItem[] = [];
  let idx = 0;

  const trashVariants: MessVariant[] = ['paper', 'bottle', 'can', 'wrapper'];
  const stainVariants: MessVariant[] = ['mud', 'grease', 'coffee'];
  const puddleVariants: MessVariant[] = ['water', 'soap_spill'];
  const cobwebVariants: MessVariant[] = ['cobweb', 'dust'];

  const stageMultiplier = 1 + (stage.id - 1) * 0.3;

  const addMess = (kind: MessKind, count: number, zones: AnchorPoint[]) => {
    const shuffled = [...zones].sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      const anchor = shuffled[i % shuffled.length];
      const pos = jitterPoint(anchor, 4);
      let variant: MessVariant = 'paper';
      let requiredTool: ToolId = 'broom';
      let baseHp = 1;
      let baseReward = 12;
      let size = 54;

      if (kind === 'trash') {
        variant = pickRandom(trashVariants);
        requiredTool = 'broom';
        baseHp = 1;
        baseReward = 12;
        size = 52;
      } else if (kind === 'stain') {
        variant = pickRandom(stainVariants);
        requiredTool = 'sponge';
        baseHp = 2.6 + stage.id * 0.35;
        baseReward = 20;
        size = 66;
      } else if (kind === 'puddle') {
        variant = pickRandom(puddleVariants);
        requiredTool = 'mop';
        baseHp = 2.2 + stage.id * 0.3;
        baseReward = 18;
        size = 72;
      } else if (kind === 'cobweb') {
        variant = pickRandom(cobwebVariants);
        requiredTool = 'duster';
        baseHp = 1.6 + stage.id * 0.25;
        baseReward = 16;
        size = 64;
      }

      items.push({
        id: `mess-${stage.id}-${idx++}-${Math.random().toString(36).slice(2, 6)}`,
        kind,
        variant,
        requiredTool,
        x: pos.x,
        y: pos.y,
        size,
        rotation: kind === 'cobweb' ? (pos.x < 50 ? -10 : 10) : Math.round((Math.random() - 0.5) * 38),
        hp: baseHp,
        maxHp: baseHp,
        reward: Math.round(baseReward * stageMultiplier),
        hasBonusCoin: Math.random() < 0.24,
      });
    }
  };

  addMess('trash', stage.messCount.trash, [...FLOOR_ZONES, ...SURFACE_ZONES]);
  addMess('stain', stage.messCount.stain, [...SURFACE_ZONES, ...FLOOR_ZONES]);
  addMess('puddle', stage.messCount.puddle, FLOOR_ZONES);
  addMess('cobweb', stage.messCount.cobweb, HIGH_ZONES);

  return items;
}

export const DEFAULT_SAVE_STATE: SaveState = {
  coins: 50,
  totalEarned: 50,
  unlockedStage: 1,
  stageStars: {},
  stageBestScores: {},
  toolLevels: {
    broom: 1,
    sponge: 1,
    mop: 1,
    duster: 1,
  },
  soundEnabled: true,
  roomsCleanedCount: 0,
};

const STORAGE_KEY = 'clean_home_game_save_v1';

export function loadSaveState(): SaveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE_STATE;
    const parsed = JSON.parse(raw) as Partial<SaveState>;
    return {
      ...DEFAULT_SAVE_STATE,
      ...parsed,
      toolLevels: {
        ...DEFAULT_SAVE_STATE.toolLevels,
        ...(parsed.toolLevels || {}),
      },
    };
  } catch {
    return DEFAULT_SAVE_STATE;
  }
}

export function persistSaveState(state: SaveState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors in restricted environments
  }
}
