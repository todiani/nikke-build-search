# main.py
import tkinter as tk
from tkinter import ttk, Menu
import re

from core_state import AppState
from io_files import (
    load_themes, load_config, save_config, load_tags, 
    load_database, inject_recommended_builds, save_database_silent, auto_generate_tags
)
from ui_theme import setup_styles
from core_utils import match_search

# Import Tab Modules
from tab_detail_tags import TabDetailTags
from tab_tag_manage import TabTagManage
from tab_edit import TabEdit
from tab_calc import TabCalc
from tab_compare import TabCompare
from tab_upgrade import TabUpgrade
from widgets_common import setup_scroll_binding

class NikkeManagerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("⚡ Nikke Manager V10.50 (Optimized) - Smart Indexing")
        
        # 기본 창 크기
        self.default_geometry = "1650x950"
        
        # Initialize Shared State
        self.app_state = AppState()
        self.app_state.search_scope_single_skill = tk.BooleanVar(value=False)

        # Load Data
        load_themes(self.app_state)
        load_config(self.app_state, self.root)
        
        # 창 크기 적용
        try: 
            if self.app_state.layout_config.get("geometry"):
                self.root.geometry(self.app_state.layout_config.get("geometry"))
            else:
                self.root.geometry(self.default_geometry)
        except: 
            pass

        # Apply Theme
        self.app_state.colors = self.app_state.themes.get(self.app_state.current_theme_name, list(self.app_state.themes.values())[0])
        
        # Load & Process DB
        load_tags(self.app_state)
        load_database(self.app_state)
        inject_recommended_builds(self.app_state) # 최적 성능 데이터 주입
        auto_generate_tags(self.app_state, silent=True) # 태그 생성 및 인덱싱
        
        setup_styles(self.app_state)
        self.create_menu()
        self.create_layout()
        
        # Initial Search
        self.on_search()
        
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def on_close(self):
        try:
            current_sash = self.paned.sashpos(0)
            if current_sash > 100:
                self.app_state.layout_config["sash_main"] = current_sash
            
            if hasattr(self, 'tab_detail') and hasattr(self.tab_detail, 'detail_paned'):
                detail_sash = self.tab_detail.detail_paned.sashpos(0)
                if detail_sash > 50:
                    self.app_state.layout_config["sash_detail"] = detail_sash
        except:
            pass

        save_config(self.app_state, self.root)
        self.root.destroy()

    def create_menu(self):
        menubar = Menu(self.root)
        self.root.config(menu=menubar)
        file_menu = Menu(menubar, tearoff=0)
        file_menu.add_command(label="저장", command=lambda: save_database_silent(self.app_state))
        file_menu.add_separator()
        file_menu.add_command(label="종료", command=self.on_close)
        menubar.add_cascade(label="파일", menu=file_menu)
        
        theme_menu = Menu(menubar, tearoff=0)
        for t_name in sorted(self.app_state.themes.keys()):
            theme_menu.add_command(label=t_name, command=lambda t=t_name: self.change_theme(t))
        menubar.add_cascade(label="테마", menu=theme_menu)
    
    def change_theme(self, theme_name):
        self.app_state.current_theme_name = theme_name
        self.app_state.colors = self.app_state.themes.get(theme_name, self.app_state.themes.get("Blue Pro (Default)"))
        save_config(self.app_state, self.root)
        setup_styles(self.app_state)
        self.root.configure(bg=self.app_state.colors["bg"])
        self.update_all_tabs()
        if hasattr(self, 'tab_detail'):
            self.tab_detail.create_tag_ui() 

    def create_layout(self):
        self.paned = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        self.paned.pack(fill=tk.BOTH, expand=True)
        
        self.sidebar = ttk.Frame(self.paned, style="Panel.TFrame")
        self.paned.add(self.sidebar, weight=0)
        
        self.create_sidebar_content()
        
        self.main_area = ttk.Frame(self.paned, style="Panel.TFrame")
        self.paned.add(self.main_area, weight=1)
        
        self.create_tabs()
        self.apply_sash_position()

    def apply_sash_position(self):
        saved_pos = self.app_state.layout_config.get("sash_main", 450)
        if saved_pos < 100: saved_pos = 450
        def _set_pos():
            self.root.update_idletasks()
            try: self.paned.sashpos(0, saved_pos)
            except: pass
        self.root.after(200, _set_pos)

    def create_sidebar_content(self):
        search_frame = ttk.Frame(self.sidebar, padding=10)
        search_frame.pack(fill=tk.X)
        ttk.Label(search_frame, text="🔍 니케 검색", style="Header.TLabel").pack(anchor="w", pady=(0,5))
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", self.on_search)
        entry = ttk.Entry(search_frame, textvariable=self.search_var)
        entry.pack(fill=tk.X, pady=5)
        
        filter_frame = ttk.LabelFrame(self.sidebar, text="필터 (AND)", padding=5)
        filter_frame.pack(fill=tk.X, padx=10, pady=5)
        self.filter_vars = {
            "company": tk.StringVar(value="ALL"), "weapon": tk.StringVar(value="ALL"),
            "burst": tk.StringVar(value="ALL"), "role": tk.StringVar(value="ALL"), "code": tk.StringVar(value="ALL")
        }
        filters = [
            ("제조사", "company", ["ALL", "엘리시온", "미실리스", "테트라", "필그림", "어브노멀"]),
            ("무기", "weapon", ["ALL", "AR", "SMG", "SG", "MG", "SR", "RL"]),
            ("버스트", "burst", ["ALL", "I", "II", "III"]),
            ("역할", "role", ["ALL", "화력형", "방어형", "지원형"]),
            ("코드", "code", ["ALL", "작열", "수냉", "풍압", "전격", "철갑"])
        ]
        for label, key, values in filters:
            f = ttk.Frame(filter_frame)
            f.pack(fill=tk.X, pady=2)
            ttk.Label(f, text=label, width=6).pack(side=tk.LEFT)
            cb = ttk.Combobox(f, textvariable=self.filter_vars[key], values=values, state="readonly", width=15)
            cb.pack(side=tk.RIGHT, expand=True, fill=tk.X)
            cb.bind("<<ComboboxSelected>>", self.on_search)
            
        list_frame = ttk.Frame(self.sidebar, padding=(10,5,10,10))
        list_frame.pack(fill=tk.BOTH, expand=True)
        cols = ("name", "info")
        v_sb = ttk.Scrollbar(list_frame, orient="vertical")
        h_sb = ttk.Scrollbar(list_frame, orient="horizontal")
        self.nikke_list = ttk.Treeview(list_frame, columns=cols, show="headings", selectmode="browse", yscrollcommand=v_sb.set, xscrollcommand=h_sb.set)
        self.nikke_list.heading("name", text="이름")
        self.nikke_list.heading("info", text="정보")
        self.nikke_list.column("name", width=220, minwidth=150)
        self.nikke_list.column("info", width=90, minwidth=80, anchor="center")
        self.nikke_list.grid(row=0, column=0, sticky='nsew')
        v_sb.grid(row=0, column=1, sticky='ns')
        h_sb.grid(row=1, column=0, sticky='ew')
        list_frame.grid_columnconfigure(0, weight=1)
        list_frame.grid_rowconfigure(0, weight=1)
        v_sb.config(command=self.nikke_list.yview)
        h_sb.config(command=self.nikke_list.xview)
        setup_scroll_binding(self.nikke_list)
        self.nikke_list.bind("<<TreeviewSelect>>", self.on_select_nikke)
        
        self.tag_info_frame = ttk.LabelFrame(self.sidebar, text="🏷️ 선택된 태그 현황", padding=5)
        self.tag_info_frame.pack(fill=tk.X, padx=10, pady=10, side=tk.BOTTOM)
        self.tag_count_lbl = ttk.Label(self.tag_info_frame, text="매칭된 니케: 0명", font=("맑은 고딕", 9, "bold"), foreground=self.app_state.colors["primary"])
        self.tag_count_lbl.pack(anchor="w")
        self.tag_list_lbl = ttk.Label(self.tag_info_frame, text="(없음)", font=("맑은 고딕", 8), wraplength=340, justify="left")
        self.tag_list_lbl.pack(anchor="w", pady=2, fill=tk.X)

    def create_tabs(self):
        self.notebook = ttk.Notebook(self.main_area)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Initialize Tab Frames
        tab_detail_frame = ttk.Frame(self.notebook)
        tab_upgrade_frame = ttk.Frame(self.notebook)
        tab_calc_frame = ttk.Frame(self.notebook)
        tab_compare_frame = ttk.Frame(self.notebook)
        tab_tag_manage_frame = ttk.Frame(self.notebook)
        tab_edit_frame = ttk.Frame(self.notebook)
        
        self.notebook.add(tab_detail_frame, text="📋 DB 상세보기")
        self.notebook.add(tab_upgrade_frame, text="🛠️ 육성 가이드")
        self.notebook.add(tab_calc_frame, text="📊 전투력 계산")
        self.notebook.add(tab_compare_frame, text="⚖️ 옵션 비교")
        self.notebook.add(tab_tag_manage_frame, text="🏷️ 태그 관리")
        self.notebook.add(tab_edit_frame, text="✏️ DB 수정")
        
        self.tab_detail = TabDetailTags(tab_detail_frame, self.app_state, self.on_search)
        self.tab_detail.create_tag_ui()
        self.tab_upgrade = TabUpgrade(tab_upgrade_frame, self.app_state)
        self.tab_calc = TabCalc(tab_calc_frame, self.app_state)
        self.tab_compare = TabCompare(tab_compare_frame, self.app_state, self.tab_calc.do_calc)
        self.tab_tag_manage = TabTagManage(tab_tag_manage_frame, self.app_state, self.refresh_tag_ui_globally)
        self.tab_edit = TabEdit(tab_edit_frame, self.app_state, {'search': self.on_search, 'update_all': self.update_all_tabs})

    def on_search(self, *args):
        query = self.search_var.get()
        f_co = self.filter_vars["company"].get()
        f_wp = self.filter_vars["weapon"].get()
        f_bs = self.filter_vars["burst"].get()
        f_ro = self.filter_vars["role"].get()
        f_cd = self.filter_vars["code"].get()
        
        self.nikke_list.delete(*self.nikke_list.get_children())
        match_count = 0
        
        is_strict_mode = self.app_state.search_scope_single_skill.get()

        # ★ [개선] 인덱서를 통한 1차 필터링 (Smart Search)
        if self.app_state.selected_tags_and or self.app_state.selected_tags_or or self.app_state.selected_tags_not:
            if not self.app_state.indexer:
                # 안전장치: 인덱서가 없으면 전체 리스트 사용 (Fail-safe)
                candidate_names = set(c['nikke_name'] for c in self.app_state.database)
            else:
                candidate_names = self.app_state.indexer.search(
                    self.app_state.selected_tags_and,
                    self.app_state.selected_tags_or,
                    self.app_state.selected_tags_not,
                    is_strict_mode
                )
        else:
            # 태그 선택이 없으면 전체 데이터가 후보
            candidate_names = None # None means all

        for char in self.app_state.database:
            name = char.get("nikke_name", "")
            
            # 1. Indexer Filtering
            if candidate_names is not None:
                if name not in candidate_names: continue

            # 2. Filters
            if f_co != "ALL" and char.get("company") != f_co: continue
            if f_wp != "ALL" and char.get("weapon") != f_wp: continue
            if f_bs != "ALL" and f_bs not in char.get("burst_type", ""): continue
            if f_ro != "ALL" and char.get("role") != f_ro: continue
            if f_cd != "ALL" and char.get("code") != f_cd: continue
            
            # 3. Name Search
            if query and not match_search(query, name): continue
            
            display_name = re.sub(r'\s*\(.*?\)', '', name).strip()
            info = f"{char.get('code','')}/{char.get('weapon','')}"
            self.nikke_list.insert("", "end", iid=name, values=(display_name, info))
            match_count += 1
            
        self.tag_count_lbl.config(text=f"매칭된 니케: {match_count}명")
        
        txt = ""
        if self.app_state.selected_tags_and: txt += f"[AND] {len(self.app_state.selected_tags_and)}개 "
        if self.app_state.selected_tags_or: txt += f"[OR] {len(self.app_state.selected_tags_or)}개 "
        if self.app_state.selected_tags_not: txt += f"[NOT] {len(self.app_state.selected_tags_not)}개 "
        if not txt: txt = "(선택 없음)"
        self.tag_list_lbl.config(text=txt)

    def on_select_nikke(self, event):
        sel = self.nikke_list.selection()
        if not sel: return
        real_name = sel[0]
        self.app_state.current_nikke = next((c for c in self.app_state.database if c['nikke_name'] == real_name), None)
        if self.app_state.current_nikke:
            self.update_all_tabs()
            self.tab_calc.load_current_user_data()

    def update_all_tabs(self):
        if not self.app_state.current_nikke: return
        self.tab_detail.update_content()
        self.tab_upgrade.update_content()
        self.tab_compare.update_content()
        self.tab_edit.update_content()

    def refresh_tag_ui_globally(self):
        self.tab_detail.create_tag_ui()
        self.on_search()

if __name__ == "__main__":
    root = tk.Tk()
    app = NikkeManagerApp(root)
    root.mainloop()