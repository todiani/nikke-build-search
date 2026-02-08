# core_utils.py
from collections import defaultdict
from core_constants import OVERLOAD_DATA, OVERLOAD_OPT_TYPES, PARTS, WEAPON_OPTION_DEFAULTS

def get_chosung(text):
    CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
    result = []
    for char in text:
        if '가' <= char <= '힣':
            code = ord(char) - ord('가')
            result.append(CHO[code // (21 * 28)])
        else:
            result.append(char)
    return ''.join(result)

def match_search(term, text):
    if not term or not text: return False
    t = term.lower().replace(" ", "")
    txt = text.lower().replace(" ", "")
    if t in txt: return True
    if any('ㄱ' <= c <= 'ㅎ' for c in t):
        if t in get_chosung(txt): return True
    return False

def get_option_value_from_stage_str(option_type, stage_str):
    if option_type == "옵션없음" or option_type not in OVERLOAD_DATA: return 0
    try:
        if "단계" in stage_str:
            stage_num = int(stage_str.split("단계")[0].strip())
            return OVERLOAD_DATA[option_type][stage_num] if 0 <= stage_num < len(OVERLOAD_DATA[option_type]) else 0
        else:
            stage_num = int(stage_str)
            return OVERLOAD_DATA[option_type][stage_num] if 0 <= stage_num < len(OVERLOAD_DATA[option_type]) else 0
    except: return 0

def get_stage_number(stage_str):
    try:
        if "단계" in stage_str: return int(stage_str.split("단계")[0].strip())
        return int(stage_str)
    except: return 0

def get_max_value_for_option(option_type):
    """해당 옵션의 15단계(최대) 수치를 반환"""
    if option_type in OVERLOAD_DATA:
        return OVERLOAD_DATA[option_type][-1]
    return 0

def get_dynamic_efficiency(nikke_data, weapon_type, option_type):
    if option_type == "옵션없음": return 0.0
    if nikke_data and 'overload' in nikke_data:
        ol_data = nikke_data['overload']
        valid_ops = ol_data.get('valid_ops', [])
        invalid_ops = ol_data.get('invalid_ops', [])
        if option_type in valid_ops: return 1.5
        if option_type in invalid_ops: return 0.1
    return WEAPON_OPTION_DEFAULTS.get(weapon_type, {}).get(option_type, 0.5)

def calculate_grade(is_valid, percentage):
    if not is_valid: return "F (무효)", "invalid"
    if percentage >= 95: return "SSS (종결)", "valid"
    elif percentage >= 85: return "SS (준종결)", "valid"
    elif percentage >= 70: return "S (우수)", "primary"
    elif percentage >= 50: return "A (보통)", "text"
    else: return "B (아쉬움)", "neutral"

def calculate_power_detailed(hp, atk, def_, skill1, skill2, burst, part_options, cube_lvl, col_grade, col_skill1, col_skill2, weapon, nikke_data=None):
    try:
        # 1. 기본 스탯 CP
        term1 = 0.7 * float(hp)
        term2 = 19.35 * float(atk)
        term3 = 70.0 * float(def_)
        base_sum = term1 + term2 + term3 
        
        base_coeff = 1.3
        skill_coeff = (0.01 * skill1) + (0.01 * skill2) + (0.02 * burst)
        cube_coeff = 0.0092 * cube_lvl 
        
        col_coeff_val = 0
        max_col_val = 1.0 
        if col_grade == "R": 
            col_coeff_val = col_skill1 + 6.33
            max_col_val = 15 + 6.33
        elif col_grade == "SR": 
            col_coeff_val = col_skill1 + col_skill2 + 10.66
            max_col_val = 15 + 15 + 10.66
        elif col_grade == "SSR":
            col_coeff_val = col_skill1 + col_skill2 + 15.00
            max_col_val = 15 + 15 + 15.00
        
        col_coeff = 0.0069 * col_coeff_val

        # 2. 오버로드 데이터 집계
        total_ol_cp_coeff = 0 
        total_ol_potential_score = 0 
        valid_ops = nikke_data.get('overload', {}).get('valid_ops', []) if nikke_data else []
        
        # 합계 계산을 위한 딕셔너리
        # Key: 옵션명, Value: {현재값합계, 최대값합계(15단계기준), 줄수, CP계수합, 유효여부}
        agg_stats = defaultdict(lambda: {"curr": 0.0, "max": 0.0, "count": 0, "cp": 0.0, "is_valid": False})

        for p in PARTS:
            for i in range(1, 4):
                opt = part_options[p][f"option{i}"]
                o_type = opt['type']
                stage_str = opt['stage']
                
                if o_type == "옵션없음": continue

                # CP 계산
                stage_num = get_stage_number(stage_str)
                cp_multiplier = 0.00828 if o_type == "우월코드 대미지 증가" else 0.0069
                cp_coeff = stage_num * cp_multiplier
                total_ol_cp_coeff += cp_coeff
                
                # 수치 계산
                current_val = get_option_value_from_stage_str(o_type, stage_str)
                max_val_single = get_max_value_for_option(o_type)
                
                # 유효성 및 개별 점수 (종결도 계산용)
                is_valid = o_type in valid_ops
                pct_single = (current_val / max_val_single * 100) if max_val_single > 0 else 0
                weight = 1.0 if is_valid else 0.0 
                line_score = (pct_single / 100) * weight * 100 
                total_ol_potential_score += line_score
                
                # 합산 데이터 누적
                agg_stats[o_type]["curr"] += current_val
                agg_stats[o_type]["max"] += max_val_single
                agg_stats[o_type]["count"] += 1
                agg_stats[o_type]["cp"] += (base_sum * cp_coeff) / 100
                agg_stats[o_type]["is_valid"] = is_valid

        total_coeff = base_coeff + skill_coeff + total_ol_cp_coeff + cube_coeff + col_coeff
        final_power = (base_sum * total_coeff) / 100
        
        # 종결도 점수 (4부위 * 3줄 * 100점 = 1200점 만점)
        graduation_pct = (total_ol_potential_score / 1200) * 100 
        skill_pct = ((skill1 + skill2 + burst) / 30) * 100
        
        # 합산 데이터를 리스트 형태로 변환 및 등급 산정
        final_aggregated_list = []
        for o_type, data in agg_stats.items():
            # 해당 옵션의 종합 퍼센트 (현재합 / 최대합)
            total_pct = (data["curr"] / data["max"] * 100) if data["max"] > 0 else 0
            grade_str, grade_tag = calculate_grade(data["is_valid"], total_pct)
            
            final_aggregated_list.append({
                "type": o_type,
                "lines": data["count"],
                "val": data["curr"],
                "max": data["max"],
                "pct": total_pct,
                "cp": data["cp"],
                "grade": grade_str,
                "tag": grade_tag
            })

        details = {
            "base_cp": (base_sum * base_coeff) / 100,
            "skill_cp": (base_sum * skill_coeff) / 100,
            "skill_pct": skill_pct,
            "cube_cp": (base_sum * cube_coeff) / 100,
            "cube_pct": (cube_lvl / 15) * 100 if cube_lvl > 0 else 0,
            "col_cp": (base_sum * col_coeff) / 100,
            "col_pct": (col_coeff_val / max_col_val) * 100 if col_grade != "None" else 0,
            "ol_cp": (base_sum * total_ol_cp_coeff) / 100,
            "ol_graduation_pct": graduation_pct,
            "ol_aggregated": final_aggregated_list # 리스트 형태 반환
        }
                    
        return {"power": round(final_power), "score": graduation_pct, "details": details}
    except Exception as e:
        print(f"Calc Error: {e}")
        return {"power": 0, "score": 0, "details": {}}