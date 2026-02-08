
import os
import json

def normalize(name):
    if not name: return ""
    return "".join(e for e in name if e.isalnum())

def test_matching():
    nikke_name = "라피 : 레드 후드"
    target_norm = normalize(nikke_name)
    print(f"Target Norm: {target_norm}")
    
    data_dir = r"r:\AI\nikke-build-search\Tampermonkey Script\DATA"
    if not os.path.exists(data_dir):
        print(f"Directory not found: {data_dir}")
        return
        
    files = [f for f in os.listdir(data_dir) if f.endswith(".json")]
    print(f"Total json files: {len(files)}")
    
    found = False
    for filename in files:
        name_part = filename.rsplit('(', 1)[0] if '(' in filename else filename.replace('.json', '')
        norm_filename = normalize(name_part)
        if norm_filename == target_norm:
            print(f"MATCH FOUND: {filename}")
            found = True
            break
            
    if not found:
        print("No match found.")

if __name__ == "__main__":
    test_matching()
