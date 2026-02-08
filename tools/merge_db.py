import json
import os
import re

# Paths
PYTHON_SRC = r'c:\Users\TODI\.gemini\antigravity\playground\ruby-blazar\nikke-build-search\python_src'
WEB_SRC = r'c:\Users\TODI\.gemini\antigravity\playground\ruby-blazar\nikke-build-search\src'
PUBLIC_DIR = r'c:\Users\TODI\.gemini\antigravity\playground\ruby-blazar\nikke-build-search\public\data'

os.makedirs(PUBLIC_DIR, exist_ok=True)

# 1. Load nikkedatabase.json (Rich Data)
details_path = os.path.join(PYTHON_SRC, 'nikkedatabase.json')
with open(details_path, 'r', encoding='utf-8') as f:
    detailed_data = json.load(f)

# Helper to find detail entry
def find_detail(name):
    for item in detailed_data:
        if item['nikke_name'] == name:
            return item
    return None

# 2. Load nikkes.ts (Tier Data, IDs)
# We will cheat and use simple parsing since we know the format from previous view_file
nikkes_ts_path = os.path.join(WEB_SRC, 'data', 'nikkes.ts')
with open(nikkes_ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Extract the array content. It starts after `export const nikkes: NikkeData[] = [` and ends with `];`
# This is fragile but fast.
# Actually, since I have to produce valid JSON, I'll regex capture the object blocks.
# But `nikkes.ts` keys are unquoted. I need to quote them.

# Alternative: I will use the `detailed_data` as the MASTER list, and try to Map `tier`, `id` from `nikkes.ts` if found.
# If not found, generate ID and set Tier to "Unranked".

# Let's verify if `nikkes.ts` has ALL characters or if `nikkedatabase.json` has more.
# `nikkedatabase.json` is likely larger/more complete.

# Parse TS manually-ish to build a map: Name -> {id, tier, class, ...}
ts_map = {}

# Regex to find objects like { "id": "...", ... }
# Matches: id: "..." or "id": "..."
# We iterate line by line.
current_obj = {}
in_obj = False
for line in ts_content.split('\n'):
    line = line.strip()
    if line.startswith('{'):
        in_obj = True
        current_obj = {}
        continue
    if line.startswith('}'):
        if in_obj and 'name' in current_obj:
            ts_map[current_obj['name']] = current_obj
        in_obj = False
        continue
    
    if in_obj:
        # Key-Value match
        # match: key: "value" or "key": "value"
        # remove comma
        if line.endswith(','): line = line[:-1]
        parts = line.split(':', 1)
        if len(parts) == 2:
            k = parts[0].strip().replace('"', '').replace("'", "")
            v = parts[1].strip().replace('"', '').replace("'", "")
            current_obj[k] = v

print(f"Loaded {len(ts_map)} entries from nikkes.ts")
print(f"Loaded {len(detailed_data)} entries from nikkedatabase.json")

# 3. Merge
merged_list = []

# ID Generator
def generate_id(name):
    # simple hash replacement
    import base64
    return 'gen_' + base64.b64encode(name.encode('utf-8')).decode('utf-8').replace('=','').replace('+','-').replace('/','_')

for item in detailed_data:
    name = item['nikke_name']
    
    # Base object
    new_obj = {
        "id": generate_id(name),
        "name": name,
        "name_en": name, # Default to KR name if no EN
        "tier": "Unranked",
        "burst": "II", # Default
        "class": "Attacker", # Default
        "weapon": "AR", # Default
        "squad": item.get('desc_label', ''), # Map 'desc_label' (e.g. Squad/Event) to squad
        "company": item.get('company', 'Unknown'),
        "role": item.get('role', '화력형'),
        "code": item.get('code', '철갑'),
        "skill_priority_comment": item.get('skill_priority', {}).get('order', ''),
        # Keep original structures for rich features
        "skills_detail": item.get('skills', {}), 
        "overload_detail": item.get('overload', {}),
        "skill_priority": "", # Flat string for UI?
        "options": [],
        "cube": "",
        "desc": "" # Will populate with skill text for search
    }

    # Map Python data to TS attributes
    # Class mapping
    role_map = {"화력형": "Attacker", "지원형": "Supporter", "방어형": "Defender"}
    if new_obj['role'] in role_map: new_obj['class'] = role_map[new_obj['role']]

    # Burst mapping
    burst_raw = item.get('burst_type', '') 
    if 'III' in burst_raw: new_obj['burst'] = 'III'
    elif 'II' in burst_raw: new_obj['burst'] = 'II'
    elif 'I' in burst_raw: new_obj['burst'] = 'I'

    # Weapon
    new_obj['weapon'] = item.get('weapon', 'AR')

    # Skill Priority (Short)
    sp = item.get('skill_priority', {})
    if isinstance(sp, dict):
        new_obj['skill_priority'] = sp.get('order', '4-4-4')
    
    # Overload Options (List of strings)
    ol = item.get('overload', {})
    if isinstance(ol, dict):
        rec = ol.get('recommended_ops', [])
        valid = ol.get('valid_ops', [])
        # Combine unique
        new_obj['options'] = list(set(rec + valid))
        new_obj['cube'] = ", ".join(ol.get('recommended_cubes', []))

    # Description (Search Text)
    # Combine skill desc
    skills = item.get('skills', {})
    desc_text = []
    if 'skill1' in skills: desc_text.append(f"1스킬: {skills['skill1'].get('desc','')}")
    if 'skill2' in skills: desc_text.append(f"2스킬: {skills['skill2'].get('desc','')}")
    if 'burst' in skills: desc_text.append(f"버스트: {skills['burst'].get('desc','')}")
    new_obj['desc'] = "\n".join(desc_text)

    # 4. Overlay Data from nikkes.ts (Tier, English Name, Manual overwrites)
    if name in ts_map:
        ts_item = ts_map[name]
        if 'id' in ts_item: new_obj['id'] = ts_item['id']
        if 'tier' in ts_item: new_obj['tier'] = ts_item['tier']
        if 'name_en' in ts_item: new_obj['name_en'] = ts_item['name_en']
        # Trust TS for these simplified fields if they exist? 
        # Actually detailed_data is better for skills. TS is better for Tier/Meta.
        # So we kept detail as base and just overlay Tier/ID/EN-Name.
        
        # Also clean up options if TS has better ones
        # TS options were ["공격력", "장탄"] etc.
        # Python options are ["공격력 증가", "최대 장탄 수 증가"]
        # We should keep Python ones for compatibility with Calculator logic which matches Python keys!
        pass
    
    merged_list.append(new_obj)

# 5. Add items from TS that were NOT in detailed (if any)
detailed_names = set(item['nikke_name'] for item in detailed_data)
for name, ts_item in ts_map.items():
    if name not in detailed_names:
        print(f"Adding TS-only character: {name}")
        # Minimal conversion
        new_obj = {
            "id": ts_item.get('id', generate_id(name)),
            "name": name,
            "name_en": ts_item.get('name_en', name),
            "tier": ts_item.get('tier', 'Unranked'),
            "burst": ts_item.get('burst', 'II'),
            "class": ts_item.get('class', 'Attacker'),
            "weapon": ts_item.get('weapon', 'AR'),
            "skill_priority": ts_item.get('skill_priority', ''),
            "options": [], # Need to parse TS options string list
            "cube": ts_item.get('cube', ''),
            "desc": "",
            "skills_detail": {},
            "overload_detail": {}
        }
        # Try to parse options
        # In TS reader, 'options' might be "[...]" string? 
        # My simple parser above makes values strings. Arrays might be broken.
        # It's fine, this is fallback.
        merged_list.append(new_obj)

# Sort by Tier (SSS -> SS -> S -> A -> PvP -> Unranked)
tier_order = {"SSS": 0, "SS": 1, "S": 2, "A": 3, "PvP": 4, "Unranked": 5}
merged_list.sort(key=lambda x: (tier_order.get(x['tier'], 5), x['name']))

# Save
out_path = os.path.join(PUBLIC_DIR, 'nikke_db.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(merged_list, f, indent=2, ensure_ascii=False)

print(f"Successfully saved {len(merged_list)} members to {out_path}")
