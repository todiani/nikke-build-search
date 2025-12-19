export interface NikkeData {
  id: string;
  name: string;
  name_en: string;
  tier: "SSS" | "SS" | "S" | "A" | "PvP" | "Unranked";
  burst: "I" | "II" | "III";
  class: "Attacker" | "Supporter" | "Defender";
  weapon: "AR" | "SR" | "SG" | "SMG" | "RL" | "MG";

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
  desc: string;

  // Extra info extracted from parentheses in name
  extra_info?: string;

  // Overload option recommendations
  valid_options?: string[];
  invalid_options?: string[];

  // Rich Data
  skills_detail?: {
    normal?: { name?: string; desc?: string; type?: string; };
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
}

// Data is now loaded successfully from public/data/nikke_db.json
export const nikkes: NikkeData[] = []; 
