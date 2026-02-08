# tab_compare.py
import tkinter as tk
from tkinter import ttk, messagebox
import copy
from core_state import AppState
from core_constants import PARTS, PART_NAMES, OPTION_LIST, OVERLOAD_DATA, OVERLOAD_OPT_TYPES
from core_utils import calculate_power_detailed

class TabCompare:
    def __init__(self, parent, app_state: AppState, calc_callback):
        self.app_state = app_state
        self.calc_callback = calc_callback 
        
        # 메인 프레임
        frame = ttk.Frame(parent, padding=20)
        frame.pack(fill=tk.BOTH, expand=True)
        
        # 헤더
        top_frame = ttk.Frame(frame)
        top_frame.pack(fill=tk.X, pady=(0, 10))
        ttk.Label(top_frame, text="⚖️ 장비 옵션 시뮬레이션 (CP & 종결도 비교)", style="Header.TLabel").pack(side=tk.LEFT)
        
        # 1. 부위 선택
        sel_frame = ttk.LabelFrame(frame, text="비교할 부위 선택 (나머지 부위는 계산기 탭 설정 유지)", padding=10)
        sel_frame.pack(fill=tk.X, pady=5)
        
        self.comp_part_var = tk.StringVar(value="helmet")
        self.comp_part_var.trace_add("write", self.on_change_compare_part)
        
        for key in PARTS:
            ttk.Radiobutton(sel_frame, text=PART_NAMES[key], variable=self.comp_part_var, value=key).pack(side=tk.LEFT, padx=15)
        
        # 2. 비교 입력 UI (좌우 분할)
        comp_ui_frame = ttk.Frame(frame)
        comp_ui_frame.pack(fill=tk.X, pady=10)
        
        # Left: 변경 전 (Current)
        left_f = ttk.LabelFrame(comp_ui_frame, text="변경 전 (Current)", padding=10)
        left_f.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
        self.comp_before_vars = self.create_option_rows(left_f)
        ttk.Button(left_f, text="⬇️ 현재 장비 불러오기", command=self.load_from_calc_tab).pack(pady=5, anchor="e")
        
        # Right: 변경 후 (Target)
        right_f = ttk.LabelFrame(comp_ui_frame, text="변경 후 (Target)", padding=10)
        right_f.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))
        self.comp_after_vars = self.create_option_rows(right_f)
        ttk.Button(right_f, text="⬆️ 전투력 탭에 적용", command=self.apply_to_calc_tab).pack(pady=5, anchor="e")
        
        # 3. 상세 결과 테이블
        res_frame = ttk.LabelFrame(frame, text="비교 분석 결과", padding=10)
        res_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        cols = ("metric", "before", "after", "diff")
        self.comp_tree = ttk.Treeview(res_frame, columns=cols, show="headings", height=10)
        
        self.comp_tree.heading("metric", text="항목")
        self.comp_tree.heading("before", text="변경 전")
        self.comp_tree.heading("after", text="변경 후")
        self.comp_tree.heading("diff", text="증감 (Delta)")
        
        self.comp_tree.column("metric", width=200, anchor="w")
        self.comp_tree.column("before", width=150, anchor="center")
        self.comp_tree.column("after", width=150, anchor="center")
        self.comp_tree.column("diff", width=150, anchor="center")
        
        self.comp_tree.pack(fill=tk.BOTH, expand=True)
        
        # 태그 설정 (색상)
        self.comp_tree.tag_configure("up", foreground="#2e7d32", font=("맑은 고딕", 9, "bold"))   # Green/Blue
        self.comp_tree.tag_configure("down", foreground="#c62828", font=("맑은 고딕", 9, "bold")) # Red
        self.comp_tree.tag_configure("same", foreground="#757575") # Gray
        self.comp_tree.tag_configure("header", background="#f0f0f0", font=("맑은 고딕", 10, "bold"))

        # 초기 로드
        self.load_from_calc_tab()

    def create_option_rows(self, parent_frame):
        var_list = []
        for i in range(3):
            f = ttk.Frame(parent_frame)
            f.pack(fill=tk.X, pady=3)
            
            tv = tk.StringVar(value="옵션없음")
            sv = tk.StringVar(value="0단계 (0.00%)")
            
            # 값이 바뀔 때 비교 로직 실행
            tv.trace_add("write", self.do_compare)
            sv.trace_add("write", self.do_compare)
            
            cb_t = ttk.Combobox(f, textvariable=tv, values=OPTION_LIST, width=16, state="readonly")
            cb_t.pack(side=tk.LEFT)
            
            cb_s = ttk.Combobox(f, textvariable=sv, width=13, state="readonly")
            cb_s.pack(side=tk.LEFT, padx=5)
            
            lbl_eval = ttk.Label(f, text="-", font=("맑은 고딕", 8), width=6)
            lbl_eval.pack(side=tk.LEFT)
            
            # 콤보박스 선택 시 단계 리스트 갱신 로직
            def on_type_change(event, t_var=tv, cb_stage=cb_s, l_eval=lbl_eval):
                opt_type = t_var.get()
                if opt_type in OVERLOAD_DATA:
                    vals = [f"{k}단계 ({v}%)" for k, v in enumerate(OVERLOAD_DATA[opt_type])]
                    cb_stage['values'] = vals
                    cb_stage.current(0)
                else:
                    cb_stage['values'] = ["0단계 (0.00%)"]
                    cb_stage.current(0)
                
                self.update_validity_label(opt_type, l_eval)
                self.do_compare()

            cb_t.bind("<<ComboboxSelected>>", on_type_change)
            var_list.append((tv, sv, cb_t, cb_s, lbl_eval))
            
        return var_list

    def update_validity_label(self, opt_type, label_widget):
        if not self.app_state.current_nikke:
            label_widget.config(text="-", foreground="gray")
            return

        ol_data = self.app_state.current_nikke.get('overload', {})
        rec_ops = ol_data.get('recommended_ops', [])
        valid_ops = ol_data.get('valid_ops', [])
        invalid_ops = ol_data.get('invalid_ops', [])

        if opt_type == "옵션없음":
            label_widget.config(text="-", foreground="gray")
        elif opt_type in rec_ops:
            label_widget.config(text="★추천", foreground="#1565c0") # Blue
        elif opt_type in valid_ops:
            label_widget.config(text="O유효", foreground="#2e7d32") # Green
        elif opt_type in invalid_ops:
            label_widget.config(text="X무효", foreground="#c62828") # Red
        else:
            label_widget.config(text="△미미", foreground="#555555")

    def on_change_compare_part(self, *args): self.load_from_calc_tab()
    def update_content(self): self.load_from_calc_tab()
    
    def load_from_calc_tab(self):
        """계산 탭의 현재 장비 상태를 '변경 전'과 '변경 후'에 모두 불러옴"""
        if not self.app_state.calc_opts[0][0]: return # 아직 초기화 안됨
        
        part_key = self.comp_part_var.get()
        part_idx = PARTS.index(part_key)
        source = self.app_state.calc_opts[part_idx]
        
        # Load to Before & After
        for target_vars in [self.comp_before_vars, self.comp_after_vars]:
            for i in range(3):
                src_t, src_s, _, _, _ = source[i] 
                dest_t, dest_s, _, dest_cb_s, dest_lbl = target_vars[i]
                
                t_val = src_t.get()
                dest_t.set(t_val)
                
                # 드롭박스 갱신
                if t_val in OVERLOAD_DATA:
                    dest_cb_s['values'] = [f"{k}단계 ({v}%)" for k, v in enumerate(OVERLOAD_DATA[t_val])]
                else:
                    dest_cb_s['values'] = ["0단계 (0.00%)"]
                    
                dest_s.set(src_s.get())
                self.update_validity_label(t_val, dest_lbl)
        
        self.do_compare()

    def apply_to_calc_tab(self):
        """변경 후(Target)의 설정을 계산 탭에 반영"""
        part_key = self.comp_part_var.get()
        part_idx = PARTS.index(part_key)
        
        for i in range(3):
            src_t, src_s, _, _, _ = self.comp_after_vars[i]
            dest_t, dest_s, _, dest_cb_s, _ = self.app_state.calc_opts[part_idx][i]
            
            t_val = src_t.get()
            dest_t.set(t_val)
            
            if t_val in OVERLOAD_DATA:
                dest_cb_s['values'] = [f"{k}단계 ({v}%)" for k, v in enumerate(OVERLOAD_DATA[t_val])]
            else:
                dest_cb_s['values'] = ["0단계 (0.00%)"]
                
            dest_s.set(src_s.get())
            
        if self.calc_callback: self.calc_callback()
        messagebox.showinfo("적용", "전투력 계산 탭에 반영되었습니다.")

    def do_compare(self, *args):
        """두 가지 설정에 대해 전체 전투력 계산을 수행하고 비교"""
        if not self.app_state.current_nikke: return
        
        # 1. 기본 스탯 정보 가져오기 (TabCalc의 변수 사용)
        try:
            hp = self.app_state.calc_vars["hp"].get()
            atk = self.app_state.calc_vars["atk"].get()
            defn = self.app_state.calc_vars["def"].get()
            s1 = int(self.app_state.calc_vars["s1"].get())
            s2 = int(self.app_state.calc_vars["s2"].get())
            burst = int(self.app_state.calc_vars["burst"].get())
            cube = int(self.app_state.calc_vars["cube_lvl"].get())
            cg = self.app_state.calc_vars["col_grade"].get()
            cs1 = int(self.app_state.calc_vars["col_skill1"].get())
            cs2 = int(self.app_state.calc_vars["col_skill2"].get())
            weapon = self.app_state.current_nikke.get('weapon', 'Unknown')
        except:
            return # 입력값 오류 시 중단

        # 2. 전체 옵션 구성 (나머지 3부위는 그대로, 선택 부위만 변경)
        selected_part = self.comp_part_var.get()
        
        def build_full_options(target_ui_vars):
            full_opts = {}
            for i, part in enumerate(PARTS):
                full_opts[part] = {}
                # 현재 비교중인 부위라면 -> Compare 탭의 UI 값 사용
                if part == selected_part:
                    for j in range(3):
                        t = target_ui_vars[j][0].get()
                        s = target_ui_vars[j][1].get()
                        full_opts[part][f"option{j+1}"] = {"type": t, "stage": s}
                # 다른 부위라면 -> Calc 탭의 기존 값 사용
                else:
                    for j in range(3):
                        t = self.app_state.calc_opts[i][j][0].get()
                        s = self.app_state.calc_opts[i][j][1].get()
                        full_opts[part][f"option{j+1}"] = {"type": t, "stage": s}
            return full_opts

        opts_before = build_full_options(self.comp_before_vars)
        opts_after = build_full_options(self.comp_after_vars)

        # 3. 계산 수행
        res_before = calculate_power_detailed(hp, atk, defn, s1, s2, burst, opts_before, cube, cg, cs1, cs2, weapon, self.app_state.current_nikke)
        res_after = calculate_power_detailed(hp, atk, defn, s1, s2, burst, opts_after, cube, cg, cs1, cs2, weapon, self.app_state.current_nikke)

        # 4. 결과 출력
        self.comp_tree.delete(*self.comp_tree.get_children())
        
        def get_tag(val):
            if val > 0.001: return "up"
            if val < -0.001: return "down"
            return "same"

        # (1) 전투력 & 종결도
        diff_cp = res_after['power'] - res_before['power']
        self.comp_tree.insert("", "end", values=(
            "총 전투력 (CP)", 
            f"{res_before['power']:,}", 
            f"{res_after['power']:,}", 
            f"{diff_cp:+d}"
        ), tags=("header", get_tag(diff_cp)))
        
        diff_score = res_after['score'] - res_before['score']
        self.comp_tree.insert("", "end", values=(
            "졸업 종결도 (%)", 
            f"{res_before['score']:.2f}%", 
            f"{res_after['score']:.2f}%", 
            f"{diff_score:+.2f}%"
        ), tags=("header", get_tag(diff_score)))
        
        self.comp_tree.insert("", "end", values=("", "", "", ""), tags=("same",)) # Separator

        # (2) 개별 옵션 합계 비교
        # 데이터를 딕셔너리로 변환 {옵션명: 값}
        stats_b = {item['type']: item['val'] for item in res_before['details']['ol_aggregated']}
        stats_a = {item['type']: item['val'] for item in res_after['details']['ol_aggregated']}
        
        all_keys = set(stats_b.keys()) | set(stats_a.keys())
        
        # 정렬 (유효 옵션 우선)
        valid_ops = self.app_state.current_nikke.get('overload', {}).get('valid_ops', [])
        rec_ops = self.app_state.current_nikke.get('overload', {}).get('recommended_ops', [])
        
        sorted_keys = sorted(list(all_keys), key=lambda k: (
            0 if k in rec_ops else 1 if k in valid_ops else 2, k
        ))

        for k in sorted_keys:
            v1 = stats_b.get(k, 0)
            v2 = stats_a.get(k, 0)
            
            if v1 == 0 and v2 == 0: continue
            
            diff = v2 - v1
            
            prefix = ""
            if k in rec_ops: prefix = "★ "
            elif k in valid_ops: prefix = "O "
            
            name_display = f"{prefix}{k}"
            val_fmt = "{:.2f}%"
            # 장탄수는 정수일수도 있으나 %로 계산됨 (오버로드 장탄은 %)
            
            self.comp_tree.insert("", "end", values=(
                name_display,
                val_fmt.format(v1),
                val_fmt.format(v2),
                val_fmt.format(diff) if diff != 0 else "-"
            ), tags=(get_tag(diff),))