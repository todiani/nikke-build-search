# tab_edit.py
import tkinter as tk
from tkinter import ttk, messagebox, Toplevel
import re
from core_state import AppState
from io_files import save_database_silent, auto_generate_tags
from core_constants import CONST_COMPANIES, CONST_ROLES, CONST_WEAPONS, CONST_CODES, CONST_BURSTS, OVERLOAD_OPT_TYPES
from widgets_common import setup_scroll_binding

class TabEdit:
    def __init__(self, parent, app_state: AppState, callbacks):
        self.app_state = app_state
        self.callbacks = callbacks # {'search': func, 'update_all': func}
        self.parent = parent
        
        self.edit_canvas = tk.Canvas(parent, bg=self.app_state.colors["bg"], highlightthickness=0)
        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=self.edit_canvas.yview)
        self.edit_frame = ttk.Frame(self.edit_canvas)
        self.edit_frame.bind("<Configure>", lambda e: self.edit_canvas.configure(scrollregion=self.edit_canvas.bbox("all")))
        self.edit_canvas.create_window((0, 0), window=self.edit_frame, anchor="nw")
        self.edit_canvas.configure(yscrollcommand=scrollbar.set)
        self.edit_canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        setup_scroll_binding(self.edit_frame, self.edit_canvas)
        self.edit_entries = {}
        
        # 1. 기본 정보
        basic_frame = ttk.LabelFrame(self.edit_frame, text="기본 정보", padding=10)
        basic_frame.pack(fill=tk.X, padx=10, pady=5)
        
        labels = [
            ("니케 이름", "nikke_name"), ("제조사", "company"), 
            ("역할", "role"), ("코드", "code"), 
            ("버스트", "burst_type"), ("무기", "weapon"),
            ("소속 스쿼드", "squad")
        ]
        
        for i, (txt, key) in enumerate(labels):
            r, c = divmod(i, 2)
            ttk.Label(basic_frame, text=txt).grid(row=r, column=c*2, sticky="e", padx=5, pady=5)
            
            if key == "nikke_name":
                e = ttk.Entry(basic_frame, width=30)
                self.edit_entries[key] = e
            elif key == "company": 
                self.edit_entries[key] = ttk.Combobox(basic_frame, values=CONST_COMPANIES, state="readonly", width=27)
            elif key == "role": 
                self.edit_entries[key] = ttk.Combobox(basic_frame, values=CONST_ROLES, state="readonly", width=27)
            elif key == "code": 
                self.edit_entries[key] = ttk.Combobox(basic_frame, values=CONST_CODES, state="readonly", width=27)
            elif key == "burst_type": 
                self.edit_entries[key] = ttk.Combobox(basic_frame, values=CONST_BURSTS, state="readonly", width=27)
            elif key == "squad": 
                self.edit_entries[key] = ttk.Entry(basic_frame, width=30)
            elif key == "weapon":
                w_frame = ttk.Frame(basic_frame)
                c_w = ttk.Combobox(w_frame, values=CONST_WEAPONS, state="readonly", width=10)
                c_w.pack(side=tk.LEFT)
                e_wn = ttk.Entry(w_frame, width=15)
                e_wn.pack(side=tk.LEFT, padx=(5,0))
                self.edit_entries["weapon"] = c_w
                self.edit_entries["weapon_name"] = e_wn
                w_frame.grid(row=r, column=c*2+1, sticky="w", padx=5)
                continue
            
            self.edit_entries[key].grid(row=r, column=c*2+1, sticky="w", padx=5)

        # 2. 육성 정보
        upg_frame = ttk.LabelFrame(self.edit_frame, text="육성 정보 (자동 완성)", padding=10)
        upg_frame.pack(fill=tk.X, padx=10, pady=5)
        upg_labels = [("종합 랭크:", "global_rank"), ("스킬 순서:", "skill_order"), ("추천 큐브/빌드 (,):", "build_patterns"), ("오버로드 우선순위:", "ol_prio"), ("추천 옵션 (텍스트):", "ol_opts")]
        for i, (lbl, key) in enumerate(upg_labels):
            ttk.Label(upg_frame, text=lbl).grid(row=i, column=0, sticky="e", padx=5, pady=2)
            e = ttk.Entry(upg_frame, width=50)
            e.grid(row=i, column=1, pady=2, sticky="w", padx=5)
            self.edit_entries[key] = e
        ttk.Button(upg_frame, text="⚙️ 오버로드 유효/무효/추천 상세 설정", command=self.open_ol_selector).grid(row=len(upg_labels), column=1, sticky="w", pady=5)

        # 3. 스킬 정보
        skill_frame = ttk.LabelFrame(self.edit_frame, text="스킬 정보 수정", padding=10)
        skill_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # 일반 공격 정보 입력란 (높이 5줄)
        na_frame = ttk.Frame(skill_frame)
        na_frame.pack(fill=tk.X, pady=(0, 15))
        ttk.Label(na_frame, text="일반 공격 정보:", width=15, font=("맑은 고딕", 9, "bold")).pack(side=tk.LEFT, anchor="n")
        self.edit_normal_attack = tk.Text(na_frame, height=5, width=80, font=("맑은 고딕", 9))
        self.edit_normal_attack.pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Label(na_frame, text="예:\n일반 공격\n런처\n최대 장탄 수 6\n...", justify="left", foreground="gray").pack(side=tk.LEFT, anchor="n", padx=5)

        self.edit_skill_names = {}
        self.edit_skill_types = {}     # 스킬 타입 (패시브/액티브)
        self.edit_skill_texts = {}
        self.edit_burst_cd = None      # 버스트 쿨타임 엔트리
        
        skill_keys = ['skill1', 'skill2', 'burst']
        skill_labels = ['스킬 1', '스킬 2', '버스트 스킬']
        
        for k, label in zip(skill_keys, skill_labels):
            sf = ttk.Frame(skill_frame)
            sf.pack(fill=tk.X, pady=5)
            
            # 상단 헤더 (라벨 / 이름 / 타입 / (쿨타임))
            header_f = ttk.Frame(sf)
            header_f.pack(fill=tk.X, pady=(0, 2))
            
            # 라벨
            ttk.Label(header_f, text=f"{label}:", width=12, font=("맑은 고딕", 9, "bold")).pack(side=tk.LEFT)
            
            # 스킬 이름
            name_entry = ttk.Entry(header_f, width=30)
            name_entry.pack(side=tk.LEFT, padx=5)
            self.edit_skill_names[k] = name_entry
            
            # 스킬 타입 (패시브/액티브)
            ttk.Label(header_f, text="타입:").pack(side=tk.LEFT, padx=(10, 2))
            type_combo = ttk.Combobox(header_f, values=["패시브", "액티브"], state="readonly", width=8)
            type_combo.pack(side=tk.LEFT)
            self.edit_skill_types[k] = type_combo
            
            # 버스트 스킬일 경우 쿨타임 추가
            if k == 'burst':
                ttk.Label(header_f, text="재사용 시간:").pack(side=tk.LEFT, padx=(10, 2))
                cd_entry = ttk.Entry(header_f, width=10)
                cd_entry.pack(side=tk.LEFT)
                self.edit_burst_cd = cd_entry
            
            # 설명 텍스트
            t_frame = ttk.Frame(sf)
            t_frame.pack(fill=tk.X, pady=(0, 10))
            ttk.Label(t_frame, text="설명:", width=12).pack(side=tk.LEFT, anchor="n")
            t = tk.Text(t_frame, height=4, width=80, font=("맑은 고딕", 9))
            t.pack(side=tk.LEFT, fill=tk.X, expand=True)
            self.edit_skill_texts[k] = t

        # 4. 버튼
        btn_frame = ttk.Frame(self.edit_frame)
        btn_frame.pack(pady=20)
        
        ttk.Button(btn_frame, text="💾 변경사항 저장", command=self.save_changes, style="Accent.TButton").pack(side=tk.LEFT, padx=10)
        ttk.Button(btn_frame, text="➕ 신규 니케 추가", command=self.add_nikke).pack(side=tk.LEFT, padx=10)
        ttk.Button(btn_frame, text="🗑️ 현재 니케 삭제", command=self.delete_nikke).pack(side=tk.LEFT, padx=10)

    def update_content(self):
        """현재 선택된 니케 정보를 UI에 반영"""
        c = self.app_state.current_nikke
        if not c: 
            self.clear_fields()
            return
        
        def safe_str(val): return str(val) if val is not None else ""
        
        # 기본 정보
        self.edit_entries["nikke_name"].delete(0, tk.END)
        self.edit_entries["nikke_name"].insert(0, safe_str(c.get("nikke_name")))
        
        self.edit_entries["company"].set(safe_str(c.get("company", "Unknown")))
        self.edit_entries["role"].set(safe_str(c.get("role", "Unknown")))
        self.edit_entries["code"].set(safe_str(c.get("code", "Unknown")))
        self.edit_entries["burst_type"].set(safe_str(c.get("burst_type", "Unknown")))
        
        self.edit_entries["squad"].delete(0, tk.END)
        self.edit_entries["squad"].insert(0, safe_str(c.get("squad", "")))
        
        raw_weapon = safe_str(c.get("weapon", "Unknown"))
        w_type = raw_weapon.split("(")[0].strip() if "(" in raw_weapon else raw_weapon
        w_name = raw_weapon.split("(")[1].replace(")", "").strip() if "(" in raw_weapon else ""
        
        self.edit_entries["weapon"].set(w_type)
        self.edit_entries["weapon_name"].delete(0, tk.END)
        self.edit_entries["weapon_name"].insert(0, w_name)
        
        # 육성 정보
        sp = c.get('skill_priority') or {}
        self.edit_entries["global_rank"].delete(0, tk.END)
        self.edit_entries["global_rank"].insert(0, safe_str(sp.get('global_rank')))
        
        self.edit_entries["skill_order"].delete(0, tk.END)
        self.edit_entries["skill_order"].insert(0, safe_str(sp.get('order')))
        
        bp_list = c.get('build_patterns') or []
        cube_list = (c.get('overload') or {}).get('recommended_cubes') or []
        display_build = ",".join([str(x) for x in (bp_list + cube_list) if x])
        
        self.edit_entries["build_patterns"].delete(0, tk.END)
        self.edit_entries["build_patterns"].insert(0, display_build)
        
        ol = c.get('overload') or {}
        self.edit_entries["ol_prio"].delete(0, tk.END)
        self.edit_entries["ol_prio"].insert(0, safe_str(ol.get('priority')))
        
        ol_opts = ol.get('options') or []
        self.edit_entries["ol_opts"].delete(0, tk.END)
        self.edit_entries["ol_opts"].insert(0, ",".join([str(x) for x in ol_opts if x]))
        
        # 스킬 정보
        skills = c.get('skills') or {}
        
        # 일반 공격 정보
        normal_atk = skills.get('normal', {}) if skills else {}
        na_desc = normal_atk.get('desc', '') if isinstance(normal_atk, dict) else ""
        self.edit_normal_attack.delete("1.0", tk.END)
        self.edit_normal_attack.insert("1.0", safe_str(na_desc))

        for k in ['skill1', 'skill2', 'burst']:
            s_data = skills.get(k) or {}
            
            # 이름
            self.edit_skill_names[k].delete(0, tk.END)
            self.edit_skill_names[k].insert(0, safe_str(s_data.get('name')))
            
            # 타입 (패시브/액티브)
            type_val = s_data.get('type', '패시브')
            if k == 'burst' and not s_data.get('type'): type_val = '액티브' # 버스트는 기본 액티브
            self.edit_skill_types[k].set(type_val)
            
            # 쿨타임 (버스트만)
            if k == 'burst':
                self.edit_burst_cd.delete(0, tk.END)
                self.edit_burst_cd.insert(0, safe_str(s_data.get('cooldown', '40.00초')))
            
            # 설명
            self.edit_skill_texts[k].delete("1.0", tk.END)
            self.edit_skill_texts[k].insert("1.0", safe_str(s_data.get('desc')))

    def clear_fields(self):
        """모든 입력 필드 초기화"""
        for entry in self.edit_entries.values():
            if isinstance(entry, ttk.Entry): entry.delete(0, tk.END)
            elif isinstance(entry, ttk.Combobox): entry.set('')
        
        self.edit_normal_attack.delete("1.0", tk.END)
        
        for k in ['skill1', 'skill2', 'burst']:
            self.edit_skill_names[k].delete(0, tk.END)
            self.edit_skill_types[k].set('')
            self.edit_skill_texts[k].delete("1.0", tk.END)
        
        if self.edit_burst_cd:
            self.edit_burst_cd.delete(0, tk.END)

    def save_changes(self):
        if not self.app_state.current_nikke: return
        
        c = self.app_state.current_nikke
        old_name = c.get("nikke_name", "").strip()
        new_name = self.edit_entries["nikke_name"].get().strip()
        
        if not new_name:
            messagebox.showwarning("오류", "니케 이름은 비워둘 수 없습니다.")
            return

        # 이름 변경 확인 및 중복 체크
        if old_name != new_name:
            for char in self.app_state.database:
                if char is not c and char.get("nikke_name") == new_name:
                    messagebox.showerror("오류", f"이미 '{new_name}' 이름을 가진 니케가 존재합니다.")
                    return
            
            confirm = messagebox.askyesno(
                "이름 변경 확인", 
                f"니케 이름을 변경하시겠습니까?\n(기존 데이터가 새 이름으로 저장됩니다)\n\n'{old_name}' ➔ '{new_name}'"
            )
            if not confirm:
                return

        # 데이터 업데이트
        c["nikke_name"] = new_name
        c["company"] = self.edit_entries["company"].get()
        c["role"] = self.edit_entries["role"].get()
        c["code"] = self.edit_entries["code"].get()
        c["burst_type"] = self.edit_entries["burst_type"].get()
        c["squad"] = self.edit_entries["squad"].get().strip()
        
        w_type = self.edit_entries["weapon"].get()
        w_name = self.edit_entries["weapon_name"].get().strip()
        c["weapon"] = f"{w_type} ({w_name})" if w_name else w_type
        
        if 'skill_priority' not in c or c['skill_priority'] is None: c['skill_priority'] = {}
        c['skill_priority']['global_rank'] = self.edit_entries["global_rank"].get()
        c['skill_priority']['order'] = self.edit_entries["skill_order"].get()
        
        raw_build = self.edit_entries["build_patterns"].get()
        items = [x.strip() for x in raw_build.split(',') if x.strip()]
        cubes = [x for x in items if "큐브" in x or "베어" in x or "바스티온" in x]
        builds = [x for x in items if x not in cubes]
        c['build_patterns'] = builds
        
        if 'overload' not in c or c['overload'] is None: c['overload'] = {}
        c['overload']['recommended_cubes'] = cubes
        c['overload']['priority'] = self.edit_entries["ol_prio"].get()
        c['overload']['options'] = [x.strip() for x in self.edit_entries["ol_opts"].get().split(',') if x.strip()]
        
        if 'skills' not in c or c['skills'] is None: c['skills'] = {}
        
        # 일반 공격 정보 저장
        c['skills']['normal'] = {
            "name": "일반 공격",
            "desc": self.edit_normal_attack.get("1.0", tk.END).strip()
        }

        # 스킬 1, 2, 버스트 저장 (타입, 쿨타임 포함)
        for k in ['skill1', 'skill2', 'burst']:
            if k not in c['skills']: c['skills'][k] = {}
            c['skills'][k]['name'] = self.edit_skill_names[k].get().strip()
            c['skills'][k]['desc'] = self.edit_skill_texts[k].get("1.0", tk.END).strip()
            c['skills'][k]['type'] = self.edit_skill_types[k].get() 
            
            if k == 'burst':
                c['skills'][k]['cooldown'] = self.edit_burst_cd.get().strip()
            
        save_database_silent(self.app_state)
        
        # 태그 재분석 및 인덱스 리빌딩
        auto_generate_tags(self.app_state, silent=True)
        
        messagebox.showinfo("성공", f"[{new_name}] 정보가 저장되었습니다!")
        self.callbacks['search']() 
        self.callbacks['update_all']()

    def add_nikke(self):
        """신규 니케를 생성하고 즉시 입력 모드로 전환"""
        base_name = "New Nikke"
        final_name = base_name
        dup_count = 1
        
        existing_names = set(c["nikke_name"] for c in self.app_state.database)
        while final_name in existing_names:
            final_name = f"{base_name} ({dup_count})"
            dup_count += 1
            
        new_char = {
            "nikke_name": final_name,
            "company": "엘리시온", "role": "화력형", "weapon": "AR", 
            "code": "작열", "burst_type": "버스트 I", "squad": "",
            "skills": {
                "normal": {"name": "일반 공격", "desc": ""}, 
                "skill1": {"name": "", "desc": "", "type": "패시브"}, 
                "skill2": {"name": "", "desc": "", "type": "패시브"}, 
                "burst": {"name": "", "desc": "", "type": "액티브", "cooldown": "40.00초"}
            },
            "skill_priority": {}, "build_patterns": [], "overload": {}, "user_data": {}
        }
        
        self.app_state.database.append(new_char)
        self.app_state.current_nikke = new_char
        
        self.callbacks['search']()
        self.update_content()
        
        self.edit_entries["nikke_name"].focus_set()
        self.edit_entries["nikke_name"].select_range(0, tk.END)

    def delete_nikke(self):
        if not self.app_state.current_nikke: return
        target_name = self.app_state.current_nikke['nikke_name']
        if messagebox.askyesno("확인", f"정말로 '{target_name}'을(를) 영구 삭제하시겠습니까?\n(다시는 불러오지 않습니다.)"):
            if self.app_state.current_nikke in self.app_state.database:
                self.app_state.database.remove(self.app_state.current_nikke)
            
            if target_name not in self.app_state.deleted_nikkes:
                self.app_state.deleted_nikkes.append(target_name)
                from io_files import save_config
                save_config(self.app_state, self.parent.winfo_toplevel())
            
            save_database_silent(self.app_state)
            self.app_state.current_nikke = None
            
            # 삭제 후에도 태그 정보 등 갱신
            auto_generate_tags(self.app_state, silent=True)
            
            self.callbacks['search']()
            self.clear_fields()
            
            messagebox.showinfo("완료", "영구적으로 삭제되었습니다.")

    def open_ol_selector(self):
        if not self.app_state.current_nikke: return
        win = Toplevel(self.parent)
        win.title(f"오버로드 옵션 설정 - {self.app_state.current_nikke.get('nikke_name')}")
        win.geometry("550x700") # 창 크기 확장
        
        ol_data = self.app_state.current_nikke.get('overload', {}) or {}
        # 기존 데이터 로드 (추천/유효/무효)
        rec_ops = set(ol_data.get('recommended_ops', []))
        valid_ops = set(ol_data.get('valid_ops', []))
        invalid_ops = set(ol_data.get('invalid_ops', []))
        
        self.ol_vars = {} 
        
        # 헤더
        container = ttk.Frame(win, padding=20)
        container.pack(fill="both", expand=True)
        
        ttk.Label(container, text="자동 설정을 누르거나 직접 선택하세요.", font=("맑은 고딕", 10)).pack(pady=(0, 10))
        
        # 자동 설정 버튼
        btn_auto = ttk.Button(container, text="🤖 니케 무기/스킬 기반 자동 설정", command=lambda: self.auto_configure_ol())
        btn_auto.pack(fill="x", pady=5)
        
        ttk.Separator(container).pack(fill="x", pady=10)
        
        # 스크롤 가능한 영역 생성
        canvas = tk.Canvas(container, highlightthickness=0)
        sb = ttk.Scrollbar(container, orient="vertical", command=canvas.yview)
        scroll_frame = ttk.Frame(canvas)
        
        scroll_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=scroll_frame, anchor="nw")
        canvas.configure(yscrollcommand=sb.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        
        # Grid Header
        ttk.Label(scroll_frame, text="옵션 이름", width=20, font=("bold")).grid(row=0, column=0, padx=5, pady=5)
        ttk.Label(scroll_frame, text="설정 (등급)", width=15, font=("bold")).grid(row=0, column=1, padx=5, pady=5)
        
        # 옵션별 Combobox 생성
        # States: "미미 (△)", "추천 (★)", "유효 (O)", "무효 (X)"
        STATE_MAP = ["△ 미미", "★ 추천", "O 유효", "X 무효"]
        
        for idx, opt in enumerate(OVERLOAD_OPT_TYPES):
            row = idx + 1
            ttk.Label(scroll_frame, text=opt, anchor="w").grid(row=row, column=0, padx=5, pady=2, sticky="w")
            
            # 현재 상태 판별
            current_val = STATE_MAP[0] # Default Neutral
            if opt in rec_ops: current_val = STATE_MAP[1]
            elif opt in valid_ops: current_val = STATE_MAP[2]
            elif opt in invalid_ops: current_val = STATE_MAP[3]
            
            cb = ttk.Combobox(scroll_frame, values=STATE_MAP, state="readonly", width=12)
            cb.set(current_val)
            cb.grid(row=row, column=1, padx=5, pady=2)
            
            self.ol_vars[opt] = cb

        # 저장 버튼
        btn_save = ttk.Button(win, text="💾 설정 저장 및 적용", command=lambda: self.apply_ol_selection(win), style="Accent.TButton")
        btn_save.pack(side="bottom", fill="x", padx=20, pady=20)

    def auto_configure_ol(self):
        """무기 타입과 스킬 텍스트를 분석하여 오버로드 옵션을 자동 설정"""
        if not self.app_state.current_nikke: return
        
        c = self.app_state.current_nikke
        weapon_type = c.get('weapon', '').upper()
        
        # 스킬 텍스트 통합
        skills = c.get('skills', {})
        full_text = ""
        for k in ['skill1', 'skill2', 'burst']:
            full_text += skills.get(k, {}).get('desc', '') + " "
            
        # 설정 맵핑
        # STATE_MAP = ["△ 미미", "★ 추천", "O 유효", "X 무효"]
        new_states = {opt: "△ 미미" for opt in OVERLOAD_OPT_TYPES}
        
        # 1. 공통 기본
        new_states["공격력 증가"] = "O 유효"
        new_states["우월코드 대미지 증가"] = "O 유효"
        
        # 2. 무기별 로직
        if "RL" in weapon_type or "SR" in weapon_type:
            new_states["차지 속도 증가"] = "O 유효"
            new_states["차지 대미지 증가"] = "O 유효"
        elif any(x in weapon_type for x in ["AR", "SMG", "MG", "SG"]):
            new_states["차지 속도 증가"] = "X 무효"
            new_states["차지 대미지 증가"] = "X 무효"
            
        if "SG" in weapon_type or "SMG" in weapon_type:
            new_states["명중률 증가"] = "O 유효"
            
        # 3. 스킬 기반 스마트 분석
        # 마지막 탄환 -> 장탄수 무효
        if "마지막 탄환" in full_text:
            new_states["최대 장탄 수 증가"] = "X 무효"
        else:
            # 기본적으로 장탄수는 좋음
            new_states["최대 장탄 수 증가"] = "O 유효"
            
        # 최대 체력 계수 -> 체력 추천
        if "최대 체력" in full_text and "비례" in full_text:
            # 지원형/방어형일 가능성 높음 -> 공증보다 체력이 중요할 수 있음
            # 여기서는 단순히 추천으로 격상
            pass # (방어력/체력은 기본적으로 미미하지만 필요시 유저가 설정)
            
        # 차지 속도 100% 목표 니케 (앨리스, 레드후드 등) -> 추천
        if "차지 속도" in full_text and ("RL" in weapon_type or "SR" in weapon_type):
            new_states["차지 속도 증가"] = "★ 추천"
            
        # UI 반영
        for opt, state in new_states.items():
            if opt in self.ol_vars:
                self.ol_vars[opt].set(state)
                
        messagebox.showinfo("자동 설정 완료", "무기 및 스킬 정보를 기반으로 옵션을 자동 설정했습니다.\n필요시 수동으로 조정해주세요.")

    def apply_ol_selection(self, win):
        if not self.app_state.current_nikke: return
        
        new_rec = []
        new_valid = []
        new_invalid = []
        
        # STATE_MAP = ["△ 미미", "★ 추천", "O 유효", "X 무효"]
        for opt, cb in self.ol_vars.items():
            val = cb.get()
            if "★" in val: new_rec.append(opt)
            elif "O" in val: new_valid.append(opt)
            elif "X" in val: new_invalid.append(opt)
            # 미미(Neutral)는 리스트에 넣지 않음
            
        if 'overload' not in self.app_state.current_nikke or self.app_state.current_nikke['overload'] is None:
            self.app_state.current_nikke['overload'] = {}
            
        self.app_state.current_nikke['overload']['recommended_ops'] = new_rec
        self.app_state.current_nikke['overload']['valid_ops'] = new_valid
        self.app_state.current_nikke['overload']['invalid_ops'] = new_invalid
        
        # 텍스트로도 요약 저장 (UI 표시용)
        summary = []
        if new_rec: summary.append(f"★: {', '.join(new_rec)}")
        if new_valid: summary.append(f"O: {', '.join(new_valid)}")
        self.app_state.current_nikke['overload']['options'] = summary
        
        save_database_silent(self.app_state)
        self.callbacks['update_all']()
        win.destroy()
        messagebox.showinfo("완료", "오버로드 설정이 저장되었습니다.")