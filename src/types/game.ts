export type ToolId = 'broom' | 'sponge' | 'mop' | 'duster';

export type MessKind = 'trash' | 'stain' | 'puddle' | 'cobweb';

export type MessVariant =
  | 'paper'
  | 'bottle'
  | 'can'
  | 'wrapper'
  | 'mud'
  | 'grease'
  | 'coffee'
  | 'water'
  | 'soap_spill'
  | 'cobweb'
  | 'dust';

export interface MessItem {
  id: string;
  kind: MessKind;
  variant: MessVariant;
  requiredTool: ToolId;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // px base size
  rotation: number;
  hp: number;
  maxHp: number;
  reward: number;
  hasBonusCoin?: boolean;
}

export interface BonusCoin {
  id: string;
  x: number;
  y: number;
  value: number;
  expiresAt: number;
}

export interface FloatingEffect {
  id: string;
  x: number;
  y: number;
  type: 'coin' | 'bubble' | 'sparkle' | 'hint';
  text?: string;
}

export interface ToolInfo {
  id: ToolId;
  name: string;
  shortDesc: string;
  targetsLabel: string;
  baseCost: number;
  hotkey: string;
  accentHex: string;
}

export interface StageConfig {
  id: number;
  title: string;
  roomName: string;
  subtitle: string;
  image: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب' | 'خبير';
  baseReward: number;
  parTimeSeconds: number;
  messCount: {
    trash: number;
    stain: number;
    puddle: number;
    cobweb: number;
  };
}

export type GameScreen = 'HOME_HUB' | 'CLEANING_STAGE' | 'CASH_MINIGAME' | 'TOOL_SHOP';

export interface SaveState {
  coins: number;
  totalEarned: number;
  unlockedStage: number;
  stageStars: Record<number, number>;
  stageBestScores: Record<number, number>;
  toolLevels: Record<ToolId, number>;
  soundEnabled: boolean;
  roomsCleanedCount: number;
}
