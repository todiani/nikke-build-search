# tab_detail_tags.py
import tkinter as tk
from tkinter import ttk
from core_state import AppState
from widgets_common import setup_scroll_binding

class TabDetailTags:
    def __init__(self, parent, app_state: AppState, search_callback):
        self.app_state = app_state
        self.search_callback = search_callback
        self.tag_buttons = {}
        self.tag_dashboard_frame = None
        
        # 메인 패널 (전체)
        self.detail_paned = ttk.PanedWindow(parent, orient=tk.HORIZONTAL)
        self.detail_paned.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # === Left Main Area: Tag Search ===
        # width를 명시하여 초기 크기 잡기
        tag_main_frame = ttk.Frame(self.detail_paned, width=480, style="Card.TFrame")
        self.detail_paned.add(tag_main_frame, weight=0) # weight=0으로 설정하여 초기에는 덜 늘어나게 함
        
        header_frame = ttk.Frame(tag_main_frame)
        header_frame.pack(fill=tk.X, pady=5, padx=5)
        
        ttk.Label(header_frame, text="🏷️ 스마트 태그 검색", style="Header.TLabel").pack(side=tk.LEFT)
        
        ttk.Checkbutton(
            header_frame, 
            text="개별 스킬 내 일치 (정밀 검색)", 
            variable=self.app_state.search_scope_single_skill,
            command=self.search_callback
        ).pack(side=tk.RIGHT)
        
        self.tag_split_pane = ttk.PanedWindow(tag_main_frame, orient=tk.HORIZONTAL)
        self.tag_split_pane.pack(fill=tk.BOTH, expand=True, padx=2, pady=2)
        
        self.tag_list_frame = ttk.Frame(self.tag_split_pane)
        self.tag_split_pane.add(self.tag_list_frame, weight=1)
        
        self.tag_canvas = tk.Canvas(self.tag_list_frame, bg=self.app_state.colors["surface_light"], highlightthickness=0)
        tag_scrollbar = ttk.Scrollbar(self.tag_list_frame, orient="vertical", command=self.tag_canvas.yview)
        self.tag_container = ttk.Frame(self.tag_canvas, style="Card.TFrame")
        self.tag_container.bind("<Configure>", lambda e: self.tag_canvas.configure(scrollregion=self.tag_canvas.bbox("all")))
        self.tag_canvas.create_window((0, 0), window=self.tag_container, anchor="nw", width=380)
        self.tag_canvas.configure(yscrollcommand=tag_scrollbar.set)
        
        self.tag_canvas.pack(side="left", fill="both", expand=True)
        tag_scrollbar.pack(side="right", fill="y")
        setup_scroll_binding(self.tag_container, self.tag_canvas)

        self.tag_summary_panel = ttk.Frame(self.tag_split_pane, style="Card.TFrame", padding=5)
        self.tag_split_pane.add(self.tag_summary_panel, weight=1)
        
        ttk.Label(self.tag_summary_panel, text="선택된 태그 (클릭해제)", font=("맑은 고딕", 10, "bold")).pack(anchor="w", pady=(0,5))
        
        self.tag_dashboard_frame = ttk.Frame(self.tag_summary_panel)
        self.tag_dashboard_frame.pack(fill=tk.BOTH, expand=True)
        
        btn_clear = ttk.Button(self.tag_summary_panel, text="🔄 태그 초기화", command=self.clear_tags)
        btn_clear.pack(side=tk.BOTTOM, fill=tk.X, pady=5)

        # === Right Main Area: Character Info ===
        # 스크롤 가능한 캔버스로 구성
        info_canvas = tk.Canvas(self.detail_paned, bg=self.app_state.colors["bg"], highlightthickness=0)
        info_scrollbar = ttk.Scrollbar(self.detail_paned, orient="vertical", command=info_canvas.yview)
        info_frame = ttk.Frame(info_canvas, style="Panel.TFrame")
        
        # 캔버스 크기 조정 바인딩
        info_frame.bind("<Configure>", lambda e: info_canvas.configure(scrollregion=info_canvas.bbox("all")))
        info_canvas.create_window((0, 0), window=info_frame, anchor="nw", width=800) # 너비를 넉넉하게 설정
        info_canvas.configure(yscrollcommand=info_scrollbar.set)
        
        self.detail_paned.add(info_canvas, weight=5) # 우측 패널에 더 높은 가중치 부여 (공간 확보)
        
        # 스크롤바 바인딩
        setup_scroll_binding(info_frame, info_canvas)

        # 내용 UI 구성
        content_pad = ttk.Frame(info_frame, padding=20)
        content_pad.pack(fill=tk.BOTH, expand=True)

        # 1. 헤더 및 기본 정보
        self.det_header = ttk.Label(content_pad, text="니케를 선택해주세요", style="Title.TLabel")
        self.det_header.pack(anchor="w", pady=(0, 5))
        
        # 폰트 굵게 변경 ("bold" 추가)
        self.det_info = ttk.Label(content_pad, text="", font=("맑은 고딕", 10, "bold"), foreground=self.app_state.colors["text"])
        self.det_info.pack(anchor="w", pady=(0, 5))
        
        # 육성 정보 요약 (LabelFrame)
        upg_frame = ttk.LabelFrame(content_pad, text="육성 정보 요약", padding=10)
        upg_frame.pack(fill=tk.X, pady=(0, 15))
        self.det_upgrade_info = ttk.Label(upg_frame, text="-", font=("맑은 고딕", 10), justify="left", foreground="#555555")
        self.det_upgrade_info.pack(anchor="w")

        # 2. 스킬 정보 (LabelFrame)
        skill_frame = ttk.LabelFrame(content_pad, text="스킬 세부 정보", padding=10)
        skill_frame.pack(fill=tk.BOTH, expand=True)
        
        self.det_skill_texts = []
        titles = ["일반 공격 [기본]", "스킬 1", "스킬 2", "버스트 스킬"]
        
        for i in range(4):
            sf = ttk.Frame(skill_frame)
            sf.pack(fill=tk.X, pady=5)
            
            # 헤더 (이름, 타입, 쿨타임 표시용 라벨)
            lbl_header = ttk.Label(sf, text=titles[i], style="Header.TLabel", width=15, anchor="n")
            lbl_header.pack(side=tk.LEFT, anchor="n", padx=(0, 10))
            
            # 텍스트 박스
            txt = tk.Text(sf, height=6, wrap=tk.WORD, 
                          bg=self.app_state.colors["surface_light"], 
                          fg=self.app_state.colors["text"], 
                          relief="flat", padx=10, pady=10, font=("맑은 고딕", 10))
            txt.pack(side=tk.LEFT, fill=tk.X, expand=True)
            txt.config(state=tk.DISABLED)
            
            # (헤더라벨, 텍스트위젯) 저장
            self.det_skill_texts.append((lbl_header, txt))
            
        # 저장된 sash 위치 복구
        sash_pos = self.app_state.layout_config.get("sash_detail", 480)
        if sash_pos > 700: sash_pos = 480
        
        parent.after(200, lambda: self.detail_paned.sashpos(0, sash_pos))

    def create_tag_ui(self):
        for widget in self.tag_container.winfo_children(): widget.destroy()
        self.tag_buttons = {}
        
        help_frame = ttk.Frame(self.tag_container)
        help_frame.pack(fill=tk.X, pady=(5, 5))
        ttk.Label(help_frame, text="[조작] 좌:", font=("맑은 고딕", 9), foreground=self.app_state.colors["text_dim"]).pack(side=tk.LEFT)
        ttk.Label(help_frame, text="AND", font=("맑은 고딕", 9, "bold"), foreground=self.app_state.colors["primary"]).pack(side=tk.LEFT)
        ttk.Label(help_frame, text=" / 우:", font=("맑은 고딕", 9), foreground=self.app_state.colors["text_dim"]).pack(side=tk.LEFT)
        ttk.Label(help_frame, text="OR", font=("맑은 고딕", 9, "bold"), foreground=self.app_state.colors["invalid"]).pack(side=tk.LEFT)
        ttk.Label(help_frame, text=" / Shift+좌:", font=("맑은 고딕", 9), foreground=self.app_state.colors["text_dim"]).pack(side=tk.LEFT)
        ttk.Label(help_frame, text="NOT", font=("맑은 고딕", 9, "bold"), foreground="#999999").pack(side=tk.LEFT)

        for group_key, group_data in self.app_state.tag_groups.items():
            display_name = group_data.get("display_name", group_key)
            grp_lbl = ttk.Label(self.tag_container, text=display_name, font=("맑은 고딕", 10, "bold"), foreground=self.app_state.colors["primary"])
            grp_lbl.pack(fill=tk.X, pady=(10, 2))
            
            btn_frame = ttk.Frame(self.tag_container, style="Card.TFrame")
            btn_frame.pack(fill=tk.X)
            
            col = 0
            row = 0
            MAX_COL = 2 
            
            for tag in group_data.get("tags", []):
                count = self.app_state.tag_counts.get(tag, 0)
                btn_text = f"{tag} ({count})"
                state = "normal" if count > 0 else "disabled"
                
                btn = tk.Button(btn_frame, text=btn_text, font=("맑은 고딕", 9),
                                bg=self.app_state.colors["tag_bg"], fg=self.app_state.colors["tag_fg"],
                                activebackground=self.app_state.colors["surface_light"],
                                relief="flat", state=state, width=18, anchor="w", padx=5)
                
                btn.bind("<Button-1>", lambda e, t=tag: self.handle_tag_click(t, "LEFT"))
                btn.bind("<Button-3>", lambda e, t=tag: self.handle_tag_click(t, "RIGHT"))
                btn.bind("<Shift-Button-1>", lambda e, t=tag: self.handle_tag_click(t, "SHIFT")) 
                
                btn.grid(row=row, column=col, padx=2, pady=2, sticky="ew")
                self.tag_buttons[tag] = btn
                
                col += 1
                if col > MAX_COL:
                    col = 0
                    row += 1
            
            btn_frame.grid_columnconfigure(0, weight=1)
            btn_frame.grid_columnconfigure(1, weight=1)
            btn_frame.grid_columnconfigure(2, weight=1)

        setup_scroll_binding(self.tag_container, self.tag_canvas)
        self.refresh_selected_tags_view()

    def handle_tag_click(self, tag, click_type):
        was_and = tag in self.app_state.selected_tags_and
        was_or = tag in self.app_state.selected_tags_or
        was_not = tag in self.app_state.selected_tags_not
        
        if was_and: self.app_state.selected_tags_and.remove(tag)
        if was_or: self.app_state.selected_tags_or.remove(tag)
        if was_not: self.app_state.selected_tags_not.remove(tag)
        
        if click_type == "LEFT": # Target: AND
            if not was_and: 
                self.app_state.selected_tags_and.append(tag)
        elif click_type == "RIGHT": # Target: OR
            if not was_or:
                self.app_state.selected_tags_or.append(tag)
        elif click_type == "SHIFT": # Target: NOT
            if not was_not:
                self.app_state.selected_tags_not.append(tag)

        self.refresh_selected_tags_view()
        self.search_callback()

    def refresh_selected_tags_view(self):
        for tag, btn in self.tag_buttons.items():
            if tag in self.app_state.selected_tags_and:
                btn.config(bg=self.app_state.colors["rec_bg"], fg="#ffffff", text=f"✔ {tag}") 
            elif tag in self.app_state.selected_tags_or:
                btn.config(bg=self.app_state.colors["invalid"], fg="#ffffff", text=f"✚ {tag}") 
            elif tag in self.app_state.selected_tags_not:
                btn.config(bg="#555555", fg="#aaaaaa", text=f"✖ {tag}") 
            else:
                count = self.app_state.tag_counts.get(tag, 0)
                btn.config(bg=self.app_state.colors["tag_bg"], fg=self.app_state.colors["tag_fg"], text=f"{tag} ({count})")

        self.refresh_tag_summary_layer()

    def refresh_tag_summary_layer(self):
        if not self.tag_dashboard_frame: return

        for widget in self.tag_dashboard_frame.winfo_children():
            widget.destroy()
            
        if not (self.app_state.selected_tags_and or self.app_state.selected_tags_or or self.app_state.selected_tags_not):
            lbl = tk.Label(self.tag_dashboard_frame, text="태그를 선택하면\n여기에 표시됩니다.", fg=self.app_state.colors["text_dim"], bg=self.app_state.colors["surface_light"])
            lbl.pack(pady=20)
            return

        def create_chip(parent, text, color, remove_cb):
            f = tk.Frame(parent, bg=color, padx=2, pady=2)
            f.pack(side=tk.TOP, fill=tk.X, padx=2, pady=1)
            inner = tk.Frame(f, bg=color)
            inner.pack(fill=tk.X)
            lbl = tk.Label(inner, text=text, bg=color, fg="#ffffff", font=("맑은 고딕", 9), anchor="w")
            lbl.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(2,0))
            btn = tk.Label(inner, text="☒", bg=color, fg="#ffffff", font=("Consolas", 10, "bold"), cursor="hand2")
            btn.pack(side=tk.RIGHT, padx=2)
            for w in [f, inner, lbl, btn]:
                w.bind("<Button-1>", lambda e: remove_cb())

        if self.app_state.selected_tags_and:
            lf_and = ttk.LabelFrame(self.tag_dashboard_frame, text="AND (모두 포함)", padding=5)
            lf_and.pack(fill=tk.X, pady=2)
            for tag in self.app_state.selected_tags_and:
                create_chip(lf_and, tag, self.app_state.colors["rec_bg"], lambda t=tag: self.handle_tag_click(t, "LEFT"))

        if self.app_state.selected_tags_or:
            lf_or = ttk.LabelFrame(self.tag_dashboard_frame, text="OR (하나라도 포함)", padding=5)
            lf_or.pack(fill=tk.X, pady=2)
            for tag in self.app_state.selected_tags_or:
                create_chip(lf_or, tag, self.app_state.colors["invalid"], lambda t=tag: self.handle_tag_click(t, "RIGHT"))

        if self.app_state.selected_tags_not:
            lf_not = ttk.LabelFrame(self.tag_dashboard_frame, text="NOT (제외)", padding=5)
            lf_not.pack(fill=tk.X, pady=2)
            for tag in self.app_state.selected_tags_not:
                create_chip(lf_not, tag, "#555555", lambda t=tag: self.handle_tag_click(t, "SHIFT"))

    def clear_tags(self):
        self.app_state.selected_tags_and = []
        self.app_state.selected_tags_or = []
        self.app_state.selected_tags_not = []
        self.refresh_selected_tags_view()
        self.search_callback()

    def update_content(self):
        c = self.app_state.current_nikke
        if not c: return
        
        # 1. 헤더 및 기본 정보 업데이트
        self.det_header.config(text=f"{c['nikke_name']}")
        
        squad_txt = c.get('squad', '')
        squad_info = f" | 🛡️ {squad_txt}" if squad_txt else ""
        
        info_str = f"🏢 {c.get('company','?')} | 🎭 {c.get('role','?')} | 🔫 {c.get('weapon','?')} | 🧪 {c.get('code','?')} | 💥 {c.get('burst_type','?')}{squad_info}"
        self.det_info.config(text=info_str)
        
        # 육성 정보 업데이트
        sp = c.get('skill_priority', {})
        ol = c.get('overload', {})
        
        rank = sp.get('global_rank', '-')
        order = sp.get('order', '-')
        cubes = ", ".join(ol.get('recommended_cubes', []))
        ol_prio = ol.get('priority', '-')
        
        upg_str = f"⭐ 랭크: {rank}   |   📈 스킬작: {order}\n🧊 추천 큐브: {cubes}\n⚙️ 오버로드: {ol_prio}"
        self.det_upgrade_info.config(text=upg_str)

        # 2. 스킬 정보 업데이트 (일반 공격 포함)
        skills = c.get('skills', {})
        skill_keys = ['normal', 'skill1', 'skill2', 'burst']
        display_titles = ["일반 공격 [기본]", "스킬 1", "스킬 2", "버스트 스킬"]
        
        for i, key in enumerate(skill_keys):
            lbl_widget, txt_widget = self.det_skill_texts[i]
            s_data = skills.get(key)
            
            s_name = s_data.get('name', 'Unknown') if s_data else 'Unknown'
            s_type = s_data.get('type', '') if s_data else ''
            s_cd = s_data.get('cooldown', '') if s_data else ''
            
            # ★ [수정] 일반 공격(i==0)일 경우 이름 표시 안함
            if i == 0:
                header_text = display_titles[i]
            else:
                header_text = f"{display_titles[i]}\n[{s_name}]"
                if s_type: header_text += f" - {s_type}"
                if s_cd: header_text += f" ({s_cd})"
            
            lbl_widget.config(text=header_text)
            
            # 본문 구성
            txt_widget.config(state=tk.NORMAL, bg=self.app_state.colors["surface_light"], fg=self.app_state.colors["text"])
            txt_widget.delete("1.0", tk.END)
            
            if s_data:
                desc = s_data.get('desc', '').replace('\n', '\n')
                txt_widget.insert("1.0", desc)
                
            # 태그 하이라이팅
            for tag in self.app_state.selected_tags_and: self.highlight_text(txt_widget, tag, self.app_state.colors["rec_bg"])
            for tag in self.app_state.selected_tags_or: self.highlight_text(txt_widget, tag, self.app_state.colors["invalid"])
            txt_widget.config(state=tk.DISABLED)

    def highlight_text(self, text_widget, pattern, bg_color):
        start = "1.0"
        search_kw = pattern.replace("▲", "").replace("▼", "").strip()
        if not search_kw: search_kw = pattern
        while True:
            pos = text_widget.search(search_kw, start, stopindex=tk.END)
            if not pos: break
            end = f"{pos}+{len(search_kw)}c"
            text_widget.tag_add(search_kw, pos, end)
            text_widget.tag_config(search_kw, background=bg_color, foreground="white")
            start = end