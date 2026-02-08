# tab_tag_manage.py
import tkinter as tk
from tkinter import ttk, messagebox
from core_state import AppState
from io_files import save_tags, save_database_silent, auto_generate_tags
from widgets_common import setup_scroll_binding

class TabTagManage:
    def __init__(self, parent, app_state: AppState, refresh_tag_ui_callback):
        self.app_state = app_state
        self.refresh_tag_ui_callback = refresh_tag_ui_callback
        
        frame = ttk.Frame(parent, padding=20)
        frame.pack(fill=tk.BOTH, expand=True)
        add_frame = ttk.LabelFrame(frame, text="🏷️ 새 태그 추가 (그룹 지정)", padding=10)
        add_frame.pack(fill=tk.X, pady=10)
        f_add = ttk.Frame(add_frame)
        f_add.pack(fill=tk.X, pady=5)
        ttk.Label(f_add, text="태그명:").pack(side=tk.LEFT)
        self.new_tag_entry = ttk.Entry(f_add, width=30)
        self.new_tag_entry.pack(side=tk.LEFT, padx=5)
        ttk.Label(f_add, text="그룹:").pack(side=tk.LEFT)
        group_display_names = [data.get("display_name", key) for key, data in self.app_state.tag_groups.items()]
        self.group_combo = ttk.Combobox(f_add, values=group_display_names, state="readonly", width=25)
        self.group_combo.pack(side=tk.LEFT, padx=5)
        ttk.Button(f_add, text="➕ 추가", command=self.add_tag).pack(side=tk.LEFT, padx=5)
        list_frame = ttk.LabelFrame(frame, text="📋 현재 태그 목록", padding=10)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        v_sb = ttk.Scrollbar(list_frame, orient="vertical")
        h_sb = ttk.Scrollbar(list_frame, orient="horizontal")
        self.tag_list_tree = ttk.Treeview(list_frame, columns=("tag", "group", "count"), show="headings", yscrollcommand=v_sb.set, xscrollcommand=h_sb.set)
        self.tag_list_tree.heading("tag", text="태그 이름")
        self.tag_list_tree.heading("group", text="그룹")
        self.tag_list_tree.heading("count", text="매칭 수")
        self.tag_list_tree.column("tag", width=200)
        self.tag_list_tree.column("group", width=200)
        self.tag_list_tree.column("count", width=100)
        self.tag_list_tree.grid(row=0, column=0, sticky='nsew')
        v_sb.grid(row=0, column=1, sticky='ns')
        h_sb.grid(row=1, column=0, sticky='ew')
        list_frame.grid_columnconfigure(0, weight=1)
        list_frame.grid_rowconfigure(0, weight=1)
        v_sb.config(command=self.tag_list_tree.yview)
        h_sb.config(command=self.tag_list_tree.xview)
        setup_scroll_binding(self.tag_list_tree)
        btn_frame = ttk.Frame(frame)
        btn_frame.pack(fill=tk.X, pady=10)
        ttk.Button(btn_frame, text="🗑️ 선택된 태그 삭제", command=self.delete_tag).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="🔄 목록 새로고침", command=self.refresh_tag_list).pack(side=tk.LEFT, padx=5)
        self.refresh_tag_list()

    def add_tag(self):
        tag_name = self.new_tag_entry.get().strip()
        selected_group_display = self.group_combo.get()
        if not tag_name or not selected_group_display: return
        target_group_key = None
        for key, data in self.app_state.tag_groups.items():
            if data.get("display_name", key) == selected_group_display:
                target_group_key = key
                break
        if tag_name in self.app_state.all_tags:
            messagebox.showwarning("경고", "이미 존재하는 태그입니다.")
            return
        self.app_state.all_tags.append(tag_name)
        if target_group_key:
            self.app_state.tag_groups[target_group_key]["tags"].append(tag_name)
        save_tags(self.app_state)
        auto_generate_tags(self.app_state)
        save_database_silent(self.app_state)
        self.refresh_tag_list()
        self.refresh_tag_ui_callback()
        self.new_tag_entry.delete(0, tk.END)
        messagebox.showinfo("성공", "태그가 추가되었습니다.")

    def delete_tag(self):
        sel = self.tag_list_tree.selection()
        if not sel: return
        tag = self.tag_list_tree.item(sel[0], 'values')[0]
        if messagebox.askyesno("확인", f"'{tag}' 태그를 삭제하시겠습니까?"):
            if tag in self.app_state.all_tags: self.app_state.all_tags.remove(tag)
            for g in self.app_state.tag_groups.values():
                if tag in g["tags"]: g["tags"].remove(tag)
            save_tags(self.app_state)
            auto_generate_tags(self.app_state)
            save_database_silent(self.app_state)
            self.refresh_tag_list()
            self.refresh_tag_ui_callback()

    def refresh_tag_list(self):
        self.tag_list_tree.delete(*self.tag_list_tree.get_children())
        for group_key, group_data in self.app_state.tag_groups.items():
            display_name = group_data.get("display_name", group_key)
            for tag in group_data.get("tags", []):
                count = self.app_state.tag_counts.get(tag, 0)
                self.tag_list_tree.insert("", "end", values=(tag, display_name, count))
        if hasattr(self, 'group_combo'):
            group_display_names = [data.get("display_name", key) for key, data in self.app_state.tag_groups.items()]
            self.group_combo['values'] = group_display_names