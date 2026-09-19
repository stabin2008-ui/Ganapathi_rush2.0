const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runControlsTest() {
  console.log('===============================================================');
  console.log('TEST_CONTROLS.JS — ALL INPUT MODES & NAVIGATION VERIFICATION');
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader-webgl',
      '--enable-webgl',
      '--window-size=1280,720'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      // Ignore static favicon or image network 404s if any
      if (!txt.includes('Failed to load resource')) {
        consoleErrors.push(txt);
      }
    }
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  console.log('1. Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1000);

  console.log('2. Clicking #btnStartGame to begin festival run...');
  await page.click('#btnStartGame');
  await sleep(500);

  // Helper to read game state
  const getState = async () => {
    return await page.evaluate(() => ({
      state: window.gameInstance.state,
      targetLane: window.gameInstance.player.targetLane,
      lane: window.gameInstance.player.lane,
      currentX: window.gameInstance.player.currentX,
      isJumping: window.gameInstance.player.isJumping,
      isSliding: window.gameInstance.player.isSliding
    }));
  };

  let init = await getState();
  console.log(`   Initial State: state=${init.state}, targetLane=${init.targetLane}, currentX=${init.currentX.toFixed(2)}`);

  let allPassed = true;
  const assert = (condition, testName) => {
    if (condition) {
      console.log(`   [PASS] ${testName}`);
    } else {
      console.error(`   [FAIL] ${testName}`);
      allPassed = false;
    }
  };

  assert(init.state === 'PLAYING', 'Game transitioned to PLAYING state');
  assert(init.targetLane === 1, 'Initial lane is Center (1)');

  // -------------------------------------------------------------
  // TEST GROUP 1: KEYBOARD ARROWS
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 1: KEYBOARD ARROW CONTROLS ---');
  // ArrowRight: Center (1) -> Right (2)
  await page.keyboard.press('ArrowRight');
  await sleep(180);
  let s = await getState();
  assert(s.targetLane === 2, 'ArrowRight: Center (1) -> Right (2)');

  // ArrowRight at boundary: Right (2) -> Right (2)
  await page.keyboard.press('ArrowRight');
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 2, 'ArrowRight boundary: Right (2) -> stays 2 (clamped)');

  // ArrowLeft: Right (2) -> Center (1)
  await page.keyboard.press('ArrowLeft');
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 1, 'ArrowLeft: Right (2) -> Center (1)');

  // ArrowLeft: Center (1) -> Left (0)
  await page.keyboard.press('ArrowLeft');
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 0, 'ArrowLeft: Center (1) -> Left (0)');

  // ArrowLeft boundary: Left (0) -> stays 0
  await page.keyboard.press('ArrowLeft');
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 0, 'ArrowLeft boundary: Left (0) -> stays 0 (clamped)');

  // -------------------------------------------------------------
  // TEST GROUP 2: KEYBOARD A / D CONTROLS
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: KEYBOARD A / D CONTROLS ---');
  // KeyD: Left (0) -> Center (1)
  await page.keyboard.press('KeyD');
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 1, 'KeyD: Left (0) -> Center (1)');

  // KeyD: Center (1) -> Right (2)
  await page.keyboard.press('KeyD');
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 2, 'KeyD: Center (1) -> Right (2)');

  // KeyA: Right (2) -> Center (1)
  await page.keyboard.press('KeyA');
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 1, 'KeyA: Right (2) -> Center (1)');

  // KeyA: Center (1) -> Left (0)
  await page.keyboard.press('KeyA');
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 0, 'KeyA: Center (1) -> Left (0)');

  // -------------------------------------------------------------
  // TEST GROUP 3: ON-SCREEN NAVIGATION BUTTONS (CRITICAL BUG FIX)
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: ON-SCREEN MOBILE BUTTONS (#btnMobileLeft / #btnMobileRight) ---');
  // Check element properties in DOM
  const btnProps = await page.evaluate(() => {
    const leftEl = document.getElementById('btnMobileLeft');
    const rightEl = document.getElementById('btnMobileRight');
    const barEl = document.getElementById('mobileControls');
    const leftStyle = window.getComputedStyle(leftEl);
    const rightStyle = window.getComputedStyle(rightEl);
    const barStyle = window.getComputedStyle(barEl);
    return {
      leftVisible: leftStyle.display !== 'none' && leftStyle.visibility !== 'hidden',
      rightVisible: rightStyle.display !== 'none' && rightStyle.visibility !== 'hidden',
      leftPointerEvents: leftStyle.pointerEvents,
      rightPointerEvents: rightStyle.pointerEvents,
      barZIndex: parseInt(barStyle.zIndex, 10) || 0
    };
  });

  assert(btnProps.leftVisible && btnProps.rightVisible, 'Left and Right buttons are visible in DOM');
  assert(btnProps.rightPointerEvents === 'auto', 'Right button has pointer-events: auto');
  assert(btnProps.barZIndex >= 50, 'Controls bar has high z-index (above canvas)');

  // Move via #btnMobileRight from Left (0) -> Center (1)
  await page.evaluate(() => {
    const btn = document.getElementById('btnMobileRight');
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  });
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 1, '#btnMobileRight pointerdown: Left (0) -> Center (1)');

  // Move via #btnMobileRight from Center (1) -> Right (2)
  await page.evaluate(() => {
    const btn = document.getElementById('btnMobileRight');
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  });
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 2, '#btnMobileRight pointerdown: Center (1) -> Right (2)');

  // Move via #btnMobileRight at right boundary -> stays 2
  await page.evaluate(() => {
    const btn = document.getElementById('btnMobileRight');
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  });
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 2, '#btnMobileRight boundary: Right (2) -> stays 2');

  // Move via #btnMobileLeft from Right (2) -> Center (1)
  await page.evaluate(() => {
    const btn = document.getElementById('btnMobileLeft');
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  });
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 1, '#btnMobileLeft pointerdown: Right (2) -> Center (1)');

  // Move via #btnMobileLeft from Center (1) -> Left (0)
  await page.evaluate(() => {
    const btn = document.getElementById('btnMobileLeft');
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  });
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 0, '#btnMobileLeft pointerdown: Center (1) -> Left (0)');

  // -------------------------------------------------------------
  // TEST GROUP 4: TOUCH SWIPE GESTURES
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: TOUCH SWIPE GESTURES ---');
  // Swipe Right: Left (0) -> Center (1)
  await page.evaluate(() => {
    try {
      const t1 = new Touch({ identifier: 1, target: window, clientX: 200, clientY: 400 });
      const t2 = new Touch({ identifier: 1, target: window, clientX: 340, clientY: 400 });
      window.dispatchEvent(new TouchEvent('touchstart', { touches: [t1] }));
      window.dispatchEvent(new TouchEvent('touchend', { changedTouches: [t2] }));
    } catch (e) {
      // Mouse drag fallback for swipe
      window.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 400, button: 0 }));
      window.dispatchEvent(new MouseEvent('mouseup', { clientX: 340, clientY: 400, button: 0 }));
    }
  });
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 1, 'Swipe Right: Left (0) -> Center (1)');

  // Swipe Right: Center (1) -> Right (2)
  await page.evaluate(() => {
    try {
      const t1 = new Touch({ identifier: 1, target: window, clientX: 200, clientY: 400 });
      const t2 = new Touch({ identifier: 1, target: window, clientX: 340, clientY: 400 });
      window.dispatchEvent(new TouchEvent('touchstart', { touches: [t1] }));
      window.dispatchEvent(new TouchEvent('touchend', { changedTouches: [t2] }));
    } catch (e) {
      window.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 400, button: 0 }));
      window.dispatchEvent(new MouseEvent('mouseup', { clientX: 340, clientY: 400, button: 0 }));
    }
  });
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 2, 'Swipe Right: Center (1) -> Right (2)');

  // Swipe Left: Right (2) -> Center (1)
  await page.evaluate(() => {
    try {
      const t1 = new Touch({ identifier: 1, target: window, clientX: 340, clientY: 400 });
      const t2 = new Touch({ identifier: 1, target: window, clientX: 200, clientY: 400 });
      window.dispatchEvent(new TouchEvent('touchstart', { touches: [t1] }));
      window.dispatchEvent(new TouchEvent('touchend', { changedTouches: [t2] }));
    } catch (e) {
      window.dispatchEvent(new MouseEvent('mousedown', { clientX: 340, clientY: 400, button: 0 }));
      window.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 400, button: 0 }));
    }
  });
  await sleep(180);
  s = await getState();
  assert(s.targetLane === 1, 'Swipe Left: Right (2) -> Center (1)');

  // -------------------------------------------------------------
  // TEST GROUP 5: JUMP & SLIDE
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: JUMP & SLIDE ---');
  // Jump via ArrowUp
  await page.keyboard.press('ArrowUp');
  await sleep(50);
  s = await getState();
  assert(s.isJumping === true, 'ArrowUp activates jump (isJumping === true)');
  await sleep(650); // Wait for jump to land

  // Slide via ArrowDown
  await page.keyboard.press('ArrowDown');
  await sleep(50);
  s = await getState();
  assert(s.isSliding === true, 'ArrowDown activates slide (isSliding === true)');

  // -------------------------------------------------------------
  // TEST GROUP 6: CONSOLE ERROR CHECK
  // -------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: CONSOLE ERROR CHECK ---');
  assert(consoleErrors.length === 0, `Zero console errors during controls test (errors=${consoleErrors.length})`);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
  }

  await browser.close();

  if (allPassed) {
    console.log('\n===============================================================');
    console.log('ALL CONTROL TESTS PASSED SUCCESSFULLY! (PHASE 1 COMPLETE)');
    console.log('===============================================================\n');
    process.exit(0);
  } else {
    console.error('\nSOME CONTROL TESTS FAILED.');
    process.exit(1);
  }
}

runControlsTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
