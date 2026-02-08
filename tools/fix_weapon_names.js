import fs from 'fs';
import path from 'path';

const dbPath = 'r:/AI/nikke-build-search/public/data/nikke_db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. 라피 : 레드 후드 (ID 16)
const rapiRH = db.nikkes.find(n => n.id === "16");
if (rapiRH) {
    if (rapiRH.skills_detail && rapiRH.skills_detail.normal) {
        rapiRH.skills_detail.normal.name = "울프스 베인";
    }
    if (rapiRH.weapon_info) {
        rapiRH.weapon_info.name = "울프스 베인";
        rapiRH.weapon_info.weapon_name = "울프스 베인";
    }
}

// 2. 레드 후드 (ID 470)
const redHood = db.nikkes.find(n => n.id === "470");
if (redHood) {
    if (redHood.skills_detail && redHood.skills_detail.normal) {
        redHood.skills_detail.normal.name = "울프스 베인";
    }
    if (redHood.weapon_info) {
        redHood.weapon_info.name = "울프스 베인";
        if (redHood.weapon_info.weapon_name) {
            redHood.weapon_info.weapon_name = "울프스 베인";
        }
    }
}

// 3. 스노우 화이트 : 이노센트 데이즈 (ID 224)
// 이미 "세븐스 드워프 제로"인 경우가 많으나 확인 차원
const swInnocent = db.nikkes.find(n => n.id === "224");
if (swInnocent) {
    if (swInnocent.skills_detail && swInnocent.skills_detail.normal) {
        swInnocent.skills_detail.normal.name = "세븐스 드워프 제로";
    }
    if (swInnocent.weapon_info) {
        swInnocent.weapon_info.name = "성궤";
        swInnocent.weapon_info.weapon_name = "세븐스 드워프 제로";
    } else {
        swInnocent.weapon_info = {
            name: "성궤",
            weapon_name: "세븐스 드워프 제로"
        };
    }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Database updated successfully.');
