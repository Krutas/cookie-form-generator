const { firefox } = require('playwright');
const fs = require('fs');

(async () => {
    console.log('Launching Firefox with Playwright...');
    const browser = await firefox.launch({
        headless: true
    });
    
    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 }
    });
    
    const page = await context.newPage();
    
    console.log('Navigating to page...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Create screenshots directory
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
    }
    
    // Take screenshot of initial state
    console.log('Taking screenshot 1: Initial page load...');
    await page.screenshot({ path: 'screenshots/screenshot-1-initial.png', fullPage: true });
    
    // Test drag and drop area - hover to see effect
    const uploadArea = await page.$('#uploadArea');
    if (uploadArea) {
        console.log('Found upload area, testing hover...');
        await uploadArea.hover();
        await page.waitForTimeout(500);
        
        console.log('Taking screenshot 2: Hover on upload area...');
        await page.screenshot({ path: 'screenshots/screenshot-2-hover.png', fullPage: true });
        
        // Test clicking browse button
        const browseBtn = await page.$('#browseBtn');
        if (browseBtn) {
            console.log('Found browse button!');
            
            // Scroll to make sure button is visible
            await browseBtn.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            
            console.log('Taking screenshot 3: Browse button visible...');
            await page.screenshot({ path: 'screenshots/screenshot-3-browse-btn.png', fullPage: true });
            
            // Simulate drag enter
            console.log('Simulating drag enter...');
            await uploadArea.evaluate(el => {
                const event = new DragEvent('dragenter', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: new DataTransfer()
                });
                el.dispatchEvent(event);
            });
            await page.waitForTimeout(500);
            
            console.log('Taking screenshot 4: Drag enter effect...');
            await page.screenshot({ path: 'screenshots/screenshot-4-dragenter.png', fullPage: true });
        }
    }
    
    console.log('All screenshots saved to screenshots/ directory!');
    await browser.close();
})();
