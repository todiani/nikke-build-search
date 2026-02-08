export interface OverloadOption {
  type: string;
  stage: number;
}

export interface PartOptions {
  option1: OverloadOption;
  option2: OverloadOption;
  option3: OverloadOption;
}

export interface NikkeData {
  id: string;
  name: string;
  name_en: string;
  tier: string;
  burst: string;
  class: string;
  weapon: string;      // 무기 종류 (예: 소총 (AR), 기관총 (MG))
  weapon_name: string; // 무기 이름 (예: 울프스 베인, 세븐스 드워프)
  rarity?: string;
  thumbnail?: string; // 니케 썸네일 이미지 경로

  // NEW: Company/Manufacturer
  company?: string;  // 엘리시온, 미시리스, 테트라, 필그림, 이상현상
  squad?: string;    // Added Squad

  // NEW: Code/Element
  code?: "작열" | "풍압" | "철갑" | "전격" | "수냉" | string;

  // NEW: Weapon Info (Basic Attack)
  weapon_info?: {
    weapon_name?: string;      // 런처, 돌격 소총, 등
    max_ammo?: number;         // 최대 장탄 수
    reload_time?: number;      // 재장전 시간 (초)
    control_type?: string;     // 조작 타입: 차지형, 일반형, 등
  };

  skill_priority: string;
  skills?: {
    min: string;
    efficient: string;
    max: string;
  };
  options: string[];
  cube: string;
  desc: string; // 3. 주요 사용 콘텐츠의 상세 설명 (니케 활용법 및 특징)

  // Extra info extracted from parentheses in name
  extra_info?: string;

  // Manual aliases/nicknames for matching
  aliases?: string[];

  // Overload option recommendations
  valid_options?: string[];
  neutral_options?: string[];
  invalid_options?: string[];

  // Rich Data
  skills_detail?: {
    normal?: { name?: string; desc?: string; type?: string; tags?: string[]; };
    skill1?: { name: string; desc: string; tags: string[]; type?: string; cooldown?: string; };
    skill2?: { name: string; desc: string; tags: string[]; type?: string; cooldown?: string; };
    burst?: { name: string; desc: string; tags: string[]; type?: string; cooldown?: string; };
  };
  overload_detail?: {
    priority?: string;
    valid_ops?: string[];
    invalid_ops?: string[];
    recommended_cubes?: string[];
  };
  usage_stats?: {
    name: string;
    stars: number;
    desc: string;
  }[];
  burst_details?: {
    [stage in "2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL"]?: {
      value: number;
      hits?: string;
      bonus?: string;
    };
  };
  // Persisted Calculator and Comparison Data
  calc_data?: any;
  compare_data?: any;

  // New: Separated Build Data
  build?: {
    stats: { hp: number; atk: number; def: number };
    skills: { skill1: number; skill2: number; burst: number };
    cube_level: number;
    collection: { grade: string; skill1: number; skill2: number };
    overload: {
      helmet: PartOptions;
      armor: PartOptions;
      gloves: PartOptions;
      boots: PartOptions;
    };
  };
  isGuest?: boolean;
  _originalGuestName?: string;
  _deleteGuest?: boolean;
}

// Data is now loaded successfully from public/data/nikke_db.json
export const nikkes: NikkeData[] = [];
