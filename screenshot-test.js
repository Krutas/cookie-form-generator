const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('Launching Firefox browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/usr/bin/firefox',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
        product: 'firefox'
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    console.log('Navigating to page...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of initial state
    console.log('Taking screenshot 1: Initial page load...');
    await page.screenshot({ path: 'screenshot-1-initial.png', fullPage: true });
    
    // Test drag and drop area - hover to see effect
    const uploadArea = await page.$('#uploadArea');
    if (uploadArea) {
        console.log('Found upload area, testing hover...');
        await uploadArea.hover();
        await page.waitForTimeout(500);
        
        console.log('Taking screenshot 2: Hover on upload area...');
        await page.screenshot({ path: 'screenshot-2-hover.png', fullPage: true });
        
        // Test clicking browse button
        const browseBtn = await page.$('#browseBtn');
        if (browseBtn) {
            console.log('Found browse button!');
            
            // Scroll to make sure button is visible
            await browseBtn.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            
            console.log('Taking screenshot 3: Browse button visible...');
            await page.screenshot({ path: 'screenshot-3-browse-btn.png', fullPage: true });
            
            // Simulate drag over
            console.log('Simulating drag over...');
            await uploadArea.evaluate(el => {
                const event = new DragEvent('dragenter', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: new DataTransfer()
                });
                el.dispatchEvent(event);
            });
            await page.waitForTimeout(500);
            
            console.log('Taking screenshot 4: Drag over effect...');
            await page.screenshot({ path: 'screenshot-4-dragover.png', fullPage: true });
        }
    }
    
    console.log('All screenshots saved!');
    await browser.close();
})();
