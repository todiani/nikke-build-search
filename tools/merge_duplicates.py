#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Merge duplicate Nikke entries with the same normalized name.
Keeps the most complete/accurate data from each duplicate.
"""

import json
import re
import os
from collections import defaultdict

# File paths
INPUT_FILE = os.path.join(os.path.dirname(__file__), '../public/data/nikke_db.json')
OUTPUT_FILE = INPUT_FILE

def normalize_name(name: str) -> str:
    """
    Normalize name by removing:
    - Spaces
    - Special characters (except Korean/English alphanumeric)
    - Parentheses and their content
    """
    # Remove parentheses content first
    name = re.sub(r'[\(（][^)）]*[\)）]', '', name)
    # Remove all non-alphanumeric characters (keep Korean, English letters, numbers)
    name = re.sub(r'[^가-힣a-zA-Z0-9]', '', name)
    return name.lower().strip()


def get_data_richness(nikke: dict) -> int:
    """
    Calculate a "richness" score for the data.
    Higher score = more complete data.
    """
    score = 0
    
    # Basic fields
    if nikke.get('name_en'): score += 1
    if nikke.get('tier') and nikke['tier'] != 'Unranked': score += 2
    if nikke.get('burst'): score += 1
    if nikke.get('class'): score += 1
    if nikke.get('weapon'): score += 1
    if nikke.get('skill_priority'): score += 2
    if nikke.get('cube'): score += 1
    if nikke.get('desc'): score += 1
    
    # Skills structured data
    if nikke.get('skills'):
        skills = nikke['skills']
        if skills.get('min'): score += 2
        if skills.get('efficient'): score += 2
        if skills.get('max'): score += 2
    
    # Options
    if nikke.get('options') and len(nikke['options']) > 0: score += 3
    if nikke.get('valid_options') and len(nikke['valid_options']) > 0: score += 3
    if nikke.get('invalid_options') and len(nikke['invalid_options']) > 0: score += 2
    
    # Skills detail (rich data)
    if nikke.get('skills_detail'):
        sd = nikke['skills_detail']
        for key in ['skill1', 'skill2', 'burst']:
            if sd.get(key):
                skill = sd[key]
                if skill.get('name'): score += 2
                if skill.get('desc'): score += 3
                if skill.get('tags') and len(skill['tags']) > 0: score += 4
    
    return score


def merge_nikke_data(base: dict, other: dict) -> dict:
    """
    Merge two Nikke entries, keeping the best data from each.
    Base is the primary entry, other provides supplementary data.
    """
    merged = base.copy()
    
    # Simple fields: prefer non-empty, non-default values
    simple_fields = ['name_en', 'skill_priority', 'cube', 'desc', 'extra_info']
    for field in simple_fields:
        if not merged.get(field) or merged.get(field) == '':
            if other.get(field):
                merged[field] = other[field]
    
    # Tier: prefer non-Unranked
    if merged.get('tier') == 'Unranked' or not merged.get('tier'):
        if other.get('tier') and other['tier'] != 'Unranked':
            merged['tier'] = other['tier']
    
    # Burst, class, weapon: prefer existing
    for field in ['burst', 'class', 'weapon']:
        if not merged.get(field):
            if other.get(field):
                merged[field] = other[field]
    
    # Skills structured data: prefer complete set
    if not merged.get('skills') or not merged['skills'].get('efficient'):
        if other.get('skills') and other['skills'].get('efficient'):
            merged['skills'] = other['skills']
    
    # Options: merge unique values
    base_opts = set(merged.get('options', []))
    other_opts = set(other.get('options', []))
    merged['options'] = list(base_opts | other_opts)
    
    # Valid/Invalid options: prefer if base doesn't have
    if not merged.get('valid_options') or len(merged.get('valid_options', [])) == 0:
        if other.get('valid_options') and len(other['valid_options']) > 0:
            merged['valid_options'] = other['valid_options']
    if not merged.get('invalid_options') or len(merged.get('invalid_options', [])) == 0:
        if other.get('invalid_options') and len(other['invalid_options']) > 0:
            merged['invalid_options'] = other['invalid_options']
    
    # Skills detail: deep merge
    if not merged.get('skills_detail'):
        merged['skills_detail'] = {}
    if other.get('skills_detail'):
        for key in ['skill1', 'skill2', 'burst']:
            base_skill = merged['skills_detail'].get(key, {})
            other_skill = other['skills_detail'].get(key, {})
            
            # Prefer richer skill data
            base_has_content = bool(base_skill.get('desc'))
            other_has_content = bool(other_skill.get('desc'))
            
            if other_has_content and not base_has_content:
                merged['skills_detail'][key] = other_skill
            elif base_has_content and other_has_content:
                # Merge tags
                base_tags = set(base_skill.get('tags', []))
                other_tags = set(other_skill.get('tags', []))
                merged_skill = base_skill.copy()
                merged_skill['tags'] = list(base_tags | other_tags)
                merged['skills_detail'][key] = merged_skill
    
    return merged


def merge_duplicates():
    # Load data
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} nikkes")
    
    # Group by normalized name
    groups = defaultdict(list)
    for nikke in data:
        norm_name = normalize_name(nikke.get('name', ''))
        if norm_name:
            groups[norm_name].append(nikke)
    
    # Find duplicates
    duplicates = {name: entries for name, entries in groups.items() if len(entries) > 1}
    print(f"Found {len(duplicates)} duplicate groups")
    
    # Process each group
    merged_data = []
    merged_ids = set()
    
    for norm_name, entries in groups.items():
        if len(entries) == 1:
            # No duplicate, keep as-is
            merged_data.append(entries[0])
        else:
            # Multiple entries - merge them
            print(f"\n[Merging] Normalized: '{norm_name}'")
            for e in entries:
                richness = get_data_richness(e)
                print(f"  - '{e.get('name')}' (richness: {richness})")
            
            # Sort by richness score (highest first)
            entries_sorted = sorted(entries, key=get_data_richness, reverse=True)
            
            # Start with the richest entry
            base = entries_sorted[0]
            print(f"  → Base: '{base.get('name')}'")
            
            # Merge others into base
            for other in entries_sorted[1:]:
                base = merge_nikke_data(base, other)
                # If other had extra_info and base didn't, note it
                if other.get('extra_info') and not base.get('extra_info'):
                    base['extra_info'] = other.get('extra_info')
            
            # Keep original name (without parentheses if extracted)
            # but ensure we have the "canonical" name
            final_richness = get_data_richness(base)
            print(f"  → Merged: '{base.get('name')}' (final richness: {final_richness})")
            
            merged_data.append(base)
            
            # Track merged IDs for cleanup
            for e in entries_sorted[1:]:
                merged_ids.add(e.get('id'))
    
    # Sort by name for consistency
    merged_data.sort(key=lambda x: x.get('name', ''))
    
    # Reassign IDs if needed
    for i, nikke in enumerate(merged_data):
        if not nikke.get('id'):
            nikke['id'] = f"nikke_{i:03d}"
    
    print(f"\n=== Summary ===")
    print(f"Original entries: {len(data)}")
    print(f"After merge: {len(merged_data)}")
    print(f"Reduced by: {len(data) - len(merged_data)}")
    
    # Save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    
    print(f"Saved to {OUTPUT_FILE}")


if __name__ == '__main__':
    merge_duplicates()
