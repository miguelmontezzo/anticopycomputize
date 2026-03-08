const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const targets = [
    { url: 'https://antiplanos.com.br/#/medical-zm0x', name: 'port-medical.jpg' },
    { url: 'https://antiplano.com.br/maiko', name: 'port-maiko.jpg' },
    { url: 'https://anticopyai.com.br/metodoEMP', name: 'port-metodoemp.jpg' }
];

const destDir = path.join(__dirname, 'public');

(async () => {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Set window size for desktop-ish preview that looks good in bento boxes
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Starting screenshots pipeline...');

    for (let target of targets) {
        console.log(`Navigating to ${target.url}...`);
        try {
            await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 30000 });
            // Wait a bit extra for animations/images to load fully
            await new Promise(r => setTimeout(r, 2000));

            const destPath = path.join(destDir, target.name);
            await page.screenshot({ path: destPath, type: 'jpeg', quality: 80 });
            console.log(`Saved screenshot to ${destPath}`);
        } catch (e) {
            console.error(`Failed to screenshot ${target.url}:`, e);
        }
    }

    await browser.close();
    console.log('Pipeline finished.');
})();
