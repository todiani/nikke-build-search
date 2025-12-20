# widgets_common.py
import tkinter as tk

def setup_scroll_binding(widget, target_scrollable=None):
    scroll_target = target_scrollable if target_scrollable else widget
    def _on_mousewheel(event):
        if scroll_target.winfo_exists():
            if event.num == 5 or event.delta < 0: scroll_target.yview_scroll(1, "units")
            elif event.num == 4 or event.delta > 0: scroll_target.yview_scroll(-1, "units")
    widget.bind("<MouseWheel>", _on_mousewheel)
    widget.bind("<Button-4>", _on_mousewheel)
    widget.bind("<Button-5>", _on_mousewheel)
    for child in widget.winfo_children(): setup_scroll_binding(child, scroll_target)