import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BUILDS_DIR = 'r:/AI/nikke-build-search/public/data/builds';

async function scrapeNikke(page, name) {
    const getUrls = (name) => {
        if (name === 'N102') return ['N102(승리의 여신: 니케)', 'N102'];
        
        const massProduced = ['프로덕트 08', '프로덕트 12', '프로덕트 23', 'iDoll 플라워', 'iDoll 오션', 'iDoll 썬', '솔져 O.W.', '솔져 E.G.', '솔져 F.A.'];
        
        const abnormalCollabs = ['2B', 'A2', '파스칼', '마키마', '파워', '히메노', '에밀리아', '렘', '람', '아스카', '레이', '마리', '미사토', '이브', '릴리', '레이븐'];
        if (abnormalCollabs.includes(name)) {
            return [name + '(승리의 여신: 니케)'];
        }
        
        const noSuffixNames = [
            '라피 : 레드 후드', '홍련 : 흑영', '모더니아', '니힐리스타', '레드 후드', '스노우 화이트', 
            '홍련', '라푼젤', '도로시', '해란', '이사벨', '노아', '네베'
        ];
        
        if (noSuffixNames.some(n => name === n) || name.includes(' : ')) {
            return [name];
        }

        // Try both, but prioritize without suffix if it's likely to be unique
        return [
            name,
            name + '(승리의 여신: 니케)'
        ];
    };

    const urls = getUrls(name);
    let lastError = '';

    for (const urlPart of urls) {
        const url = `https://namu.wiki/w/${encodeURIComponent(urlPart)}`;
        console.log(`Scraping ${name} from ${url}...`);

        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            // Extra wait for SPA content
            await page.waitForTimeout(3000);
            
            // Wait for at least one table to appear
            try {
                await page.waitForSelector('table', { timeout: 10000 });
            } catch (e) {
                console.log(`No tables found on ${urlPart}, trying next or skipping...`);
                continue;
            }

            const skillData = await page.evaluate((targetName) => {
                const tables = Array.from(document.querySelectorAll('table'));
                const result = {
                    skill1: { name: '', desc: '' },
                    skill2: { name: '', desc: '' },
                    burst: { name: '', desc: '', cooldown: '' }
                };

                const cleanText = (t) => t.replace(/\n+/g, '\n').trim();

                const isTargetTable = (text) => {
                    const lowerText = text.toLowerCase();
                    // Skill tables almost always have "일반 공격" and "스킬 1"
                    return lowerText.includes('일반 공격') && (lowerText.includes('스킬 1') || lowerText.includes('1번 스킬'));
                };

                for (const table of tables) {
                    const text = table.innerText;
                    
                    if (isTargetTable(text)) {
                        // If it's a shared page, we might need more logic, but for now let's try to extract
                        const rows = Array.from(table.querySelectorAll('tr'));
                        let currentTarget = null;

                        for (let i = 0; i < rows.length; i++) {
                            const rowText = rows[i].innerText;
                            
                            if (rowText.includes('스킬 1') || rowText.includes('1번 스킬')) {
                                currentTarget = 'skill1';
                                const parts = rowText.split(/[\n\t]|\s{2,}/).filter(p => p.trim());
                                result.skill1.name = parts[parts.length - 1];
                            } else if (rowText.includes('스킬 2') || rowText.includes('2번 스킬')) {
                                currentTarget = 'skill2';
                                const parts = rowText.split(/[\n\t]|\s{2,}/).filter(p => p.trim());
                                result.skill2.name = parts[parts.length - 1];
                            } else if (rowText.match(/버스트\s*([IVX]+|스킬)/)) {
                                currentTarget = 'burst';
                                const parts = rowText.split(/[\n\t]|\s{2,}/).filter(p => p.trim());
                                result.burst.name = parts[parts.length - 1];
                                const cdMatch = rowText.match(/(\d+\.?\d*)초/);
                                if (cdMatch) result.burst.cooldown = cdMatch[0];
                            }

                            if (currentTarget && rows[i+1]) {
                                // If the current row contains the name, the next row usually contains the description
                                let descIdx = i + 1;
                                let potentialDesc = cleanText(rows[descIdx].innerText);
                                
                                // Skip if the next row is just another skill header or too short
                                if (potentialDesc.length > 5 && 
                                    !potentialDesc.includes('스킬 1') && 
                                    !potentialDesc.includes('스킬 2') && 
                                    !potentialDesc.match(/버스트\s*([IVX]+|스킬)/)) {
                                    result[currentTarget].desc = potentialDesc;
                                }
                            }
                        }
                        
                        // If we found at least one skill name, consider it a success for this table
                        if (result.skill1.name || result.skill2.name || result.burst.name) {
                            return result;
                        }
                    }
                }
                return null;
            }, name);

            if (skillData && (skillData.skill1.name || skillData.burst.name)) {
                return skillData;
            }
        } catch (e) {
            lastError = e.message;
            console.error(`Failed to navigate to ${url}: ${e.message}`);
        }
    }

    return null;
}

async function run() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // Get list of nikkes from builds directory
    const files = fs.readdirSync(BUILDS_DIR).filter(f => f.endsWith('.json'));
    
    // For debugging, we can limit to specific nikkes
    const targetNikkes = []; // Run for all
    // const filteredFiles = files.filter(f => targetNikkes.some(tn => f.includes(tn)));
    const filteredFiles = files;
    
    for (const file of filteredFiles) {
        const filePath = path.join(BUILDS_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (targetNikkes.length > 0 && !targetNikkes.includes(data.name)) {
            continue;
        }
        
        // Skip only if all skill details are already present and non-empty
        const hasSkill1 = data.skills_detail?.skill1?.name && data.skills_detail?.skill1?.desc && !data.skills_detail.skill1.desc.includes('성우');
        const hasSkill2 = data.skills_detail?.skill2?.name && data.skills_detail?.skill2?.desc && !data.skills_detail.skill2.desc.includes('성우');
        const hasBurst = data.skills_detail?.burst?.name && data.skills_detail?.burst?.desc && !data.skills_detail.burst.desc.includes('성우');
        
        if (hasSkill1 && hasSkill2 && hasBurst) {
            // console.log(`Skipping ${data.name} (already has complete data)`);
            continue;
        }

        console.log(`Processing ${data.name} (${file})...`);
        const skillData = await scrapeNikke(page, data.name);
        if (skillData && (skillData.skill1.name || skillData.burst.name)) {
            data.skills_detail = {
                ...data.skills_detail,
                skill1: skillData.skill1.name ? { ...data.skills_detail?.skill1, name: skillData.skill1.name, desc: skillData.skill1.desc } : data.skills_detail?.skill1,
                skill2: skillData.skill2.name ? { ...data.skills_detail?.skill2, name: skillData.skill2.name, desc: skillData.skill2.desc } : data.skills_detail?.skill2,
                burst: skillData.burst.name ? { ...data.skills_detail?.burst, name: skillData.burst.name, desc: skillData.burst.desc, cooldown: skillData.burst.cooldown } : data.skills_detail?.burst
            };
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`Updated ${data.name}`);
        } else {
            console.warn(`Could not scrape data for ${data.name}`);
        }
        
        // Add a small delay to be polite to namu.wiki
        await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();
}

run();
