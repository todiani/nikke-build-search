import fs from 'fs';
import path from 'path';
import { normalizeName } from '../src/utils/nikkeConstants.js';

const DB_PATH = 'public/data/nikke_db.json';

function deduplicateDb() {
    if (!fs.existsSync(DB_PATH)) {
        console.error('DB file not found');
        return;
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const nikkes = db.nikkes || [];
    const nameGroups = {};

    // Group by normalized name
    nikkes.forEach(n => {
        const norm = normalizeName(n.name);
        if (!nameGroups[norm]) nameGroups[norm] = [];
        nameGroups[norm].push(n);
    });

    const keptNikkes = [];
    const removedIds = [];

    for (const norm in nameGroups) {
        const group = nameGroups[norm];
        if (group.length === 1) {
            keptNikkes.push(group[0]);
            continue;
        }

        // ID 유형별로 분리
        const numeric = group.filter(n => /^\d+$/.test(n.id));
        const generated = group.filter(n => !/^\d+$/.test(n.id));

        if (numeric.length > 0) {
            // 숫자 ID가 있으면 모두 유지 (예: 사쿠라 282, 836 등 다른 버전일 가능성)
            keptNikkes.push(...numeric);
            // 숫자 ID가 있는 경우 해당 이름의 생성된(gen_) ID는 중복으로 간주하고 제거
            generated.forEach(g => removedIds.push({ name: g.name, id: g.id }));
        } else {
            // 숫자 ID가 없는 경우 가장 짧은 ID 하나만 유지
            generated.sort((a, b) => a.id.length - b.id.length || a.id.localeCompare(b.id));
            keptNikkes.push(generated[0]);
            generated.slice(1).forEach(g => removedIds.push({ name: g.name, id: g.id }));
        }
    }

    if (removedIds.length > 0) {
        console.log(`Removing ${removedIds.length} duplicate entries:`);
        removedIds.forEach(r => console.log(`- ${r.name} (ID: ${r.id})`));
        
        db.nikkes = keptNikkes;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        console.log('Database updated successfully.');
    } else {
        console.log('No duplicates found.');
    }
}

deduplicateDb();
