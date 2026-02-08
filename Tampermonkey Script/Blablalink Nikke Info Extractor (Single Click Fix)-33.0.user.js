// ==UserScript==
// @name         Blablalink Nikke Info Extractor (UI Design Fix)
// @namespace    http://tampermonkey.net/
// @version      34.0
// @description  v34.0: 버튼 크기 및 디자인 통일 + 더블클릭 방지 + 완벽 데이터 수집
// @author       Nikke Data Miner
// @match        *://*.blablalink.com/*
// @include      *://www.blablalink.com/*
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // === 설정 ===
    const AUTO_KEY = 'nikke_auto_scraping';
    const VISITED_KEY = 'nikke_visited_ids';
    const LAST_ID_KEY = 'nikke_last_processed_id';

    const CONFIG = {
        INITIAL_WAIT: 4000,
        TAB_CLICK_WAIT: 800,
        NEXT_PAGE_WAIT: 3000
    };

    const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    const storage = {
        get: (key) => localStorage.getItem(key),
        set: (key, val) => localStorage.setItem(key, val),
        remove: (key) => localStorage.removeItem(key)
    };

    const cleanupOldVersions = () => {
        const oldUI = document.getElementById('nikke-ui-container');
        if (oldUI) oldUI.remove();
        const oldNoti = document.getElementById('nikke-status-noti');
        if (oldNoti) oldNoti.remove();
    };
    cleanupOldVersions();

    // ==========================================
    // 1. UI 생성 (디자인 수정)
    // ==========================================
    function createUI() {
        if (document.getElementById('nikke-ui-container')) return;

        const container = document.createElement('div');
        container.id = 'nikke-ui-container';
        Object.assign(container.style, {
            position: 'fixed', bottom: '30px', right: '30px', zIndex: '2147483647',
            display: 'flex', flexDirection: 'column', gap: '10px', // 버튼 간격
            padding: '20px', background: '#1a1a1a', borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.7)', border: '2px solid #FF0050',
            color: 'white', fontFamily: 'sans-serif',
            minWidth: '200px' // 컨테이너 최소 너비 고정
        });

        const header = document.createElement('div');
        header.innerHTML = '<b style="color:#FF0050">NIKKE</b> EXTRACTOR <small style="opacity:0.6">v34.0</small>';
        header.style.textAlign = 'center';
        header.style.marginBottom = '5px';
        container.appendChild(header);

        // 1. 다운로드 버튼
        const downBtn = document.createElement('button');
        downBtn.innerHTML = '<b>📥 현재 정보 추출</b>';
        styleButton(downBtn, '#FF0050');
        downBtn.onclick = () => manualRun();

        // 2. 자동 수집 버튼
        const autoBtn = document.createElement('button');
        const isAuto = storage.get(AUTO_KEY) === 'true';
        autoBtn.id = 'nikke-auto-btn';
        updateAutoButton(isAuto, autoBtn);
        autoBtn.onclick = toggleAuto;

        // 3. 초기화 버튼
        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = '<small>🔄 상태 초기화</small>';
        resetBtn.style.cssText = "background:none;border:none;color:#888;cursor:pointer;font-size:11px;margin-top:5px;width:100%;text-align:center;";
        resetBtn.onmouseover = () => resetBtn.style.color = '#fff';
        resetBtn.onmouseout = () => resetBtn.style.color = '#888';
        resetBtn.onclick = () => {
            if(confirm("기록을 초기화합니까?")) {
                storage.remove(AUTO_KEY); storage.remove(VISITED_KEY); storage.remove(LAST_ID_KEY);
                location.reload();
            }
        };

        container.appendChild(downBtn);
        container.appendChild(autoBtn);
        container.appendChild(resetBtn);
        document.body.appendChild(container);
    }

    // ★ 버튼 스타일 통일 함수
    function styleButton(btn, bgColor) {
        Object.assign(btn.style, {
            width: '100%',           // 가로 꽉 채우기 (크기 통일)
            padding: '12px 0',       // 세로 여백만 지정
            background: bgColor, 
            color: 'white',
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer',
            fontWeight: 'bold', 
            fontSize: '14px', 
            transition: 'all 0.2s',
            textAlign: 'center',     // 텍스트 중앙 정렬
            boxSizing: 'border-box'  // 패딩 포함 크기 계산
        });
        
        // 호버 효과
        btn.onmouseover = () => { btn.style.filter = 'brightness(1.1)'; btn.style.transform = 'scale(1.02)'; };
        btn.onmouseout = () => { btn.style.filter = 'none'; btn.style.transform = 'scale(1)'; };
    }

    function updateAutoButton(isAuto, btnElement) {
        const btn = btnElement || document.getElementById('nikke-auto-btn');
        if (!btn) return;
        if (isAuto) {
            btn.innerHTML = '<b>⏹️ 자동 수집 중지</b>'; // 글자 수 맞춰줌
            btn.style.background = '#444';
        } else {
            btn.innerHTML = '<b>▶️ 자동 수집 시작</b>';
            btn.style.background = '#007BFF';
        }
    }

    function showStatus(msg, color='orange') {
        let noti = document.getElementById('nikke-status-noti');
        if (!noti) {
            noti = document.createElement('div');
            noti.id = 'nikke-status-noti';
            Object.assign(noti.style, {
                position: 'fixed', top: '20px', left: '20px', background: color, color: 'white',
                padding: '15px 25px', borderRadius: '10px', zIndex: '2147483647',
                fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', fontSize: '16px', border: '2px solid white'
            });
            document.body.appendChild(noti);
        }
        noti.style.background = color;
        noti.innerText = msg;
        console.log(`[Status] ${msg}`);
    }

    const downloadFile = (content, filename, type) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        GM_download({ url: url, name: filename, saveAs: false });
        setTimeout(() => URL.revokeObjectURL(url), 20000);
    };

    // ==========================================
    // 2. 버튼 클릭 로직
    // ==========================================
    function getNextButton() {
        const classTarget = document.querySelector('.detail-swiper-prev');
        if (isValidButton(classTarget)) return classTarget;

        const arrowPathSignature = "M5 8.87681V17.5111C5.00246";
        const paths = document.querySelectorAll('path');
        for (const path of paths) {
            const d = path.getAttribute('d') || "";
            if (d.startsWith(arrowPathSignature)) {
                let target = path.closest('div.cursor-pointer') || 
                             path.closest('div[onclick]') || 
                             path.parentElement.parentElement;
                if (isValidButton(target)) return target;
            }
        }
        return null;
    }

    function isValidButton(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        if (rect.width > 150 || rect.height > 150) return false;
        if (rect.left < window.innerWidth / 2) return false;
        return true;
    }

    async function triggerDeepClick(element) {
        if (!element) return false;
        
        const originalBorder = element.style.border;
        element.style.border = "4px solid #FF0000"; 
        element.style.transform = "scale(0.9)";
        
        const rect = element.getBoundingClientRect();
        const x = rect.left + (rect.width / 2);
        const y = rect.top + (rect.height / 2);

        const dot = document.createElement('div');
        dot.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:10px;height:10px;background:yellow;border-radius:50%;z-index:2147483647;pointer-events:none;transform:translate(-50%,-50%);`;
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 500);

        try {
            const opts = { view: win, bubbles: true, cancelable: true, clientX: x, clientY: y, screenX: x, screenY: y };
            element.dispatchEvent(new PointerEvent('pointerdown', opts));
            element.dispatchEvent(new MouseEvent('mousedown', opts));
            await new Promise(r => setTimeout(r, 100));
            element.dispatchEvent(new PointerEvent('pointerup', opts));
            element.dispatchEvent(new MouseEvent('mouseup', opts));
            element.dispatchEvent(new MouseEvent('click', opts));
            // if (element.click) element.click(); // 더블 클릭 방지 위해 제거
            return true;
        } catch (e) {
            console.error("클릭 실패:", e);
            return false;
        } finally {
            setTimeout(() => {
                element.style.border = originalBorder;
                element.style.transform = "scale(1)";
            }, 500);
        }
    }

    async function tryMoveNext() {
        if (storage.get(AUTO_KEY) !== 'true') return;

        const nextBtn = getNextButton();
        if (nextBtn) {
            showStatus(`🚀 다음 버튼 클릭...`, '#2196F3');
            const clicked = await triggerDeepClick(nextBtn);
            if (!clicked) setTimeout(tryMoveNext, 2000);
        } else {
            showStatus("⚠️ 버튼 미감지 (로딩중?)", "orange");
            window.scrollBy(0, 100);
            setTimeout(() => {
                if (storage.get(AUTO_KEY) === 'true') {
                    const retryBtn = getNextButton();
                    if (retryBtn) triggerDeepClick(retryBtn);
                }
            }, 1000);
        }
    }

    // ==========================================
    // 3. 자동화 흐름 제어
    // ==========================================
    function toggleAuto() {
        const isAuto = storage.get(AUTO_KEY) === 'true';
        if (isAuto) {
            stopAutoCollection("🛑 사용자가 자동 수집을 중단했습니다.");
        } else {
            if (confirm("자동 수집을 시작하시겠습니까?\n(중복된 니케를 만나면 자동으로 종료됩니다)")) {
                storage.set(AUTO_KEY, 'true');
                storage.set(VISITED_KEY, JSON.stringify([]));
                storage.remove(LAST_ID_KEY);
                updateAutoButton(true);
                autoProcessLoop();
            }
        }
    }

    function stopAutoCollection(msg) {
        storage.set(AUTO_KEY, 'false');
        updateAutoButton(false);
        showStatus(msg, "#333");
        alert(msg);
        const btn = document.getElementById('nikke-auto-btn');
        if(btn) {
            btn.innerHTML = '<b>🏁 수집 완료</b>';
            btn.style.background = '#28a745';
        }
    }

    async function manualRun() {
        showStatus("🏃 수동 수집 시작...", "#673AB7");
        await extractAndDownload(false);
    }

    async function autoProcessLoop() {
        if (storage.get(AUTO_KEY) !== 'true') return;

        const currentId = new URLSearchParams(window.location.search).get('nikke') || 'Unknown';
        const lastProcessedId = storage.get(LAST_ID_KEY);

        const visitedList = JSON.parse(storage.get(VISITED_KEY) || '[]');
        if (currentId !== 'Unknown' && visitedList.includes(currentId)) {
            stopAutoCollection(`🎉 순환 완료!\n(ID: ${currentId} 지점으로 돌아왔습니다)\n\n자동 수집을 종료합니다.`);
            return;
        }

        if (currentId === lastProcessedId && currentId !== 'Unknown') {
            showStatus(`⚠️ 이동 실패 감지 (ID ${currentId}). 버튼 다시 클릭!`, '#FF9800');
            setTimeout(tryMoveNext, 2000);
            return;
        }

        showStatus(`⏳ 데이터 로딩 대기 중... (ID: ${currentId})`);
        const loaded = await waitForData();
        if (!loaded) {
            if (storage.get(AUTO_KEY) === 'true') {
                showStatus("❌ 로딩 실패. 새로고침...", "red");
                setTimeout(() => location.reload(), 2000);
            }
            return;
        }

        showStatus('💾 데이터 수집 및 저장 중...', '#4CAF50');
        await extractAndDownload(true);

        if (currentId !== 'Unknown') {
            visitedList.push(currentId);
            storage.set(VISITED_KEY, JSON.stringify(visitedList));
            storage.set(LAST_ID_KEY, currentId);
        }

        if (storage.get(AUTO_KEY) === 'true') {
            setTimeout(() => {
                if (storage.get(AUTO_KEY) === 'true') tryMoveNext();
            }, CONFIG.NEXT_PAGE_WAIT);
        }
    }

    async function waitForData() {
        for (let i = 0; i < 20; i++) {
            if (storage.get(AUTO_KEY) !== 'true') return false;
            const bodyText = document.body ? document.body.innerText : "";
            if (bodyText.includes('CV') || bodyText.includes('전투력')) return true;
            await new Promise(r => setTimeout(r, 500));
        }
        return false;
    }

    // ==========================================
    // 4. 데이터 추출
    // ==========================================
    const extractAndDownload = async (isAuto) => {
        try {
            const data = await extractData();
            const id = new URLSearchParams(window.location.search).get('nikke') || 'NoID';
            const filenameBase = `${data.meta.name}(${id})`;

            downloadFile(JSON.stringify(data, null, 2), `${filenameBase}.json`, 'application/json');
            setTimeout(() => {
                downloadFile(generateMarkdown(data), `${filenameBase}.md`, 'text/markdown');
                if (!isAuto) showStatus("✅ 다운로드 완료", "#4CAF50");
            }, 500);
        } catch (e) {
            console.error(e);
            showStatus("❌ 추출 오류: " + e.message, "red");
        }
    };

    const analyzeImages = () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        let code="확인 필요", weapon="확인 필요", rarity="확인 필요", burst="확인 필요";
        const burstHash = {'448005ff9513c9a8afabbece6ad2a05b':'I','50f0e38e5306ba4ddae04e494921216a':'II','3b98d581bb5776454e084075adf00c4c':'III'};
        const rarityHash = {'014d90279e0ca7278b0b8f7e9094a8dd':'SSR','64ec71645699f5fce79d98cfc20a525f':'SR','1c5d999c42ed640c95da540af7578667':'R'};
        const codeMap = {'fire':'작열','water':'수냉','wind':'풍압','iron':'철갑','electric':'전격'};
        const weaponMap = [{k:'shot_gun',v:'샷건 (SG)'},{k:'sniper',v:'저격소총 (SR)'},{k:'assault',v:'소총 (AR)'},{k:'machine',v:'기관총 (MG)'},{k:'sub_machine',v:'기관단총 (SMG)'},{k:'rocket',v:'런처 (RL)'},{k:'sg.',v:'샷건 (SG)'},{k:'smg.',v:'기관단총 (SMG)'},{k:'ar.',v:'소총 (AR)'},{k:'mg.',v:'기관총 (MG)'},{k:'sr.',v:'저격소총 (SR)'},{k:'rl.',v:'런처 (RL)'}];
        imgs.forEach(img => {
            const src = img.src.toLowerCase();
            const cls = img.className.toLowerCase();
            if (src.includes('icon-code')||src.includes('icon_code')) for(const [k,v]of Object.entries(codeMap)) if(src.includes(k)) code=v;
            if (cls.includes('weapon')||src.includes('weapon')) for(const m of weaponMap) if(src.includes(m.k)) weapon=m.v;
            for(const [h,v]of Object.entries(rarityHash)) if(src.includes(h)) rarity=v;
            for(const [h,v]of Object.entries(burstHash)) if(src.includes(h)) burst=v;
        });
        return {code,weapon,rarity,burst};
    };

    const extractData = async () => {
        const imgInfo = analyzeImages();
        const clickTab = async (tabName) => {
            const tabs = Array.from(document.querySelectorAll('div'));
            const targetTab = tabs.find(el => el.innerText.trim() === tabName);
            if (targetTab) {
                targetTab.click();
                await new Promise(r => setTimeout(r, CONFIG.TAB_CLICK_WAIT));
                return true;
            }
            return false;
        };

        await clickTab('스킬');
        const skillSpans = Array.from(document.querySelectorAll('span.text-20.text-white.ff-num.text-highlight-blue'));
        const skills = {
            skill1: skillSpans[0] ? parseInt(skillSpans[0].innerText.trim()) : 0,
            skill2: skillSpans[1] ? parseInt(skillSpans[1].innerText.trim()) : 0,
            burst: skillSpans[2] ? parseInt(skillSpans[2].innerText.trim()) : 0
        };

        await clickTab('큐브');
        const rubikNameDiv = document.querySelector('.rubik-name');
        let cubeLevel = 0;
        if (rubikNameDiv) {
            const lvDivs = rubikNameDiv.querySelectorAll('div');
            lvDivs.forEach(div => { if(div.innerText.includes('Lv')) cubeLevel = parseInt(div.innerText.replace(/\D/g,'')) || 0; });
        }
        const cube = { level: cubeLevel };

        await clickTab('소장품');
        const collectionText = document.body ? document.body.innerText : "";
        let collectionRarity = "None";
        if (collectionText.includes('SR')) collectionRarity = "SR";
        else if (collectionText.includes('R')) collectionRarity = "R";
        const collSkillSpans = Array.from(document.querySelectorAll('span.text-highlight-blue')).filter(el => el.classList.contains('ff-num'));
        const collection = {
            rarity: collectionRarity,
            skillLv1: collSkillSpans[0] ? parseInt(collSkillSpans[0].innerText.trim()) : 0,
            skillLv2: collSkillSpans[1] ? parseInt(collSkillSpans[1].innerText.trim()) : 0
        };

        await clickTab('장비'); 
        const fullText = document.body ? document.body.innerText : "";
        const lines = fullText.split('\n').map(l=>l.trim()).filter(l=>l);
        let name="Unknown", cv="Unknown", squad="Unknown", company="Unknown", role="Unknown";
        for(let i=0; i<lines.length; i++) {
            if(lines[i].includes("CV")||lines[i].includes("CV :")) { cv=lines[i].replace(/CV\s*[:]?\s*/, "").trim(); if(lines[i+1]) name=lines[i+1]; }
            if(lines[i]==="스쿼드" && lines[i+1]) squad=lines[i+1];
            if(["미실리스","테트라","엘리시온","필그림","어브노멀"].includes(lines[i])) company=lines[i];
            if(["화력형","방어형","지원형"].includes(lines[i])) role=lines[i];
        }
        if (company === "Unknown") company = "어브노멀";
        if(name==="Unknown"||name.includes("레어도")) { const h1=document.querySelector('h1'); if(h1) name=h1.innerText.trim(); }
        const getStat=(label)=>{ const r=new RegExp(`${label}\\s*\\n\\s*([\\d,]+)`); const m=fullText.match(r); return m?parseInt(m[1].replace(/,/g,'')):0; };
        const stats={combatPower:getStat('전투력'),hp:getStat('체력'),atk:getStat('공격'),def:getStat('방어')};
        const equipment=[];
        const equipBlocks = fullText.split('장비 능력치').slice(1);
        equipBlocks.forEach((block,i)=>{
            if(block.length<20) return;
            const eqStats={};
            ['체력','공격','방어'].forEach(k=>{ const m=block.match(new RegExp(`${k}\\s*\\n\\s*([\\d,]+)`)); if(m) eqStats[k]=parseInt(m[1].replace(/,/g,'')); });
            const optRegex=/\[([^\]]+)\][\s\n]*([\d.]+%)/g; const opts=[]; let m;
            while((m=optRegex.exec(block))!==null) opts.push({name:m[1].trim(),value:m[2].trim()});
            if(Object.keys(eqStats).length>0||opts.length>0) equipment.push({partIndex:i+1,stats:eqStats,options:opts});
        });

        return {
            meta: { name, cv, rarity: imgInfo.rarity, squad, company, class: role, burst: imgInfo.burst, code: imgInfo.code, weapon: imgInfo.weapon },
            stats, skills, cube, collection, equipment,
            rawUrl: window.location.href, timestamp: new Date().toISOString()
        };
    };

    const generateMarkdown = (data) => {
        const { meta, stats, skills, cube, collection, equipment } = data;
        const dateStr = new Date(data.timestamp).toLocaleString('ko-KR');
        let md = `# ${meta.name} 분석 정보\n\n**📅 추출일:** ${dateStr}\n**🔗 URL:** ${data.rawUrl}\n\n## 🆔 프로필\n| 항목 | 내용 | 항목 | 내용 |\n|---|---|---|---|\n`;
        md += `| **레어도** | **${meta.rarity}** | **버스트** | **${meta.burst}** |\n| **CV** | ${meta.cv} | **스쿼드** | ${meta.squad} |\n| **기업** | ${meta.company} | **클래스** | ${meta.class} |\n| **무기** | ${meta.weapon} | **속성** | ${meta.code} |\n\n`;
        md += `## ⚔️ 스킬 및 강화 정보\n| 항목 | 레벨 / 정보 |\n|---|---|\n| **스킬 1** | Lv.${skills.skill1} |\n| **스킬 2** | Lv.${skills.skill2} |\n| **버스트** | Lv.${skills.burst} |\n| **큐브 Lv** | Lv.${cube.level} |\n| **소장품** | ${collection.rarity} (스킬Lv1: ${collection.skillLv1}, 스킬Lv2: ${collection.skillLv2}) |\n\n`;
        md += `## 📊 기본 스탯 (전투력: ${stats.combatPower.toLocaleString()})\n| 체력 (HP) | 공격력 (ATK) | 방어력 (DEF) |\n|:---:|:---:|:---:|\n| ${stats.hp.toLocaleString()} | ${stats.atk.toLocaleString()} | ${stats.def.toLocaleString()} |\n\n## 🛡️ 착용 장비 분석\n`;
        if(equipment.length>0) equipment.forEach(eq=>{ md+=`\n### 🔹 장비 #${eq.partIndex}\n`; const statStr=Object.entries(eq.stats).map(([k,v])=>`${k} ${v}`).join(', '); md+=`- **기본 스탯**: ${statStr}\n`; if(eq.options.length>0){ md+=`- **오버로드 옵션**:\n`; eq.options.forEach(opt=>md+=`  - [${opt.name}] **${opt.value}**\n`); }});
        else md+=`\n*(장비 정보 없음)*\n`;
        return md;
    };

    // ==========================================
    // 5. 실행 감지
    // ==========================================
    let lastUrl = location.href;
    setInterval(() => {
        if (!document.getElementById('nikke-ui-container')) createUI();
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            if (storage.get(AUTO_KEY) === 'true') {
                console.log("🔄 URL 변경 감지 -> 재개");
                setTimeout(autoProcessLoop, 2000);
            }
        }
    }, 1000);

    window.addEventListener('load', () => {
        createUI();
        if (storage.get(AUTO_KEY) === 'true') {
            setTimeout(autoProcessLoop, 2000);
        }
    });

})();