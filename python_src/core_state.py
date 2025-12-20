# core_state.py
from collections import Counter
import tkinter as tk

class AppState:
    def __init__(self):
        self.database = []
        self.current_nikke = None
        self.all_tags = []
        self.tag_groups = {}
        
        # 스마트 태그 검색용 변수
        self.selected_tags_and = [] 
        self.selected_tags_or = []  
        self.selected_tags_not = []
        
        # 개별 스킬 범위 검색 활성화 여부
        self.search_scope_single_skill = None
        
        self.tag_counts = Counter()
        self.themes = {}
        self.current_theme_name = "Blue Pro (Default)"
        
        # 삭제된 니케 목록 (Blacklist)
        self.deleted_nikkes = []
        
        self.colors = {}
        
        # 레이아웃 설정 저장용
        self.layout_config = {
            "geometry": "1650x950",
            "sash_main": 380,
            "sash_detail": 680,
            "sash_calc": 750
        }
        
        # 계산기 탭 변수
        self.calc_vars = {} 
        self.calc_opts = [[None]*3 for _ in range(4)]
        
        # ★ [추가] 검색 엔진 인덱서
        self.indexer = None