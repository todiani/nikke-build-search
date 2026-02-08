# tab_upgrade.py
import tkinter as tk
from tkinter import ttk
from core_state import AppState
from core_constants import OVERLOAD_DATA, WEAPON_OPTION_DEFAULTS

class TabUpgrade:
    def __init__(self, parent, app_state: AppState):
        self.app_state = app_state
        
        frame = ttk.Frame(parent, padding=20)
        frame.pack(fill=tk.BOTH, expand=True)
        
        # 1. 스킬 육성 추천 프레임
        sk_frame = ttk.LabelFrame(frame, text="🛠️ 스킬 육성 추천", padding=15)
        sk_frame.pack(fill=tk.X, pady=10)
        self.upg_skill_lbl = ttk.Label(sk_frame, text="데이터 없음", font=("맑은 고딕", 11), justify="left")
        self.upg_skill_lbl.pack(anchor="w")
        
        # 2. 오버로드 옵션 분석 프레임
        ol_frame = ttk.LabelFrame(frame, text="⚙️ 오버로드 옵션 분석 (유효/무효)", padding=15)
        ol_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.upg_ol_text = tk.Text(ol_frame, height=12, 
                                   bg=self.app_state.colors["surface_light"], 
                                   fg=self.app_state.colors["text"], 
                                   font=("맑은 고딕", 11), relief="flat")
        self.upg_ol_text.pack(fill=tk.BOTH, expand=True)
        
        # 텍스트 태그 설정
        self.upg_ol_text.tag_config("valid", foreground=self.app_state.colors.get("valid", "#2e7d32"), font=("맑은 고딕", 11, "bold"))
        self.upg_ol_text.tag_config("invalid", foreground=self.app_state.colors.get("invalid", "#c62828"))
        self.upg_ol_text.tag_config("neutral", foreground=self.app_state.colors.get("neutral", "#757575"))
        self.upg_ol_text.config(state=tk.DISABLED)
        
        # 3. 큐브 추천 프레임
        cb_frame = ttk.LabelFrame(frame, text="🧊 추천 큐브", padding=15)
        cb_frame.pack(fill=tk.X, pady=10)
        self.upg_cube_lbl = ttk.Label(cb_frame, text="데이터 없음", font=("맑은 고딕", 11))
        self.upg_cube_lbl.pack(anchor="w")

    def update_content(self):
        c = self.app_state.current_nikke
        if not c: 
            return
            
        # 스킬 정보 업데이트
        sp = c.get('skill_priority', {})
        bp = c.get('build_patterns', [])
        
        skill_txt = f"⭐ 중요도: {sp.get('global_rank', '-')}\n"
        skill_txt += f"📈 순서: {sp.get('order', '-')}\n"
        txt_bp = " ➔ ".join(bp) if bp else "정보 없음"
        skill_txt += f"🏗️ 빌드: {txt_bp}"
        self.upg_skill_lbl.config(text=skill_txt)
        
        # 오버로드 정보 업데이트
        self.upg_ol_text.config(state=tk.NORMAL)
        self.upg_ol_text.delete("1.0", tk.END)
        
        ol_data = c.get('overload', {})
        valid_ops = ol_data.get('valid_ops', [])
        invalid_ops = ol_data.get('invalid_ops', [])
        legacy_opts = ol_data.get('options', [])
        weapon = c.get('weapon', 'Unknown')
        
        self.upg_ol_text.insert(tk.END, "✅ 추천 (Valid):\n", "valid")
        if valid_ops:
            for o in valid_ops: self.upg_ol_text.insert(tk.END, f" • {o}\n", "valid")
        elif legacy_opts:
             for o in legacy_opts: self.upg_ol_text.insert(tk.END, f" • {o}\n", "valid")
        else:
             self.upg_ol_text.insert(tk.END, " (설정 없음)\n", "neutral")
        
        self.upg_ol_text.insert(tk.END, "\n❌ 비추천/금지 (Invalid):\n", "invalid")
        if invalid_ops:
             for o in invalid_ops: self.upg_ol_text.insert(tk.END, f" • {o}\n", "invalid")
        else:
            has_invalid = False
            for opt in OVERLOAD_DATA.keys():
                # 무기별 기본 효율이 0인 옵션을 자동으로 비추천 처리
                eff = WEAPON_OPTION_DEFAULTS.get(weapon, {}).get(opt, 0.0)
                if eff == 0.0 and opt not in valid_ops: 
                    self.upg_ol_text.insert(tk.END, f" • {opt} (기본)\n", "invalid")
                    has_invalid = True
            if not has_invalid:
                self.upg_ol_text.insert(tk.END, " (없음)\n", "neutral")

        self.upg_ol_text.config(state=tk.DISABLED)
        
        # 큐브 정보 업데이트
        cubes = c.get('overload', {}).get('recommended_cubes', [])
        self.upg_cube_lbl.config(text=", ".join(cubes) if cubes else "정보 없음")