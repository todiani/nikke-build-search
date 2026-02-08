#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Process nikke_db.json to:
1. Extract parenthesized content from names into 'extra_info' field
2. Update overload option recommendations based on latest meta
"""

import json
import re
import os

# File paths
INPUT_FILE = os.path.join(os.path.dirname(__file__), '../public/data/nikke_db.json')
OUTPUT_FILE = INPUT_FILE  # Overwrite

# Updated Overload Option Recommendations based on 2024-2025 meta research
# Format: { name: { valid: [...], invalid: [...] } }
OVERLOAD_RECOMMENDATIONS = {
    # SSS Tier - Top Meta Nikkes
    "라피 : 레드 후드": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "차지 속도 증가", "최대 장탄 수 증가"],
        "invalid": ["방어력 증가"]
    },
    "레드 후드": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "차지 속도 증가", "차지 대미지 증가"],
        "invalid": ["방어력 증가"]
    },
    "모더니아": {
        "valid": ["공격력 증가", "최대 장탄 수 증가", "우월코드 대미지 증가", "명중률 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "크라운": {
        "valid": ["공격력 증가", "최대 장탄 수 증가", "우월코드 대미지 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "앨리스": {
        "valid": ["차지 속도 증가", "공격력 증가", "최대 장탄 수 증가", "우월코드 대미지 증가"],
        "invalid": ["방어력 증가"]
    },
    "나가": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "최대 장탄 수 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "홍련 : 흑영": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "최대 장탄 수 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "홍련": {
        "valid": ["최대 장탄 수 증가", "공격력 증가", "우월코드 대미지 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "도로시": {
        "valid": ["공격력 증가", "우월코드 대미지 증가"],
        "invalid": ["최대 장탄 수 증가", "차지 속도 증가", "차지 대미지 증가", "방어력 증가"]  # Dorothy - last bullet mechanic
    },
    "신데렐라": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "최대 장탄 수 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "리타": {
        "valid": ["최대 장탄 수 증가", "우월코드 대미지 증가", "공격력 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가"]
    },
    "티아": {
        "valid": ["최대 장탄 수 증가", "차지 속도 증가", "공격력 증가"],
        "invalid": ["방어력 증가"]
    },
    "맥스웰": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "차지 대미지 증가", "차지 속도 증가"],
        "invalid": ["방어력 증가"]
    },
    "스노우 화이트": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "차지 대미지 증가", "크리티컬 확률 증가", "크리티컬 대미지 증가"],
        "invalid": ["방어력 증가"]
    },
    "라푼젤": {
        "valid": ["차지 속도 증가", "최대 장탄 수 증가"],
        "invalid": ["공격력 증가"]  # Healer, tank priority
    },
    "블랑": {
        "valid": ["최대 장탄 수 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가"]
    },
    "누아르": {
        "valid": ["공격력 증가", "최대 장탄 수 증가", "우월코드 대미지 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "아인": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "차지 대미지 증가", "차지 속도 증가"],
        "invalid": ["방어력 증가"]
    },
    "그레이브": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "최대 장탄 수 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "프리바티": {
        "valid": ["공격력 증가", "우월코드 대미지 증가"],
        "invalid": ["최대 장탄 수 증가", "차지 속도 증가", "차지 대미지 증가"]  # Last bullet mechanic
    },
    "헬름": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "차지 속도 증가"],
        "invalid": ["방어력 증가"]
    },
    "마르차나": {
        "valid": [],
        "invalid": ["공격력 증가"]  # Tank
    },
    "2B": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "최대 장탄 수 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "A2": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "최대 장탄 수 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "D: 킬러 와이프": {
        "valid": ["최대 장탄 수 증가", "공격력 증가", "우월코드 대미지 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    },
    "스카디": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "차지 속도 증가", "차지 대미지 증가"],
        "invalid": ["방어력 증가"]
    },
    "하란": {
        "valid": ["공격력 증가", "명중률 증가", "우월코드 대미지 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가", "방어력 증가"]
    }
}

# Weapon type based defaults
WEAPON_DEFAULTS = {
    "SR": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "차지 속도 증가", "차지 대미지 증가"],
        "invalid": []
    },
    "AR": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "명중률 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가"]
    },
    "SMG": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "명중률 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가"]
    },
    "MG": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "최대 장탄 수 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가"]
    },
    "SG": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "명중률 증가", "최대 장탄 수 증가"],
        "invalid": ["차지 속도 증가", "차지 대미지 증가"]
    },
    "RL": {
        "valid": ["공격력 증가", "우월코드 대미지 증가", "차지 속도 증가", "차지 대미지 증가"],
        "invalid": ["명중률 증가"]
    }
}


def extract_parenthesis_content(name: str) -> tuple:
    """
    Extract content in parentheses from name.
    Returns (clean_name, extra_info)
    """
    # Pattern: match content in Korean-style parentheses (()) or regular ()
    pattern = r'\s*[\(（]([^)）]+)[\)）]\s*$'
    match = re.search(pattern, name)
    
    if match:
        extra_info = match.group(1).strip()
        clean_name = name[:match.start()].strip()
        return clean_name, extra_info
    
    return name, ""


def process_nikke_data():
    # Load data
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        full_data = json.load(f)
    
    # Handle both new format (dict with 'nikkes' key) and old format (list)
    if isinstance(full_data, dict) and 'nikkes' in full_data:
        data = full_data['nikkes']
        is_dict_format = True
    else:
        data = full_data
        is_dict_format = False
    
    print(f"Loaded {len(data)} nikkes")
    
    updated_count = 0
    extra_info_count = 0
    
    for nikke in data:
        if not isinstance(nikke, dict):
            continue
            
        name = nikke.get('name', '')
        
        # 1. Extract parenthesis content
        clean_name, extra_info = extract_parenthesis_content(name)
        if extra_info:
            nikke['extra_info'] = extra_info
            # Only update name if we actually extracted something meaningful
            # and the original name had parentheses
            if '(' in name or '（' in name:
                nikke['name'] = clean_name
            extra_info_count += 1
            print(f"  Extracted: '{name}' -> name='{clean_name}', extra_info='{extra_info}'")
        else:
            nikke['extra_info'] = nikke.get('extra_info', '')
        
        # 2. Update overload recommendations
        # Check if we have specific recommendations for this nikke
        if name in OVERLOAD_RECOMMENDATIONS:
            rec = OVERLOAD_RECOMMENDATIONS[name]
            nikke['valid_options'] = rec.get('valid', [])
            nikke['invalid_options'] = rec.get('invalid', [])
            updated_count += 1
        elif clean_name in OVERLOAD_RECOMMENDATIONS:
            rec = OVERLOAD_RECOMMENDATIONS[clean_name]
            nikke['valid_options'] = rec.get('valid', [])
            nikke['invalid_options'] = rec.get('invalid', [])
            updated_count += 1
        else:
            # Fallback to weapon-based defaults
            weapon = nikke.get('weapon', 'AR')
            if weapon in WEAPON_DEFAULTS:
                defaults = WEAPON_DEFAULTS[weapon]
                if 'valid_options' not in nikke:
                    nikke['valid_options'] = defaults.get('valid', [])
                if 'invalid_options' not in nikke:
                    nikke['invalid_options'] = defaults.get('invalid', [])
    
    # Save updated data
    if is_dict_format:
        full_data['nikkes'] = data
        output_data = full_data
    else:
        output_data = data

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nProcessing complete:")
    print(f"  - Extracted extra_info from {extra_info_count} nikkes")
    print(f"  - Updated overload recommendations for {updated_count} nikkes")
    print(f"  - Saved to {OUTPUT_FILE}")


if __name__ == '__main__':
    process_nikke_data()
