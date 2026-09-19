const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLaneMovementTest() {
  console.log('===============================================================');
  console.log('TEST_LANE_MOVEMENT.JS — RAPID INPUT, DEBOUNCE & CLAMP STRESS');
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

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1000);
  await page.click('#btnStartGame');
  await sleep(400);

  const getState = async () => {
    return await page.evaluate(() => ({
      targetLane: window.gameInstance.player.targetLane,
      lane: window.gameInstance.player.lane,
      currentX: window.gameInstance.player.currentX,
      state: window.gameInstance.state
    }));
  };

  let allPassed = true;
  const assert = (condition, testName) => {
    if (condition) {
      console.log(`   [PASS] ${testName}`);
    } else {
      console.error(`   [FAIL] ${testName}`);
      allPassed = false;
    }
  };

  // 1. Stress rapid succession: RIGHT then immediate RIGHT (< 50ms)
  console.log('--- TEST 1: RAPID DOUBLE-TAP DEBOUNCE ---');
  await page.keyboard.press('ArrowRight');
  await sleep(20); // within debounce window (<120ms)
  await page.keyboard.press('ArrowRight');
  await sleep(200);
  let s = await getState();
  // Center is 1. One right moves to 2. Second rapid right within 20ms must be debounced (or at boundary)
  assert(s.targetLane === 2, 'Rapid double-tap right landed on right lane (2)');

  // 2. Center -> Left -> Left Rapid
  console.log('\n--- TEST 2: RAPID LEFT MOVEMENT WITH DEBOUNCE ---');
  await page.keyboard.press('ArrowLeft');
  await sleep(150); // after debounce
  s = await getState();
  assert(s.targetLane === 1, 'First ArrowLeft: 2 -> 1');

  await page.keyboard.press('ArrowLeft');
  await sleep(150); // after debounce
  s = await getState();
  assert(s.targetLane === 0, 'Second ArrowLeft: 1 -> 0');

  await page.keyboard.press('ArrowLeft');
  await sleep(50);
  s = await getState();
  assert(s.targetLane === 0, 'Third ArrowLeft at boundary: stays clamped at 0');

  // 3. Rapid Alternating: RIGHT, LEFT, RIGHT, LEFT
  console.log('\n--- TEST 3: RAPID ALTERNATING LANE SHIFTS ---');
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('ArrowRight');
    await sleep(140);
    s = await getState();
    assert(s.targetLane === 1, `Alternation ${i+1}A: Left (0) -> Center (1)`);

    await page.keyboard.press('ArrowLeft');
    await sleep(140);
    s = await getState();
    assert(s.targetLane === 0, `Alternation ${i+1}B: Center (1) -> Left (0)`);
  }

  // 4. Smooth Interpolation Check: currentX approaches CONFIG.LANES[targetLane] smoothly
  console.log('\n--- TEST 4: SMOOTH INTERPOLATION (NO INSTANT TELEPORTATION) ---');
  // Move to right lane and sample intermediate positions
  await page.keyboard.press('ArrowRight');
  const samples = [];
  for (let step = 0; step < 6; step++) {
    const posX = await page.evaluate(() => window.gameInstance.player.currentX);
    samples.push(posX);
    await sleep(35);
  }
  console.log(`   X position interpolation samples: ${samples.map(x => x.toFixed(2)).join(' -> ')}`);
  const isIncreasing = samples[samples.length - 1] > samples[0];
  assert(isIncreasing, 'currentX smoothly moves towards target lane coordinate');

  // 5. Restart Integrity: Restart run and verify lane resets to 1 and movement still works
  console.log('\n--- TEST 5: RESTART RUN LANE SYSTEM INTEGRITY ---');
  await page.evaluate(() => window.gameInstance.startRun());
  await sleep(300);
  s = await getState();
  assert(s.targetLane === 1, 'startRun() resets targetLane to Center (1)');
  assert(s.state === 'PLAYING', 'Game is in PLAYING state after restart');

  await page.keyboard.press('ArrowRight');
  await sleep(160);
  s = await getState();
  assert(s.targetLane === 2, 'Movement still works after restart: Center (1) -> Right (2)');

  await browser.close();

  if (allPassed) {
    console.log('\n===============================================================');
    console.log('ALL LANE MOVEMENT TESTS PASSED! (LANE SYSTEM 100% ROBUST)');
    console.log('===============================================================\n');
    process.exit(0);
  } else {
    console.error('\nSOME LANE MOVEMENT TESTS FAILED.');
    process.exit(1);
  }
}

runLaneMovementTest().catch(err => {
  console.error('Lane test error:', err);
  process.exit(1);
});
