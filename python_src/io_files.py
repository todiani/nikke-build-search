# io_files.py
import os
import json
import re
from collections import Counter
from core_constants import *
from core_state import AppState
from core_indexer import TagIndexer # 인덱서 임포트

def load_themes(state: AppState):
    if os.path.exists(THEMES_FILE):
        try:
            with open(THEMES_FILE, 'r', encoding='utf-8') as f:
                state.themes = json.load(f)
            return
        except: pass
    state.themes = {"Blue Pro (Default)": {"bg": "#121212", "surface": "#1e1e1e", "surface_light": "#2c2c2c", "primary": "#64b5f6", "primary_dark": "#1565c0", "text": "#ffffff", "text_dim": "#b0bec5", "border": "#424242", "tag_bg": "#37474f", "tag_fg": "#eceff1", "sel_tag_bg": "#1976d2", "highlight": "#d4e157", "badge_bg": "#4fc3f7", "badge_fg": "#000000", "valid": "#69f0ae", "invalid": "#ff5252", "neutral": "#b0bec5", "rec_bg": "#1565c0", "valid_bg": "#2e7d32", "invalid_bg": "#c62828", "none_bg": "#424242"}}

def load_config(state: AppState, root):
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
                state.current_theme_name = config.get("theme", "Blue Pro (Default)")
                state.deleted_nikkes = config.get("deleted_nikkes", [])
                
                layout = config.get("layout", {})
                state.layout_config.update(layout)
                
                geom = state.layout_config.get("geometry")
                if geom: root.geometry(geom)
            return True
        except: pass
    return False

def save_config(state: AppState, root):
    try:
        state.layout_config["geometry"] = root.geometry()
        config = {
            "theme": state.current_theme_name, 
            "deleted_nikkes": state.deleted_nikkes,
            "layout": state.layout_config
        }
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
    except: pass

def load_tags(state: AppState):
    loaded = False
    if os.path.exists(TAGS_FILE):
        try:
            with open(TAGS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                state.all_tags = data.get("tags", [])
                state.tag_groups = data.get("tag_groups", {})
                if state.tag_groups: loaded = True
        except: pass
    if not loaded:
        state.tag_groups = DEFAULT_TAG_GROUPS.copy()
        temp = []
        for g in state.tag_groups.values(): temp.extend(g["tags"])
        state.all_tags = list(set(temp))

def save_tags(state: AppState):
    try:
        data = {"version": "3.2", "tags": state.all_tags, "tag_groups": state.tag_groups}
        with open(TAGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except: pass

def load_database(state: AppState):
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                state.database = [c for c in data if c.get('nikke_name') not in state.deleted_nikkes]
        except: state.database = []
    else: state.database = []

def save_database_silent(state: AppState):
    try:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(state.database, f, ensure_ascii=False, indent=2)
    except: pass

def inject_recommended_builds(state: AppState):
    modified_count = 0
    for char in state.database:
        if char['nikke_name'] in state.deleted_nikkes: continue
        
        name = char["nikke_name"]
        preset = None
        
        # 이름 부분 일치 검색 (예: "홍련: 흑영" -> "홍련: 흑영", "홍련" -> "홍련")
        for k in PRESET_BUILD_DATA.keys():
            if k == name or k in name:
                # 정확도 높은 매칭을 위해
                if len(k) < len(name) and " " not in name: continue 
                preset = PRESET_BUILD_DATA[k]
                break
        
        if preset:
            sp = char.get("skill_priority", {})
            # 데이터가 비어있거나 구버전 데이터일 경우 업데이트
            if not sp.get("order") or "가성비" not in str(sp.get("order")):
                sp["order"] = f"[가성비] {preset['skill_cost']}  /  [종결] {preset['skill_final']}"
                modified_count += 1
            
            ol = char.get("overload", {})
            if not ol.get("options") or len(ol.get("options")) == 0:
                ol_text = f"★최상: {preset['ol_best']}  |  ☆유효: {preset['ol_good']}"
                ol["options"] = [ol_text]
                modified_count += 1
            
            if not ol.get("recommended_cubes") or len(ol.get("recommended_cubes")) == 0:
                ol["recommended_cubes"] = [preset["cube"]]
                modified_count += 1
                
    if modified_count > 0:
        save_database_silent(state)

def auto_generate_tags(state: AppState, silent=False):
    state.tag_counts = Counter()
    tag_patterns = {}
    
    if not state.all_tags:
        temp_tags = []
        for g in state.tag_groups.values(): temp_tags.extend(g["tags"])
        state.all_tags = list(set(temp_tags))
        
    for tag in state.all_tags:
        keyword = re.escape(tag.replace("▲", "").replace("▼", "").strip())
        pattern = re.compile(rf"{keyword}", re.IGNORECASE)
        tag_patterns[tag] = pattern
        
    for char in state.database:
        if char['nikke_name'] in state.deleted_nikkes: continue
        
        char_tags = set()
        skills = char.get("skills", {})
        for s_key in ["skill1", "skill2", "burst"]:
            if s_key in skills:
                skill = skills[s_key]
                desc = skill.get("desc", "")
                name = skill.get("name", "")
                full_text = f"{name} {desc}"
                
                found_tags = []
                for tag, pattern in tag_patterns.items():
                    if pattern.search(full_text):
                        found_tags.append(tag)
                        char_tags.add(tag)
                skill["tags"] = list(set(found_tags))
                
        for t in char_tags: state.tag_counts[t] += 1
    
    # ★ [추가] 인덱스 빌드 (태그 생성 후 즉시 인덱싱)
    if not state.indexer:
        state.indexer = TagIndexer()
    state.indexer.build_index(state.database)