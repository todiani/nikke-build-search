# tab_calc.py
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import os
import json
from collections import defaultdict
from core_state import AppState
from core_constants import PARTS, PART_NAMES, OPTION_LIST, OVERLOAD_DATA
from core_utils import calculate_power_detailed, get_max_value_for_option

class TabCalc:
    def __init__(self, parent, app_state: AppState):
        self.app_state = app_state
        
        # 메인 스크롤 캔버스
        canvas = tk.Canvas(parent, highlightthickness=0)
        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=canvas.yview)
        self.scroll_frame = ttk.Frame(canvas)
        
        # 캔버스 크기 조정 바인딩
        self.scroll_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        
        # canvas_window를 생성할 때 width를 고정하지 않고 유동적으로 처리
        self.canvas_window = canvas.create_window((0, 0), window=self.scroll_frame, anchor="nw")
        
        def on_canvas_configure(event):
            canvas.itemconfig(self.canvas_window, width=event.width)
        canvas.bind("<Configure>", on_canvas_configure)
        
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # 전체 내용을 담는 중앙 정렬용 프레임
        center_frame = ttk.Frame(self.scroll_frame)
        center_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 1. Base Stats (+ Result Summary)
        self.create_base_stats_ui(center_frame)
        
        # 2. Overload Options
        self.create_overload_ui(center_frame)
        
        # 3. Result Analysis
        self.create_result_ui(center_frame)

    def create_base_stats_ui(self, parent):
        # 전체를 감싸는 프레임
        container_frame = ttk.LabelFrame(parent, text="1. 기본 스탯 및 결과 요약", padding=10)
        container_frame.pack(fill=tk.X, pady=(0, 10))
        
        # 내부 컨텐츠를 좌측 정렬하기 위한 프레임
        inner_frame = ttk.Frame(container_frame)
        inner_frame.pack(anchor="w", fill=tk.X)

        # === [Left Side] Inputs ===
        f_inputs = ttk.Frame(inner_frame)
        f_inputs.pack(side=tk.LEFT, padx=(0, 20), anchor="n")
        
        if not self.app_state.calc_vars:
            self.app_state.calc_vars = {
                "hp": tk.StringVar(value="1000000"), "atk": tk.StringVar(value="50000"), "def": tk.StringVar(value="10000"),
                "s1": tk.StringVar(value="10"), "s2": tk.StringVar(value="10"), "burst": tk.StringVar(value="10"),
                "cube_lvl": tk.StringVar(value="0"), "col_grade": tk.StringVar(value="None"),
                "col_skill1": tk.StringVar(value="0"), "col_skill2": tk.StringVar(value="0")
            }
        
        for var in self.app_state.calc_vars.values(): var.trace_add("write", self.do_calc)
        
        # Input Grid
        # Row 0: Stats
        ttk.Label(f_inputs, text="HP:").grid(row=0, column=0, padx=2, sticky="e")
        ttk.Entry(f_inputs, textvariable=self.app_state.calc_vars["hp"], width=10).grid(row=0, column=1, padx=2)
        ttk.Label(f_inputs, text="ATK:").grid(row=0, column=2, padx=2, sticky="e")
        ttk.Entry(f_inputs, textvariable=self.app_state.calc_vars["atk"], width=10).grid(row=0, column=3, padx=2)
        ttk.Label(f_inputs, text="DEF:").grid(row=0, column=4, padx=2, sticky="e")
        ttk.Entry(f_inputs, textvariable=self.app_state.calc_vars["def"], width=10).grid(row=0, column=5, padx=2)
        
        # Row 1: Skills & Cube
        ttk.Label(f_inputs, text="스킬(1/2/B):").grid(row=1, column=0, padx=2, sticky="e", pady=5)
        f_skill = ttk.Frame(f_inputs)
        f_skill.grid(row=1, column=1, columnspan=3, sticky="w")
        for v in ["s1", "s2", "burst"]: 
            ttk.Entry(f_skill, textvariable=self.app_state.calc_vars[v], width=4).pack(side="left", padx=1)
        
        ttk.Label(f_inputs, text="큐브Lv:").grid(row=1, column=4, padx=2, sticky="e")
        ttk.Combobox(f_inputs, textvariable=self.app_state.calc_vars["cube_lvl"], values=[str(i) for i in range(16)], width=4, state="readonly").grid(row=1, column=5, sticky="w", padx=2)
        
        # Row 2: Collection
        ttk.Label(f_inputs, text="소장품:").grid(row=2, column=0, padx=2, sticky="e")
        f_col = ttk.Frame(f_inputs)
        f_col.grid(row=2, column=1, columnspan=5, sticky="w")
        ttk.Combobox(f_col, textvariable=self.app_state.calc_vars["col_grade"], values=["None", "R", "SR", "SSR"], width=6, state="readonly").pack(side="left")
        ttk.Label(f_col, text="Lv:").pack(side="left", padx=2)
        ttk.Combobox(f_col, textvariable=self.app_state.calc_vars["col_skill1"], values=[str(i) for i in range(16)], width=3, state="readonly").pack(side="left")
        ttk.Combobox(f_col, textvariable=self.app_state.calc_vars["col_skill2"], values=[str(i) for i in range(16)], width=3, state="readonly").pack(side="left")

        # Row 3: Buttons
        btn_area = ttk.Frame(f_inputs)
        btn_area.grid(row=3, column=0, columnspan=6, sticky="ew", pady=(10,0))
        ttk.Button(btn_area, text="💾 설정 저장", command=self.save_current_user_data, style="Accent.TButton", width=12).pack(side=tk.LEFT, padx=2)
        ttk.Button(btn_area, text="📋 전체 수집데이터 적용", command=self.apply_all_external_data, width=18).pack(side=tk.LEFT, padx=2)
        ttk.Button(btn_area, text="📂 개별 데이터 로드", command=self.load_individual_external_data, width=15).pack(side=tk.LEFT, padx=2)
        ttk.Button(btn_area, text="❓ 도움말", command=self.show_formula_info, width=8).pack(side=tk.LEFT, padx=2)

        # === [Right Side] Result Summary (Compact) ===
        # 구분선 (세로)
        ttk.Separator(inner_frame, orient="vertical").pack(side=tk.LEFT, fill="y", padx=10)
        
        f_result = ttk.Frame(inner_frame)
        f_result.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # 결과 표시 박스 (크기 고정하지 않고 내용물에 맞춤)
        summary_box = ttk.Frame(f_result, style="Card.TFrame", padding=10)
        summary_box.pack(anchor="w", fill=tk.Y, expand=True)
        
        # 상단: 전투력
        f_cp = ttk.Frame(summary_box)
        f_cp.pack(fill=tk.X)
        ttk.Label(f_cp, text="예상 전투력", font=("맑은 고딕", 9), foreground="gray").pack(anchor="w")
        self.calc_total_cp = ttk.Label(f_cp, text="0", font=("맑은 고딕", 20, "bold"), foreground=self.app_state.colors["primary"])
        self.calc_total_cp.pack(anchor="w")
        
        ttk.Separator(summary_box, orient="horizontal").pack(fill="x", pady=5)
        
        # 하단: 종결도
        f_score = ttk.Frame(summary_box)
        f_score.pack(fill=tk.X)
        ttk.Label(f_score, text="오버로드 종결도", font=("맑은 고딕", 9), foreground="gray").pack(anchor="w")
        self.calc_score_lbl = ttk.Label(f_score, text="0% (F)", font=("맑은 고딕", 14, "bold"), foreground="#555555")
        self.calc_score_lbl.pack(anchor="w")

    def create_overload_ui(self, parent):
        ol_frame = ttk.LabelFrame(parent, text="2. 장비 옵션 (실시간 반영)", padding=10)
        ol_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Grid 설정: 2열 배치 (창이 좁아도 잘 보이게 너비 조정)
        pos_map = {"helmet": (0,0), "armor": (0,1), "gloves": (1,0), "boots": (1,1)}
        
        for i, part_key in enumerate(PARTS):
            r, c = pos_map[part_key]
            p_frame = ttk.LabelFrame(ol_frame, text=PART_NAMES[part_key], padding=5)
            p_frame.grid(row=r, column=c, padx=5, pady=5, sticky="nsew")
            
            part_opts = []
            for j in range(3):
                row_f = ttk.Frame(p_frame)
                row_f.pack(fill=tk.X, pady=2)
                
                tv = tk.StringVar(value="옵션없음")
                sv = tk.StringVar(value="0단계 (0.00%)")
                
                tv.trace_add("write", self.do_calc)
                sv.trace_add("write", self.do_calc)
                
                # ★ [수정] 콤보박스 너비 축소 (22->15, 18->13)
                cb_type = ttk.Combobox(row_f, textvariable=tv, values=OPTION_LIST, width=15, state="readonly")
                cb_type.pack(side=tk.LEFT)
                
                cb_stg = ttk.Combobox(row_f, textvariable=sv, width=13, state="readonly")
                cb_stg.pack(side=tk.LEFT, padx=3)
                
                lbl_eval = ttk.Label(row_f, text="-", font=("맑은 고딕", 8), width=6)
                lbl_eval.pack(side=tk.LEFT, padx=2)
                
                def update_vals(event, t_var=tv, s_combo=cb_stg, l_eval=lbl_eval):
                    t = t_var.get()
                    self.update_validity_label(t, l_eval)
                    if t in OVERLOAD_DATA:
                        vals = [f"{k}단계 ({v}%)" for k, v in enumerate(OVERLOAD_DATA[t])]
                        s_combo['values'] = vals
                        s_combo.current(0)
                    else:
                        s_combo['values'] = ["0단계 (0.00%)"]
                        s_combo.current(0)
                    self.do_calc()

                cb_type.bind("<<ComboboxSelected>>", update_vals)
                part_opts.append((tv, sv, cb_type, cb_stg, lbl_eval)) 
            self.app_state.calc_opts[i] = part_opts
            
        ol_frame.columnconfigure(0, weight=1)
        ol_frame.columnconfigure(1, weight=1)

    def create_result_ui(self, parent):
        res_frame = ttk.LabelFrame(parent, text="3. 효율 상세 분석", padding=10)
        res_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        cols = ("category", "val", "grade", "cp")
        self.calc_tree = ttk.Treeview(res_frame, columns=cols, show="headings", height=8)
        
        self.calc_tree.heading("category", text="항목")
        self.calc_tree.heading("val", text="합계 / %")
        self.calc_tree.heading("grade", text="평가")
        self.calc_tree.heading("cp", text="CP 기여")
        
        # 컬럼 너비 조정
        self.calc_tree.column("category", width=200, anchor="w")
        self.calc_tree.column("val", width=150, anchor="center")
        self.calc_tree.column("grade", width=150, anchor="center")
        self.calc_tree.column("cp", width=100, anchor="e")
        
        self.calc_tree.pack(fill=tk.BOTH, expand=True)
        
        # 태그별 색상
        self.calc_tree.tag_configure("valid", foreground="#2e7d32") # Green
        self.calc_tree.tag_configure("invalid", foreground="#c62828") # Red
        self.calc_tree.tag_configure("neutral", foreground="#000000") # Black
        self.calc_tree.tag_configure("header_row", background="#eeeeee", font=("bold"))

    def update_validity_label(self, opt_type, label_widget):
        if not self.app_state.current_nikke:
            label_widget.config(text="-", foreground="black")
            return

        ol_data = self.app_state.current_nikke.get('overload', {})
        valid_ops = ol_data.get('valid_ops', [])
        invalid_ops = ol_data.get('invalid_ops', [])

        if opt_type == "옵션없음":
            label_widget.config(text="-", foreground="gray")
        elif opt_type in valid_ops:
            label_widget.config(text="★추천", foreground="#2e7d32") # Green
        elif opt_type in invalid_ops:
            label_widget.config(text="✖비추", foreground="#c62828") # Red
        else:
            label_widget.config(text="➖무난", foreground="#555555") # Gray

    def calculate_display_grade(self, percentage, is_valid, is_invalid):
        grade_str = ""
        tag = "neutral"
        
        if percentage >= 95: grade_str = "SSS (졸업)"
        elif percentage >= 85: grade_str = "SS (준졸업)"
        elif percentage >= 70: grade_str = "S (우수)"
        elif percentage >= 50: grade_str = "A (보통)"
        else: grade_str = "B (부족)"
        
        if is_valid:
            prefix = "[★추천]"
            tag = "valid"
        elif is_invalid:
            prefix = "[✖비추]"
            tag = "invalid"
            grade_str = "F (무효)"
        else:
            prefix = "[➖무난]"
            tag = "neutral"
            
        final_text = f"{prefix} {grade_str}"
        return final_text, tag

    def do_calc(self, *args):
        if not self.app_state.current_nikke: return
        try:
            p_opts = {}
            for i, part in enumerate(PARTS):
                p_opts[part] = {}
                for j in range(3):
                    t = self.app_state.calc_opts[i][j][0].get()
                    s = self.app_state.calc_opts[i][j][1].get()
                    p_opts[part][f"option{j+1}"] = {"type": t, "stage": s}

            weapon = self.app_state.current_nikke.get('weapon', 'Unknown')
            res = calculate_power_detailed(
                self.app_state.calc_vars["hp"].get(), self.app_state.calc_vars["atk"].get(), self.app_state.calc_vars["def"].get(),
                int(self.app_state.calc_vars["s1"].get()), int(self.app_state.calc_vars["s2"].get()), int(self.app_state.calc_vars["burst"].get()),
                p_opts, int(self.app_state.calc_vars["cube_lvl"].get()), 
                self.app_state.calc_vars["col_grade"].get(), int(self.app_state.calc_vars["col_skill1"].get()), int(self.app_state.calc_vars["col_skill2"].get()),
                weapon, self.app_state.current_nikke
            )
            
            total_cp = res["power"]
            grad_score = res["score"]
            d = res["details"]
            
            # 결과값 상단 업데이트
            self.calc_total_cp.config(text=f"{total_cp:,}")
            self.calc_score_lbl.config(text=f"{grad_score:.1f}% ({self.get_total_grade_str(grad_score)})")
            
            self.calc_tree.delete(*self.calc_tree.get_children())
            
            # 1. Base Stats
            self.calc_tree.insert("", "end", values=("기본 스탯 (깡전투력)", "-", "-", f"{int(d['base_cp']):,}"), tags=("header_row",))
            
            # 2. Growth
            self.calc_tree.insert("", "end", values=("스킬 성장도", f"{d['skill_pct']:.1f}%", self.get_pct_grade_str(d['skill_pct']), f"{int(d['skill_cp']):,}"))
            self.calc_tree.insert("", "end", values=("큐브 성장도", f"{d['cube_pct']:.1f}%", self.get_pct_grade_str(d['cube_pct']), f"{int(d['cube_cp']):,}"))
            self.calc_tree.insert("", "end", values=("소장품 성장도", f"{d['col_pct']:.1f}%", self.get_pct_grade_str(d['col_pct']), f"{int(d['col_cp']):,}"))
            
            # 3. Overload Aggregated Stats
            self.calc_tree.insert("", "end", values=("오버로드 (옵션별 합계)", "-", f"종결도 {grad_score:.1f}%", f"{int(d['ol_cp']):,}"), tags=("header_row",))
            
            ol_data = self.app_state.current_nikke.get('overload', {})
            valid_ops = ol_data.get('valid_ops', [])
            invalid_ops = ol_data.get('invalid_ops', [])

            for item in d['ol_aggregated']:
                val_display = f"{item['val']:.2f}% (총{item['pct']:.1f}%)"
                
                is_v = item['type'] in valid_ops
                is_i = item['type'] in invalid_ops
                
                grade_text, tag_color = self.calculate_display_grade(item['pct'], is_v, is_i)
                
                self.calc_tree.insert("", "end", values=(
                    f"{item['type']} ({item['lines']}줄)",
                    val_display,
                    grade_text,
                    f"{int(item['cp']):,}"
                ), tags=(tag_color,))

        except Exception as e: pass

    def get_total_grade_str(self, pct):
        if pct >= 80: return "졸업"
        if pct >= 50: return "우수"
        if pct >= 30: return "보통"
        return "미흡"

    def get_pct_grade_str(self, pct):
        if pct >= 100: return "MAX"
        if pct >= 80: return "High"
        if pct >= 50: return "Mid"
        return "Low"
    
    def save_current_user_data(self):
        if not self.app_state.current_nikke: return
        p_opts = {}
        for i, part in enumerate(PARTS):
            part_list = []
            for j in range(3):
                t_var, s_var, _, _, _ = self.app_state.calc_opts[i][j]
                part_list.append({"type": t_var.get(), "stage": s_var.get()})
            p_opts[part] = part_list
        data = {
            "hp": self.app_state.calc_vars["hp"].get(),
            "atk": self.app_state.calc_vars["atk"].get(),
            "def": self.app_state.calc_vars["def"].get(),
            "s1": self.app_state.calc_vars["s1"].get(),
            "s2": self.app_state.calc_vars["s2"].get(),
            "burst": self.app_state.calc_vars["burst"].get(),
            "cube_lvl": self.app_state.calc_vars["cube_lvl"].get(),
            "col_grade": self.app_state.calc_vars["col_grade"].get(),
            "col_skill1": self.app_state.calc_vars["col_skill1"].get(),
            "col_skill2": self.app_state.calc_vars["col_skill2"].get(),
            "options": p_opts
        }
        self.app_state.current_nikke["user_data"] = data
        from io_files import save_database_silent
        save_database_silent(self.app_state)
        tk.messagebox.showinfo("저장 완료", "설정이 저장되었습니다.")

    def show_formula_info(self):
        msg = """
📊 계산 방식 안내

1. 종결도(Graduation %):
   - 해당 니케의 '추천 옵션(Valid Ops)'이 얼마나 높은 수치로 붙었는지 평가합니다.
   
2. 성능(Efficiency):
   - 현재 수치가 최대치(15단계) 대비 몇 %인지 나타냅니다.
   
3. CP 기여도:
   - 해당 항목이 실제 전투력 수치에 얼마나 기여하는지 보여줍니다.
"""
        messagebox.showinfo("도움말", msg)

    def load_current_user_data(self):
        if not self.app_state.current_nikke: return
        u_data = self.app_state.current_nikke.get("user_data", {})
        
        # 1. 기존 데이터 초기화 (잔상 제거)
        for i in range(4):
            for j in range(3):
                t_var, s_var, cb_type, cb_stg, lbl_eval = self.app_state.calc_opts[i][j]
                t_var.set("옵션없음")
                s_var.set("0단계 (0.00%)")
                cb_stg['values'] = ["0단계 (0.00%)"]
                self.update_validity_label("옵션없음", lbl_eval)

        # 2. 기존 저장된 사용자 데이터 로드
        self.app_state.calc_vars["hp"].set(u_data.get("hp", "1000000"))
        self.app_state.calc_vars["atk"].set(u_data.get("atk", "50000"))
        self.app_state.calc_vars["def"].set(u_data.get("def", "10000"))
        self.app_state.calc_vars["s1"].set(u_data.get("s1", "10"))
        self.app_state.calc_vars["s2"].set(u_data.get("s2", "10"))
        self.app_state.calc_vars["burst"].set(u_data.get("burst", "10"))
        self.app_state.calc_vars["cube_lvl"].set(u_data.get("cube_lvl", "0"))
        self.app_state.calc_vars["col_grade"].set(u_data.get("col_grade", "None"))
        self.app_state.calc_vars["col_skill1"].set(u_data.get("col_skill1", "0"))
        self.app_state.calc_vars["col_skill2"].set(u_data.get("col_skill2", "0"))
        
        saved_opts = u_data.get("options", {})
        for i, part in enumerate(PARTS):
            if part in saved_opts:
                for j, opt in enumerate(saved_opts[part]):
                    if j < 3:
                        t_val = opt.get("type", "옵션없음")
                        s_val = opt.get("stage", "0단계 (0.00%)")
                        
                        t_var, s_var, cb_type, cb_stg, lbl_eval = self.app_state.calc_opts[i][j]
                        
                        t_var.set(t_val)
                        if t_val in OVERLOAD_DATA:
                            vals = [f"{k}단계 ({v}%)" for k, v in enumerate(OVERLOAD_DATA[t_val])]
                            cb_stg['values'] = vals
                        else:
                            cb_stg['values'] = ["0단계 (0.00%)"]
                        
                        s_var.set(s_val)
                        self.update_validity_label(t_val, lbl_eval)

        # 3. 외부 데이터(Tampermonkey DATA)에서 빈 자리 채우기
        self.auto_fill_from_external_data()
        
        self.do_calc()

    def apply_all_external_data(self):
        """외부 JSON 데이터의 모든 수치를 현재 계산기에 강제 적용 (덮어쓰기)"""
        if not self.app_state.current_nikke: 
            messagebox.showwarning("경고", "대상이 선택되지 않았습니다.")
            return
        
        name = self.app_state.current_nikke.get("nikke_name")
        file_path = self.get_external_data_path(name)
        
        if not file_path:
            messagebox.showinfo("알림", f"'{name}'에 대한 수집 데이터를 찾을 수 없습니다.\n(Tampermonkey Script/DATA 폴더 확인)")
            return
            
        if not messagebox.askyesno("전체 적용", f"'{name}'의 수집 데이터를 전체 적용하시겠습니까?\n기존 입력된 수치가 모두 변경됩니다."):
            return

        self._apply_data_from_file(file_path)
        messagebox.showinfo("완료", f"'{name}' 데이터가 적용되었습니다.")

    def load_individual_external_data(self):
        """파일 탐색기를 통해 특정 수집 데이터를 선택하여 로드"""
        data_dir = r"r:\AI\nikke-build-search\Tampermonkey Script\DATA"
        if not os.path.exists(data_dir):
            data_dir = os.getcwd()

        file_path = filedialog.askopenfilename(
            initialdir=data_dir,
            title="수집 데이터(JSON) 선택",
            filetypes=(("JSON files", "*.json"), ("All files", "*.*"))
        )
        
        if not file_path:
            return

        self._apply_data_from_file(file_path)
        messagebox.showinfo("완료", "선택한 데이터가 적용되었습니다.")

    def _apply_data_from_file(self, file_path):
        """공통 데이터 적용 로직 (덮어쓰기 모드)"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                ext_data = json.load(f)
            
            # 1. 기본 스탯 업데이트 (강제 덮어쓰기)
            stats = ext_data.get("stats", {})
            if stats:
                self.app_state.calc_vars["hp"].set(str(stats.get("hp", "1000000")))
                self.app_state.calc_vars["atk"].set(str(stats.get("atk", "50000")))
                self.app_state.calc_vars["def"].set(str(stats.get("def", "10000")))

            # 2. 스킬 정보 (있는 경우만)
            skills = ext_data.get("skills", {})
            if skills:
                if "skill1" in skills: self.app_state.calc_vars["s1"].set(str(skills["skill1"]))
                if "skill2" in skills: self.app_state.calc_vars["s2"].set(str(skills["skill2"]))
                if "burst" in skills: self.app_state.calc_vars["burst"].set(str(skills["burst"]))

            # 3. 큐브 및 소장품
            cube = ext_data.get("cube", {})
            if cube: self.app_state.calc_vars["cube_lvl"].set(str(cube.get("level", "0")))
            
            col = ext_data.get("collection", {})
            if col:
                self.app_state.calc_vars["col_grade"].set(col.get("rarity", "None"))
                self.app_state.calc_vars["col_skill1"].set(str(col.get("skillLv1", "0")))
                self.app_state.calc_vars["col_skill2"].set(str(col.get("skillLv2", "0")))

            # 4. 오버로드 옵션 업데이트 (강제 덮어쓰기)
            # 기존 옵션 초기화
            for i in range(4):
                for j in range(3):
                    t_var, s_var, _, cb_stg, lbl_eval = self.app_state.calc_opts[i][j]
                    t_var.set("옵션없음")
                    s_var.set("0단계 (0.00%)")
                    cb_stg['values'] = ["0단계 (0.00%)"]
                    self.update_validity_label("옵션없음", lbl_eval)

            equipment = ext_data.get("equipment", [])
            part_map = {1: 0, 2: 1, 3: 2, 4: 3}
            
            for eq in equipment:
                p_idx = eq.get("partIndex")
                if p_idx not in part_map: continue
                
                ui_idx = part_map[p_idx]
                options = eq.get("options", [])
                
                for idx, opt in enumerate(options):
                    # opt.get("slot") 정보가 있으면 사용 (1-based), 없으면 루프 인덱스 사용
                    slot_idx = opt.get("slot")
                    if slot_idx is not None and 1 <= slot_idx <= 3:
                        j = slot_idx - 1
                    else:
                        j = idx
                    
                    if j >= 3: continue
                    
                    t_var, s_var, cb_type, cb_stg, lbl_eval = self.app_state.calc_opts[ui_idx][j]
                    
                    opt_name = opt.get("name", "").strip()
                    opt_val = opt.get("value", "0.00%").strip()
                    
                    if opt_name in OVERLOAD_DATA:
                        stage_str = self.map_value_to_stage(opt_name, opt_val)
                        t_var.set(opt_name)
                        vals = [f"{k}단계 ({v}%)" for k, v in enumerate(OVERLOAD_DATA[opt_name])]
                        cb_stg['values'] = vals
                        s_var.set(stage_str)
                        self.update_validity_label(opt_name, lbl_eval)
            
            # UI 강제 업데이트
            self.do_calc()
            
        except Exception as e:
            print(f"[Error] Failed to apply external data from {file_path}: {e}")
            messagebox.showerror("오류", f"데이터 적용 중 오류가 발생했습니다: {e}")

    def get_external_data_path(self, nikke_name):
        """니케 이름을 기반으로 Tampermonkey DATA 폴더에서 매칭되는 JSON 파일 경로를 찾음"""
        try:
            # 1. 경로 탐색: 사용자가 명시한 경로를 1순위로 사용
            data_dir = r"r:\AI\nikke-build-search\Tampermonkey Script\DATA"
            
            if not os.path.exists(data_dir):
                # 예비 경로들 (상대 경로 등)
                backup_dirs = [
                    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Tampermonkey Script", "DATA"),
                    os.path.join(os.getcwd(), "Tampermonkey Script", "DATA")
                ]
                for d in backup_dirs:
                    if os.path.exists(d):
                        data_dir = d
                        break
            
            if not os.path.exists(data_dir):
                return None
                
            def normalize(name):
                if not name: return ""
                # 모든 공백, 특수문자, 대소문자 제거하여 비교
                return "".join(e for e in name if e.isalnum()).lower()
            
            target_norm = normalize(nikke_name)
            if not target_norm: return None
            
            files = [f for f in os.listdir(data_dir) if f.endswith(".json")]
            
            # 1순위: 정규화된 이름이 정확히 일치하는 파일 (ID 제외)
            # 예: "라피 : 레드 후드" -> "라피레드후드", "라피 - 레드 후드(16).json" -> "라피레드후드"
            for filename in files:
                name_part = filename.rsplit('(', 1)[0] if '(' in filename else filename.replace('.json', '')
                if normalize(name_part) == target_norm:
                    return os.path.join(data_dir, filename)
            
            # 2순위: 정규화된 이름이 포함된 파일
            for filename in files:
                if target_norm in normalize(filename):
                    return os.path.join(data_dir, filename)
            
            # 3순위: 원본 이름 변환 매칭
            search_name = nikke_name.replace(" : ", " - ").replace(":", " - ")
            for filename in files:
                if search_name in filename or nikke_name in filename:
                    return os.path.join(data_dir, filename)
                    
        except Exception as e:
            print(f"[Debug] get_external_data_path error: {e}")
        return None

    def map_value_to_stage(self, opt_name, value_str):
        """퍼센트 문자열(예: '6.88%')을 단계 문자열(예: '4단계 (6.88%)')로 변환"""
        if opt_name not in OVERLOAD_DATA:
            return "0단계 (0.00%)"
            
        try:
            val_str = value_str.replace('%', '').strip()
            val = float(val_str)
            stages = OVERLOAD_DATA[opt_name]
            
            # 가장 가까운 값 찾기 (부동소수점 오차 고려)
            best_idx = 0
            min_diff = 999.0
            for i, s_val in enumerate(stages):
                diff = abs(s_val - val)
                if diff < min_diff:
                    min_diff = diff
                    best_idx = i
            
            return f"{best_idx}단계 ({stages[best_idx]:.2f}%)"
        except Exception as e:
            return "0단계 (0.00%)"

    def auto_fill_from_external_data(self):
        """외부 JSON 데이터에서 현재 '옵션없음'인 칸만 자동으로 채움"""
        if not self.app_state.current_nikke: return
        
        name = self.app_state.current_nikke.get("nikke_name")
        file_path = self.get_external_data_path(name)
        
        if not file_path:
            return
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                ext_data = json.load(f)
            
            # 1. 기본 스탯 업데이트 (초기값인 경우만)
            stats = ext_data.get("stats", {})
            hp_val = str(stats.get("hp", "1000000"))
            atk_val = str(stats.get("atk", "50000"))
            def_val = str(stats.get("def", "10000"))
            
            if self.app_state.calc_vars["hp"].get() in ["1000000", "0", ""]:
                self.app_state.calc_vars["hp"].set(hp_val)
            if self.app_state.calc_vars["atk"].get() in ["50000", "0", ""]:
                self.app_state.calc_vars["atk"].set(atk_val)
            if self.app_state.calc_vars["def"].get() in ["10000", "0", ""]:
                self.app_state.calc_vars["def"].set(def_val)

            # 2. 오버로드 옵션 업데이트 (빈 자리만)
            equipment = ext_data.get("equipment", [])
            # partIndex 1:머리, 2:몸통, 3:장갑, 4:신발
            part_map = {1: 0, 2: 1, 3: 2, 4: 3}
            
            for eq in equipment:
                p_idx = eq.get("partIndex")
                if p_idx not in part_map: continue
                
                ui_idx = part_map[p_idx]
                options = eq.get("options", [])
                
                for idx, opt in enumerate(options):
                    # opt.get("slot") 정보가 있으면 사용 (1-based), 없으면 루프 인덱스 사용
                    slot_idx = opt.get("slot")
                    if slot_idx is not None and 1 <= slot_idx <= 3:
                        j = slot_idx - 1
                    else:
                        j = idx
                    
                    if j >= 3: continue
                    
                    t_var, s_var, cb_type, cb_stg, lbl_eval = self.app_state.calc_opts[ui_idx][j]
                    
                    # 현재 "옵션없음"인 경우에만 채움 (사용자가 바꾼 곳은 유지)
                    current_opt = t_var.get().strip()
                    if current_opt == "옵션없음" or not current_opt:
                        opt_name = opt.get("name", "").strip()
                        opt_val = opt.get("value", "0.00%").strip()
                        
                        if opt_name in OVERLOAD_DATA:
                            stage_str = self.map_value_to_stage(opt_name, opt_val)
                            
                            t_var.set(opt_name)
                            # 단계 콤보박스 값 갱신
                            vals = [f"{k}단계 ({v}%)" for k, v in enumerate(OVERLOAD_DATA[opt_name])]
                            cb_stg['values'] = vals
                            s_var.set(stage_str)
                            self.update_validity_label(opt_name, lbl_eval)
            
            # UI 강제 업데이트
            self.do_calc()
            
        except Exception as e:
            print(f"[Error] Failed to auto-fill external data for {name}: {e}")