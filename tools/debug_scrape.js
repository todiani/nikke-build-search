import { chromium } from 'playwright';
import fs from 'fs';

async function debug() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    const name = '네베';
    const url = `https://namu.wiki/w/${encodeURIComponent(name)}`; // Try direct name as per user instruction
    
    console.log(`Debugging ${name} at ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // Give extra time for rendering
        
        // Take a screenshot to see the page state
        await page.screenshot({ path: 'tools/debug_screenshot.png' });
        console.log('Screenshot saved to tools/debug_screenshot.png');
        
        const content = await page.content();
        fs.writeFileSync('tools/debug_page.html', content);
        console.log('Page HTML saved to tools/debug_page.html');
        
        const title = await page.title();
        console.log(`Page Title: ${title}`);
        
        const tablesData = await page.evaluate(() => {
            const tables = Array.from(document.querySelectorAll('table'));
            return tables.filter(text => text.innerText.includes('스킬') || text.innerText.includes('버스트')).map(t => {
                const rows = Array.from(t.querySelectorAll('tr'));
                return {
                    text: t.innerText.substring(0, 200),
                    rows: rows.map(r => r.innerText.replace(/\n+/g, ' | ').trim())
                };
            });
        });
        console.log('Skill-related tables found:', tablesData.length);
        tablesData.forEach((t, i) => {
            console.log(`--- Table ${i} ---`);
            console.log(`Preview: ${t.text}...`);
            t.rows.forEach((r, j) => {
                console.log(`  Row ${j}: ${r}`);
            });
        });
        
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }

    await browser.close();
}

debug();
