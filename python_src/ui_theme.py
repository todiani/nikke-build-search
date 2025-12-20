# ui_theme.py
import tkinter as tk
from tkinter import ttk
from core_state import AppState

def setup_styles(state: AppState):
    style = ttk.Style()
    style.theme_use('clam')
    c = state.colors
    style.configure(".", background=c["bg"], foreground=c["text"], fieldbackground=c["surface_light"], bordercolor=c["border"])
    style.configure("Treeview", background=c["surface_light"], foreground=c["text"], fieldbackground=c["surface_light"], borderwidth=0, font=("맑은 고딕", 10), rowheight=28)
    style.map("Treeview", background=[("selected", c["primary_dark"])], foreground=[("selected", "#ffffff")])
    style.configure("Treeview.Heading", background=c["surface"], foreground=c["text"], font=("맑은 고딕", 9, "bold"))
    style.configure("Header.TLabel", background=c["surface"], foreground=c["primary"], font=("맑은 고딕", 12, "bold"))
    style.configure("Title.TLabel", background=c["surface_light"], foreground=c["text"], font=("맑은 고딕", 16, "bold"))
    style.configure("Accent.TButton", background=c["primary_dark"], foreground="white")
    style.configure("Card.TFrame", background=c["surface_light"], borderwidth=1, relief="solid")
    style.configure("Panel.TFrame", background=c["bg"])