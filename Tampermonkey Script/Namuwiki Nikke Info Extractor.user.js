// ==UserScript==
// @name         Namuwiki Nikke Skill Extractor
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Extract Nikke skill data from Namuwiki for nikke-build-search project
// @author       Nikke Data Miner
// @match        https://namu.wiki/w/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_download
// ==/UserScript==

(function () {
    'use strict';

    // === UI Creation ===
    function createUI() {
        if (document.getElementById('nikke-namu-extractor')) return;

        const container = document.createElement('div');
        container.id = 'nikke-namu-extractor';
        Object.assign(container.style, {
            position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999',
            padding: '15px', background: '#1a1a1a', borderRadius: '12px',
            border: '2px solid #00c3ff', color: 'white', fontFamily: 'sans-serif',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        });

        const title = document.createElement('div');
        title.innerHTML = '<b style="color:#00c3ff">NIKKE</b> NAMU EXTRACTOR';
        title.style.marginBottom = '10px';
        title.style.textAlign = 'center';
        container.appendChild(title);

        const extractBtn = document.createElement('button');
        extractBtn.innerText = '📊 클립보드 복사 (JSON)';
        styleButton(extractBtn, '#00c3ff');
        extractBtn.onclick = handleExtract;
        container.appendChild(extractBtn);

        const downloadBtn = document.createElement('button');
        downloadBtn.innerText = '💾 DATA 폴더 저장 (JSON)';
        styleButton(downloadBtn, '#4caf50');
        downloadBtn.style.marginTop = '8px';
        downloadBtn.onclick = handleDownload;
        container.appendChild(downloadBtn);
        document.body.appendChild(container);
    }

    function styleButton(btn, color) {
        Object.assign(btn.style, {
            width: '100%', padding: '10px', background: color, color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
        });
    }

    // === Extraction Logic ===
    function handleExtract() {
        try {
            const data = extractSkills();
            const json = JSON.stringify(data, null, 2);
            GM_setClipboard(json);
            GM_notification({
                title: '수집 완료',
                text: `${data.name}의 분류 및 스킬 정보가 클립보드에 복사되었습니다.`,
                timeout: 3000
            });
            console.log('Extracted Data:', data);
        } catch (e) {
            alert('정보 추출 중 오류가 발생했습니다: ' + e.message);
        }
    }

    function handleDownload() {
        try {
            const data = extractSkills();
            const id = getNikkeId(data.name);
            const fileName = `${data.name}${id ? '(' + id + ')' : ''}.json`;
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

            GM_download({
                url: URL.createObjectURL(blob),
                name: `DATA/${fileName}`,
                saveAs: false,
                onerror: (err) => {
                    console.error('Download error:', err);
                    alert('다운로드 오류: Tampermonkey 설정에서 "Allow Browser Downloads"가 켜져 있는지 확인해주세요.');
                },
                onload: () => {
                    GM_notification({
                        title: '저장 완료',
                        text: `${fileName} 파일이 DATA 폴더에 저장되었습니다.`,
                        timeout: 3000
                    });
                }
            });
        } catch (e) {
            alert('저장 중 오류가 발생했습니다: ' + e.message);
        }
    }

    const NIKKE_ID_MAP = {
        "신데렐라": "511",
        "레드 후드": "470",
        "라피 : 레드 후드": "16",
        "모더니아": "72",
        "도로시": "33",
        "크라운": "151",
        "홍련": "177",
        "홍련 : 흑영": "178",
        "라푼젤": "39",
        "스노우 화이트": "107",
        "스노우 화이트 : 헤비암즈": "3120", // Just example, real ID needed
        "그레이브": "15"
    };

    function getNikkeId(name) {
        if (NIKKE_ID_MAP[name]) return NIKKE_ID_MAP[name];
        // Try to find in-game ID from table if exists
        const idCell = Array.from(document.querySelectorAll('td')).find(td => td.innerText.trim() === 'ID');
        if (idCell && idCell.nextElementSibling) {
            return idCell.nextElementSibling.innerText.trim();
        }
        return prompt(`${name}의 ID를 입력해주세요 (예: 511)`, "");
    }

    function extractSkills() {
        const name = document.querySelector('h1')?.innerText.split('(')[0].trim() || 'Unknown';
        const tables = Array.from(document.querySelectorAll('table'));

        let metaData = extractMeta(tables);

        let skillData = {
            name: name,
            ...metaData,
            skills_detail: {
                skill1: { name: '', desc: '', type: '패시브', tags: [] },
                skill2: { name: '', desc: '', type: '패시브', tags: [] },
                burst: { name: '', desc: '', type: '액티브', cooldown: '', tags: [] },
                normal: { name: '일반 공격', desc: '', tags: [] }
            }
        };

        const cleanText = (t) => t.replace(/\n+/g, '\n').trim();

        // Find the main skill table
        const skillTable = tables.find(t => {
            const text = t.innerText;
            return text.includes('일반 공격') && (text.includes('스킬 1') || text.includes('1번 스킬'));
        });

        if (!skillTable) return skillData; // Could happen if only meta is available

        const rows = Array.from(skillTable.querySelectorAll('tr'));
        let currentTarget = null;

        for (let i = 0; i < rows.length; i++) {
            const rowText = rows[i].innerText;

            if (rowText.includes('스킬 1') || rowText.includes('1번 스킬')) {
                currentTarget = 'skill1';
                skillData.skills_detail.skill1.name = extractNameFromRow(rowText);
            } else if (rowText.includes('스킬 2') || rowText.includes('2번 스킬')) {
                currentTarget = 'skill2';
                skillData.skills_detail.skill2.name = extractNameFromRow(rowText);
            } else if (rowText.match(/버스트\s*([IVX]+|스킬)/)) {
                currentTarget = 'burst';
                skillData.skills_detail.burst.name = extractNameFromRow(rowText);
                const cdMatch = rowText.match(/(\d+\.?\d*)초/);
                if (cdMatch) skillData.skills_detail.burst.cooldown = cdMatch[0];
            } else if (rowText.includes('일반 공격')) {
                currentTarget = 'normal';
            }

            if (currentTarget && rows[i + 1]) {
                let desc = findDescription(rows, i);
                if (desc) {
                    skillData.skills_detail[currentTarget].desc = desc;
                }
            }
        }

        return skillData;
    }

    function extractMeta(tables) {
        const meta = {
            rarity: '',
            company: '', // 제조사
            squad: '',
            weapon: '',
            code: '', // 속성 (작열, 수냉 등)
            burst: '',
            class: ''  // 클래스 (화력형 등)
        };

        // The info table is usually the first major table with "제조사" or "등급"
        const infoTable = tables.find(t => t.innerText.includes('제조사') || t.innerText.includes('등급'));
        if (!infoTable) return meta;

        const rows = Array.from(infoTable.querySelectorAll('tr'));
        rows.forEach(row => {
            const labelCell = row.querySelector('td:first-child');
            if (!labelCell) return;

            const label = labelCell.innerText.trim();
            const valueCell = row.querySelector('td:last-child');
            if (!valueCell) return;

            const getValue = (cell) => {
                // Check all images in the cell
                const imgs = Array.from(cell.querySelectorAll('img'));
                for (const img of imgs) {
                    let alt = img.getAttribute('alt') || '';
                    if (!alt) {
                        // Some images might have titles or data-src that hint at their content
                        const src = img.getAttribute('src') || '';
                        if (src.includes('Ssr')) return 'SSR';
                        if (src.includes('Sr')) return 'SR';
                    }
                    if (alt.includes('니케-')) return alt.replace('니케-', '').split(' ')[0].trim();
                    if (alt.includes('니케')) return alt.replace('니케', '').trim();
                }
                // Fallback to text, removing footnotes like [1]
                return cell.innerText.replace(/\[\d+\]/g, '').trim();
            };

            let value = getValue(valueCell);

            // Special handling for labels
            if (label === '등급') meta.rarity = (value === 'Ssr' || value === 'SSR') ? 'SSR' : (value === 'Sr' || value === 'SR' ? 'SR' : value);
            else if (label === '제조사') meta.company = value;
            else if (label === '스쿼드') meta.squad = value;
            else if (label === '무기') {
                const iconVal = getValue(valueCell);
                if (iconVal === 'RL' || value.includes('런처')) meta.weapon = '런처 (RL)';
                else if (iconVal === 'AR' || value.includes('소총')) meta.weapon = '소총 (AR)';
                else if (iconVal === 'MG' || value.includes('기관총')) meta.weapon = '기관총 (MG)';
                else if (iconVal === 'SR' || value.includes('저격')) meta.weapon = '저격소총 (SR)';
                else if (iconVal === 'SMG' || value.includes('하브')) meta.weapon = '하브소총 (SMG)';
                else if (iconVal === 'SG' || value.includes('샷건')) meta.weapon = '샷건 (SG)';
                else meta.weapon = value.split('\n')[0];
            }
            else if (label === '속성') {
                if (value.includes('전격')) meta.code = '전격';
                else if (value.includes('작열')) meta.code = '작열';
                else if (value.includes('수냉')) meta.code = '수냉';
                else if (value.includes('풍압')) meta.code = '풍압';
                else if (value.includes('철갑')) meta.code = '철갑';
                else meta.code = value;
            }
            else if (label === '버스트') {
                if (value.includes('3단계') || value.includes('III')) meta.burst = 'III';
                else if (value.includes('2단계') || value.includes('II')) meta.burst = 'II';
                else if (value.includes('1단계') || value.includes('I')) meta.burst = 'I';
                else meta.burst = value;
            }
            else if (label === '클래스') {
                if (value.includes('화력')) meta.class = '화력형';
                else if (value.includes('방어')) meta.class = '방어형';
                else if (value.includes('지원')) meta.class = '지원형';
                else meta.class = value;
            }
            else if (label === '성우') {
                // KR, JP, EN CVs
                const cvs = Array.from(valueCell.querySelectorAll('a')).map(a => a.innerText.trim());
                if (cvs.length > 0) meta.cv = cvs[0]; // Primary KR CV
                if (cvs.length > 1) meta.cv_jp = cvs[1];
                if (cvs.length > 2) meta.cv_en = cvs[2];
            }
        });

        return meta;
    }

    function extractNameFromRow(text) {
        const parts = text.split(/[\n\t]|\s{2,}/).map(p => p.trim()).filter(Boolean);
        return parts[parts.length - 1] || '';
    }

    function findDescription(rows, startIndex) {
        for (let j = 1; j <= 3; j++) {
            if (!rows[startIndex + j]) break;
            const text = rows[startIndex + j].innerText.trim();
            if (text.length > 10 && !text.includes('스킬 1') && !text.includes('버스트')) {
                return text;
            }
        }
        return '';
    }

    // Initialize
    if (document.body.innerText.includes('승리의 여신: 니케')) {
        createUI();
    }

})();
