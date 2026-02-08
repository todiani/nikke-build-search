import { chromium } from 'playwright';

async function testScrape() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const name = "라피 : 레드 후드";
    const url = `https://namu.wiki/w/${encodeURIComponent(name)}`;
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Try to find skill information
    // Namuwiki usually has skill info in tables. 
    // We look for tables containing "스킬 정보" or specific skill types.
    
    const skillData = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll('table'));
        const result = {
            skill1: { name: '', desc: '' },
            skill2: { name: '', desc: '' },
            burst: { name: '', desc: '', cooldown: '' }
        };

        // This is a heuristic and might need adjustment based on Namuwiki's actual structure
        for (const table of tables) {
            const text = table.innerText;
            if (text.includes('스킬 1') || text.includes('1번 스킬')) {
                // Potential skill table
                // Usually structured as:
                // [Skill Name]
                // [Type/Cooldown]
                // [Description]
                
                // Let's try to find rows that contain "스킬 1", "스킬 2", "버스트 스킬"
                const rows = Array.from(table.querySelectorAll('tr'));
                let currentSkill = '';
                
                for (const row of rows) {
                    const rowText = row.innerText;
                    if (rowText.includes('스킬 1')) currentSkill = 'skill1';
                    else if (rowText.includes('스킬 2')) currentSkill = 'skill2';
                    else if (rowText.includes('버스트 스킬')) currentSkill = 'burst';
                    
                    if (currentSkill) {
                        // The next row or the same row might have name and desc
                        // This part is tricky because Namuwiki tables are complex
                    }
                }
            }
        }
        return document.body.innerText.substring(0, 1000); // For debugging
    });

    console.log("Extracted content snippet:");
    console.log(skillData);

    await browser.close();
}

testScrape();
