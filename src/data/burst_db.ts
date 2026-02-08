
export type RLStage = "2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL";

export interface RLData {
    value: number;
    hits?: string;
    bonus?: string;
}

export interface NikkeBurst {
    "2RL": RLData;
    "2_5RL": RLData;
    "3RL": RLData;
    "3_5RL": RLData;
    "4RL": RLData;
}

export let BURST_DB: Record<string, NikkeBurst> = {
    "라피 : 레드 후드": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "스노우 화이트 : 헤비암즈": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "2B": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "A2": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "D": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "D : 킬러 와이프": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "K": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "N102": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "iDoll 썬": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "iDoll 오션": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "iDoll 플라워": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "그레이브": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "길로틴": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "길로틴 : 윈터 슬레이어": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "길티": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "나가": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "나유타": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "네로": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "네베": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "네온": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "네온 : 블루 오션": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "노벨": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "노아": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "노이즈": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "누아르": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "니힐리스타": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "델타": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "델타 : 닌자 시프": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "도라": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "도로시": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "도로시 : 세렌디피티": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "드레이크": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "디젤": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "디젤 : 윈터 스위츠": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "라이": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "라푼젤": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "라푼젤 : 퓨어 그레이스": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "라플라스": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "라피": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "람": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "레드 후드": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "레오나": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "레이 : 아야나미": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "레이븐": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "렘": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "로산나": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "로산나 : 시크 오션": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "루드밀라": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "루드밀라 : 윈터 오너": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "루마니": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "루주": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "루피": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "루피 : 윈터 쇼퍼": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "리버렐리오": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "리타": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "리틀 머메이드": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "릴리": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "마나": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "마르차나": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "마리": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "마스트": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "마스트 : 로망틱 메이드": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "마키마": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "맥스웰": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "메어리": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "메어리 : 베이 갓데스": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "메이든": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "메이든 : 아이스 로즈": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "모더니아": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "모리": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "목단": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "미란다": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "미사토": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "미카": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "미카 : 스노우 버디": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "미하라": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "미하라 : 본딩 체인": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "밀크": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "밀크 : 블루밍 바니": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "프로덕트 12": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "바이퍼": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "베이": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "베스티": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "베스티 : 택티컬 업": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "벨로타": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "볼륨": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "블랑": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "브래디": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "브리드": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "비스킷": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "사쿠라": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "사쿠라 : 스즈하라": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "사쿠라 : 블룸 인 서머": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "센티": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "소다": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "소다 : 트윙클링 바니": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "소라": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "솔린": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "솔린 : 프로스트 티켓": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "솔져 E.G.": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "솔져 F.A.": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "솔져 O.W.": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "슈가": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "스노우 화이트": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "스노우 화이트 : 이노센트 데이즈": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "시그널": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "아스카": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "아스카 : WILLE": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "신": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "신데렐라": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "아니스": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "아니스 : 스파클링 서머": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "아르카나": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "아리아": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "아인": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "애드미": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "에피넬": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "앤 : 미라클 페어리": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "앨리스": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "앨리스 : 원더랜드 바니": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "앵커": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "앵커 : 이노센트 메이드": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "얀": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "에밀리아": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "에이다": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "에이드": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "에이드 : 에이전트 바니": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "에테르": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "엑시아": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "엠마": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "엠마 : 택티컬 업": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "유니": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "율리아": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "율하": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "은화": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "은화 : 택티컬 업": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "이브": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "이사벨": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "일레그": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "일레그 : 붐 앤 쇼크": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "자칼": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "질": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "차임": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "츠바이": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "코코아": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "퀀시": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "퀀시 : 이스케이프 퀸": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "크라운": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "크러스트": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "크로우": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "클레어": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "클레이": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "키리": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "킬로": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "토브": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "트로니": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "트리나": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "티아": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "파스칼": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "파워": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "팬텀": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "페퍼": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "폴리": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "폴크방": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "프로덕트 08": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "프로덕트 23": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "프리바티": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "프리바티 : 언카인드 메이드": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "프림": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "플로라": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "하란": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "헬름": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "헬름 : 아쿠아마린": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "홍련": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "홍련 : 흑영": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "히메노": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "브리드 : 사일런트 트랙": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "레이": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "바스트": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "솔저 E.G": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "솔저 F.A": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "솔저 O.W": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    },
    "N102 : 미라클 페어리": {
        "2RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "2_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "3_5RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        },
        "4RL": {
            "value": 0,
            "hits": "-",
            "bonus": "0%-0%"
        }
    }
};

export const getBurstDB = () => BURST_DB;

export const setBurstDB = (data: Record<string, NikkeBurst>) => {
    BURST_DB = data;
};

export const getNikkeBurstValue = (name: string): NikkeBurst | null => {
    const cleanName = name.split('(')[0].trim();
    return BURST_DB[cleanName] || BURST_DB[name] || null;
};
